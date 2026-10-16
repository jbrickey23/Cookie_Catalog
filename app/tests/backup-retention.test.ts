import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {handleApiRequest} from '../src/worker';
import {startManagedBackup,advanceManagedBackup,completeBackup,listManagedBackups,assertFreshBackup,scheduledBackups} from '../src/server/managed-backups';
import {retentionOverview,retentionPreview,startRetention,advanceRetention,retentionState} from '../src/server/backup-retention';
import {withBackupStorageLock,retentionInProgress,cleanupKey} from '../src/server/backup-storage-lock';
import {sha256,createDatabaseSnapshot} from '../src/server/development-backup';
import type {IdentityVerifier} from '../src/server/access-identity';
const origin='https://catalog.example.test';
const owner:IdentityVerifier={verify:async()=>({subject:'owner',email:'owner@example.test',role:'owner'})};
const editor:IdentityVerifier={verify:async()=>({subject:'editor',email:'editor@example.test',role:'editor'})};
async function env(){const runtime=new Miniflare(convertV4MiniflareOptions({modules:true,script:"export default {fetch(){return new Response('test')}}",d1Databases:{DB:'retention'},r2Buckets:['FILES']}));const db=await runtime.getD1Database('DB') as unknown as D1Database,files=await runtime.getR2Bucket('FILES') as unknown as R2Bucket;const names=['0001_initial.sql','0002_variants_components.sql','0003_import_reviews.sql','0004_catalog_imports.sql'];for(const name of names){const sql=readFileSync('../database/migrations/'+name,'utf8').replace(/^--.*$/gm,'');await db.batch(sql.split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));}await db.prepare('CREATE TABLE d1_migrations(id INTEGER PRIMARY KEY,name TEXT,applied_at TEXT)').run();await db.batch(names.map((n,i)=>db.prepare('INSERT INTO d1_migrations VALUES(?,?,?)').bind(i+1,n,'TEST')));await db.prepare("INSERT INTO shapes(id,name) VALUES('shape-test','TEST retention')").run();const add=async(id:string,value:number)=>{const bytes=new Uint8Array(256).fill(value),hash=await sha256(bytes),key='attachments/'+id+'/original';await files.put(key,bytes);await db.prepare('INSERT INTO attachments(id,storage_key,filename,media_type,byte_size,sha256) VALUES(?,?,?,?,?,?)').bind(id,key,id+'.png','image/png',bytes.length,hash).run();await db.prepare("INSERT INTO shape_attachments VALUES('shape-test',?,'photo')").bind(id).run();return {id,key,hash};};return {runtime,db,files,add};}
async function backup(db:D1Database,files:R2Bucket,kind:'normal'|'pre-change'='normal'){let job=await startManagedBackup(db,files,'owner',kind);while(job.status!=='complete')job=await advanceManagedBackup(files,job.id);return job;}
function request(path:string,value?:unknown,headers:Record<string,string>={}){return new Request(origin+'/api/backups/retention'+path,{method:value===undefined?'GET':'POST',headers:{Origin:origin,'content-type':'application/json','X-Cookie-Catalog-Check':'managed-backup',...headers},...(value===undefined?{}:{body:JSON.stringify(value)})});}
async function ok(response:Response,status=200){assert.equal(response.status,status,await response.clone().text());return response.json() as Promise<any>;}
test('reviewed retention keeps newest seven normal points, protected points and shared files; cleanup resumes after a partial deletion',async()=>{
 const {runtime,db,files,add}=await env();try{
  const old=await add('file_retention_old',1),oldPoint=await backup(db,files);
  await db.prepare('DELETE FROM shape_attachments WHERE attachment_id=?').bind(old.id).run();await db.prepare('DELETE FROM attachments WHERE id=?').bind(old.id).run();await files.delete(old.key);
  const live=await add('file_retention_live',2),protectedPoint=await backup(db,files,'pre-change');for(let i=0;i<8;i++)await backup(db,files);
  const overview=await retentionOverview(files);assert.equal(overview.snapshotCount,10);assert.equal(overview.originalBytes,512);assert(overview.storedBytes>overview.originalBytes);assert(overview.accountedBytes>overview.originalBytes);const ids=overview.backups.filter(j=>j.cleanupRecommended).map(j=>j.id);assert.equal(ids.length,2);assert(ids.includes(oldPoint.id));
  await assert.rejects(()=>retentionPreview(files,[overview.backups[0].id]),/Newest verified/);await assert.rejects(()=>retentionPreview(files,[protectedPoint.id]),/Protected pre-change/);
  const preview=await retentionPreview(files,ids);assert.equal(preview.objectsToRemove,1);assert.equal(preview.reclaimOriginalBytes,256);assert.equal(preview.sharedOriginalsKept,1);assert.equal((await listManagedBackups(files)).length,10,'preview removes nothing');
  await assert.rejects(()=>startRetention(files,'owner',{ids,previewSha256:preview.previewSha256}),/approve/);
  await startRetention(files,'owner',{ids,previewSha256:preview.previewSha256,approved:true});await assert.rejects(()=>startManagedBackup(db,files,'owner'),/cleanup is in progress/);await assert.rejects(()=>advanceManagedBackup(files,overview.backups[0].id),/cleanup is in progress/);
  const routine=new Request(origin+'/api/workspace/shapes',{method:'POST',headers:{Origin:origin,'content-type':'application/json','X-Cookie-Catalog-Check':'workspace'},body:JSON.stringify({shape:{name:'TEST edit remains quick during cleanup'},cutter:null,tags:[]})});await ok(await handleApiRequest(routine,owner,db,files),201);const database=await createDatabaseSnapshot(db,10000);
  const first=await advanceRetention(files);assert.equal(first?.phase,'objects');assert.equal((await listManagedBackups(files)).length,8);
  let injected=false;const failAfterDelete=new Proxy(files,{get(target,key){if(key==='delete')return async(path:string)=>{await target.delete(path);if(path.endsWith(old.hash)&&!injected){injected=true;throw Error('TEST interruption after object deletion');}};const v=Reflect.get(target,key);return typeof v==='function'?v.bind(target):v;}});
  await assert.rejects(()=>advanceRetention(failAfterDelete),/TEST interruption/);assert.equal((await retentionState(files))?.status,'failed');assert.equal(await retentionInProgress(files),true);
  const finished=await advanceRetention(files);assert.equal(finished?.status,'complete');assert.equal(finished?.reclaimedBytes,256);assert.equal(finished?.objectsToRemove,1);assert.equal(await retentionInProgress(files),false);assert.deepEqual(await createDatabaseSnapshot(db,10000),database);assert.equal(await files.head('catalog-backups/objects/'+old.hash),null);assert(await files.head('catalog-backups/objects/'+live.hash));assert(await files.head(live.key));assert.equal((await files.list({prefix:'catalog-backups/record-changes/'})).objects.length,1);
  assert.deepEqual((await advanceRetention(files)),finished,'completed cleanup can be retried');for(const job of await listManagedBackups(files))await completeBackup(files,job.id);assert((await retentionState(files))!.objects.length===0,'completion control stays small');
 }finally{await runtime.dispose();}
});
test('changed previews, retained incomplete references, active restores and owner-only guards fail without cleanup',async()=>{
 const {runtime,db,files,add}=await env();try{
  const a=await add('file_retention_a',1),older=await backup(db,files);const incomplete=await startManagedBackup(db,files,'owner');await backup(db,files);
  const preview=await retentionPreview(files,[older.id]);assert.equal(preview.objectsToRemove,0,'incomplete retained point pins its captured originals');
  await backup(db,files);await assert.rejects(()=>startRetention(files,'owner',{ids:[older.id],previewSha256:preview.previewSha256,approved:true}),/storage changed/);assert.equal((await listManagedBackups(files)).length,4);
  await assert.rejects(()=>retentionPreview(files,[incomplete.id]),/Explicitly approve discarding/);const discard=await retentionPreview(files,[incomplete.id],true);assert.equal(discard.selected[0].status,'copying');
  await files.put('catalog-backups/control/restore.json',JSON.stringify({phase:'copying',sourceId:older.id,beforeId:older.id}));await assert.rejects(()=>retentionPreview(files,[older.id]),/active restore/);await files.delete('catalog-backups/control/restore.json');
  assert.equal((await handleApiRequest(request(''),editor,db,files)).status,403);assert.equal((await handleApiRequest(request('/preview',{ids:[older.id]},{Origin:'https://wrong.test'}),owner,db,files)).status,403);assert.equal((await handleApiRequest(request('/apply',{ids:[older.id],approved:false}),owner,db,files)).status,409);assert(await files.head('catalog-backups/objects/'+a.hash));
 }finally{await runtime.dispose();}
});
test('protected points need reviewed release, verified changes and a newer verified point before becoming cleanup candidates',async()=>{
 const {runtime,db,files,add}=await env();try{
  await add('file_retention_a',1);const point=await backup(db,files,'pre-change');assert.equal((await handleApiRequest(request('/protection-preview',{id:point.id}),owner,db,files)).status,409);await backup(db,files);
  const preview=await ok(await handleApiRequest(request('/protection-preview',{id:point.id}),owner,db,files));assert.equal((await handleApiRequest(request('/release-protection',{...preview,approved:true,changesVerified:false}),owner,db,files)).status,409);
  await ok(await handleApiRequest(request('/release-protection',{...preview,approved:true,changesVerified:true}),owner,db,files));const released=(await listManagedBackups(files)).find(j=>j.id===point.id)!;assert(released.protectionReleasedAt);assert.equal((await completeBackup(files,point.id)).job.id,point.id,'release does not delete the recovery point');await assert.rejects(()=>assertFreshBackup(db,files,point.id),/released from protection/);assert.equal((await retentionPreview(files,[point.id])).selected.length,1);
 }finally{await runtime.dispose();}
});
test('backup storage lease excludes concurrent mutations and cron can resume approved cleanup without a browser',async()=>{
 const {runtime,db,files,add}=await env();try{
  await add('file_retention_a',1);const older=await backup(db,files),pending=await startManagedBackup(db,files,'owner');
  let release!:()=>void,started!:()=>void;const ready=new Promise<void>(resolve=>started=resolve),hold=new Promise<void>(resolve=>release=resolve);
  const operation=withBackupStorageLock(files,async()=>{started();await hold;});await ready;
  try{await assert.rejects(()=>advanceManagedBackup(files,pending.id),/storage is busy/);await scheduledBackups(db,files);assert.equal((await listManagedBackups(files)).find(j=>j.id===pending.id)?.status,'copying');}finally{release();await operation;}
  await advanceManagedBackup(files,pending.id);const preview=await retentionPreview(files,[older.id]);await startRetention(files,'owner',{ids:[older.id],previewSha256:preview.previewSha256,approved:true});for(let i=0;i<4&&(await retentionInProgress(files));i++)await scheduledBackups(db,files);assert.equal((await retentionState(files))?.status,'complete');assert.equal(await retentionInProgress(files),false);
 }finally{await runtime.dispose();}
});
