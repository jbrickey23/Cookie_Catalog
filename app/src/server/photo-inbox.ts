import {sha256} from './development-backup';
import {attachmentMedia} from './attachments';
import {withBackupStorageLock} from './backup-storage-lock';
import type {AuthenticatedUser} from './access-identity';
const base='catalog-photo-inbox/v1/',MAX=10*1024*1024;
const validId=(id:string)=>/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(id);
const key=(id:string)=>base+'items/'+id+'.json',original=(id:string)=>base+'originals/'+id,queue=(id:string,token:string)=>base+'queue/'+id+'/'+token;
type Item={queueToken:string;id:string;filename:string;mediaType:string;byteSize:number;sha256:string;createdAt:string;createdBy:string;context:string;status:'queued'|'ready-for-review'|'failed';errorCode?:string;preparedAt?:string;analysis?:{provider:null;proposedFields:Record<string,never>;notice:string}};
const reply=(value:unknown,status=200)=>Response.json(value,{status,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
export async function handlePhotoInbox(request:Request,files:R2Bucket,user:AuthenticatedUser){
 const url=new URL(request.url),suffix=url.pathname.slice('/api/photo-inbox'.length),match=/^\/([a-f0-9-]{36})(?:\/(original|retry))?$/.exec(suffix);
 if(suffix&&(!match||!validId(match[1])))return reply({error:'Photo item not found'},404);
 try{
  if(request.method==='GET'){
   if(!suffix){const cursor=url.searchParams.get('cursor')??undefined;if(cursor&&cursor.length>2048)return reply({error:'Invalid photo cursor'},400);const page=await files.list({prefix:base+'items/',limit:20,cursor}),items=[];for(const item of page.objects){const object=await files.get(item.key);if(!object)throw Error('Listing changed');const value=await object.json<Item>();items.push({...value,createdBy:undefined});}return reply({items,nextCursor:page.truncated?page.cursor:null});}
   const object=await files.get(key(match![1]));if(!object)return reply({error:'Photo item not found'},404);const item=await object.json<Item>();
   if(match![2]==='original'){const photo=await files.get(original(item.id));if(!photo||photo.size!==item.byteSize)return reply({error:'Photo original missing'},409);return new Response(photo.body,{headers:{'content-type':item.mediaType,'cache-control':'no-store','x-content-type-options':'nosniff','content-disposition':(url.searchParams.get('view')==='image'?'inline':'attachment')+"; filename*=UTF-8''"+encodeURIComponent(item.filename)}});}
   if(match![2])return reply({error:'Method not allowed'},405);return reply({...item,createdBy:undefined,revision:object.httpEtag});
  }
  if(request.method!=='POST')return reply({error:'Method not allowed'},405);
  if(!['owner','editor'].includes(user.role))return reply({error:'Editing access required'},403);
  if(request.headers.get('Origin')!==url.origin||request.headers.get('X-Cookie-Catalog-Check')!=='photo-inbox')return reply({error:'Same-origin photo request required'},403);
  if(match){if(match[2]!=='retry')return reply({error:'Method not allowed'},405);const object=await files.get(key(match[1]));if(!object)return reply({error:'Photo item not found'},404);const item=await object.json<Item>();if(item.status==='ready-for-review')return reply({id:item.id,status:item.status});const token=crypto.randomUUID();const saved=await files.put(key(item.id),JSON.stringify({...item,queueToken:token,status:'queued',errorCode:undefined}),{onlyIf:{etagMatches:object.etag}});if(!saved)return reply({error:'Photo changed; refresh before retrying'},409);await files.put(queue(item.id,token),'queued');return reply({id:item.id,status:'queued'});}
  const id=request.headers.get('X-Photo-Id')??'';if(!validId(id))return reply({error:'Invalid photo upload identity'},400);
  let filename:string,context:string;try{filename=decodeURIComponent(request.headers.get('X-Photo-Filename')??'');context=decodeURIComponent(request.headers.get('X-Photo-Context')??'');if(!filename||filename.length>200||/[\x00-\x1f/\\]/.test(filename)||context.length>400||/[\x00-\x1f]/.test(context))throw Error();}catch{return reply({error:'Check the photo filename and context'},400);}
  if(Number(request.headers.get('content-length'))>MAX)return reply({error:'Photo exceeds 10 MiB'},413);
  const reader=request.body?.getReader();if(!reader)return reply({error:'Choose a photo'},400);const chunks:Uint8Array[]=[];let size=0;try{for(;;){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>MAX){await reader.cancel();return reply({error:'Photo exceeds 10 MiB'},413);}chunks.push(part.value);}}finally{reader.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}const mediaType=attachmentMedia(filename,bytes);if(!mediaType?.startsWith('image/')||!['image/png','image/jpeg','image/webp'].includes(mediaType))return reply({error:'Choose a PNG, JPEG or WebP photo with matching file contents. HEIC needs conversion first.'},415);
  const hash=await sha256(bytes);
  return await withBackupStorageLock(files,async locked=>{
   const existing=await locked.get(key(id));if(existing){const value=await existing.json<Item>();if(value.sha256!==hash||value.createdBy!==user.subject||value.filename!==filename||value.context!==context)return reply({error:'Upload identity already used for another photo'},409);if(value.status==='queued')await locked.put(queue(id,value.queueToken),'queued');return reply({id,status:value.status},200);}
   const quota=await locked.list({prefix:base+'originals/',limit:101}),alreadyStored=quota.objects.some(o=>o.key===original(id));if(quota.truncated||quota.objects.length+(alreadyStored?0:1)>100||quota.objects.reduce((n,o)=>n+o.size,0)+(alreadyStored?0:size)>250*1024*1024)return reply({error:'Photo inbox safety limit reached (100 photos / 250 MiB). No photos were deleted.'},409);
   const saved=await locked.put(original(id),bytes,{sha256:hash,onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:mediaType}});if(!saved){const prior=await locked.get(original(id));if(!prior||await sha256(new Uint8Array(await prior.arrayBuffer()))!==hash)return reply({error:'An incomplete upload has different original bytes; use a new upload identity'},409);}
   const item:Item={queueToken:crypto.randomUUID(),id,filename,context,mediaType,byteSize:size,sha256:hash,createdAt:new Date().toISOString(),createdBy:user.subject,status:'queued'};
   await locked.put(key(id),JSON.stringify(item),{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'}});await locked.put(queue(id,item.queueToken),'queued');return reply({id,status:item.status},201);
  });
 }catch{return reply({error:'Photo inbox operation could not complete. Retained items can be refreshed or retried.'},503);}
}
/** One bounded preparation item per scheduled tick; no paid analysis or catalog writes. */
export async function preparePhotoInbox(files:R2Bucket){
 const page=await files.list({prefix:base+'queue/',limit:1});for(const queued of page.objects){const [id,token,...rest]=queued.key.slice((base+'queue/').length).split('/');if(!validId(id)||!validId(token)||rest.length)throw Error('Invalid photo queue identity');const object=await files.get(key(id));if(!object)throw Error('Queued photo metadata missing');const item=await object.json<Item>();if(item.queueToken!==token||item.status==='ready-for-review'){await files.delete(queued.key);continue;}
 const photo=await files.get(original(id));let next:Item;
 if(!photo||photo.size!==item.byteSize||await sha256(new Uint8Array(await photo.arrayBuffer()))!==item.sha256)next={...item,status:'failed',errorCode:'ORIGINAL_CHECK_FAILED'};
 else next={...item,status:'ready-for-review',errorCode:undefined,preparedAt:new Date().toISOString(),analysis:{provider:null,proposedFields:{},notice:'Original verified. Automated image analysis is not configured. No name, dimensions, scale, ownership or match has been inferred.'}};
 const saved=await files.put(key(id),JSON.stringify(next),{onlyIf:{etagMatches:object.etag},httpMetadata:{contentType:'application/json'}});if(saved)await files.delete(queued.key);
 }
}
