import {createHash} from 'node:crypto';
export const digest=value=>createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
const full=value=>typeof value==='string'&&/^[a-f0-9]{40}$/.test(value);
/** Intent must come from the reviewed trusted ref, never from candidate artifact metadata. */
export function validateIntent(plan,evidence){
 const problems=[];
 if(!/^[a-f0-9]{64}$/.test(plan.configHash??'')||!/^[a-f0-9]{64}$/.test(plan.artifactHash??'')||!/^\d+$/.test(plan.artifactRun??''))problems.push('digest and run format');
 if(plan.protocol!==1||!full(plan.candidateSha)||!full(plan.baselineSha)||plan.candidateSha===plan.baselineSha)problems.push('immutable commits');
 if(evidence.mainSha!==plan.candidateSha||evidence.dispatchSha!==plan.candidateSha||evidence.reviewedSha!==plan.candidateSha||!evidence.ciPassed)problems.push('reviewed exact-head intent');
 if(!evidence.singleWriter||!evidence.bridgeVerified||!evidence.backupReadinessVerified||!evidence.compatibilityReviewed)problems.push('readiness dependencies');
 if(plan.configHash!==evidence.configHash||plan.artifactHash!==evidence.artifactHash||plan.artifactRun!==evidence.artifactRun||!plan.artifactRun)problems.push('artifact provenance');
 if(plan.expiresAt<=evidence.now||!Number.isFinite(plan.expiresAt))problems.push('expired intent');
 if((evidence.changedFiles??[]).some(p=>/^database\//.test(p)||/wrangler.*jsonc$|package-lock\.json$/.test(p))&&!evidence.compatibilityExceptionReviewed)problems.push('migration, binding or toolchain review');
 if(!/^\d+\.\d+\.\d+$/.test(plan.version??'')||!/^\d+\.\d+\.\d+$/.test(plan.baselinePackageVersion??'')||compareVersions(plan.version,plan.baselinePackageVersion)<=0)problems.push('version increase');
 if(problems.length)throw Error('Release rejected: '+problems.join(', '));
 return Object.freeze(structuredClone(plan));
}
function compareVersions(a,b){const x=a.split('.').map(Number),y=b.split('.').map(Number);for(let i=0;i<3;i++)if(x[i]!==y[i])return x[i]-y[i];return 0;}
function actualVersion(value){if(value?.settled!==true||value.versions?.length!==1||value.versions[0].percentage!==100)throw Error('Ambiguous deployment');return value.versions[0].version_id;}
/** Ports separate trusted credentialed transport from build code. Persist() MUST
 * write the independent recovery artifact before begin(), and append evidence
 * before each external side effect. Never retry a timed-out deployment call. */
export async function runRelease(plan,port){
 let paused=false;
 await port.persist({phase:'prepared',plan,planHash:digest(plan)});
 try{
  const before=actualVersion(await port.deployment());if(before!==plan.baselineVersion)throw Error('Baseline changed');
  paused=true;await port.begin(plan);
  if(!(await port.status()).ready)throw Error('Writes have not drained');
  await port.phase('deploy');
  await port.persist({phase:'deployment-requested',version:plan.candidateVersion});
  await port.deploy(plan.candidateVersion); // one invocation; timeouts remain unknown
  if(actualVersion(await port.deployment())!==plan.candidateVersion)throw Error('Candidate not deployed');
  await port.verify({sha:plan.candidateSha,version:plan.candidateVersion});
  await port.phase('verify');await port.phase('finish');
  await port.persist({phase:'released'});return 'Released';
 }catch(error){
  if(!paused)throw error;
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
