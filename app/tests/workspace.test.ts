import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {handleApiRequest} from '../src/worker';
import {startManagedBackup,advanceManagedBackup,completeBackup} from '../src/server/managed-backups';
import type {IdentityVerifier} from '../src/server/access-identity';
const origin='https://catalog.example.test';
const identity=(role:'owner'|'editor'|'viewer'):IdentityVerifier=>({verify:async()=>({subject:role,email:role+'@example.test',role})});
const owner=identity('owner');
async function env(){const runtime=new Miniflare(convertV4MiniflareOptions({modules:true,script:"export default {fetch(){return new Response('test')}}",d1Databases:{DB:'workspace'},r2Buckets:['FILES']}));const db=await runtime.getD1Database('DB') as unknown as D1Database,files=await runtime.getR2Bucket('FILES') as unknown as R2Bucket;const names=['0001_initial.sql','0002_variants_components.sql','0003_import_reviews.sql','0004_catalog_imports.sql','0005_physical_photographs.sql'];for(const name of names){const sql=readFileSync('../database/migrations/'+name,'utf8').replace(/^--.*$/gm,'');await db.batch(sql.split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));}await db.prepare('CREATE TABLE d1_migrations(id INTEGER PRIMARY KEY,name TEXT,applied_at TEXT)').run();await db.batch(names.map((n,i)=>db.prepare('INSERT INTO d1_migrations VALUES(?,?,?)').bind(i+1,n,'TEST')));return {runtime,db,files};}
function request(path:string,method='GET',value?:unknown,revision?:string,backup?:string){return new Request(origin+'/api/workspace'+path,{method,headers:{Origin:origin,'content-type':'application/json','X-Cookie-Catalog-Check':'workspace',...(revision?{'if-match':revision}:{}),...(backup?{'x-catalog-backup':backup}:{})},...(value===undefined?{}:{body:JSON.stringify(value)})});}
async function checkpoint(db:D1Database,files:R2Bucket){let job=await startManagedBackup(db,files,'owner','pre-change');while(job.status!=='complete')job=await advanceManagedBackup(files,job.id);return job.id;}
const cutter=()=>({location_id:null,quantity:1,origin:'unknown',reference_size_mm:95.25,width_mm:null,height_mm:null,slot:null,notes:null});
const draft=(name='TEST new shape')=>({shape:{name,maker:null,source_url:null,notes:'notes'},tags:[],cutter:cutter()});
async function call(db:D1Database,files:R2Bucket,path:string,method='GET',value?:unknown,revision?:string,backup?:string,verifier=owner){return handleApiRequest(request(path,method,value,revision,backup),verifier,db,files);}
async function success(response:Response,status=200){assert.equal(response.status,status,await response.clone().text());return response.json() as Promise<any>;}
test('workspace creates shapes and physical records atomically; staged tags canonicalize, BIN stays independent, and edits retain provenance',async()=>{
 const {runtime,db,files}=await env();try{
  await db.prepare("INSERT INTO locations(id,label) VALUES('bin-001','Bin 001')").run();await db.prepare("INSERT INTO tags(id,label) VALUES('legacy-tag','Holiday')").run();
  const input:any=draft();input.cutter.location_id='bin-001';input.tags=[{label:' holiday '},{label:'Winter'},{label:'ＷＩＮＴＥＲ'}];
  const backup=await checkpoint(db,files),saved=await success(await call(db,files,'/cutters','POST',input,undefined,backup),201);
  assert.equal(saved.cutter.location_id,'bin-001');assert.equal(saved.cutter.origin,'unknown');assert.equal(saved.cutter.quantity,1);assert.equal(saved.tags.length,2);assert(saved.tags.some((t:any)=>t.id==='legacy-tag'));
  assert.equal((await db.prepare('SELECT count(*) n FROM tags').first<any>())?.n,2);assert.equal((await completeBackup(files,backup)).payload.database.tables.physical_cutters.length,0);
  await db.prepare('UPDATE shapes SET notes=? WHERE id=?').bind(JSON.stringify({source:{sectionPath:'Bin 007',pageTitle:'TEST'},reviewState:'not_printed',reason:'TEST evidence'}),saved.shape.id).run();
  const opened=await success(await call(db,files,'/cutters/'+saved.cutter.id));input.shape.notes='User note';input.tags=[];input.cutter.location_id=null;
  const edited=await success(await call(db,files,'/cutters/'+saved.cutter.id,'PUT',input,opened.revision,await checkpoint(db,files)));
  const metadata=JSON.parse(edited.shape.notes);assert.equal(metadata.source.sectionPath,'Bin 007');assert.equal(metadata.catalogNotes,'User note');assert.equal(metadata.reviewState,'not_printed');
  assert.equal(edited.tags.length,0);assert.equal((await db.prepare('SELECT count(*) n FROM tags').first<any>())?.n,2);assert.equal(edited.cutter.location_id,null);
  assert.equal((await call(db,files,'/cutters/'+saved.cutter.id,'PUT',input,opened.revision,backup)).status,412);
  assert.equal((await success(await call(db,files,'/cutters/'+saved.cutter.id))).revision,edited.revision);
 }finally{await runtime.dispose();}
});
test('invalid shape, arbitrary BIN and stale selected shape create no records or orphan vocabulary',async()=>{
 const {runtime,db,files}=await env();try{
  const invalid:any=draft(' ');invalid.tags=[{label:'orphan'}];assert.equal((await call(db,files,'/cutters','POST',invalid)).status,400);
  const unknown:any=draft();unknown.cutter.location_id='new-bin';unknown.tags=[{label:'orphan'}];assert.equal((await call(db,files,'/cutters','POST',unknown)).status,400);
  assert.equal((await db.prepare('SELECT count(*) n FROM shapes').first<any>())?.n,0);assert.equal((await db.prepare('SELECT count(*) n FROM tags').first<any>())?.n,0);
  await db.prepare("INSERT INTO shapes(id,name) VALUES('existing','Existing')").run();const existing=await success(await call(db,files,'/shapes/existing'));
  const input:any=draft('Existing');input.existingShapeId='existing';input.shapeRevision=existing.revision;
  await db.prepare("UPDATE shapes SET maker='Changed' WHERE id='existing'").run();assert.equal((await call(db,files,'/cutters','POST',input,undefined,await checkpoint(db,files))).status,412);
  input.existingShapeId=undefined;input.shapeRevision=undefined;input.shape.maker='Changed';assert.equal((await call(db,files,'/cutters','POST',input)).status,409);
 }finally{await runtime.dispose();}
});
test('delete requires owner confirmation and record protection, checks inbound relationships, and preserves shared shapes',async()=>{
 const {runtime,db,files}=await env();try{
  const saved=await success(await call(db,files,'/cutters','POST',draft(),undefined,await checkpoint(db,files)),201),id=saved.cutter.id;
  assert.equal((await call(db,files,'/cutters/'+id,'DELETE',{approved:true},saved.revision,undefined,identity('editor'))).status,403);
  assert.equal((await call(db,files,'/cutters/'+id,'DELETE',{approved:false},saved.revision)).status,400);
  const shape=await success(await call(db,files,'/shapes/'+saved.shape.id)),protectedPoint=await checkpoint(db,files);
  const linked=await call(db,files,'/shapes/'+saved.shape.id,'DELETE',{approved:true},shape.revision,protectedPoint);assert.equal(linked.status,409,await linked.clone().text());
  assert.equal((await call(db,files,'/cutters/'+id,'DELETE',{approved:true},saved.revision,protectedPoint)).status,200);assert(await db.prepare('SELECT id FROM shapes WHERE id=?').bind(saved.shape.id).first());
  const latest=await success(await call(db,files,'/shapes/'+saved.shape.id));assert.equal((await call(db,files,'/shapes/'+saved.shape.id,'DELETE',{approved:true},latest.revision,await checkpoint(db,files))).status,200);assert.equal((await db.prepare('SELECT count(*) n FROM shapes').first<any>())?.n,0);
 }finally{await runtime.dispose();}
});
test('atomic transaction rejects a racing change and rolls back newly drafted tags',async()=>{
 const {runtime,db,files}=await env();try{
  const saved=await success(await call(db,files,'/cutters','POST',draft(),undefined,await checkpoint(db,files)),201),backup=await checkpoint(db,files),input:any=draft();input.tags=[{label:'must roll back'}];input.cutter.quantity=2;
  let batches=0;const racing=new Proxy(db,{get(target,key){if(key==='batch')return async(statements:D1PreparedStatement[])=>{if(++batches===2)await target.prepare('UPDATE physical_cutters SET quantity=9 WHERE id=?').bind(saved.cutter.id).run();return target.batch(statements);};const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value;}});
  assert.equal((await call(racing,files,'/cutters/'+saved.cutter.id,'PUT',input,saved.revision,backup)).status,412);assert.equal((await db.prepare('SELECT quantity FROM physical_cutters').first<any>())?.quantity,9);assert.equal((await db.prepare('SELECT count(*) n FROM tags').first<any>())?.n,0);
 }finally{await runtime.dispose();}
});
test('workspace role/origin guards run first; editors can protect changes but cannot restore or advance another pending job',async()=>{
 const {runtime,db,files}=await env();try{
  assert.equal((await call(db,files,'/checkpoint','POST',{},undefined,undefined,identity('viewer'))).status,403);assert.equal((await handleApiRequest(new Request(origin+'/api/workspace/checkpoint',{method:'POST',headers:{Origin:'https://wrong.test'}}),owner,db,files)).status,403);
  const job=await success(await call(db,files,'/checkpoint','POST',{},undefined,undefined,identity('editor')),201);assert.equal((await call(db,files,'/checkpoint','POST',{id:job.id})).status,404);
  const done=await success(await call(db,files,'/checkpoint','POST',{id:job.id},undefined,undefined,identity('editor')));assert.equal(done.status,'complete');assert.equal((await handleApiRequest(new Request(origin+'/api/backups'),identity('editor'),db,files)).status,403);
 }finally{await runtime.dispose();}
});
test('a SQL failure after shape, tag and cutter insertion rolls back the entire new entry and retains its recovery point',async()=>{
 const {runtime,db,files}=await env();try{const backup=await checkpoint(db,files);let batches=0;const broken=new Proxy(db,{get(target,key){if(key==='batch')return async(statements:D1PreparedStatement[])=>target.batch(++batches===2?[...statements,target.prepare('INSERT INTO missing_workspace_table VALUES(1)')]:statements);const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value;}});const input:any=draft();input.tags=[{label:'no orphan'}];const response=await call(broken,files,'/cutters','POST',input,undefined,backup);assert.notEqual(response.status,201);for(const table of ['shapes','physical_cutters','tags','shape_tags'])assert.equal((await db.prepare('SELECT count(*) n FROM '+table).first<any>())?.n,0);assert.equal((await completeBackup(files,backup)).job.status,'complete');}finally{await runtime.dispose();}
});
test('maximum tag associations use a bounded transaction; removing them preserves every shared tag',async()=>{
 const {runtime,db,files}=await env();try{const input:any=draft();input.tags=Array.from({length:50},(_,i)=>({label:'TEST tag '+i}));const backup=await checkpoint(db,files);let prepared=0;const counted=new Proxy(db,{get(target,key){if(key==='prepare')return(sql:string)=>{prepared++;return target.prepare(sql);};const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value;}});const saved=await success(await call(counted,files,'/cutters','POST',input,undefined,backup),201);assert.equal(saved.tags.length,50);assert(prepared<=50,'save remains within the conservative per-request query budget');input.tags=[];await success(await call(db,files,'/cutters/'+saved.cutter.id,'PUT',input,saved.revision,await checkpoint(db,files)));assert.equal((await db.prepare('SELECT count(*) n FROM tags').first<any>())?.n,50);assert.equal((await db.prepare('SELECT count(*) n FROM shape_tags').first<any>())?.n,0);}finally{await runtime.dispose();}
});
test('shape deletion explicitly blocks cascade tag relationships rather than silently removing them',async()=>{
 const {runtime,db,files}=await env();try{await db.prepare("INSERT INTO shapes(id,name) VALUES('s','TEST tagged shape')").run();await db.prepare("INSERT INTO tags(id,label) VALUES('t','TEST shared')").run();await db.prepare("INSERT INTO shape_tags VALUES('s','t')").run();const opened=await success(await call(db,files,'/shapes/s'));const response=await call(db,files,'/shapes/s','DELETE',{approved:true},opened.revision,await checkpoint(db,files));assert.equal(response.status,409);assert.equal((await db.prepare('SELECT count(*) n FROM shape_tags').first<any>())?.n,1);}finally{await runtime.dispose();}
});

test('routine create/edit/delete use one small recovery write and never read original files or full snapshots',async()=>{
 const {runtime,db,files}=await env();try{
  let puts=0;const sizes:number[]=[];
  const bounded=new Proxy(files,{get(target,key){if(['list','head','delete'].includes(String(key)))return()=>{throw Error('Routine change must not scan storage');};if(key==='get')return(path:string,...args:any[])=>{assert.equal(path,'catalog-backups/control/restore.json');return (target.get as any)(path,...args);};if(key==='put')return(path:string,value:Uint8Array,options:any)=>{assert(path.startsWith('catalog-backups/record-changes/'));puts++;sizes.push(value.byteLength);return target.put(path,value,options);};const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value;}});
  const saved=await success(await call(db,bounded,'/cutters','POST',draft()),201);assert(saved.recoveryId);assert.equal(puts,1);
  const input=draft();input.cutter.quantity=2;const edited=await success(await call(db,bounded,'/cutters/'+saved.cutter.id,'PUT',input,saved.revision));assert.equal(puts,2);
  await success(await call(db,bounded,'/cutters/'+saved.cutter.id,'DELETE',{approved:true},edited.revision));assert.equal(puts,3);assert(sizes.every(size=>size<5000));
  const listing=await success(await call(db,files,'/recovery'));assert.equal(listing.changes.length,3);
 }finally{await runtime.dispose();}
});
async function undo(db:D1Database,files:R2Bucket,id:string){const preview=await success(await call(db,files,'/recovery/'+id));assert.equal(preview.canUndo,true,preview.reason);return success(await call(db,files,'/recovery/'+id,'POST',{approved:true},preview.revision));}
test('record undo restores edits, tags, deleted rows and new entries without full archive work',async()=>{
 const {runtime,db,files}=await env();try{
  const original:any=draft();original.tags=[{label:'TEST keep shared'}];const saved=await success(await call(db,files,'/cutters','POST',original),201);
  const input:any=draft('TEST changed name');input.tags=[];input.cutter.quantity=7;
  const edited=await success(await call(db,files,'/cutters/'+saved.cutter.id,'PUT',input,saved.revision));const review=await success(await call(db,files,'/recovery/'+edited.recoveryId));assert.deepEqual(review.changes.find((c:any)=>c.field==='Quantity'),{field:'Quantity',current:'7',restore:'1'});await undo(db,files,edited.recoveryId);
  const reopened=await success(await call(db,files,'/cutters/'+saved.cutter.id));assert.equal(reopened.shape.name,saved.shape.name);assert.equal(reopened.cutter.quantity,1);assert.deepEqual(reopened.tags,saved.tags);
  const removed=await success(await call(db,files,'/cutters/'+saved.cutter.id,'DELETE',{approved:true},reopened.revision));assert.equal((await call(db,files,'/cutters/'+saved.cutter.id)).status,404);await undo(db,files,removed.recoveryId);assert.equal((await success(await call(db,files,'/cutters/'+saved.cutter.id))).revision,saved.revision);
  await undo(db,files,saved.recoveryId);assert.equal((await call(db,files,'/cutters/'+saved.cutter.id)).status,404);assert.equal((await db.prepare('SELECT count(*) n FROM shapes').first<any>())?.n,0);assert.equal((await db.prepare('SELECT count(*) n FROM tags').first<any>())?.n,1,'shared vocabulary is retained');
  const shape=await success(await call(db,files,'/shapes','POST',{shape:{name:'TEST recover shape'},cutter:null,tags:[]}),201);
  const deleted=await success(await call(db,files,'/shapes/'+shape.shape.id,'DELETE',{approved:true},shape.revision));await undo(db,files,deleted.recoveryId);assert.equal((await success(await call(db,files,'/shapes/'+shape.shape.id))).shape.name,'TEST recover shape');
 }finally{await runtime.dispose();}
});
test('a missing recovery write blocks a save; failed SQL leaves a recovery attempt that cannot undo unrelated data',async()=>{
 const {runtime,db,files}=await env();try{
  const unavailable=new Proxy(files,{get(target,key){if(key==='put')return()=>{throw Error('TEST recovery unavailable');};const v=Reflect.get(target,key);return typeof v==='function'?v.bind(target):v;}});
  assert.equal((await call(db,unavailable,'/cutters','POST',draft())).status,400);assert.equal((await db.prepare('SELECT count(*) n FROM shapes').first<any>())?.n,0);
  let batches=0;const broken=new Proxy(db,{get(target,key){if(key==='batch')return async(statements:D1PreparedStatement[])=>target.batch(++batches===2?[...statements,target.prepare('INSERT INTO missing_test_table VALUES(1)')]:statements);const v=Reflect.get(target,key);return typeof v==='function'?v.bind(target):v;}});
  assert.notEqual((await call(broken,files,'/cutters','POST',draft())).status,201);
  const changes=await success(await call(db,files,'/recovery'));assert.equal(changes.changes.length,1);const preview=await success(await call(db,files,'/recovery/'+changes.changes[0].id));assert.equal(preview.canUndo,false);
  assert.equal((await call(db,files,'/recovery/'+preview.id,'POST',{approved:true},preview.revision)).status,412);
 }finally{await runtime.dispose();}
});
test('undo denies non-owners, stale/racing edits, corrupt recovery records and new relationships',async()=>{
 const {runtime,db,files}=await env();try{
  const saved=await success(await call(db,files,'/cutters','POST',draft()),201),path='/recovery/'+saved.recoveryId;
  assert.equal((await call(db,files,path,'GET',undefined,undefined,undefined,identity('editor'))).status,403);assert.equal((await call(db,files,'/recovery','GET',undefined,undefined,undefined,identity('viewer'))).status,403);
  const preview=await success(await call(db,files,path));assert.equal((await call(db,files,path,'POST',{approved:false},preview.revision)).status,400);
  await db.prepare('UPDATE physical_cutters SET quantity=9 WHERE id=?').bind(saved.cutter.id).run();assert.equal((await call(db,files,path,'POST',{approved:true},preview.revision)).status,412);
  await db.prepare('UPDATE physical_cutters SET quantity=1 WHERE id=?').bind(saved.cutter.id).run();
  await db.prepare("INSERT INTO attachments(id,storage_key,filename) VALUES('test-file','attachments/test-file/original','test.png')").run();await db.prepare("INSERT INTO shape_attachments VALUES(?,'test-file','photo')").bind(saved.shape.id).run();
  assert.equal((await call(db,files,path,'POST',{approved:true},preview.revision)).status,409);assert.equal((await db.prepare('SELECT quantity FROM physical_cutters WHERE id=?').bind(saved.cutter.id).first<any>())?.quantity,1,'failed undo rolls back its earlier cutter deletion');
  await files.put('catalog-backups/record-changes/'+saved.recoveryId+'.json','{}');assert.equal((await call(db,files,path)).status,409);
 }finally{await runtime.dispose();}
});
test('undo restores fifty tag associations within a bounded query budget and rejects a transaction race',async()=>{
 const {runtime,db,files}=await env();try{
  const input:any=draft();input.tags=Array.from({length:50},(_,i)=>({label:'TEST many '+i}));const saved=await success(await call(db,files,'/cutters','POST',input),201);
  input.tags=[];const edited=await success(await call(db,files,'/cutters/'+saved.cutter.id,'PUT',input,saved.revision));const preview=await success(await call(db,files,'/recovery/'+edited.recoveryId));
  let prepared=0;const counted=new Proxy(db,{get(target,key){if(key==='prepare')return(sql:string)=>{prepared++;return target.prepare(sql);};const v=Reflect.get(target,key);return typeof v==='function'?v.bind(target):v;}});
  await success(await call(counted,files,'/recovery/'+edited.recoveryId,'POST',{approved:true},preview.revision));assert(prepared<=30,'tag undo uses bulk SQL, not one query per tag');assert.equal((await db.prepare('SELECT count(*) n FROM shape_tags').first<any>())?.n,50);
  const latest=await success(await call(db,files,'/cutters/'+saved.cutter.id));input.cutter.quantity=2;const changed=await success(await call(db,files,'/cutters/'+saved.cutter.id,'PUT',input,latest.revision));const fresh=await success(await call(db,files,'/recovery/'+changed.recoveryId));
  let batches=0;const racing=new Proxy(db,{get(target,key){if(key==='batch')return async(statements:D1PreparedStatement[])=>{if(++batches===2)await target.prepare('UPDATE physical_cutters SET quantity=8 WHERE id=?').bind(saved.cutter.id).run();return target.batch(statements);};const v=Reflect.get(target,key);return typeof v==='function'?v.bind(target):v;}});
  assert.equal((await call(racing,files,'/recovery/'+changed.recoveryId,'POST',{approved:true},fresh.revision)).status,409);assert.equal((await db.prepare('SELECT quantity FROM physical_cutters').first<any>())?.quantity,8);
 }finally{await runtime.dispose();}
});


test('producer references stay distinct; linked inventory is physical-only and quantity and sizes share identity',async()=>{
 const {runtime,db,files}=await env();try{
  const ref=async(maker:string)=>success(await call(db,files,'/shapes','POST',{shape:{name:'TEST Christmas Tree',maker,source_url:null,notes:null},tags:[],cutter:null}),201);
  const a=await ref('Producer A'),b=await ref('Producer B');assert.notEqual(a.shape.id,b.shape.id);
  assert.equal((await call(db,files,'/shapes','POST',{shape:{name:' TEST Christmas Tree ',maker:'producer a'},tags:[],cutter:null})).status,409);
  const input:any={shape:{name:a.shape.name,maker:a.shape.maker,source_url:null,notes:null},tags:[],existingShapeId:a.shape.id,shapeRevision:a.revision,cutter:{...cutter(),quantity:2,reference_size_mm:76.2,notes:'Medium; interchangeable copies'}};
  const medium=await success(await call(db,files,'/cutters','POST',input),201);assert.equal(medium.cutter.quantity,2);
  input.cutter={...cutter(),reference_size_mm:101.6,notes:'Large'};const large=await success(await call(db,files,'/cutters','POST',input),201);
  assert.equal(large.shape.id,medium.shape.id);assert.notEqual(large.cutter.id,medium.cutter.id);
  assert.equal((await success(await call(db,files,'/shapes/'+a.shape.id))).revision,a.revision,'physical creation preserves reference revision');
  input.shape.name='Do not change shared reference';assert.equal((await call(db,files,'/cutters','POST',input)).status,400);
  const related=await success(await call(db,files,'/shapes/'+a.shape.id+'/inventory'));assert.equal(related.items.length,2);
  const browse=async(q:string,kind='all')=>success(await handleApiRequest(new Request(origin+'/api/browse?q='+encodeURIComponent(q)+'&kind='+kind),owner,db,files));
  assert.equal((await browse('"Producer A"')).items.length,2);assert.equal((await browse('Christmas Tree','reference')).items.length,2);
  const before=(await db.prepare('SELECT count(*) n FROM shapes').first<any>())!.n;
  for(const url of ['example.test','https:example.test','javascript:alert(1)'])assert.equal((await call(db,files,'/shapes','POST',{shape:{name:'TEST invalid URL',source_url:url},tags:[],cutter:null})).status,400);
  assert.equal((await db.prepare('SELECT count(*) n FROM shapes').first<any>())!.n,before);
 }finally{await runtime.dispose();}
});
