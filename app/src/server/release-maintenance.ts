import type {MachineGate} from './release-machine';
export const stateKey='catalog-release/control/maintenance.json';
export const windowKey='catalog-release/control/window.json';
export type ReleaseWindow={id:string;startsAt:string;run:string;attempt:number;planHash:string;targetSha:string;baselineSha:string;baselineVersion:string;candidateVersion:string;status:'prepared'|'complete'|'canceled'};
export async function releaseWindow(files:R2Bucket){const object=await files.get(windowKey);if(!object)return null;const value=await object.json<ReleaseWindow>();if(!value||!['prepared','complete','canceled'].includes(value.status)||!Number.isFinite(Date.parse(value.startsAt))||!/^release_[a-f0-9-]{36}$/.test(value.id)||!/^\d+$/.test(value.run)||!Number.isSafeInteger(value.attempt)||value.attempt<1||!/^[a-f0-9]{64}$/.test(value.planHash)||!['targetSha','baselineSha'].every(k=>/^[a-f0-9]{40}$/.test((value as any)[k]))||!['baselineVersion','candidateVersion'].every(k=>/^[a-f0-9-]{36}$/.test((value as any)[k])))throw Error('Invalid release window');return {value,etag:object.etag};}
export async function finishReleaseWindow(files:R2Bucket,id:string){const current=await releaseWindow(files);if(current?.value.id===id&&current.value.status==='prepared'){if(!await files.put(windowKey,JSON.stringify({...current.value,status:'complete'}),{onlyIf:{etagMatches:current.etag}}))throw Error('Release window changed');}}
async function shopClosed(files:R2Bucket,gate:Awaited<ReturnType<typeof state>>){const window=await releaseWindow(files);return !!gate?.value.active||window?.value.status==='prepared'&&Date.parse(window.value.startsAt)<=Date.now();}
const leasePrefix='catalog-release/active/';
export type Gate={machine?:MachineGate;id:string;active:boolean;targetSha:string;startedAt:string;startedBy:string;finishedAt?:string;finishedBy?:string;outcome?:'verified'|'rolled-back'|'canceled'};
export class ReleaseGateError extends Error{constructor(message:string,public status=423){super(message);}}
export async function state(files:R2Bucket){const object=await files.get(stateKey);if(!object)return null;const value=await object.json<Gate>();if(!value||typeof value.active!=='boolean'||!/^release_[a-f0-9-]{36}$/.test(value.id)||!/^[a-f0-9]{40}$/.test(value.targetSha))throw Error('Invalid release safety state');if(value.machine){const m=value.machine;if(!/^[a-f0-9]{40}$/.test(m.controllerSha)||!/^\d+$/.test(m.run)||!Number.isSafeInteger(m.attempt)||m.attempt<1||!Number.isSafeInteger(m.sequence)||m.sequence<1||!['paused','deploying','verifying','recovering','needs-attention','complete'].includes(m.phase)||!/^[a-f0-9]{64}$/.test(m.digest)||!/^[a-f0-9]{64}$/.test(m.planHash)||!/^[a-f0-9]{40}$/.test(m.baselineSha)||!/^[a-f0-9-]{36}$/.test(m.baselineVersion)||!/^[a-f0-9-]{36}$/.test(m.candidateVersion))throw Error('Invalid machine release state');}return {value,etag:object.etag};}
async function backgroundWork(files:R2Bucket){
 const operations:{kind:string;id:string;status:'completed'|'active'|'failed'|'unknown'}[]=[];
 for(const [kind,key,done] of [['restore','catalog-backups/control/restore.json','phase'],['retention','catalog-backups/control/retention.json','status']] as const){const object=await files.get(key);if(object){const value=await object.json<Record<string,unknown>>();operations.push({kind,id:key,status:value[done]==='complete'?'completed':value.paused||value.lastError||value.status==='failed'?'failed':typeof value[done]==='string'?'active':'unknown'});}}
 const page=await files.list({prefix:'catalog-backups/jobs/',limit:20});
 if(page.truncated)operations.push({kind:'backup',id:'Backup listing exceeds the supported release check.',status:'unknown'});
 for(const item of page.objects){const object=await files.get(item.key);if(!object)throw Error('Backup status changed during release check');const job=await object.json<{status:string}>();operations.push({kind:'backup',id:item.key,status:job.status==='complete'?'completed':job.status==='copying'?'active':job.status==='failed'?'failed':'unknown'});}
 return operations;
}
export type PublicReleaseStatus={active:boolean;epoch:string;notice:{startsAt:string}|null;outcome:Gate['outcome']|null};
export type OwnerReleaseStatus=PublicReleaseStatus&{gate:Gate|null;window:ReleaseWindow|null;operations:Awaited<ReturnType<typeof backgroundWork>>;pendingBackgroundWork:string[];drained:boolean;inFlight:{id:string;status:string;startedAt:string}[];moreInFlight:boolean;ready:boolean};
export function releaseStatus(files:R2Bucket,owner:true):Promise<OwnerReleaseStatus>;
export function releaseStatus(files:R2Bucket,owner?:false):Promise<PublicReleaseStatus>;
export function releaseStatus(files:R2Bucket,owner:boolean):Promise<PublicReleaseStatus|OwnerReleaseStatus>;
export async function releaseStatus(files:R2Bucket,owner=false):Promise<PublicReleaseStatus|OwnerReleaseStatus>{
 const gate=await state(files),window=await releaseWindow(files),active=await shopClosed(files,gate);
 const notice=window?.value.status==='prepared'?{startsAt:window.value.startsAt}:null;
 const publicStatus={active,epoch:gate?.value.id??'initial',notice,outcome:!active&&!notice?(window?.value.status==='canceled'?'canceled':gate?.value.outcome??null):null};
 if(!owner)return publicStatus;
 const page=await files.list({prefix:leasePrefix,limit:1000,include:['customMetadata']});
 const operations=await backgroundWork(files),pending=operations.filter(o=>o.status!=='completed').map(o=>o.id),drained=!page.truncated&&page.objects.length===0;
 return {...publicStatus,gate:gate?.value??null,window:window?.value??null,operations,pendingBackgroundWork:pending,drained,inFlight:page.objects.map(o=>({id:o.key.slice(leasePrefix.length),status:o.customMetadata?.status==='unknown'?'unknown':'active',startedAt:o.customMetadata?.startedAt??o.uploaded.toISOString()})),moreInFlight:page.truncated,ready:active&&drained&&pending.length===0};
}
/** Registration before the second gate read closes the admission/drain race.
 * No lease expiry: uncertain interrupted writes must never silently admit a release.
 * All mutable HTTP work and scheduled work use this same boundary. */
export async function withReleaseWrite<T>(files:R2Bucket,action:()=>Promise<T>,scheduled=false):Promise<T>{
 if(scheduled&&(await releaseWindow(files))?.value.status==='prepared')throw new ReleaseGateError('Scheduled work is paused for the release window.');
 const admittedState=await state(files);if(await shopClosed(files,admittedState))throw new ReleaseGateError('A catalog release is in progress. Your draft is kept; retry after editing resumes.');
 const key=leasePrefix+crypto.randomUUID(),startedAt=new Date().toISOString();const registered=await files.put(key,'active',{onlyIf:{etagDoesNotMatch:'*'},customMetadata:{startedAt,status:'active'}});if(!registered)throw Error('Write registration failed');
 try{const current=await state(files);if(await shopClosed(files,current)||current?.value.id!==admittedState?.value.id)throw new ReleaseGateError('A catalog release is in progress. Your draft is kept; retry after editing resumes.');const result=await action();if(result instanceof Response&&result.status>=500)throw Error('Write outcome requires review');await files.delete(key);return result;}
 catch(error){if(error instanceof ReleaseGateError)await files.delete(key);else try{await files.put(key,'unknown',{onlyIf:{etagMatches:registered.etag},customMetadata:{startedAt,status:'unknown'}});}catch{/* retain the original registration if recording uncertainty fails */}throw error;}
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
  if(previous?.value.machine)return reply({error:'Machine-owned releases require verified machine recovery'},403);
  if(!previous?.value.active||body.id!==previous.value.id||body.targetSha!==previous.value.targetSha)return reply({error:'Release identity changed; refresh'},409);
  if(!['verified','rolled-back','canceled'].includes(body.outcome)||body.confirmed!==true)return reply({error:'A verified outcome or explicit cancellation is required'},400);
  const status=await releaseStatus(files,true);if(!status.drained||(body.outcome!=='canceled'&&!status.ready))return reply({error:'Writes are still active or interrupted. Keep maintenance on and review them.'},409);
  // This is an owner-operated recovery boundary, not proof of an automated deployment.
  const value={...previous.value,active:false,finishedAt:new Date().toISOString(),finishedBy:subject,outcome:body.outcome};
  await files.put('catalog-release/receipts/'+value.id+'.json',JSON.stringify(value),{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'}});
  await finishReleaseWindow(files,value.id);
  const saved=await files.put(stateKey,JSON.stringify(value),{onlyIf:{etagMatches:previous.etag},httpMetadata:{contentType:'application/json'}});
  return saved?reply({active:false,id:value.id,outcome:value.outcome}):reply({error:'Release state changed; refresh'},409);
 }
 return reply({error:'Unknown release action'},400);
}
