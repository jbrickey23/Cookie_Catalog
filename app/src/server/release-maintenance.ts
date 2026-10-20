const stateKey='catalog-release/control/maintenance.json';
const leasePrefix='catalog-release/active/';
type Gate={id:string;active:boolean;targetSha:string;startedAt:string;startedBy:string;finishedAt?:string;finishedBy?:string;outcome?:'verified'|'rolled-back'|'canceled'};
export class ReleaseGateError extends Error{constructor(message:string,public status=423){super(message);}}
async function state(files:R2Bucket){const object=await files.get(stateKey);if(!object)return null;const value=await object.json<Gate>();if(!value||typeof value.active!=='boolean'||!/^release_[a-f0-9-]{36}$/.test(value.id)||!/^[a-f0-9]{40}$/.test(value.targetSha))throw Error('Invalid release safety state');return {value,etag:object.etag};}
async function backgroundWork(files:R2Bucket){
 const pending:string[]=[];
 for(const [key,done] of [['catalog-backups/control/restore.json','phase'],['catalog-backups/control/retention.json','status']] as const){const object=await files.get(key);if(object){const value=await object.json<Record<string,unknown>>();if(value[done]!=='complete')pending.push(key);}}
 const page=await files.list({prefix:'catalog-backups/jobs/',limit:20});if(page.truncated)pending.push('Backup listing exceeds the supported release check.');
 for(const item of page.objects){const object=await files.get(item.key);if(!object)throw Error('Backup status changed during release check');const job=await object.json<{status:string}>();if(job.status==='copying')pending.push(item.key);}
 return pending;
}
export async function releaseStatus(files:R2Bucket,owner=false){
 const gate=await state(files);if(!owner)return {active:!!gate?.value.active};
 const page=await files.list({prefix:leasePrefix,limit:1000,include:['customMetadata']});
 const pending=await backgroundWork(files),drained=!page.truncated&&page.objects.length===0;
 return {active:!!gate?.value.active,gate:gate?.value??null,pendingBackgroundWork:pending,drained,inFlight:page.objects.map(o=>({id:o.key.slice(leasePrefix.length),startedAt:o.customMetadata?.startedAt??o.uploaded.toISOString()})),moreInFlight:page.truncated,ready:!!gate?.value.active&&drained&&pending.length===0};
}
/** Registration before the second gate read closes the admission/drain race.
 * No lease expiry: uncertain interrupted writes must never silently admit a release.
 * All mutable HTTP work and scheduled work use this same boundary. */
export async function withReleaseWrite<T>(files:R2Bucket,action:()=>Promise<T>):Promise<T>{
 const admittedState=await state(files);if(admittedState?.value.active)throw new ReleaseGateError('A catalog release is in progress. Your draft is kept; retry after editing resumes.');
 const key=leasePrefix+crypto.randomUUID();const registered=await files.put(key,'active',{onlyIf:{etagDoesNotMatch:'*'},customMetadata:{startedAt:new Date().toISOString()}});if(!registered)throw Error('Write registration failed');
 try{const current=await state(files);if(current?.value.active||current?.value.id!==admittedState?.value.id)throw new ReleaseGateError('A catalog release is in progress. Your draft is kept; retry after editing resumes.');return await action();}
 finally{await files.delete(key);}
}
export async function handleReleaseMaintenance(request:Request,files:R2Bucket,subject:string,owner:boolean){
 const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
 if(request.method==='GET')return reply(await releaseStatus(files,owner));
 if(!owner)return reply({error:'Owner access required'},403);
 if(request.method!=='POST')return reply({error:'Method not allowed'},405);
 if(request.headers.get('Origin')!==new URL(request.url).origin||request.headers.get('X-Cookie-Catalog-Check')!=='release-maintenance')return reply({error:'Same-origin release request required'},403);
 const length=Number(request.headers.get('content-length'));if(length>4096)return reply({error:'Release request too large'},413);
 const reader=request.body?.getReader();let raw='',size=0;const decoder=new TextDecoder('utf-8',{fatal:true});
 try{if(reader)for(;;){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>4096){await reader.cancel();return reply({error:'Release request too large'},413);}raw+=decoder.decode(part.value,{stream:true});}raw+=decoder.decode();}finally{reader?.releaseLock();}
 let body:any;try{body=JSON.parse(raw);if(!body||typeof body!=='object')throw Error();}catch{return reply({error:'Invalid release request'},400);}
 const previous=await state(files);
 if(body.action==='begin'){
  if(!/^[a-f0-9]{40}$/.test(body.targetSha??''))return reply({error:'Choose an exact commit SHA'},400);
  if(previous?.value.active)return reply({error:'A release gate is already active',id:previous.value.id},409);
  const value:Gate={id:'release_'+crypto.randomUUID(),active:true,targetSha:body.targetSha,startedAt:new Date().toISOString(),startedBy:subject};
  const saved=await files.put(stateKey,JSON.stringify(value),{onlyIf:previous?{etagMatches:previous.etag}:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'}});
  return saved?reply(await releaseStatus(files,true),201):reply({error:'Release state changed; refresh'},409);
 }
 if(body.action==='finish'){
  if(!previous?.value.active||body.id!==previous.value.id||body.targetSha!==previous.value.targetSha)return reply({error:'Release identity changed; refresh'},409);
  if(!['verified','rolled-back','canceled'].includes(body.outcome)||body.confirmed!==true)return reply({error:'A verified outcome or explicit cancellation is required'},400);
  const status=await releaseStatus(files,true);if(!status.drained||(body.outcome!=='canceled'&&!status.ready))return reply({error:'Writes are still active or interrupted. Keep maintenance on and review them.'},409);
  // This is an owner-operated recovery boundary, not proof of an automated deployment.
  const value={...previous.value,active:false,finishedAt:new Date().toISOString(),finishedBy:subject,outcome:body.outcome};
  await files.put('catalog-release/receipts/'+value.id+'.json',JSON.stringify(value),{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'}});
  const saved=await files.put(stateKey,JSON.stringify(value),{onlyIf:{etagMatches:previous.etag},httpMetadata:{contentType:'application/json'}});
  return saved?reply({active:false,id:value.id,outcome:value.outcome}):reply({error:'Release state changed; refresh'},409);
 }
 return reply({error:'Unknown release action'},400);
}
