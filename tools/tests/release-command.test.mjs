import {test} from 'node:test';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import {readFileSync} from 'node:fs';
test('production entry rejects non-main/non-dispatch context and unresolved backup readiness before any cloud call',()=>{
 const script=new URL('../release-command.mjs',import.meta.url);
 for(const env of [{},{GITHUB_REPOSITORY:'JBrickey23/Cookie_Catalog',GITHUB_REF:'refs/heads/feature/test',GITHUB_EVENT_NAME:'workflow_dispatch'},{GITHUB_REPOSITORY:'JBrickey23/Cookie_Catalog',GITHUB_REF:'refs/heads/main',GITHUB_EVENT_NAME:'workflow_dispatch',GITHUB_RUN_ID:'12',GITHUB_RUN_ATTEMPT:'1',GITHUB_SHA:'a'.repeat(40)}]){
  const result=spawnSync(process.execPath,[script.pathname,'plan','TEST-uncreated-build','TEST-uncreated-recovery'],{env,encoding:'utf8',timeout:3000});assert.equal(result.status,1);assert.match(result.stderr,/Only owner-dispatched|readiness is not approved/);
 }
});
test('inactive workflow isolates candidate build from production credentials and retains recovery plan before applying',()=>{
 const source=readFileSync(new URL('../../docs/templates/release-engine.yml.template',import.meta.url),'utf8');const build=source.split('  build:')[1].split('  release:')[0];assert.doesNotMatch(build,/secrets\.|id-token:|environment:/);assert.match(build,/persist-credentials: false/);assert.ok(source.indexOf('name: cookie-release-plan, path: recovery')<source.indexOf('node tools/release-command.mjs apply'));assert.match(source,/cancel-in-progress: false/);
});
