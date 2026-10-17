import {requestId,requestHash,validateRequestRecord} from '../request-backup';
import type {AuthenticatedUser} from './access-identity';
import type {CatalogEnvironment} from '../catalog-environment';
const prefix='catalog-requests/v1/';
const recoveryPrefix='catalog-request-recovery/v1/';
const validId=requestId;
const fingerprint=requestHash;
// Small write-ahead recovery copies protect requests without checking the catalog.
// A copy can represent an attempted write; it is not a committed-change receipt.
async function protect(files:R2Bucket,id:string,raw:string){
 const hash=await fingerprint(raw),key=recoveryPrefix+id+'/'+hash+'.json';
 await files.put(key,raw,{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'}});
 const check=await files.get(key);if(!check||await fingerprint(await check.text())!==hash)throw Error('Request recovery readback failed.');
 return hash;
}

const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'}});
function text(value:unknown,max:number,required=false){if(typeof value!=='string'||value.length>max||value.includes('\0')||(required&&!value.trim()))throw Error('Check the required text and field length limits.');return value.trim();}
export async function handleChangeRequests(request:Request,files:R2Bucket,user:AuthenticatedUser,environment:CatalogEnvironment){
 if(request.method==='GET'){
  if(user.role!=='owner')return reply({error:'Owner access required'},403);
  const params=new URL(request.url).searchParams,history=params.get('history');
  if(history!==null){
   if(!validId(history))return reply({error:'Invalid request ID'},400);
   const cursor=params.get('cursor')??undefined;if(cursor&&cursor.length>2048)return reply({error:'Invalid cursor'},400);
   try{const page=await files.list({prefix:recoveryPrefix+history+'/',limit:20,cursor}),versions=[];
    for(const item of page.objects){const hash=item.key.split('/').pop()!.replace(/\.json$/,''),object=await files.get(item.key);if(!object||object.size>32768)throw Error('Missing recovery copy');const raw=await object.text();if(await fingerprint(raw)!==hash)throw Error('Recovery checksum failed');versions.push({sha256:hash,request:JSON.parse(raw)});}
    return reply({versions,nextCursor:page.truncated?page.cursor:null,notice:'Recovery copies may include attempts that did not commit.'});
   }catch{return reply({error:'Request recovery could not be verified.'},503);}
  }
  const cursor=params.get('cursor')??undefined;if(cursor&&cursor.length>2048)return reply({error:'Invalid cursor'},400);
  try{const page=await files.list({prefix,limit:20,cursor});const items=[];for(const item of page.objects){const object=await files.get(item.key);if(!object)return reply({error:'Request listing changed; retry export.'},409);items.push({...await object.json<Record<string,unknown>>(),revision:object.httpEtag});}return reply({requests:items,nextCursor:page.truncated?page.cursor:null});}catch{return reply({error:'Requests could not be read. Retry later.'},503);}
 }
 if(!['POST','PATCH'].includes(request.method))return reply({error:'Method not allowed'},405);
 if(request.headers.get('Origin')!==new URL(request.url).origin||request.headers.get('X-Cookie-Catalog-Check')!=='change-request')return reply({error:'Same-origin request required'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return reply({error:'JSON required'},415);
 const missingRecovery=request.method==='POST'&&new URL(request.url).searchParams.get('recover')==='missing';
 if(missingRecovery&&user.role!=='owner')return reply({error:'Owner access required'},403);
 const bodyLimit=missingRecovery?65536:16384;
 let body:any;try{const reader=request.body?.getReader();let size=0,raw='';const decoder=new TextDecoder('utf-8',{fatal:true});try{if(reader)for(;;){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>bodyLimit){await reader.cancel();return reply({error:'Request exceeds the supported size'},413);}raw+=decoder.decode(part.value,{stream:true});}raw+=decoder.decode();}finally{reader?.releaseLock();}body=JSON.parse(raw);}catch{return reply({error:'Invalid request JSON'},400);}
 if(!body||typeof body!=='object'||Array.isArray(body))return reply({error:'Request JSON must be an object'},400);
 if(missingRecovery){
  if(body?.approved!==true||typeof body?.json!=='string'||typeof body?.sha256!=='string')return reply({error:'Review and approve a recovery record.'},400);
  let record:any;try{if(new TextEncoder().encode(body.json).length>32768||await fingerprint(body.json)!==body.sha256)throw Error('Recovery checksum failed.');record=JSON.parse(body.json);validateRequestRecord(record);if(record.environment!==environment)throw Error('Recovery environment does not match this catalog.');}catch(e){return reply({error:(e as Error).message},400);}
  try{const key=prefix+record.id+'.json',current=await files.get(key);if(current)return await fingerprint(await current.text())===body.sha256?reply({id:record.id,unchanged:true}):reply({error:'This request already exists with different values; nothing was overwritten.'},409);
   await protect(files,record.id,body.json);const saved=await files.put(key,body.json,{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'}});if(!saved)return reply({error:'Request appeared during recovery; review again.'},409);
   const check=await files.get(key);if(!check||await fingerprint(await check.text())!==body.sha256)return reply({error:'Recovery readback changed; review before retrying.'},409);
   return reply({id:record.id,recovered:true},201);
  }catch{return reply({error:'Missing request recovery could not be completed. Retry safely with the same record.'},503);}
 }
 if(request.method==='PATCH'){
  if(user.role!=='owner')return reply({error:'Owner access required'},403);
  if(!validId(body.id))return reply({error:'Invalid request ID'},400);
  if(body.restoreSha256!==undefined){
   if(!/^[a-f0-9]{64}$/.test(body.restoreSha256)||body.approved!==true)return reply({error:'Review and approve a valid recovery copy.'},400);
   try{const current=await files.get(prefix+body.id+'.json');if(!current)return reply({error:'Request not found'},404);
    if(request.headers.get('if-match')!==current.httpEtag)return reply({error:'Request changed; review it again before restoring.'},412);
    const copy=await files.get(recoveryPrefix+body.id+'/'+body.restoreSha256+'.json');if(!copy||copy.size>32768)return reply({error:'Recovery copy missing or oversized.'},409);
    const raw=await copy.text();if(await fingerprint(raw)!==body.restoreSha256||JSON.parse(raw).id!==body.id)return reply({error:'Recovery checksum or identity failed.'},409);
    await protect(files,body.id,await current.text());
    const saved=await files.put(prefix+body.id+'.json',raw,{onlyIf:{etagMatches:current.etag},httpMetadata:{contentType:'application/json'}});
    return saved?reply({id:body.id,restored:true}):reply({error:'Request changed during recovery.'},412);
   }catch{return reply({error:'Request recovery could not be applied.'},503);}
  }
  let release:string|null,todo:string|null;try{release=body.release===null?null:text(body.release,40,true);todo=body.todo===null?null:text(body.todo,40,true);if(release&&!/^(?:R[0-9]+(?:\.[0-9]+)*|v[0-9]+\.[0-9]+\.[0-9]+)$/.test(release))throw Error('Use a release such as R2 or v0.2.0.');if(todo&&!/^CC-TODO-[0-9]{3,}$/.test(todo))throw Error('Use a TODO such as CC-TODO-018.');}catch(e){return reply({error:(e as Error).message},400);}
  try{const current=await files.get(prefix+body.id+'.json');if(!current)return reply({error:'Request not found'},404);if(request.headers.get('if-match')!==current.httpEtag)return reply({error:'Request changed; export the current revision before planning.'},412);const prior=await current.text();const value={...JSON.parse(prior),release,todo,plannedAt:new Date().toISOString(),plannedBy:user.subject};await protect(files,body.id,prior);await protect(files,body.id,JSON.stringify(value));const saved=await files.put(prefix+body.id+'.json',JSON.stringify(value),{onlyIf:{etagMatches:current.etag},httpMetadata:{contentType:'application/json'}});return saved?reply({id:body.id,release,todo}):reply({error:'Request changed during planning.'},412);}catch{return reply({error:'Request planning could not be saved.'},503);}
 }
 let payload:any;try{
  if(body.approved!==true||!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(body.id??''))throw Error('Review and confirm the request before saving.');
  if(!['bug','improvement','feature','data-correction'].includes(body.type))throw Error('Choose a request type.');
  const c=body.context??{};
  payload={type:body.type,title:text(body.title,120,true),description:text(body.description,4000,true),reason:text(body.reason,1000,true),context:{page:'catalog',recordId:text(c.recordId??'',200),recordName:text(c.recordName??'',200),search:text(c.search??'',120)},environment};
 }catch(e){return reply({error:(e as Error).message},400);}
 const id='request_'+body.id.toLowerCase(),key=prefix+id+'.json';
 try{
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(payload))))).map(x=>x.toString(16).padStart(2,'0')).join('');
  const existing=await files.get(key);if(existing){const saved=await existing.json<any>();return saved.createdBy===user.subject&&saved.payloadSha256===hash?reply({id:saved.id,createdAt:saved.createdAt,status:saved.status}):reply({error:'Request identity already used. Start a new request.'},409);}
  const value={id,createdAt:new Date().toISOString(),createdBy:user.subject,status:'new',release:null,todo:null,payloadSha256:hash,...payload};
  await protect(files,id,JSON.stringify(value));
  const saved=await files.put(key,JSON.stringify(value),{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'}});if(!saved)return reply({error:'Request save raced; retry the same request.'},409);
  return reply({id,createdAt:value.createdAt,status:value.status},201);
 }catch{return reply({error:'Request could not be saved. Keep the draft and retry.'},503);}
}
