import {execFileSync} from 'node:child_process';import {mkdtempSync,writeFileSync,readFileSync,copyFileSync,mkdirSync} from 'node:fs';import {tmpdir} from 'node:os';import {join,resolve} from 'node:path';import {fileURLToPath} from 'node:url';
export const acceptedR1='62e92a16a1e32975ee6bc7f15679183120315411';
/** Materialize accepted source in a fresh temporary workspace. No deploy, npm
 * install, original data, credentials, schema edits or remote API operations. */
export function prepareBridge(root=resolve(fileURLToPath(new URL('..',import.meta.url)))){
 const target=mkdtempSync(join(tmpdir(),'cc-r1-bridge-'));const archive=execFileSync('git',['archive',acceptedR1,'app'],{cwd:root,maxBuffer:20*1024*1024});execFileSync('tar',['-xf','-','-C',target],{input:archive});
 const files=['server/release-health.ts','server/r1-release-bridge.ts','server/release-machine.ts','server/release-machine-identity.ts','server/release-maintenance.ts','release-client.ts','ReleaseNotice.tsx'];
 for(const name of files)copyFileSync(join(root,'app/src',name),join(target,'app/src',name));
 const main=join(target,'app/src/main.tsx'),text=readFileSync(main,'utf8');
 if(!text.includes('<App />'))throw Error('Accepted R1 frontend entry changed; review overlay');
 writeFileSync(main,"import {installReleaseFetch} from './release-client';\nimport {ReleaseNotice} from './ReleaseNotice';\ninstallReleaseFetch();\n"+text.replace('<App />','<ReleaseNotice><App /></ReleaseNotice>'));
 writeFileSync(join(target,'app/src/bridge-worker.ts'),`import original,{handleApiRequest} from './worker';\nimport {r1ReleaseBridge} from './server/r1-release-bridge';\nimport {buildInformation} from './server/build-information';\nexport default r1ReleaseBridge(original,handleApiRequest,env=>({sha:buildInformation().commit??'',version:(env as any).CF_VERSION_METADATA?.id??'',packageVersion:buildInformation().version??''}));\n`);
 writeFileSync(join(target,'bridge-source.json'),JSON.stringify({acceptedR1,overlays:files,productionAuthorized:false},null,2)+'\n');return target;
}
if(process.argv[1]===fileURLToPath(import.meta.url))console.log(prepareBridge());
