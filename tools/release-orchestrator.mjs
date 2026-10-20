import {createHash} from 'node:crypto';
export const digest=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
const full=value=>typeof value==='string'&&/^[a-f0-9]{40}$/.test(value);
/** Intent must come from the reviewed trusted ref, never from candidate artifact metadata. */
export function validateIntent(plan,evidence,{uploadPending=false}={}){
 const problems=[];
 if(evidence.recovery?.independentCopy!==true||!/^[a-f0-9]{64}$/.test(evidence.recovery?.receiptHash??'')||!Number.isFinite(evidence.recovery?.verifiedAt)||evidence.recovery.verifiedAt>evidence.now||evidence.now-evidence.recovery.verifiedAt>24*60*60*1000)problems.push('current independent recovery evidence');
 if(!Number.isFinite(evidence?.now)||!Array.isArray(evidence?.changedFiles))problems.push('complete current evidence');
 if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(plan.baselineVersion??'')||!uploadPending&&(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(plan.candidateVersion??'')||plan.baselineVersion===plan.candidateVersion))problems.push('distinct native versions');
 if(!/^[a-f0-9]{64}$/.test(plan.configHash??'')||!/^[a-f0-9]{64}$/.test(plan.artifactHash??'')||!/^\d+$/.test(plan.artifactRun??''))problems.push('digest and run format');
 if(plan.protocol!==1||!full(plan.candidateSha)||!full(plan.baselineSha)||plan.candidateSha===plan.baselineSha)problems.push('immutable commits');
 if(evidence.mainSha!==plan.candidateSha||evidence.dispatchSha!==plan.candidateSha||evidence.reviewedSha!==plan.candidateSha||evidence.ciPassed!==true)problems.push('reviewed exact-head intent');
 if(evidence.singleWriter!==true||evidence.maintenanceSupported!==true||evidence.backupReadinessVerified!==true||evidence.compatibilityReviewed!==true)problems.push('readiness dependencies');
 if(plan.configHash!==evidence.configHash||plan.artifactHash!==evidence.artifactHash||plan.artifactRun!==evidence.artifactRun||!plan.artifactRun)problems.push('artifact provenance');
 if(plan.expiresAt<=evidence.now||!Number.isFinite(plan.expiresAt))problems.push('expired intent');
 if(plan.releaseClass!=='compatible'||(evidence.changedFiles??[]).some(p=>/^database\//.test(p)||/wrangler.*jsonc$/.test(p)))problems.push('breaking changes need a separate approved plan');
 if(!Number.isFinite(Date.parse(plan.startsAt??''))||!/^release_[a-f0-9-]{36}$/.test(plan.releaseId??''))problems.push('scheduled window and release ID');
 if(!/^\d+\.\d+\.\d+$/.test(plan.version??'')||!/^\d+\.\d+\.\d+$/.test(plan.baselinePackageVersion??'')||compareVersions(plan.version,plan.baselinePackageVersion)<=0)problems.push('version increase');
 if(problems.length)throw Error('Release rejected: '+problems.join(', '));
 return Object.freeze(structuredClone(plan));
}
function compareVersions(a,b){const x=a.split('.').map(Number),y=b.split('.').map(Number);for(let i=0;i<3;i++)if(x[i]!==y[i])return x[i]-y[i];return 0;}
function actualVersion(value){if(value?.settled!==true||value.versions?.length!==1||value.versions[0].percentage!==100)throw Error('Ambiguous deployment');return value.versions[0].version_id;}
/** Small bounded settling of KNOWN work. No historical invocation census, expiry
 * unlock or background job continuation while shop is closed. */
export async function drainKnownWork(port,{attempts=30,intervalMs=2000}={}){
 let clean=0;
 for(let i=0;i<attempts;i++){
  const status=await port.status();
  if(status.pendingBackgroundWork?.length||status.inFlight?.some(x=>x.status==='unknown'))throw Error('Known background or uncertain work needs review');
  if(status.ready){if(++clean===2)return status;}else clean=0;
  if(i+1<attempts)await port.wait(intervalMs);
 }
 throw Error('Known work did not settle within the release window');
}
/** Persist the independent recovery plan before PREP. The deployment token is
 * held only by the trusted transport, never by candidate build steps. */
export async function runRelease(plan,port,evidence){
 plan=validateIntent(plan,evidence??{});
 let prepared=false,paused=false;
 await port.persist({phase:'PREP',plan,planHash:digest(plan)});
 try{
  if(actualVersion(await port.deployment())!==plan.baselineVersion)throw Error('Baseline changed');
  await port.prepare(plan);prepared=true;
  await port.waitUntil(plan.startsAt);
  await port.persist({phase:'CLOSE SHOP'});paused=true;await port.begin(plan);
  await port.persist({phase:'DRAIN'});await drainKnownWork(port);
  await port.phase('deploy');await port.persist({phase:'RELEASE',version:plan.candidateVersion});
  await port.deploy(plan.candidateVersion);
  if(actualVersion(await port.deployment())!==plan.candidateVersion)throw Error('Candidate not deployed');
  await port.verify({sha:plan.candidateSha,version:plan.candidateVersion});await port.phase('verify');
  await port.persist({phase:'OPEN SHOP'});await port.phase('finish');
  await port.persist({phase:'released'});return 'Released';
 }catch(error){
  if(!paused){if(prepared){try{await port.cancelPrep();}catch{await port.persist({phase:'needs-attention',cause:'Release window remains closed or scheduled; review original run'});} }throw error;}
  return recoverRelease(plan,port,error);
 }
}
export async function recoverRelease(plan,port,cause){
 try{
  await port.persist({phase:'recovery',cause:String(cause?.message??cause??'interrupted')});
  // A failed/late deploy cannot be disproved by one current-version read. The
  // transport must prove no outstanding request before any compensating deploy.
  if(!await port.deploymentSettled())throw Error('Outstanding deployment outcome unknown');
  const current=actualVersion(await port.deployment());
  if(![plan.baselineVersion,plan.candidateVersion].includes(current))throw Error('Unexpected external deployment');
  await port.phase('recover');
  if(!(await port.status()).ready)throw Error('Recovery writes or background jobs have not drained');
  if(current!==plan.baselineVersion){await port.persist({phase:'rollback-requested',version:plan.baselineVersion});await port.rollback(plan.baselineVersion);}
  if(!await port.deploymentSettled()||actualVersion(await port.deployment())!==plan.baselineVersion)throw Error('Rollback not proven');
  await port.verify({sha:plan.baselineSha,version:plan.baselineVersion});await port.phase('verify');await port.phase('finish');
  await port.persist({phase:'rolled-back'});return 'Rolled back';
 }catch(error){await port.persist({phase:'needs-attention',cause:error.message});try{await port.phase('attention');}catch{/* existing active gate remains the safety boundary */}return 'Needs attention';}
}
