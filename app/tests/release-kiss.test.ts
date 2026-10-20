import {test} from 'node:test';import assert from 'node:assert/strict';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {handleReleaseMachine,requireReleaseEpoch} from '../src/server/release-machine';
import {releaseStatus,withReleaseWrite,windowKey} from '../src/server/release-maintenance';
import {ReleaseSession} from '../src/release-client';
const sha='a'.repeat(40),baseline='b'.repeat(40),before='11111111-1111-1111-1111-111111111111',after='22222222-2222-2222-2222-222222222222';
const principal={run:'12',attempt:1,workflowSha:sha,sourceSha:sha};
const makeRuntime=()=>new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("test")}}',r2Buckets:['FILES']}));
test('PREP notice permits finishing edits, pauses cron; CLOSE drains admitted work; verified OPEN resumes',async()=>{
 const mf=makeRuntime();try{const files=await mf.getR2Bucket('FILES') as any,id='release_'+crypto.randomUUID();let runtime={sha:baseline,version:before,health:true};
 const call=(body:any)=>handleReleaseMachine(new Request('https://catalog.test/api/release-automation/control',{method:'POST',body:JSON.stringify(body)}),files,principal,runtime);
 const prepare={action:'prepare',id,startsAt:new Date(Date.now()+60000).toISOString(),releaseClass:'compatible',recoveryVerified:true,backupReadinessVerified:true,targetSha:sha,baselineSha:baseline,baselineVersion:before,candidateVersion:after,planHash:'c'.repeat(64)};
 assert.equal((await call({...prepare,backupReadinessVerified:false})).status,409);assert.equal((await call(prepare)).status,200);assert.equal((await call(prepare)).status,200);
 const notice=await releaseStatus(files);assert.equal(notice.active,false);assert.ok(notice.notice);assert.equal(notice.epoch,'initial');
 const page=new ReleaseSession();page.observe({...notice,build:baseline});assert.equal(page.paused,false);
 await withReleaseWrite(files,async()=>{});await assert.rejects(()=>withReleaseWrite(files,async()=>{throw Error('cron must not run');},true),/Scheduled work is paused/);
 let finish!:()=>void,entered!:()=>void;const held=new Promise<void>(r=>finish=r),admitted=new Promise<void>(r=>entered=r);const write=withReleaseWrite(files,async()=>{entered();await held;});await admitted;
 // Advance only the isolated window, without waiting or changing process clocks.
 const window=await (await files.get(windowKey)).json();window.startsAt=new Date(Date.now()-1000).toISOString();await files.put(windowKey,JSON.stringify(window));
 assert.equal((await releaseStatus(files)).active,true);await assert.rejects(()=>withReleaseWrite(files,async()=>{}),/release is in progress/);
 const begin={...prepare,action:'begin',sequence:1,epoch:'initial'};assert.equal((await call(begin)).status,200);assert.equal((await releaseStatus(files,true)).ready,false);
 const cmd=(action:string,sequence:number)=>call({action,id,epoch:id,sequence});assert.equal((await cmd('deploy',2)).status,409);finish();await write;assert.equal((await releaseStatus(files,true)).ready,true);
 assert.equal((await cmd('deploy',2)).status,200);runtime={sha,version:after,health:true};assert.equal((await cmd('verify',3)).status,200);assert.equal((await cmd('finish',4)).status,200);
 const open=await releaseStatus(files);assert.equal(open.active,false);assert.equal(open.notice,null);assert.equal(open.outcome,'verified');assert.equal(open.epoch,id);
 await assert.rejects(()=>requireReleaseEpoch(new Request('https://catalog.test',{headers:{'X-Catalog-Epoch':'initial','X-Catalog-Build':baseline}}),files,sha),/version changed/);
 await requireReleaseEpoch(new Request('https://catalog.test',{headers:{'X-Catalog-Epoch':id,'X-Catalog-Build':sha}}),files,sha);await withReleaseWrite(files,async()=>{},true);
 }finally{await mf.dispose();}
});
test('known restore/retention/backup states are explicit; failed and unknown operations block readiness',async()=>{
 const mf=makeRuntime();try{const files=await mf.getR2Bucket('FILES') as any;
 await files.put('catalog-backups/control/restore.json',JSON.stringify({phase:'database',paused:true}));await files.put('catalog-backups/control/retention.json',JSON.stringify({status:'running'}));await files.put('catalog-backups/jobs/done.json',JSON.stringify({status:'complete'}));await files.put('catalog-backups/jobs/unknown.json','{}');
 const status=await releaseStatus(files,true);assert.deepEqual(status.operations.map(o=>o.status).sort(),['active','completed','failed','unknown']);assert.equal(status.pendingBackgroundWork.length,3);assert.equal(status.ready,false);
 await assert.rejects(()=>withReleaseWrite(files,async()=>{throw Error('uncertain save');}));assert.equal((await releaseStatus(files,true)).inFlight[0].status,'unknown');
 }finally{await mf.dispose();}
});
test('owner recovery can cancel expired PREP only after verifying baseline health and known drain',async()=>{
 const mf=makeRuntime();try{const files=await mf.getR2Bucket('FILES') as any,id='release_'+crypto.randomUUID();const window={id,startsAt:new Date(Date.now()-1000).toISOString(),run:'12',attempt:1,planHash:'c'.repeat(64),targetSha:sha,baselineSha:baseline,baselineVersion:before,candidateVersion:after,status:'prepared'};await files.put(windowKey,JSON.stringify(window));
 const cancel=(health:boolean)=>handleReleaseMachine(new Request('https://catalog.test/api/release-automation/control',{method:'POST',body:JSON.stringify({action:'cancel-prep',id})}),files,principal,{sha:baseline,version:before,health});
 assert.equal((await releaseStatus(files)).active,true);assert.equal((await cancel(false)).status,409);assert.equal((await releaseStatus(files)).active,true);assert.equal((await cancel(true)).status,200);assert.equal((await releaseStatus(files)).active,false);
 }finally{await mf.dispose();}
});
