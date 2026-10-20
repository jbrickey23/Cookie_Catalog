import {digest,runRelease,recoverRelease} from './release-orchestrator.mjs';
/** Compose the existing machine gate and Cloudflare transports. One release,
 * one workflow run, one recovery file. No service/controller or polling daemon. */
export function releasePorts({plan,machine,cloud,persist,run,attempt,wait=ms=>new Promise(r=>setTimeout(r,ms)),now=Date.now}){
 const planHash=digest(plan);let recoverySettled=true;
 async function command(action,extra={}){
  const status=await machine.status(),gate=status.gate;
  if(!gate||gate.id!==plan.releaseId||gate.machine?.run!==run||gate.machine.attempt!==attempt||gate.machine.planHash!==planHash)throw Error('Release ownership changed; review original run');
  return machine.control({action,id:gate.id,epoch:gate.id,sequence:gate.machine.sequence+1,...extra});
 }
 const fields={id:plan.releaseId,targetSha:plan.candidateSha,baselineSha:plan.baselineSha,baselineVersion:plan.baselineVersion,candidateVersion:plan.candidateVersion,planHash};
 return {
  persist,wait,
  waitUntil:async date=>{const deadline=Date.parse(date);while(now()<deadline){const status=await machine.status();if(status.pendingBackgroundWork?.length||status.inFlight?.some(x=>x.status==='unknown'))throw Error('Known work needs review; postpone maintenance');await wait(Math.min(15000,deadline-now()));}},
  prepare:()=>machine.control({action:'prepare',...fields,startsAt:plan.startsAt,releaseClass:'compatible',recoveryVerified:true,backupReadinessVerified:true}),
  cancelPrep:()=>machine.control({action:'cancel-prep',id:plan.releaseId}),
  begin:async()=>{const status=await machine.status();return machine.control({action:'begin',...fields,epoch:status.epoch,sequence:1});},
  status:()=>machine.status(),phase:action=>command(action),
  deployment:()=>cloud.deployment(),deploy:version=>cloud.deploy(version),rollback:version=>cloud.rollback(version),
  deploymentSettled:async()=>recoverySettled&&await cloud.deploymentSettled(),
  verify:async expected=>{for(let i=0;i<10;i++){try{const status=await machine.status();if(status.runtime?.sha===expected.sha&&status.runtime.version===expected.version&&status.runtime.health===true)return;}catch{/* read-only health may settle; never repeat a write */}if(i<9)await wait(2000);}throw Error('Application version or health not verified');},
  acquireRecovery:async()=>{
   const status=await machine.status(),gate=status.gate,m=gate?.machine;
   if(!gate?.active||gate.id!==plan.releaseId||m?.run!==run||m.planHash!==planHash)throw Error('Matching active original release required');
   // After disappearance a fresh process cannot know that an old deployment
   // request settled. PREP/paused means no deploy was admitted; verifying means
   // the previous process already recorded verified runtime evidence.
   recoverySettled=['paused','verifying'].includes(m.phase);
   if(attempt>m.attempt)await machine.control({action:'takeover',id:gate.id,epoch:gate.id,sequence:m.sequence+1});
   else if(attempt!==m.attempt)throw Error('Stale workflow attempt');
  }
 };
}
export async function executeRelease({plan,evidence,machine,cloud,persist,run,attempt,mode='release',...clock}){
 const port=releasePorts({plan,machine,cloud,persist,run,attempt,...clock});
 if(mode==='recover'){await port.acquireRecovery();return recoverRelease(plan,port,Error('Owner resumed original release run'));}
 return runRelease(plan,port,evidence);
}
