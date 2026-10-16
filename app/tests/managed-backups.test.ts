import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {handleApiRequest} from '../src/worker';
import {startManagedBackup,advanceManagedBackup,completeBackup,assertFreshBackup,restorePreview,startManagedRestore,advanceManagedRestore,rollbackManagedRestore,restoreInProgress} from '../src/server/managed-backups';
import {createArchiveManifest} from '../src/server/archive-backup';
import {createDatabaseSnapshot,sha256} from '../src/server/development-backup';
import type {IdentityVerifier} from '../src/server/access-identity';
const origin='https://catalog.example.test';
const owner:IdentityVerifier={verify:async()=>({subject:'owner',email:'owner@example.test',role:'owner'})};
async function env(){
 const runtime=new Miniflare(convertV4MiniflareOptions({modules:true,script:"export default {fetch(){return new Response('test')}}",d1Databases:{DB:'managed'},r2Buckets:['FILES']}));
 const db=await runtime.getD1Database('DB') as unknown as D1Database,files=await runtime.getR2Bucket('FILES') as unknown as R2Bucket;
 const names=['0001_initial.sql','0002_variants_components.sql','0003_import_reviews.sql','0004_catalog_imports.sql'];
 for(const name of names){const sql=readFileSync('../database/migrations/'+name,'utf8').replace(/^--.*$/gm,'');await db.batch(sql.split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));}
 await db.prepare('CREATE TABLE d1_migrations(id INTEGER PRIMARY KEY,name TEXT,applied_at TEXT)').run();await db.batch(names.map((n,i)=>db.prepare('INSERT INTO d1_migrations VALUES(?,?,?)').bind(i+1,n,'TEST')));
 await db.prepare("INSERT INTO shapes(id,name) VALUES('test-shape','TEST original')").run();
 const add=async(id:string,byte:number)=>{const bytes=new Uint8Array(256).fill(byte),hash=await sha256(bytes),key='attachments/'+id+'/original';await files.put(key,bytes);await db.prepare('INSERT INTO attachments(id,storage_key,filename,media_type,byte_size,sha256) VALUES(?,?,?,?,?,?)').bind(id,key,id+'.png','image/png',bytes.length,hash).run();await db.prepare("INSERT INTO shape_attachments VALUES('test-shape',?,'cutter_photo')").bind(id).run();return {bytes,hash,key};};
 await add('file_managed_test1',1);return {runtime,db,files,add};
}
async function backup(db:D1Database,files:R2Bucket,kind:'normal'|'pre-change'='normal'){let job=await startManagedBackup(db,files,'owner',kind);while(job.status!=='complete')job=await advanceManagedBackup(files,job.id);return job;}
async function restore(db:D1Database,files:R2Bucket){let last:any;for(let i=0;i<20;i++){last=await advanceManagedRestore(db,files);if(last.status==='complete')return last;}throw Error('Restore failed to finish');}
test('managed snapshots checksum originals, deduplicate safely, resume and remain outside normal exports/orphan checks',async()=>{
 const {runtime,db,files,add}=await env();try{
  for(let i=2;i<=10;i++)await add('file_managed_test'+i,i);
  const original=await createDatabaseSnapshot(db,10000),job=await startManagedBackup(db,files,'owner','pre-change');
  const first=await advanceManagedBackup(files,job.id);assert.equal(first.offset,4);assert.equal(first.status,'copying');
  let done=await advanceManagedBackup(files,job.id);while(done.status!=='complete')done=await advanceManagedBackup(files,job.id);assert.equal(done.status,'complete');assert.equal(done.objects,10);
  assert.deepEqual((await completeBackup(files,done.id)).payload.database,original);
  await assertFreshBackup(db,files,done.id);
  const count=(await files.list({prefix:'catalog-backups/objects/'})).objects.length;await backup(db,files);assert.equal((await files.list({prefix:'catalog-backups/objects/'})).objects.length,count);
  await createArchiveManifest(db,files);
  assert.deepEqual(await createDatabaseSnapshot(db,10000),original);
  await db.prepare("UPDATE shapes SET name='TEST changed' WHERE id='test-shape'").run();await assert.rejects(()=>assertFreshBackup(db,files,done.id),/Catalog changed/);
 }finally{await runtime.dispose();}
});
test('restore requires a fresh protected snapshot and preview; restores database/originals atomically, preserves snapshots, and returns app access',async()=>{
 const {runtime,db,files,add}=await env();try{
  const a=await backup(db,files),target=(await completeBackup(files,a.id)).payload.database;
  await db.prepare("UPDATE shapes SET name='TEST after change' WHERE id='test-shape'").run();const extra=await add('file_managed_new2',2);
  const preview=await restorePreview(db,files,a.id),before=await backup(db,files,'pre-change');
  await assert.rejects(()=>startManagedRestore(db,files,'owner',a.id,a.id,preview.previewSha256),/fresh|separate|protected/i);
  await startManagedRestore(db,files,'owner',a.id,before.id,preview.previewSha256);assert.equal(await restoreInProgress(files),true);
  assert.equal((await handleApiRequest(new Request(origin+'/api/catalog/shapes'),owner,db,files)).status,423);
  const result=await restore(db,files);assert.equal(result.status,'complete');assert.deepEqual(await createDatabaseSnapshot(db,10000),target);
  assert.equal(await files.head(extra.key),null);assert(await files.head('catalog-backups/objects/'+extra.hash));
  assert.equal(await restoreInProgress(files),false);assert.equal((await handleApiRequest(new Request(origin+'/api/catalog/shapes'),owner,db,files)).status,200);
  await createArchiveManifest(db,files);
 }finally{await runtime.dispose();}
});
test('a restore database failure keeps maintenance and its safety snapshot; approved rollback recovers the pre-restore state',async()=>{
 const {runtime,db,files,add}=await env();try{
  const a=await backup(db,files);await db.prepare("UPDATE shapes SET name='TEST keep this' WHERE id='test-shape'").run();await add('file_managed_keep2',2);
  const preview=await restorePreview(db,files,a.id),before=await backup(db,files,'pre-change'),state=await createDatabaseSnapshot(db,10000);
  await startManagedRestore(db,files,'owner',a.id,before.id,preview.previewSha256);await advanceManagedRestore(db,files);
  const broken=new Proxy(db,{get(target,key){if(key==='batch')return async()=>{throw Error('Injected restore failure');};const v=Reflect.get(target,key);return typeof v==='function'?v.bind(target):v;}});
  await assert.rejects(()=>advanceManagedRestore(broken,files),/Injected/);assert.equal(await restoreInProgress(files),true);
  await rollbackManagedRestore(db,files);await restore(db,files);assert.equal(await restoreInProgress(files),false);assert.deepEqual(await createDatabaseSnapshot(db,10000),state);
 }finally{await runtime.dispose();}
});
test('managed backup API enforces owner, method, origin, approval and checksum failure before claiming success',async()=>{
 const {runtime,db,files}=await env();try{
  const viewer:IdentityVerifier={verify:async()=>({subject:'viewer',email:'viewer@example.test',role:'viewer'})};
  const call=(body:unknown,verifier=owner,originHeader=origin)=>handleApiRequest(new Request(origin+'/api/backups',{method:'POST',headers:{Origin:originHeader,'content-type':'application/json','X-Cookie-Catalog-Check':'managed-backup'},body:JSON.stringify(body)}),verifier,db,files);
  assert.equal((await call({},viewer)).status,403);assert.equal((await call({},owner,'https://other.test')).status,403);
  const job=await backup(db,files),saved=await completeBackup(files,job.id),o=saved.payload.objects[0];
  await files.put('catalog-backups/objects/'+o.sha256,new Uint8Array(o.byteSize).fill(99),{sha256:await sha256(new Uint8Array(o.byteSize).fill(99))});
  const before=await backup(db,files,'pre-change').catch(()=>null);assert.equal(before,null);
  const incomplete=await startManagedBackup(db,files,'owner');await assert.rejects(()=>advanceManagedBackup(files,incomplete.id),/checksum/);
 }finally{await runtime.dispose();}
});

test('a real failure after restore deletes/inserts rolls the full D1 batch back and permits safe recovery',async()=>{
 const {runtime,db,files}=await env();try{
  const a=await backup(db,files);await db.prepare("UPDATE shapes SET name='TEST preserve on failure' WHERE id='test-shape'").run();
  const preview=await restorePreview(db,files,a.id),before=await backup(db,files,'pre-change'),state=await createDatabaseSnapshot(db,10000);
  await startManagedRestore(db,files,'owner',a.id,before.id,preview.previewSha256);await advanceManagedRestore(db,files);let calls=0;
  const broken=new Proxy(db,{get(target,key){if(key==='batch')return (statements:D1PreparedStatement[])=>{calls++;return target.batch(calls===4?[...statements.slice(0,-1),target.prepare('INSERT INTO missing_restore_table VALUES(1)'),statements.at(-1)!]:statements);};const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value;}});
  await assert.rejects(()=>advanceManagedRestore(broken,files));assert.equal(calls,4);assert.deepEqual(await createDatabaseSnapshot(db,10000),state);assert.equal(await restoreInProgress(files),true);
  await rollbackManagedRestore(db,files);await restore(db,files);assert.equal(await restoreInProgress(files),false);assert.deepEqual(await createDatabaseSnapshot(db,10000),state);
 }finally{await runtime.dispose();}
});

test('scheduled jobs create fresh daily snapshots at the configured Pacific hour and resume without a browser',async()=>{
 const {scheduledBackups}=await import('../src/server/managed-backups');const {runtime,db,files}=await env();try{
  const request=new Request(origin+'/api/backups/schedule',{method:'POST',headers:{Origin:origin,'content-type':'application/json','X-Cookie-Catalog-Check':'managed-backup'},body:JSON.stringify({enabled:true,hour:2})});assert.equal((await handleApiRequest(request,owner,db,files)).status,200);
  await scheduledBackups(db,files,new Date('2026-10-16T09:00:00Z')); // 02:00 Pacific daylight time.
  const jobs=await files.list({prefix:'catalog-backups/jobs/'});assert.equal(jobs.objects.length,1);const first=await (await files.get(jobs.objects[0].key))!.json<any>();assert.equal(first.status,'copying');
  await scheduledBackups(db,files,new Date('2026-10-16T09:01:00Z'));assert.equal((await (await files.get(jobs.objects[0].key))!.json<any>()).status,'complete');
  await scheduledBackups(db,files,new Date('2026-10-16T09:02:00Z'));assert.equal((await files.list({prefix:'catalog-backups/jobs/'})).objects.length,1);
  await db.prepare("UPDATE shapes SET name='TEST fresh tomorrow' WHERE id='test-shape'").run();await scheduledBackups(db,files,new Date('2026-10-17T09:00:00Z'));assert.equal((await files.list({prefix:'catalog-backups/jobs/'})).objects.length,2);
 }finally{await runtime.dispose();}
});

test('copy progress uses the checksum-bound compact plan and upgrades retained jobs without losing progress',async()=>{
 const {runtime,db,files,add}=await env();try{
  for(let i=2;i<=10;i++)await add('file_managed_test'+i,i);
  const job=await advanceManagedBackup(files,(await startManagedBackup(db,files,'owner')).id);
  assert.equal(job.offset,4);
  const jobKey='catalog-backups/jobs/'+job.id+'.json';
  // Simulate the older deployed job format.
  delete job.copyPlanSha256;await files.put(jobKey,JSON.stringify(job));
  const first=await advanceManagedBackup(files,job.id);assert.equal(first.offset,8);assert(first.copyPlanSha256);
  let manifestReads=0;
  const compact=new Proxy(files,{get(target,key){if(key==='get')return async(path:string,...args:any[])=>{if(path.startsWith('catalog-backups/manifests/')){manifestReads++;throw Error('Progress must not reparse the database manifest');}return (target.get as any)(path,...args);};const v=Reflect.get(target,key);return typeof v==='function'?v.bind(target):v;}});
  let done=await advanceManagedBackup(compact,job.id);assert.equal(done.offset,10);
  done=await advanceManagedBackup(compact,job.id);assert.equal(done.status,'complete');assert.equal(manifestReads,0);
  await completeBackup(files,job.id); // Full manifest is still validated before recovery/use.
  const second=await startManagedBackup(db,files,'owner');
  await files.put('catalog-backups/copy-plans/'+second.id+'.json','{}');
  await assert.rejects(()=>advanceManagedBackup(files,second.id),/checksum/);
  assert.equal((await (await files.get('catalog-backups/jobs/'+second.id+'.json'))!.json<any>()).offset,0);
 }finally{await runtime.dispose();}
});
