import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {checkReleaseCandidate} from '../release-preflight.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../../app/'+name,import.meta.url),'utf8').replace(/^\s*\/\/.*$/gm,''));
const candidate=()=>({targetSha:'a'.repeat(40),baselineSha:'b'.repeat(40),headSha:'a'.repeat(40),version:'0.2.0',baselineVersion:'0.1.0',changedFiles:['app/src/worker.ts'],dirty:false,production:read('wrangler.production.ready.jsonc'),development:read('wrangler.jsonc')});
test('release plan pins candidate/configuration while refusing to claim remote release verification',()=>{const plan=checkReleaseCandidate(candidate());assert.equal(plan.localPlanPassed,true);assert.equal(plan.productionDeployed,false);assert.equal(plan.testsVerified,false);assert.equal(plan.recoveryVerified,false);assert.equal(plan.maintenanceDrained,false);assert.equal(plan.deploymentVerified,false);assert.equal(plan.targets.worker,'cookie-catalog-prod');});
test('routine release rejects wrong checkout, dirty work, duplicate versions, SQL changes and development bindings',()=>{
 for(const patch of [{targetSha:'main'},{headSha:'c'.repeat(40)},{dirty:true},{version:'0.1.0'},{version:'0.0.9'},{version:'0.2.0-rc.1'},{changedFiles:['database/migrations/0005.sql']},{production:read('wrangler.jsonc')}]){const plan=checkReleaseCandidate({...candidate(),...patch});assert.equal(plan.localPlanPassed,false,JSON.stringify(patch));assert(plan.failures.length>0);assert.equal(plan.productionDeployed,false);}
});
