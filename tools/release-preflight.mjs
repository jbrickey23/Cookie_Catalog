/** Read-only release planning. Never moves a ref, authenticates or deploys. */
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkProductionConfig} from './check-production-config.mjs';
const fullSha=value=>typeof value==='string'&&/^[a-f0-9]{40}$/.test(value);
const semver=value=>typeof value==='string'&&/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(value);
export function checkReleaseCandidate({targetSha,baselineSha,headSha,version,baselineVersion,changedFiles,dirty,production,development}){
 const failures=[];
 if(!fullSha(targetSha)||!fullSha(baselineSha)||headSha!==targetSha)failures.push('Exact target/baseline commits and checked-out target are required.');
 if(dirty)failures.push('Tracked working-tree changes must be committed before release planning.');
 if(!semver(version)||!semver(baselineVersion))failures.push('Use explicit stable semantic versions for candidate and baseline.');
 else{const a=version.split('.').map(Number),b=baselineVersion.split('.').map(Number);let newer=false;for(let i=0;i<3;i++){if(a[i]!==b[i]){newer=a[i]>b[i];break;}}if(!newer)failures.push('Candidate version must be newer than the production baseline.');}
 const schemaChanges=changedFiles.filter(path=>/^database\/.*\.sql$/.test(path));if(schemaChanges.length)failures.push('SQL changes require a separately reviewed migration/recovery plan; routine release is blocked.');
 let targets=null;try{targets=checkProductionConfig(production,development);}catch(error){failures.push(error.message);}
 return {format:'cookie-catalog-release-plan',version:1,targetSha,baselineSha,candidateVersion:version,baselineVersion,targets,sqlChanges:schemaChanges,localPlanPassed:failures.length===0,failures,testsVerified:false,recoveryVerified:false,maintenanceDrained:false,deploymentVerified:false,productionDeployed:false};
}
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:4*1024*1024}).trim();
const jsonc=path=>JSON.parse(readFileSync(path,'utf8').replace(/^\s*\/\/.*$/gm,''));
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const targetSha=process.env.RELEASE_TARGET_SHA,baselineSha=process.env.RELEASE_BASELINE_SHA;if(!fullSha(targetSha)||!fullSha(baselineSha))throw Error('Set RELEASE_TARGET_SHA and RELEASE_BASELINE_SHA to exact full commit SHAs.');
 const plan=checkReleaseCandidate({targetSha,baselineSha,headSha:git('rev-parse','HEAD'),version:JSON.parse(readFileSync('app/package.json','utf8')).version,baselineVersion:JSON.parse(git('show',baselineSha+':app/package.json')).version,changedFiles:git('diff','--name-only',baselineSha,targetSha).split('\n').filter(Boolean),dirty:!!git('status','--porcelain','--untracked-files=no'),production:jsonc('app/wrangler.production.ready.jsonc'),development:jsonc('app/wrangler.jsonc')});
 writeFileSync('release-plan.json',JSON.stringify(plan,null,2)+'\n');console.log(JSON.stringify(plan,null,2));if(!plan.localPlanPassed)process.exitCode=1;
 }catch(error){console.error(error.message);process.exitCode=1;}
}
