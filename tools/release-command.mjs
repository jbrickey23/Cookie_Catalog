/** Trusted workflow entry point. Never invoked by this engineering batch.
 * plan -> upload independent plan artifact -> apply. No shell command strings. */
import {readFileSync,writeFileSync,mkdirSync,existsSync,appendFileSync} from 'node:fs';
import {resolve,join} from 'node:path';import {execFileSync} from 'node:child_process';
import {artifactDigest} from './release-artifact.mjs';import {uploadVersion} from './release-version-upload.mjs';
import {cloudflareDeploymentTransport} from './cloudflare-release-transport.mjs';import {machineClient,githubOidc} from './release-machine-client.mjs';
import {executeRelease} from './release-runner.mjs';import {digest,validateIntent} from './release-orchestrator.mjs';
const origin='https://cookie-catalog-prod.j-brickey.workers.dev';
const json=path=>JSON.parse(readFileSync(path,'utf8'));
async function github(path){const response=await fetch('https://api.github.com/repos/JBrickey23/Cookie_Catalog/'+path,{headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('GitHub release evidence unavailable');return response.json();}
async function reviewedCandidate(sha){const [main,checks]=await Promise.all([github('branches/main'),github('commits/'+sha+'/check-runs')]);if(main.commit.sha!==sha||!checks.check_runs.some(c=>c.name==='sqlite'&&c.head_sha===sha&&c.conclusion==='success'&&c.app?.slug==='github-actions'))throw Error('Reviewed main candidate or exact-head CI changed');return sha;}
async function main(){
 const [mode,bundleArg,outputArg]=process.argv.slice(2);if(!['plan','apply'].includes(mode)||!bundleArg||!outputArg)throw Error('Use plan|apply <artifact directory> <recovery directory>');
 if(process.env.GITHUB_REPOSITORY?.toLowerCase()!=='jbrickey23/cookie_catalog'||process.env.GITHUB_REF!=='refs/heads/main'||process.env.GITHUB_EVENT_NAME!=='workflow_dispatch')throw Error('Only owner-dispatched protected-main workflow is supported');
 const bundle=resolve(bundleArg),output=resolve(outputArg),run=process.env.GITHUB_RUN_ID,attempt=Number(process.env.GITHUB_RUN_ATTEMPT),candidate=process.env.GITHUB_SHA;
 if(!/^\d+$/.test(run??'')||!Number.isSafeInteger(attempt)||attempt<1||!/^[a-f0-9]{40}$/.test(candidate??''))throw Error('Immutable workflow identity required');
 const readiness=JSON.parse(process.env.CC_RELEASE_READINESS??'{}');
 // No production configuration is provisioned here. Owner must record actual
 // independent recovery evidence and resolve CC-TODO-019 before enabling this.
 if(readiness.backupReadinessVerified!==true||readiness.singleWriter!==true||readiness.maintenanceSupported!==true||readiness.compatibilityReviewed!==true)throw Error('Release readiness is not approved; check CC-TODO-019 and production configuration');
 const machine=machineClient({origin,clientId:process.env.CC_RELEASE_CLIENT_ID,clientSecret:process.env.CC_RELEASE_CLIENT_SECRET,oidc:()=>githubOidc(process.env.CC_RELEASE_OIDC_AUD)});
 const cloud=cloudflareDeploymentTransport({account:process.env.CLOUDFLARE_ACCOUNT_ID,worker:'cookie-catalog-prod',token:process.env.CLOUDFLARE_API_TOKEN});
 const planPath=join(output,'plan.json'),evidencePath=join(output,'evidence.json');
 if(mode==='plan'){
  if(existsSync(planPath))return; // original immutable plan downloaded on explicit re-run
  await reviewedCandidate(candidate);const status=await machine.status();if(status.active||status.window?.status==='prepared'||status.pendingBackgroundWork?.length||status.inFlight?.some(o=>o.status==='unknown'))throw Error('Finish known operations before scheduling release');
  const baseline=status.runtime?.sha,baselineVersion=status.runtime?.version;if(!/^[a-f0-9]{40}$/.test(baseline??'')||status.runtime?.health!==true)throw Error('Gate-capable healthy rollback baseline required');
  const metadata=json(join(bundle,'candidate.json'));if(metadata.sha!==candidate||metadata.run!==run)throw Error('Wrong build artifact run/source');
  const hash=artifactDigest(join(bundle,'dist'));if(hash!==metadata.artifactHash)throw Error('Build artifact changed');
  const baselinePackageVersion=status.runtime.packageVersion;
  const changedFiles=execFileSync('git',['diff','--name-only',baseline,candidate],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
  const minutes=Number(process.env.CC_RELEASE_MINUTES??5);if(!Number.isInteger(minutes)||minutes<1||minutes>60)throw Error('Choose a maintenance countdown of 1 to 60 minutes');
  mkdirSync(output,{recursive:true});const configDirectory=join(output,'trusted-config');mkdirSync(configDirectory,{recursive:true});
  const source=readFileSync('app/wrangler.production.ready.jsonc','utf8').replace(/^\s*\/\/.*$/gm,'');writeFileSync(join(configDirectory,'production.json'),JSON.stringify(JSON.parse(source)));
  const configHash=artifactDigest(configDirectory),now=Date.now();
  const evidence={singleWriter:readiness.singleWriter,maintenanceSupported:readiness.maintenanceSupported,backupReadinessVerified:readiness.backupReadinessVerified,compatibilityReviewed:readiness.compatibilityReviewed,recovery:{independentCopy:readiness.recovery?.independentCopy,verifiedAt:readiness.recovery?.verifiedAt,receiptHash:readiness.recovery?.receiptHash},now,changedFiles,mainSha:candidate,dispatchSha:candidate,reviewedSha:candidate,ciPassed:true,configHash,artifactHash:hash,artifactRun:run};
  const plan={protocol:1,releaseClass:'compatible',releaseId:'release_'+crypto.randomUUID(),startsAt:new Date(now+minutes*60000).toISOString(),candidateSha:candidate,baselineSha:baseline,baselineVersion,version:metadata.version,baselinePackageVersion,configHash,artifactHash:hash,artifactRun:run,expiresAt:now+(minutes+30)*60000};
  // Validate all non-upload prerequisites before exposing the scoped token to Wrangler.
  validateIntent(plan,evidence,{uploadPending:true});
  plan.candidateVersion=uploadVersion({artifact:join(bundle,'dist'),expectedHash:hash,trustedConfig:configDirectory,expectedConfigHash:configHash,wranglerCli:'app/node_modules/wrangler/bin/wrangler.js',token:process.env.CLOUDFLARE_API_TOKEN,account:process.env.CLOUDFLARE_ACCOUNT_ID});
  validateIntent(plan,{...evidence,now:Date.now()});writeFileSync(planPath,JSON.stringify(plan,null,2)+'\n');writeFileSync(evidencePath,JSON.stringify(evidence,null,2)+'\n');return;
 }
 const plan=json(planPath),evidence=json(evidencePath);
 if(plan.artifactRun!==run||artifactDigest(join(bundle,'dist'))!==plan.artifactHash)throw Error('Original run artifact/recovery evidence mismatch');
 let status=await machine.status();
 if(process.env.CC_RECOVERY_PLAN_HASH!==digest(plan))throw Error('Independent recovery plan artifact required');
 if(!status.gate?.active&&status.window?.status==='prepared'&&status.window.id===plan.releaseId&&status.window.run===run&&attempt>status.window.attempt){
  const actual=await cloud.deployment();if(actual.settled!==true||actual.versions?.length!==1||actual.versions[0].percentage!==100||actual.versions[0].version_id!==plan.baselineVersion)throw Error('Original baseline deployment not verified; keep shop closed');
  await machine.control({action:'resume-prep',id:plan.releaseId,planHash:digest(plan)});await machine.control({action:'cancel-prep',id:plan.releaseId});console.log('PREP canceled after baseline verification. Start a fresh release window.');return;
 }
 const recover=!!status.gate?.active;
 if(!recover){await reviewedCandidate(plan.candidateSha);evidence.now=Date.now();validateIntent(plan,evidence);}
 // The workflow must have uploaded the exact plan before this job is allowed to
 // close shop. Recompute rather than trusting a plan-supplied digest.
 if(process.env.CC_RECOVERY_PLAN_HASH!==digest(plan))throw Error('Independent recovery plan artifact must be retained before PREP');
 const persist=async event=>appendFileSync(join(output,'journal.jsonl'),JSON.stringify({at:new Date().toISOString(),...event})+'\n');
 const guardedCloud={...cloud,deploy:async version=>{await reviewedCandidate(plan.candidateSha);validateIntent(plan,{...evidence,now:Date.now()});return cloud.deploy(version);}};
 const result=await executeRelease({plan,evidence,machine,cloud:guardedCloud,persist,run,attempt,mode:recover?'recover':'release'});console.log(result);if(result==='Needs attention')process.exitCode=1;
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
