import {createArchiveManifest} from './archive-backup';
import {sha256,BACKUP_TABLES,REVIEW_TABLES,IMPORT_TABLES} from './development-backup';
import type {ArchiveObject} from '../archive-format';
export const BACKUP_PREFIX='catalog-backups/';
const key=(type:string,id:string)=>BACKUP_PREFIX+type+'/'+id+'.json';
const idPattern=/^backup_[a-f0-9]{32}$/;
const lockKey=key('control','restore');
const objectKey=(o:ArchiveObject)=>BACKUP_PREFIX+'objects/'+o.sha256;
const json=(v:unknown,status=200)=>Response.json(v,{status,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
const hex=(b:ArrayBuffer)=>Array.from(new Uint8Array(b),n=>n.toString(16).padStart(2,'0')).join('');
const digest=(v:unknown)=>sha256(new TextEncoder().encode(JSON.stringify(v)));
type Payload={environment:string;database:{schema:{type:string;name:string;tbl_name:string;sql:string|null}[];tables:Record<string,Record<string,any>[]>};objects:ArchiveObject[]};
type Manifest={format:string;version:number;exportedAt:string;payloadJson:string;payloadSha256:string};
export type BackupJob={id:string;kind:'normal'|'pre-change';status:'copying'|'complete'|'failed';error?:string;offset:number;objects:number;bytes:number;tables:number;records:number;exportedAt:string;createdBy:string;manifestSha256:string;copyPlanSha256?:string};
async function read<T>(files:R2Bucket,path:string):Promise<{value:T;etag:string}|null>{const object=await files.get(path);if(!object)return null;if(object.size>18*1024**2)throw Error('Backup metadata limit exceeded.');return {value:await object.json<T>(),etag:object.etag};}
async function put(files:R2Bucket,path:string,value:unknown,etag?:string){const saved=await files.put(path,JSON.stringify(value),{httpMetadata:{contentType:'application/json'},...(etag?{onlyIf:{etagMatches:etag}}:{})});if(!saved)throw Error('Backup progress changed. Refresh and resume.');return saved;}
async function source(files:R2Bucket,id:string){if(!idPattern.test(id))throw Error('Choose a valid backup.');const raw=await files.get(key('manifests',id));if(!raw||raw.size>16*1024**2)throw Error('Backup manifest is missing or oversized.');const bytes=new Uint8Array(await raw.arrayBuffer()),manifest=JSON.parse(new TextDecoder().decode(bytes)) as Manifest;if(manifest.format!=='cookie-catalog-archive'||manifest.version!==1||await sha256(new TextEncoder().encode(manifest.payloadJson))!==manifest.payloadSha256)throw Error('Backup manifest checksum failed.');return {bytes,manifest,payload:JSON.parse(manifest.payloadJson) as Payload};}
export async function listManagedBackups(files:R2Bucket){const page=await files.list({prefix:BACKUP_PREFIX+'jobs/',limit:20});if(page.truncated)throw Error('Backup limit reached. Review retained snapshots.');const jobs=[];for(const object of page.objects){const item=await read<BackupJob>(files,object.key);if(item)jobs.push(item.value);}return jobs.sort((a,b)=>b.exportedAt.localeCompare(a.exportedAt));}
export async function startManagedBackup(db:D1Database,files:R2Bucket,createdBy:string,kind:'normal'|'pre-change'='normal'){
 const jobs=await listManagedBackups(files);if(jobs.length>=12)throw Error('Twelve managed snapshots are retained. Review retention before creating another; nothing was deleted.');
 const bytes=await createArchiveManifest(db,files),manifest=JSON.parse(new TextDecoder().decode(bytes)) as Manifest,payload=JSON.parse(manifest.payloadJson) as Payload;
 const total=payload.objects.reduce((n,o)=>n+o.byteSize,0);if(total>1024**3||jobs.reduce((n,j)=>n+j.bytes,0)+total>2*1024**3)throw Error('Managed backup storage safety limit reached. Review retention; no paid capacity or automatic deletion was enabled.');
 const id='backup_'+crypto.randomUUID().replaceAll('-',''),job:BackupJob={id,kind,status:'copying',offset:0,objects:payload.objects.length,bytes:total,tables:Object.keys(payload.database.tables).length,records:Object.values(payload.database.tables).reduce((n,rows)=>n+rows.length,0),exportedAt:manifest.exportedAt,createdBy,manifestSha256:await sha256(bytes)};
 await files.put(key('manifests',id),bytes,{sha256:job.manifestSha256,httpMetadata:{contentType:'application/json'}});await saveCopyPlan(files,job,{manifestSha256:job.manifestSha256,payloadSha256:manifest.payloadSha256,objects:payload.objects});await put(files,key('jobs',id),job);return job;
}
type CopyPlan={manifestSha256:string;payloadSha256:string;objects:ArchiveObject[]};
// Progress requests must not parse every saved review/database row for each few files.
async function saveCopyPlan(files:R2Bucket,job:BackupJob,plan:CopyPlan){
 const bytes=new TextEncoder().encode(JSON.stringify(plan));
 job.copyPlanSha256=await sha256(bytes);
 await files.put(key('copy-plans',job.id),bytes,{sha256:job.copyPlanSha256,httpMetadata:{contentType:'application/json'}});
}
async function copyPlan(files:R2Bucket,job:BackupJob):Promise<CopyPlan>{
 if(!job.copyPlanSha256){
  // Upgrade retained jobs in place without replacing their snapshot or completed offset.
  const data=await source(files,job.id);
  if(await sha256(data.bytes)!==job.manifestSha256)throw Error('Backup job manifest changed.');
  const plan={manifestSha256:job.manifestSha256,payloadSha256:data.manifest.payloadSha256,objects:data.payload.objects};
  await saveCopyPlan(files,job,plan);return plan;
 }
 const object=await files.get(key('copy-plans',job.id));
 if(!object||object.size>1024**2)throw Error('Backup copy plan is missing or oversized.');
 const bytes=new Uint8Array(await object.arrayBuffer());
 if(await sha256(bytes)!==job.copyPlanSha256)throw Error('Backup copy plan checksum failed.');
 const plan=JSON.parse(new TextDecoder().decode(bytes)) as CopyPlan;
 if(plan.manifestSha256!==job.manifestSha256||plan.objects.length!==job.objects)throw Error('Backup copy plan changed.');
 return plan;
}
async function checkedObject(files:R2Bucket,o:ArchiveObject){const object=await files.head(objectKey(o));if(!object||object.size!==o.byteSize||!object.checksums.sha256||hex(object.checksums.sha256)!==o.sha256)throw Error('A managed original failed its stored checksum.');return object;}
export async function advanceManagedBackup(files:R2Bucket,id:string){
 const record=await read<BackupJob>(files,key('jobs',id));if(!record)throw Error('Backup job not found.');if(record.value.status==='complete')return record.value;
 const job=record.value,plan=await copyPlan(files,job);
 for(const o of plan.objects.slice(job.offset,job.offset+4)){
  let saved=await files.head(objectKey(o));
  if(!saved){const original=await files.get(o.key,{onlyIf:{etagMatches:o.etag}});if(!original||!('body'in original)||original.size!==o.byteSize)throw Error('An original changed during backup. No risky operation was applied.');saved=await files.put(objectKey(o),original.body,{sha256:o.sha256,onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:o.contentType??'application/octet-stream'}});}
  await checkedObject(files,o);job.offset++;
 }
 if(job.offset===job.objects){await put(files,key('receipts',id),{format:'cookie-catalog-managed-backup-receipt',version:1,id,manifestSha256:job.manifestSha256,payloadSha256:plan.payloadSha256,objects:job.objects,bytes:job.bytes,verifiedAt:new Date().toISOString(),databaseForeignKeysChecked:true,originalChecksumsChecked:true,independentCopy:false});job.status='complete';}
 await put(files,key('jobs',id),job,record.etag);return job;
}
export async function completeBackup(files:R2Bucket,id:string){const job=await read<BackupJob>(files,key('jobs',id)),receipt=await read<{manifestSha256:string}>(files,key('receipts',id));if(!job||job.value.status!=='complete'||!receipt||receipt.value.manifestSha256!==job.value.manifestSha256)throw Error('Choose a completed, verified backup.');const data=await source(files,id);if(await sha256(data.bytes)!==job.value.manifestSha256)throw Error('Backup receipt checksum failed.');return {...data,job:job.value};}
export async function assertFreshBackup(db:D1Database,files:R2Bucket,id:string){const saved=await completeBackup(files,id),current=JSON.parse(new TextDecoder().decode(await createArchiveManifest(db,files))) as Manifest;if(current.payloadSha256!==saved.manifest.payloadSha256)throw Error('Catalog changed after this backup. Create a fresh automatic backup before applying.');return saved;}
export async function restoreInProgress(files:R2Bucket){const lock=await read<Restore>(files,lockKey);return !!lock&&String(lock.value.phase)!=='complete';}
type Restore={id:string;sourceId:string;beforeId:string;phase:'copying'|'database'|'cleanup';offset:number;cleanupOffset:number;baseline:string;baselinePath?:string;cleanupIds:string[];paused?:boolean;lastError?:string;createdBy:string};
const sameSchema=(a:Payload,b:Payload)=>JSON.stringify(a.database.schema)===JSON.stringify(b.database.schema);
export async function restorePreview(db:D1Database,files:R2Bucket,id:string){const saved=await completeBackup(files,id),bytes=await createArchiveManifest(db,files),current=JSON.parse(new TextDecoder().decode(bytes)) as Manifest,payload=JSON.parse(current.payloadJson) as Payload;if(!sameSchema(saved.payload,payload))throw Error('This backup needs a schema-compatible recovery adapter before live restore.');return {id,exportedAt:saved.manifest.exportedAt,tables:Object.keys(saved.payload.database.tables).length,records:Object.values(saved.payload.database.tables).reduce((n,r)=>n+r.length,0),physicalCutters:saved.payload.database.tables.physical_cutters.length,currentPhysicalCutters:payload.database.tables.physical_cutters.length,designs:saved.payload.database.tables.designs.length,originals:saved.payload.objects.length,currentRecords:Object.values(payload.database.tables).reduce((n,r)=>n+r.length,0),previewSha256:await digest([id,saved.job.manifestSha256,current.payloadSha256]),liveWrites:false};}
export async function startManagedRestore(db:D1Database,files:R2Bucket,subject:string,id:string,beforeId:string,previewSha256:string){
 const preview=await restorePreview(db,files,id);if(preview.previewSha256!==previewSha256)throw Error('Catalog or restore preview changed. Review a fresh preview.');const before=await assertFreshBackup(db,files,beforeId);if(before.job.kind!=='pre-change'||beforeId===id)throw Error('A separate fresh protected pre-restore snapshot is required.');
 const restore:Restore={id:'restore_'+crypto.randomUUID().replaceAll('-',''),sourceId:id,beforeId,phase:'copying',offset:0,cleanupOffset:0,baseline:before.manifest.payloadSha256,cleanupIds:[id,beforeId],createdBy:subject};
 const previous=await read<Restore>(files,lockKey);if(previous&&String(previous.value.phase)!=='complete')throw Error('A restore is already active.');
 const lock=await files.put(lockKey,JSON.stringify(restore),{onlyIf:previous?{etagMatches:previous.etag}:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'}});if(!lock)throw Error('A restore is already active. Resume it rather than starting another.');return restore;
}
function quote(s:string){if(!/^[a-z_][a-z0-9_]*$/.test(s))throw Error('Invalid restore identifier.');return '"'+s+'"';}
function chunks(rows:Record<string,any>[]){const output:Record<string,any>[][]=[];let current:Record<string,any>[]=[],length=2;for(const row of rows){const size=JSON.stringify(row).length+1;if(size>80000)throw Error('A restored row exceeds the supported statement limit.');if(length+size>80000){output.push(current);current=[];length=2;}current.push(row);length+=size;}if(current.length)output.push(current);return output;}
async function replaceDatabase(db:D1Database,target:Payload,before:Payload){
 const names=Object.keys(target.database.tables),known=[...BACKUP_TABLES,...REVIEW_TABLES,...IMPORT_TABLES] as string[];
 if(names.some(n=>!known.includes(n))||JSON.stringify([...names].sort())!==JSON.stringify(Object.keys(before.database.tables).sort()))throw Error('Unsupported restore table profile.');
 const columns=await db.batch(names.map(n=>db.prepare('PRAGMA table_info('+quote(n)+')'))),statements:D1PreparedStatement[]=[db.prepare('PRAGMA defer_foreign_keys=ON')];
 for(let i=0;i<names.length;i++){
  const name=names[i],fields=(columns[i].results as {name:string}[]).map(c=>c.name),rows=before.database.tables[name];
  statements.push(db.prepare(`SELECT CASE WHEN (SELECT count(*) FROM ${quote(name)})=? THEN 1 ELSE json('restore conflict') END`).bind(rows.length));
  for(const part of chunks(rows))statements.push(db.prepare(`SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM json_each(?) j WHERE NOT EXISTS(SELECT 1 FROM ${quote(name)} t WHERE ${fields.map(c=>`t.${quote(c)} IS json_extract(j.value,'$.${c}')`).join(' AND ')})) THEN 1 ELSE json('restore conflict') END`).bind(JSON.stringify(part)));
 }
 for(const name of [...names].reverse())statements.push(db.prepare('DELETE FROM '+quote(name)));
 for(let i=0;i<names.length;i++){const name=names[i],fields=(columns[i].results as {name:string}[]).map(c=>c.name);for(const part of chunks(target.database.tables[name]))statements.push(db.prepare(`INSERT INTO ${quote(name)}(${fields.map(quote).join(',')}) SELECT ${fields.map(c=>`json_extract(value,'$.${c}')`).join(',')} FROM json_each(?)`).bind(JSON.stringify(part)));}
 statements.push(db.prepare("SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM pragma_foreign_key_check) THEN 1 ELSE json('restore relationships failed') END"));
 await db.batch(statements);
}
export async function advanceManagedRestore(db:D1Database,files:R2Bucket){
 const record=await read<Restore>(files,lockKey);if(!record)throw Error('No active restore.');const job=record.value;delete job.paused;delete job.lastError;if(String(job.phase)==='complete')return {...job,status:'complete'};const target=await completeBackup(files,job.sourceId),before=await completeBackup(files,job.beforeId);
 if(job.phase==='copying'){
  for(const o of target.payload.objects.slice(job.offset,job.offset+8)){await checkedObject(files,o);const object=await files.get(objectKey(o));if(!object)throw Error('Restore original is missing.');await files.put(o.key,object.body,{sha256:o.sha256,httpMetadata:{contentType:o.contentType??'application/octet-stream'}});job.offset++;}
  if(job.offset===target.payload.objects.length)job.phase='database';
 }else if(job.phase==='database'){
  // A retry after a successful commit can recognize the target even if the status write was interrupted.
  const {createDatabaseSnapshot}=await import('./development-backup');const current=await createDatabaseSnapshot(db,10000);
  if(await digest(current)!==await digest(target.payload.database))await replaceDatabase(db,target.payload,job.baselinePath?{...before.payload,database:(await read<Payload['database']>(files,job.baselinePath))!.value}:before.payload);
  job.phase='cleanup';
 }else{
  const keep=new Set(target.payload.objects.map(o=>o.key)),known=new Map<string,ArchiveObject>();for(const id of job.cleanupIds??[job.beforeId])for(const o of (await completeBackup(files,id)).payload.objects)known.set(o.key,o);const remove=[...known.values()].filter(o=>!keep.has(o.key));
  for(const o of remove.slice(job.cleanupOffset,job.cleanupOffset+16)){await files.delete(o.key);job.cleanupOffset++;}
  if(job.cleanupOffset===remove.length){const live=JSON.parse(new TextDecoder().decode(await createArchiveManifest(db,files))) as Manifest,restored=JSON.parse(live.payloadJson) as Payload;
   if(await digest(restored.database)!==await digest(target.payload.database))throw Error('Restored database readback did not match. Keep maintenance active and review recovery.');
   await put(files,key('restores',job.id),{...job,complete:true,completedAt:new Date().toISOString()});await put(files,lockKey,{...job,phase:'complete'},record.etag);return {...job,status:'complete'};
  }
 }
 await put(files,lockKey,job,record.etag);return {...job,status:'restoring'};
}
export async function rollbackManagedRestore(db:D1Database,files:R2Bucket){
 const record=await read<Restore>(files,lockKey);if(!record)throw Error('No interrupted restore.');
 if(String(record.value.phase)==='complete')throw Error('This restore already completed.');
 const job=record.value,{createDatabaseSnapshot}=await import('./development-backup'),baseline=await createDatabaseSnapshot(db,10000);
 const baselinePath=key('restore-baselines',job.id+'_'+crypto.randomUUID().slice(0,8));await put(files,baselinePath,baseline);
 const rollback={...job,sourceId:job.beforeId,phase:'copying' as const,offset:0,cleanupOffset:0,baselinePath,paused:false,lastError:undefined};await put(files,lockKey,rollback,record.etag);return rollback;
}
type Schedule={enabled:boolean;hour:number;timezone:'America/Los_Angeles';lastStartedDay?:string;lastError?:string};
const scheduleKey=key('control','schedule');
export async function scheduledBackups(db:D1Database,files:R2Bucket,now=new Date()){
 if(await restoreInProgress(files)){const state=await read<Restore>(files,lockKey);if(state?.value.paused)return;try{await advanceManagedRestore(db,files);}catch(error){const current=await read<Restore>(files,lockKey);if(current&&state&&current.etag===state.etag)await put(files,lockKey,{...current.value,paused:true,lastError:(error as Error).message},current.etag);}return;}
 const jobs=await listManagedBackups(files),pending=[...jobs].reverse().find(j=>j.status==='copying');
 if(pending){try{await advanceManagedBackup(files,pending.id);}catch(error){if(/progress changed/i.test((error as Error).message))return;const item=await read<BackupJob>(files,key('jobs',pending.id));if(item&&item.value.status==='copying'&&item.value.offset===pending.offset)await put(files,key('jobs',pending.id),{...item.value,status:'failed',error:(error as Error).message},item.etag);}return;}
 const record=await read<Schedule>(files,scheduleKey);if(!record?.value.enabled)return;
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(now),value=(type:string)=>parts.find(p=>p.type===type)!.value;
 const day=value('year')+'-'+value('month')+'-'+value('day');if(Number(value('hour'))<record.value.hour||record.value.lastStartedDay===day)return;
 const claim=await put(files,scheduleKey,{...record.value,lastStartedDay:day,lastError:undefined},record.etag);
 try{await startManagedBackup(db,files,'scheduled','normal');}catch(error){await put(files,scheduleKey,{...record.value,lastStartedDay:day,lastError:(error as Error).message},claim.etag);}
}
export async function handleManagedBackups(request:Request,db:D1Database,files:R2Bucket,subject:string){
 try{
  const path=new URL(request.url).pathname.slice('/api/backups'.length);
  if(request.method==='GET'&&!path)return json({schedule:(await read<Schedule>(files,scheduleKey))?.value??{enabled:false,hour:2,timezone:'America/Los_Angeles'},backups:await listManagedBackups(files),restore:await restoreInProgress(files)?(await read<Restore>(files,lockKey))!.value:null});
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  const reader=request.body?.getReader();let text='',size=0;const decoder=new TextDecoder('utf-8',{fatal:true});try{if(reader)for(;;){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>4096){await reader.cancel();throw Error('Backup request is too large.');}text+=decoder.decode(part.value,{stream:true});}text+=decoder.decode();}finally{reader?.releaseLock();}const body=text?JSON.parse(text):{};
  if(path==='/schedule'){if(typeof body.enabled!=='boolean'||!Number.isInteger(body.hour)||body.hour<0||body.hour>23)throw Error('Choose a daily backup hour from 0 to 23.');const prior=(await read<Schedule>(files,scheduleKey))?.value;await put(files,scheduleKey,{...prior,enabled:body.enabled,hour:body.hour,timezone:'America/Los_Angeles'});return json({saved:true});}
  if(path==='/restore/rollback'){if(body.approved!==true)throw Error('Approve rollback to the automatic pre-restore snapshot.');return json(await rollbackManagedRestore(db,files));}
  if(path!=='/restore/advance'&&await restoreInProgress(files))throw Error('Resume or roll back the active restore before other backup operations.');
  if(!path)return json(await startManagedBackup(db,files,subject,body.kind==='pre-change'?'pre-change':'normal'),201);
  if(path==='/restore/advance')return json(await advanceManagedRestore(db,files));
  const match=/^\/(backup_[a-f0-9]{32})\/(advance|fresh|preview|restore)$/.exec(path);if(!match)return json({error:'Backup route not found'},404);
  const [,id,action]=match;
  if(action==='advance')return json(await advanceManagedBackup(files,id));
  if(action==='fresh'){await assertFreshBackup(db,files,id);return json({verified:true,backupId:id});}
  if(action==='preview')return json(await restorePreview(db,files,id));
  if(body.approved!==true)throw Error('Review and approve the restore preview before applying.');
  return json(await startManagedRestore(db,files,subject,id,body.beforeId,body.previewSha256),201);
 }catch(error){return json({error:(error as Error).message},409);}
}
