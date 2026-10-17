import assert from 'node:assert/strict';
import {test} from 'node:test';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {withReleaseWrite,releaseStatus,handleReleaseMaintenance} from '../src/server/release-maintenance';
import {handleReleaseGuardedApi} from '../src/worker';
const mf=()=>new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("test")}}',r2Buckets:['FILES']}));
const owner={verify:async()=>({role:'owner' as const,subject:'TEST owner',email:null})};
const request=(body:unknown)=>new Request('https://catalog.test/api/release-maintenance',{method:'POST',headers:{Origin:'https://catalog.test','X-Cookie-Catalog-Check':'release-maintenance','content-type':'application/json'},body:JSON.stringify(body)});
const sha='a'.repeat(40);
test('release gate drains admitted writes, blocks all new mutation routes, preserves reads and records explicit unlock',async()=>{
 const instance=mf();try{const files=await instance.getR2Bucket('FILES') as any;let entered!:()=>void,finish!:()=>void;const enteredPromise=new Promise<void>(r=>entered=r),finishPromise=new Promise<void>(r=>finish=r);
 const running=withReleaseWrite(files,async()=>{entered();await finishPromise;await files.put('TEST admitted','completed');});await enteredPromise;
 const begin=await handleReleaseGuardedApi(request({action:'begin',targetSha:sha}),owner,undefined,files);assert.equal(begin.status,201);const first=await begin.json() as any;assert.equal(first.inFlight.length,1);assert.equal(first.ready,false);
 for(const path of ['/api/workspace/cutters','/api/attachments','/api/backups','/api/import-reviews','/api/change-requests']){
 const response=await handleReleaseGuardedApi(new Request('https://catalog.test'+path,{method:'POST'}),owner,undefined,files);assert.equal(response.status,423,path);}
 assert.equal((await handleReleaseGuardedApi(new Request('https://catalog.test/api/session'),owner,undefined,files)).status,200);
 const complete=()=>request({action:'finish',id:first.gate.id,targetSha:sha,outcome:'canceled',confirmed:true});assert.equal((await handleReleaseGuardedApi(complete(),owner,undefined,files)).status,409);
 finish();await running;assert.equal((await releaseStatus(files,true)).ready,true);
 assert.equal((await handleReleaseGuardedApi(complete(),owner,undefined,files)).status,200);
 let resumed=false;await withReleaseWrite(files,async()=>{resumed=true;});assert.equal(resumed,true);assert.equal((await files.list({prefix:'catalog-release/receipts/'})).objects.length,1);
 }finally{await instance.dispose();}
});
test('admission race rechecks maintenance after registration and releases its unused lease',async()=>{
 const instance=mf();try{const files=await instance.getR2Bucket('FILES') as any;let raced=false,called=false;
 const proxy=new Proxy(files,{get(target,key){if(key==='put')return async(path:string,...args:any[])=>{const result=await target.put(path,...args);if(path.startsWith('catalog-release/active/')&&!raced){raced=true;assert.equal((await handleReleaseMaintenance(request({action:'begin',targetSha:sha}),files,'TEST owner',true)).status,201);}return result;};const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value;}});
 await assert.rejects(()=>withReleaseWrite(proxy,async()=>{called=true;}),/release is in progress/);assert.equal(called,false);assert.equal((await releaseStatus(files,true)).ready,true);
 }finally{await instance.dispose();}
});
test('unauthorized control, corrupt gate state and orphaned writes fail closed without timeout unlock',async()=>{
 const instance=mf();try{const files=await instance.getR2Bucket('FILES') as any;assert.equal((await handleReleaseMaintenance(request({action:'begin',targetSha:sha}),files,'TEST viewer',false)).status,403);
 await files.put('catalog-release/active/TEST interrupted','active',{customMetadata:{startedAt:'2000-01-01T00:00:00.000Z'}});
 const begin=await handleReleaseMaintenance(request({action:'begin',targetSha:sha}),files,'TEST owner',true),body=await begin.json() as any;assert.equal(body.ready,false);
 assert.equal((await handleReleaseMaintenance(request({action:'finish',id:body.gate.id,targetSha:sha,outcome:'verified',confirmed:true}),files,'TEST owner',true)).status,409);
 await files.put('catalog-release/control/maintenance.json','{}');assert.equal((await handleReleaseGuardedApi(new Request('https://catalog.test/api/change-requests',{method:'POST'}),owner,undefined,files)).status,503);
 }finally{await instance.dispose();}
});

test('unfinished background backup/restore prevents deployment readiness; a drained gate can be canceled to resume recovery',async()=>{
 const instance=mf();try{const files=await instance.getR2Bucket('FILES') as any;
 await files.put('catalog-backups/jobs/TEST.json',JSON.stringify({status:'copying'}));
 await files.put('catalog-backups/control/restore.json',JSON.stringify({phase:'database'}));
 const response=await handleReleaseMaintenance(request({action:'begin',targetSha:sha}),files,'TEST owner',true),value=await response.json() as any;
 assert.equal(value.drained,true);assert.equal(value.ready,false);assert.equal(value.pendingBackgroundWork.length,2);
 const finish=(outcome:string)=>handleReleaseMaintenance(request({action:'finish',id:value.gate.id,targetSha:sha,outcome,confirmed:true}),files,'TEST owner',true);
 assert.equal((await finish('verified')).status,409);assert.equal((await finish('canceled')).status,200);
 }finally{await instance.dispose();}
});

test('success and rollback outcomes reopen only the matching drained release and persist receipts',async()=>{
 const instance=mf();try{const files=await instance.getR2Bucket('FILES') as any;for(const outcome of ['verified','rolled-back']){
 const started=await (await handleReleaseMaintenance(request({action:'begin',targetSha:sha}),files,'TEST owner',true)).json() as any;
 assert.equal((await handleReleaseMaintenance(request({action:'finish',id:'wrong',targetSha:sha,outcome,confirmed:true}),files,'TEST owner',true)).status,409);
 assert.equal((await handleReleaseMaintenance(request({action:'finish',id:started.gate.id,targetSha:sha,outcome,confirmed:true}),files,'TEST owner',true)).status,200);
 assert.equal((await releaseStatus(files)).active,false);
 }assert.equal((await files.list({prefix:'catalog-release/receipts/'})).objects.length,2);
 }finally{await instance.dispose();}
});
