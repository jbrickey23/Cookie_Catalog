import assert from 'node:assert/strict';import {test} from 'node:test';
import {generateKeyPair,SignJWT,exportJWK,createLocalJWKSet} from 'jose';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {verifyReleaseMachine} from '../src/server/release-machine-identity';
import {handleReleaseMachine,requireReleaseEpoch} from '../src/server/release-machine';
import {withReleaseWrite,releaseStatus,windowKey} from '../src/server/release-maintenance';
import {ReleaseSession} from '../src/release-client';
const sha='a'.repeat(40),baseline='b'.repeat(40),v1='11111111-1111-1111-1111-111111111111',v2='22222222-2222-2222-2222-222222222222';
test('both signed identities required; wrong claims, human confusion and expiry denied',async()=>{
 const pair=await generateKeyPair('RS256'),jwk=await exportJWK(pair.publicKey),key=createLocalJWKSet({keys:[{...jwk,kid:'test',alg:'RS256'}]});
 const config={ACCESS_TEAM_DOMAIN:'test.cloudflareaccess.com',RELEASE_ACCESS_AUD:'machine',RELEASE_SERVICE_CLIENT_ID:'service.access',RELEASE_OIDC_AUD:'release',RELEASE_WORKFLOW_REF:'JBrickey23/Cookie_Catalog/.github/workflows/release.yml@refs/heads/main',RELEASE_WORKFLOW_SHA:sha,RELEASE_ENVIRONMENT:'release-production'};
 const access={iss:'https://test.cloudflareaccess.com',aud:'machine',sub:'',type:'app',common_name:'service.access'};
 const oidc={iss:'https://token.actions.githubusercontent.com',aud:'release',sub:'opaque-immutable-subject',jti:'test-jti',repository_id:'1415951950',repository_owner_id:'76499785',repository:'JBrickey23/Cookie_Catalog',ref:'refs/heads/main',workflow_ref:config.RELEASE_WORKFLOW_REF,workflow_sha:sha,sha,job_workflow_sha:sha,job_workflow_ref:`JBrickey23/Cookie_Catalog/.github/workflows/release-engine.yml@${sha}`,environment:'release-production',event_name:'workflow_dispatch',runner_environment:'github-hosted',run_id:'12',run_attempt:'1'};
 const sign=(body:object)=>new SignJWT(body).setProtectedHeader({alg:'RS256',kid:'test'}).setIssuedAt().setExpirationTime((body as any).exp??'2m').sign(pair.privateKey);
 async function check(a:any=access,g:any=oidc){return verifyReleaseMachine(new Request('https://catalog.test/api/release-automation/control',{headers:{'Cf-Access-Jwt-Assertion':await sign(a),'X-Release-OIDC':await sign(g)}}),config,key,key);}
 assert.deepEqual(await check(),{run:'12',attempt:1,workflowSha:sha,sourceSha:sha});
 assert.ok(await check(access,{...oidc,repository:'jbrickey23/Cookie_Catalog',workflow_ref:oidc.workflow_ref.replace('JBrickey23','jbrickey23'),job_workflow_ref:oidc.job_workflow_ref.replace('JBrickey23','jbrickey23')}));assert.equal(await check(access,{...oidc,job_workflow_ref:oidc.job_workflow_ref.replace('release-engine.yml','Release-engine.yml')}),null);
 const forgedPair=await generateKeyPair('RS256');const forged=await new SignJWT(access).setProtectedHeader({alg:'RS256',kid:'test'}).setIssuedAt().setExpirationTime('2m').sign(forgedPair.privateKey);assert.equal(await verifyReleaseMachine(new Request('https://catalog.test',{headers:{'Cf-Access-Jwt-Assertion':forged,'X-Release-OIDC':await sign(oidc)}}),config,key,key),null);
 for(const patch of [{aud:'human'},{iss:'https://wrong.test'},{common_name:'other'},{sub:'human',email:'owner@example.test'},{type:'service'},{exp:1}])assert.equal(await check({...access,...patch}),null);
 for(const patch of [{repository_id:'1'},{repository_owner_id:'1'},{ref:'refs/heads/feature/test'},{workflow_sha:baseline},{job_workflow_sha:baseline},{job_workflow_ref:'evil'},{workflow_ref:'evil'},{environment:'development'},{event_name:'pull_request'},{run_attempt:'0'},{runner_environment:'self-hosted'},{aud:'wrong'}])assert.equal(await check(access,{...oidc,...patch}),null);
});
test('CAS lifecycle rejects changed replay, stale ownership and false outcome; verified completion is idempotent',async()=>{
 const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("test")}}',r2Buckets:['FILES']}));
 try{const files=await mf.getR2Bucket('FILES') as any;const principal={run:'12',attempt:1,workflowSha:sha,sourceSha:sha};const id='release_'+crypto.randomUUID();let runtime={sha:baseline,version:v1,health:true};
 const call=(body:any,p:any=principal,finished?:any)=>handleReleaseMachine(new Request('https://catalog.test/api/release-automation/control',{method:'POST',body:JSON.stringify(body)}),files,p,runtime);
 assert.equal((await handleReleaseMachine(new Request('https://catalog.test/api/workspace/cutters',{method:'POST',body:'{}'}),files,principal,runtime)).status,403);
 const begin={action:'begin',id,epoch:'initial',sequence:1,targetSha:sha,baselineSha:baseline,baselineVersion:v1,candidateVersion:v2,planHash:'a'.repeat(64)};
 await files.put(windowKey,JSON.stringify({...begin,startsAt:new Date(Date.now()-1000).toISOString(),run:'12',attempt:1,status:'prepared'}));
 assert.equal((await call(begin)).status,200);assert.equal((await call(begin)).status,200);assert.equal((await call({...begin,planHash:'b'.repeat(64)})).status,409);
 const command=(action:string,sequence:number)=>({action,sequence,id,epoch:id});
 assert.equal((await call(command('finish',2))).status,409);assert.equal((await call(command('deploy',2),{...principal,run:'13'})).status,403);assert.equal((await call(command('deploy',2))).status,200);assert.equal((await call(command('verify',3))).status,409);
 runtime={sha,version:v2,health:true};assert.equal((await call(command('verify',3))).status,200);assert.equal((await call(command('finish',4))).status,200);assert.equal((await call(command('finish',4))).status,200);assert.equal((await releaseStatus(files)).active,false);
 await assert.rejects(()=>requireReleaseEpoch(new Request('https://catalog.test'),files,sha),/version changed/);await requireReleaseEpoch(new Request('https://catalog.test',{headers:{'X-Catalog-Epoch':id,'X-Catalog-Build':sha}}),files,sha);
 const id2='release_'+crypto.randomUUID();runtime={sha:baseline,version:v1,health:true};await files.put(windowKey,JSON.stringify({...begin,id:id2,startsAt:new Date(Date.now()-1000).toISOString(),run:'12',attempt:1,status:'prepared'}));assert.equal((await call({...begin,id:id2,epoch:id})).status,200);assert.equal((await call({action:'takeover',id:id2,epoch:id2,sequence:2},{...principal,attempt:2})).status,200);assert.equal((await call({action:'recover',id:id2,epoch:id2,sequence:3})).status,403);
 const replacement={...principal,run:'14',recovery:true};assert.equal((await call({action:'takeover',id:id2,epoch:id2,sequence:3,planHash:begin.planHash},replacement)).status,403);
 }finally{await mf.dispose();}
});
test('unknown writer failure retains registration and prevents drain',async()=>{
 const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("test")}}',r2Buckets:['FILES']}));try{const files=await mf.getR2Bucket('FILES') as any;await assert.rejects(()=>withReleaseWrite(files,async()=>{await files.put('TEST uncertain','write');throw Error('lost acknowledgement');}));assert.equal((await releaseStatus(files,true)).drained,false);}finally{await mf.dispose();}
});
test('page epoch never silently advances; attachments/Undo share authority and uncertain writes cannot replay',()=>{
 const session=new ReleaseSession();assert.equal(session.paused,true);session.observe({active:false,epoch:'initial',build:sha});assert.equal(session.headers(sha)['X-Catalog-Epoch'],'initial');session.observe({active:true,epoch:'release_new',build:sha});assert.throws(()=>session.headers(sha));session.observe({active:false,epoch:'release_new',build:sha});assert.equal(session.changed,true);assert.throws(()=>session.headers(sha));
 const other=new ReleaseSession();other.observe({active:false,epoch:'initial',build:sha});other.unknownWrite();assert.throws(()=>other.headers(sha));
});

test('central browser transport guards attachments and Undo, never retries an interrupted request',async()=>{
 const {installReleaseFetch}=await import('../src/release-client');const original=(globalThis as any).window;let calls=0,fail=false;const headers:Headers[]=[];
 const fake={location:{href:'https://catalog.test/',origin:'https://catalog.test'},fetch:async(_input:any,init:any)=>{calls++;headers.push(new Headers(init?.headers));if(fail)throw Error('connection lost');return Response.json({ok:true});}};
 (globalThis as any).window=fake;
 try{const session=new ReleaseSession();session.observe({active:false,epoch:'initial',build:sha});installReleaseFetch(session,sha);
 assert.equal((await fake.fetch('/api/attachments',{method:'POST',body:'TEST original'})).status,200);assert.equal(headers[0].get('X-Catalog-Epoch'),'initial');
 fail=true;await assert.rejects(()=>fake.fetch('/api/workspace/cutters/TEST/undo',{method:'POST'}),/connection lost/);assert.equal(calls,2);assert.equal((await fake.fetch('/api/workspace/cutters/TEST/undo',{method:'POST'})).status,409);assert.equal(calls,2);
 }finally{(globalThis as any).window=original;}
});
