import {state,stateKey,releaseStatus,releaseWindow,windowKey,finishReleaseWindow,type ReleaseWindow,type Gate,ReleaseGateError} from './release-maintenance';
import type {ReleasePrincipal} from './release-machine-identity';
export type MachineGate={run:string;attempt:number;controllerSha:string;sequence:number;digest:string;phase:'paused'|'deploying'|'verifying'|'recovering'|'needs-attention'|'complete';baselineSha:string;baselineVersion:string;candidateVersion:string;planHash:string;verified?:string;events?:{sequence:number;phase:string;run:string;attempt:number;at:string;runtime:RuntimeIdentity}[]};
export type RuntimeIdentity={sha:string;version:string;packageVersion?:string;health?:boolean};
const sha=(v:unknown):v is string=>typeof v==='string'&&/^[a-f0-9]{40}$/.test(v);
const uuid=(v:unknown):v is string=>typeof v==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(v);
const json=(v:unknown,status=200)=>Response.json(v,{status,headers:{'cache-control':'no-store'}});
/** Every mutation is one CAS. Same sequence + identical bytes is an idempotent readback;
 * different payload, stale attempt, owner or epoch is denied. No expiry unlock. */
export async function handleReleaseMachine(request:Request,files:R2Bucket,principal:ReleasePrincipal,runtime:RuntimeIdentity){
 const path=new URL(request.url).pathname;
 if(path==='/api/release-automation/status'&&request.method==='GET')return json({...await releaseStatus(files,true),runtime,protocol:1});
 if(path!=='/api/release-automation/control'||request.method!=='POST')return json({error:'Machine operation denied'},403);
 // Read at most 8 KiB, even when Content-Length is absent or dishonest.
 const reader=request.body?.getReader();let raw='',size=0;const decoder=new TextDecoder('utf-8',{fatal:true});
 try{if(reader)for(;;){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>8192){await reader.cancel();return json({error:'Request too large'},413);}raw+=decoder.decode(part.value,{stream:true});}raw+=decoder.decode();}catch{return json({error:'Invalid request'},400);}finally{reader?.releaseLock();}
 let b:any;try{b=JSON.parse(raw);if(!b||typeof b!=='object'||Array.isArray(b))throw Error();}catch{return json({error:'Invalid request'},400);}
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw))),x=>x.toString(16).padStart(2,'0')).join('');
 const previous=await state(files),old=previous?.value,m=old?.machine;
 const window=await releaseWindow(files);
 if(b.action==='prepare'){
  if(old?.active||window?.value.status==='prepared'){
   const same=window?.value;if(same&&same.id===b.id&&same.run===principal.run&&same.attempt===principal.attempt&&same.planHash===b.planHash&&same.targetSha===b.targetSha&&same.startsAt===b.startsAt&&same.baselineSha===b.baselineSha&&same.baselineVersion===b.baselineVersion&&same.candidateVersion===b.candidateVersion)return json({window:same,replayed:true});
   return json({error:'A release window or maintenance is already active'},409);
  }
  const starts=Date.parse(b.startsAt);
  if(b.id===old?.id||await files.head('catalog-release/receipts/'+String(b.id)+'.json')||!Number.isFinite(starts)||starts<Date.now()||starts>Date.now()+24*60*60*1000||!uuid(typeof b.id==='string'?b.id.slice(8):null)||!String(b.id).startsWith('release_')||!sha(b.targetSha)||!sha(b.baselineSha)||!uuid(b.baselineVersion)||!uuid(b.candidateVersion)||b.baselineVersion===b.candidateVersion||!/^[a-f0-9]{64}$/.test(b.planHash??'')||b.recoveryVerified!==true||b.backupReadinessVerified!==true||b.releaseClass!=='compatible'||runtime.sha!==b.baselineSha||runtime.version!==b.baselineVersion)return json({error:'Compatible candidate, recovery readiness and a future release window are required'},409);
  const status=await releaseStatus(files,true);if(status.pendingBackgroundWork?.length||status.inFlight?.some(o=>o.status==='unknown'))return json({error:'Review pending or failed background operations before PREP'},409);
  const value:ReleaseWindow={id:b.id,startsAt:b.startsAt,run:principal.run,attempt:principal.attempt,planHash:b.planHash,targetSha:b.targetSha,baselineSha:b.baselineSha,baselineVersion:b.baselineVersion,candidateVersion:b.candidateVersion,status:'prepared'};
  const saved=await files.put(windowKey,JSON.stringify(value),{onlyIf:window?{etagMatches:window.etag}:{etagDoesNotMatch:'*'}});return saved?json({window:value}):json({error:'Release window changed'},409);
 }
 if(b.action==='resume-prep'){
  const w=window?.value;if(!window||!w||w.status!=='prepared'||w.id!==b.id||w.run!==principal.run||w.planHash!==b.planHash||old?.active||principal.attempt<w.attempt)return json({error:'Matching original prepared run required'},409);
  const next={...w,attempt:principal.attempt};return await files.put(windowKey,JSON.stringify(next),{onlyIf:{etagMatches:window.etag}})?json({window:next}):json({error:'Release window changed'},409);
 }
 if(b.action==='cancel-prep'){
  const w=window?.value;if(!window||!w||w.id!==b.id||w.run!==principal.run||w.attempt!==principal.attempt||w.status!=='prepared'||old?.active)return json({error:'Matching original prepared run required'},409);
  if(Date.now()>=Date.parse(w.startsAt)){const status=await releaseStatus(files,true);if(!status.drained||status.pendingBackgroundWork.length||runtime.health!==true||runtime.sha!==w.baselineSha||runtime.version!==w.baselineVersion)return json({error:'Verified healthy baseline and settled known work required to cancel closed PREP'},409);}
  return await files.put(windowKey,JSON.stringify({...w,status:'canceled'}),{onlyIf:{etagMatches:window.etag}})?json({canceled:true}):json({error:'Release window changed'},409);
 }

 if(m&&b.id===old?.id&&m.run===principal.run&&m.attempt===principal.attempt&&m.sequence===b.sequence&&m.digest===digest)return json({gate:old,replayed:true});
 let value:Gate;
 if(b.action==='begin'){
  if(!window||window.value.status!=='prepared')return json({error:'PREP is required before CLOSE SHOP'},409);
  if(window?.value.status==='prepared'){const w=window.value;if(w.id!==b.id||w.run!==principal.run||w.attempt!==principal.attempt||w.planHash!==b.planHash||w.targetSha!==b.targetSha||w.baselineSha!==b.baselineSha||w.baselineVersion!==b.baselineVersion||w.candidateVersion!==b.candidateVersion||Date.now()<Date.parse(w.startsAt))return json({error:'Release window is not ready to close'},409);}
  if(old?.active||b.id===old?.id||await files.head('catalog-release/receipts/'+String(b.id)+'.json')||b.epoch!==(old?.id??'initial')||b.sequence!==1||!sha(b.targetSha)||!sha(b.baselineSha)||!uuid(b.baselineVersion)||!uuid(b.candidateVersion)||b.baselineVersion===b.candidateVersion||!uuid(typeof b.id==='string'?b.id.slice(8):null)||!String(b.id).startsWith('release_')||!/^[a-f0-9]{64}$/.test(b.planHash??'')||runtime.sha!==b.baselineSha||runtime.version!==b.baselineVersion)return json({error:'Baseline, candidate or epoch is not acceptable'},409);
  value={id:b.id,active:true,targetSha:b.targetSha,startedAt:new Date().toISOString(),startedBy:'github:'+principal.run,machine:{run:principal.run,controllerSha:principal.sourceSha,attempt:principal.attempt,sequence:1,digest,phase:'paused',baselineSha:b.baselineSha,baselineVersion:b.baselineVersion,candidateVersion:b.candidateVersion,planHash:b.planHash}};
 }else{
  if(!old?.active||!m||b.id!==old.id||b.epoch!==old.id||b.sequence!==m.sequence+1||!Number.isSafeInteger(b.sequence))return json({error:'Release epoch or sequence changed'},409);
  if(b.action==='takeover'){
   // KISS: explicit re-run of the same authorized workflow only; no cron takeover.
   if(principal.run!==m.run||principal.attempt<=m.attempt)return json({error:'Recovery ownership denied; review the original run'},403);
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
    await finishReleaseWindow(files,old.id);
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
