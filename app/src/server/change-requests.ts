import type {AuthenticatedUser} from './access-identity';
import type {CatalogEnvironment} from '../catalog-environment';
const prefix='catalog-requests/v1/';
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'}});
function text(value:unknown,max:number,required=false){if(typeof value!=='string'||value.length>max||value.includes('\0')||(required&&!value.trim()))throw Error('Check the required text and field length limits.');return value.trim();}
export async function handleChangeRequests(request:Request,files:R2Bucket,user:AuthenticatedUser,environment:CatalogEnvironment){
 if(request.method==='GET'){
  if(user.role!=='owner')return reply({error:'Owner access required'},403);
  const cursor=new URL(request.url).searchParams.get('cursor')??undefined;if(cursor&&cursor.length>2048)return reply({error:'Invalid cursor'},400);
  try{const page=await files.list({prefix,limit:20,cursor});const items=[];for(const item of page.objects){const object=await files.get(item.key);if(!object)return reply({error:'Request listing changed; retry export.'},409);items.push({...await object.json<Record<string,unknown>>(),revision:object.httpEtag});}return reply({requests:items,nextCursor:page.truncated?page.cursor:null});}catch{return reply({error:'Requests could not be read. Retry later.'},503);}
 }
 if(!['POST','PATCH'].includes(request.method))return reply({error:'Method not allowed'},405);
 if(request.headers.get('Origin')!==new URL(request.url).origin||request.headers.get('X-Cookie-Catalog-Check')!=='change-request')return reply({error:'Same-origin request required'},403);
 if(!request.headers.get('content-type')?.startsWith('application/json'))return reply({error:'JSON required'},415);
 let body:any;try{const reader=request.body?.getReader();let size=0,raw='';const decoder=new TextDecoder('utf-8',{fatal:true});try{if(reader)for(;;){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>16384){await reader.cancel();return reply({error:'Request exceeds 16 KiB'},413);}raw+=decoder.decode(part.value,{stream:true});}raw+=decoder.decode();}finally{reader?.releaseLock();}body=JSON.parse(raw);}catch{return reply({error:'Invalid request JSON'},400);}
 if(request.method==='PATCH'){
  if(user.role!=='owner')return reply({error:'Owner access required'},403);
  if(!/^request_[a-f0-9-]{36}$/.test(body.id??''))return reply({error:'Invalid request ID'},400);
  let release:string|null,todo:string|null;try{release=body.release===null?null:text(body.release,40,true);todo=body.todo===null?null:text(body.todo,40,true);if(release&&!/^(?:R[0-9]+(?:\.[0-9]+)*|v[0-9]+\.[0-9]+\.[0-9]+)$/.test(release))throw Error('Use a release such as R2 or v0.2.0.');if(todo&&!/^CC-TODO-[0-9]{3,}$/.test(todo))throw Error('Use a TODO such as CC-TODO-018.');}catch(e){return reply({error:(e as Error).message},400);}
  try{const current=await files.get(prefix+body.id+'.json');if(!current)return reply({error:'Request not found'},404);if(request.headers.get('if-match')!==current.httpEtag)return reply({error:'Request changed; export the current revision before planning.'},412);const value={...await current.json<Record<string,unknown>>(),release,todo,plannedAt:new Date().toISOString(),plannedBy:user.subject};const saved=await files.put(prefix+body.id+'.json',JSON.stringify(value),{onlyIf:{etagMatches:current.etag},httpMetadata:{contentType:'application/json'}});return saved?reply({id:body.id,release,todo}):reply({error:'Request changed during planning.'},412);}catch{return reply({error:'Request planning could not be saved.'},503);}
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
  const saved=await files.put(key,JSON.stringify(value),{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'}});if(!saved)return reply({error:'Request save raced; retry the same request.'},409);
  return reply({id,createdAt:value.createdAt,status:value.status},201);
 }catch{return reply({error:'Request could not be saved. Keep the draft and retry.'},503);}
}
