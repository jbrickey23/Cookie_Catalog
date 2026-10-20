import {completedReleaseRun} from './release-run-evidence';
import {state,stateKey,releaseStatus,type Gate,ReleaseGateError} from './release-maintenance';
import type {ReleasePrincipal} from './release-machine-identity';
export type MachineGate={run:string;attempt:number;controllerSha:string;sequence:number;digest:string;phase:'paused'|'deploying'|'verifying'|'recovering'|'needs-attention'|'complete';baselineSha:string;baselineVersion:string;candidateVersion:string;planHash:string;verified?:string;events?:{sequence:number;phase:string;run:string;attempt:number;at:string;runtime:RuntimeIdentity}[]};
export type RuntimeIdentity={sha:string;version:string;health?:boolean};
const sha=(v:unknown):v is string=>typeof v==='string'&&/^[a-f0-9]{40}$/.test(v);
const uuid=(v:unknown):v is string=>typeof v==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(v);
const json=(v:unknown,status=200)=>Response.json(v,{status,headers:{'cache-control':'no-store'}});
/** Every mutation is one CAS. Same sequence + identical bytes is an idempotent readback;
 * different payload, stale attempt, owner or epoch is denied. No expiry unlock. */
export async function handleReleaseMachine(request:Request,files:R2Bucket,principal:ReleasePrincipal,runtime:RuntimeIdentity,finishedRun=completedReleaseRun){
 const path=new URL(request.url).pathname;
 if(path==='/api/release-automation/status'&&request.method==='GET')return json({...await releaseStatus(files,true),runtime,protocol:1});
 if(path!=='/api/release-automation/control'||request.method!=='POST')return json({error:'Machine operation denied'},403);
 // Read at most 8 KiB, even when Content-Length is absent or dishonest.
 const reader=request.body?.getReader();let raw='',size=0;const decoder=new TextDecoder('utf-8',{fatal:true});
 try{if(reader)for(;;){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>8192){await reader.cancel();return json({error:'Request too large'},413);}raw+=decoder.decode(part.value,{stream:true});}raw+=decoder.decode();}catch{return json({error:'Invalid request'},400);}finally{reader?.releaseLock();}
 let b:any;try{b=JSON.parse(raw);if(!b||typeof b!=='object'||Array.isArray(b))throw Error();}catch{return json({error:'Invalid request'},400);}
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw))),x=>x.toString(16).padStart(2,'0')).join('');
 const previous=await state(files),old=previous?.value,m=old?.machine;
 if(m&&b.id===old?.id&&m.run===principal.run&&m.attempt===principal.attempt&&m.sequence===b.sequence&&m.digest===digest)return json({gate:old,replayed:true});
 let value:Gate;
 if(b.action==='begin'){
  if(old?.active||b.id===old?.id||await files.head('catalog-release/receipts/'+String(b.id)+'.json')||b.epoch!==(old?.id??'initial')||b.sequence!==1||!sha(b.targetSha)||!sha(b.baselineSha)||!uuid(b.baselineVersion)||!uuid(b.candidateVersion)||b.baselineVersion===b.candidateVersion||!uuid(typeof b.id==='string'?b.id.slice(8):null)||!String(b.id).startsWith('release_')||!/^[a-f0-9]{64}$/.test(b.planHash??'')||runtime.sha!==b.baselineSha||runtime.version!==b.baselineVersion)return json({error:'Baseline, candidate or epoch is not acceptable'},409);
  value={id:b.id,active:true,targetSha:b.targetSha,startedAt:new Date().toISOString(),startedBy:'github:'+principal.run,machine:{run:principal.run,controllerSha:principal.sourceSha,attempt:principal.attempt,sequence:1,digest,phase:'paused',baselineSha:b.baselineSha,baselineVersion:b.baselineVersion,candidateVersion:b.candidateVersion,planHash:b.planHash}};
 }else{
  if(!old?.active||!m||b.id!==old.id||b.epoch!==old.id||b.sequence!==m.sequence+1||!Number.isSafeInteger(b.sequence))return json({error:'Release epoch or sequence changed'},409);
  if(b.action==='takeover'){
   // A new trusted recovery run also needs independent completed-run evidence.
   // This permits control takeover only, never proves an external write settled.
   if(principal.run===m.run?principal.attempt<=m.attempt:!principal.recovery||b.planHash!==m.planHash||!await finishedRun(m.run,m.controllerSha))return json({error:'Recovery ownership denied'},403);
   value={...old,machine:{...m,run:principal.run,controllerSha:principal.sourceSha,attempt:principal.attempt,phase:'recovering',verified:undefined,sequence:b.sequence,digest}};
  }else{
   if(principal.run!==m.run||principal.attempt!==m.attempt)return json({error:'Release ownership denied'},403);
   const next={...m,sequence:b.sequence,digest};value={...old,machine:next};
   if(b.action==='attention'){next.phase='needs-attention';next.verified=undefined;}
   else if(b.action==='deploy'){
    if(m.phase!=='paused'||!(await releaseStatus(files,true)).ready)return json({error:'Writers or background jobs have not drained'},409);
    next.phase='deploying';
   }else if(b.action==='recover') {next.phase='recovering';next.verified=undefined;}
   else if(b.action==='verify'){
    if(!['deploying','recovering','verifying'].includes(m.phase)||!(await releaseStatus(files,true)).ready)return json({error:'Verification phase or drain invalid'},409);
    const rollback=m.phase==='recovering';
    if(runtime.health!==true||runtime.sha!==(rollback?m.baselineSha:old.targetSha)||runtime.version!==(rollback?m.baselineVersion:m.candidateVersion))return json({error:'Runtime identity does not match outcome'},409);
    next.verified=rollback?'rolled-back':'verified';next.phase='verifying';
   }else if(b.action==='finish'){
    if(runtime.health!==true||m.phase!=='verifying'||!m.verified||!(await releaseStatus(files,true)).ready||runtime.sha!==(m.verified==='rolled-back'?m.baselineSha:old.targetSha)||runtime.version!==(m.verified==='rolled-back'?m.baselineVersion:m.candidateVersion))return json({error:'Verified matching outcome required'},409);
    value.active=false;value.outcome=m.verified as 'verified'|'rolled-back';value.finishedAt=new Date().toISOString();value.finishedBy='github:'+principal.run;next.phase='complete';
   }else return json({error:'Machine operation denied'},403);
  }
 }
 if(value.machine){const events=value.machine.events??[];if(events.length>=128)return json({error:'Recovery evidence budget exhausted; keep maintenance active'},409);value.machine={...value.machine,events:[...events,{sequence:value.machine.sequence,phase:value.machine.phase,run:principal.run,attempt:principal.attempt,at:new Date().toISOString(),runtime}]};}
 const saved=await files.put(stateKey,JSON.stringify(value),{onlyIf:previous?{etagMatches:previous.etag}:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'}});
 if(!saved)return json({error:'Concurrent release state change'},409);
 // Gate is the authoritative receipt. Auxiliary receipt loss never authorizes unlock.
 if(!value.active)await files.put('catalog-release/receipts/'+value.id+'.json',JSON.stringify(value),{onlyIf:{etagDoesNotMatch:'*'}});
 return json({gate:value});
}
export async function requireReleaseEpoch(request:Request,files:R2Bucket,sha:string){
 const current=await state(files);if(current?.value.active)throw new ReleaseGateError('Catalog update in progress. Keep your draft.');
 if(request.headers.get('X-Catalog-Epoch')!==(current?.value.id??'initial')||!sha||request.headers.get('X-Catalog-Build')!==sha)throw new ReleaseGateError('Catalog version changed. Keep your draft and refresh/review before saving.',409);
}
