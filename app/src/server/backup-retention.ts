import {body} from './catalog';
import {listManagedBackups,managedBackupObjects,completeBackup,restoreInProgress,type BackupJob} from './managed-backups';
import {withBackupStorageLock,cleanupKey,retentionInProgress} from './backup-storage-lock';
import {sha256} from './development-backup';
const prefix='catalog-backups/',jobKey=(id:string)=>prefix+'jobs/'+id+'.json';
const idPattern=/^backup_[a-f0-9]{32}$/;
const digest=(value:unknown)=>sha256(new TextEncoder().encode(JSON.stringify(value)));
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'cache-control':'no-store'}});
type StoredObject={key:string;size:number;etag:string};
export type Cleanup={id:string;status:'running'|'failed'|'complete';phase:'snapshots'|'objects';selectedIds:string[];snapshotOffset:number;objects:StoredObject[];totalObjects?:number;objectOffset:number;reclaimedBytes:number;plannedReclaimedBytes:number;at:string;subject:string;previewSha256:string;error?:string;completedAt?:string};
export async function retentionState(files:R2Bucket){const o=await files.get(cleanupKey);return o?o.json<Cleanup>():null;}
async function idle(files:R2Bucket){if(await restoreInProgress(files))throw Error('Finish or roll back the active restore before cleanup.');if(await retentionInProgress(files))throw Error('Resume the approved cleanup before starting another retention action.');}
async function listed(files:R2Bucket,scope:string,maxPages=16){const objects:StoredObject[]=[];let cursor:string|undefined;for(let page=0;page<maxPages;page++){const result=await files.list({prefix:scope,limit:1000,cursor});objects.push(...result.objects.map(o=>({key:o.key,size:o.size,etag:o.etag})));if(!result.truncated)return {objects,complete:true};cursor=result.cursor;}return {objects,complete:false};}
function protection(jobs:BackupJob[]){const newest=jobs.find(j=>j.status==='complete')?.id,newestNormal=jobs.find(j=>j.status==='complete'&&j.kind==='normal')?.id;return (job:BackupJob)=>job.id===newest?'Newest verified recovery point':job.id===newestNormal?'Newest verified normal backup':job.kind==='pre-change'&&!job.protectionReleasedAt?'Protected pre-change recovery point':null;}
export async function retentionOverview(files:R2Bucket){
 const jobs=await listManagedBackups(files),inventory=await listed(files,prefix,20),isProtected=protection(jobs),normal=jobs.filter(j=>j.kind==='normal'&&j.status==='complete');
 return {storedBytes:inventory.objects.reduce((n,o)=>n+o.size,0),usageComplete:inventory.complete,originalBytes:inventory.objects.filter(o=>o.key.startsWith(prefix+'objects/')).reduce((n,o)=>n+o.size,0),recordRecoveryBytes:inventory.objects.filter(o=>o.key.startsWith(prefix+'record-changes/')).reduce((n,o)=>n+o.size,0),snapshotCount:jobs.length,maxSnapshots:12,accountedBytes:jobs.reduce((n,j)=>n+j.bytes,0),accountedLimitBytes:2*1024**3,keepNormal:7,backups:jobs.map(job=>({...job,protectedReason:isProtected(job),cleanupRecommended:normal.slice(7).some(j=>j.id===job.id)&&!isProtected(job),canReleaseProtection:job.kind==='pre-change'&&!job.protectionReleasedAt&&job.status==='complete'&&jobs.some(j=>j.id!==job.id&&j.status==='complete'&&j.exportedAt>=job.exportedAt)})),cleanup:await retentionState(files)};
}
async function plan(files:R2Bucket,selectedIds:string[],discardIncomplete:boolean){
 await idle(files);const jobs=await listManagedBackups(files),isProtected=protection(jobs);
 if(!Array.isArray(selectedIds)||!selectedIds.length||selectedIds.length>12||new Set(selectedIds).size!==selectedIds.length||selectedIds.some(id=>typeof id!=='string'||!idPattern.test(id)))throw Error('Select one to twelve distinct backups.');
 const selected=jobs.filter(j=>selectedIds.includes(j.id));if(selected.length!==selectedIds.length)throw Error('A selected backup changed or is missing. Refresh the list.');
 for(const job of selected){const reason=isProtected(job);if(reason)throw Error(reason+' cannot be removed.');if(job.status!=='complete'&&!discardIncomplete)throw Error('Explicitly approve discarding selected incomplete backups.');}
 if(!jobs.some(j=>j.status==='complete'&&!selectedIds.includes(j.id)))throw Error('Keep at least one verified recovery point.');
 // A retained incomplete snapshot still owns every object in its captured manifest.
 const keep=new Set<string>();for(const job of jobs.filter(j=>!selectedIds.includes(j.id))){for(const o of await managedBackupObjects(files,job)){if(!/^[a-f0-9]{64}$/.test(o.sha256))throw Error('Invalid retained original checksum. Cleanup stopped.');keep.add(prefix+'objects/'+o.sha256);}}
 const inventory=await listed(files,prefix+'objects/',13);if(!inventory.complete)throw Error('Backup object listing exceeds the supported cleanup limit. Nothing was removed.');
 if(inventory.objects.some(o=>!/^catalog-backups\/objects\/[a-f0-9]{64}$/.test(o.key)))throw Error('Unknown object in the managed-original namespace. Reconcile before cleanup.');
 const remove=inventory.objects.filter(o=>!keep.has(o.key)),previewSha256=await digest({jobs,selectedIds:[...selectedIds].sort(),discardIncomplete,objects:inventory.objects});
 return {previewSha256,selected:selected.map(j=>({id:j.id,exportedAt:j.exportedAt,kind:j.kind,status:j.status})),remove,retainedSnapshots:jobs.length-selected.length,reclaimOriginalBytes:remove.reduce((n,o)=>n+o.size,0),sharedOriginalsKept:inventory.objects.length-remove.length,discardIncomplete};
}
export async function retentionPreview(files:R2Bucket,ids:string[],discardIncomplete=false){return withBackupStorageLock(files,async locked=>{const result=await plan(locked,ids,discardIncomplete);return {...result,remove:undefined,objectsToRemove:result.remove.length,liveCatalogChanged:false};},true);}
export async function startRetention(files:R2Bucket,subject:string,input:any){
 return withBackupStorageLock(files,async locked=>{
  if(input.approved!==true)throw Error('Review and approve cleanup first.');
  const preview=await plan(locked,input.ids,input.discardIncomplete===true);if(preview.previewSha256!==input.previewSha256)throw Error('Backup storage changed. Review a new cleanup preview.');
  const state:Cleanup={id:'cleanup_'+crypto.randomUUID().replaceAll('-',''),status:'running',phase:'snapshots',selectedIds:preview.selected.map(j=>j.id),snapshotOffset:0,objects:preview.remove,objectOffset:0,reclaimedBytes:0,plannedReclaimedBytes:preview.reclaimOriginalBytes,at:new Date().toISOString(),subject,previewSha256:preview.previewSha256};
  // Persist the approved job before any deletion. All backup/import/restore mutations now pause.
  await locked.put(cleanupKey,JSON.stringify(state),{httpMetadata:{contentType:'application/json'}});return publicCleanup(state);
 },true);
}
function publicCleanup(state:Cleanup|null){if(!state)return null;const {objects,...summary}=state;return {...summary,objectsToRemove:state.totalObjects??objects.length};}
export async function advanceRetention(files:R2Bucket){
 return withBackupStorageLock(files,async locked=>{
  const state=await retentionState(locked);if(!state)throw Error('No approved cleanup is available.');if(state.status==='complete')return publicCleanup(state);
  if(await restoreInProgress(locked))throw Error('An active restore blocks cleanup.');
  state.status='running';delete state.error;
  try{
   if(state.phase==='snapshots'){
    for(const id of state.selectedIds.slice(state.snapshotOffset,state.snapshotOffset+2)){
     if(!idPattern.test(id))throw Error('Invalid cleanup snapshot.');
     // Erase job visibility last; a retry can repeat any already-completed step.
     for(const kind of ['manifests','copy-plans','receipts','jobs'])await locked.delete(prefix+kind+'/'+id+'.json');state.snapshotOffset++;
    }
    if(state.snapshotOffset===state.selectedIds.length)state.phase='objects';
   }else{
    for(const object of state.objects.slice(state.objectOffset,state.objectOffset+16)){
     if(!/^catalog-backups\/objects\/[a-f0-9]{64}$/.test(object.key))throw Error('Invalid cleanup object key.');
     const live=await locked.head(object.key);if(live&&live.etag!==object.etag)throw Error('A backup object changed during cleanup. Review the paused job.');
     await locked.delete(object.key);state.objectOffset++;state.reclaimedBytes+=object.size;
    }
    if(state.objectOffset===state.objects.length){state.status='complete';state.totalObjects=state.objects.length;state.completedAt=new Date().toISOString();await locked.put(prefix+'retention-receipts/'+state.id+'.json',JSON.stringify(publicCleanup(state)),{httpMetadata:{contentType:'application/json'}});}
   }
   if(state.status==='complete')state.objects=[];
   await locked.put(cleanupKey,JSON.stringify(state),{httpMetadata:{contentType:'application/json'}});return publicCleanup(state);
  }catch(error){state.status='failed';state.error=(error as Error).message;await locked.put(cleanupKey,JSON.stringify(state),{httpMetadata:{contentType:'application/json'}});throw error;}
 },true);
}
async function protectionPreview(files:R2Bucket,id:string){
 await idle(files);const jobs=await listManagedBackups(files),job=jobs.find(j=>j.id===id),newer=jobs.find(j=>j.id!==id&&j.status==='complete'&&job&&j.exportedAt>=job.exportedAt);
 if(!job||job.kind!=='pre-change'||job.status!=='complete'||job.protectionReleasedAt||!newer)throw Error('Keep this point protected until its changes are verified and another newer verified backup exists.');
 await completeBackup(files,id);await completeBackup(files,newer.id);
 return {id,exportedAt:job.exportedAt,newerBackupAt:newer.exportedAt,previewSha256:await digest(jobs)};
}
export async function handleBackupRetention(request:Request,files:R2Bucket,subject:string){
 try{
  const path=new URL(request.url).pathname.slice('/api/backups/retention'.length);
  if(request.method==='GET'&&!path){const result=await retentionOverview(files);return json({...result,cleanup:publicCleanup(result.cleanup)});}
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  const input=await body(request) as any;
  if(path==='/preview')return json(await retentionPreview(files,input.ids,input.discardIncomplete===true));
  if(path==='/apply')return json(await startRetention(files,subject,input),201);
  if(path==='/advance')return json(await advanceRetention(files));
  if(path==='/protection-preview')return json(await withBackupStorageLock(files,locked=>protectionPreview(locked,input.id),true));
  if(path==='/release-protection')return json(await withBackupStorageLock(files,async locked=>{if(input.approved!==true||input.changesVerified!==true)throw Error('Verify the protected changes and explicitly approve releasing protection.');const preview=await protectionPreview(locked,input.id);if(preview.previewSha256!==input.previewSha256)throw Error('Backup list changed. Review protection again.');const object=await locked.get(jobKey(input.id));if(!object)throw Error('Backup no longer exists.');const job=await object.json<BackupJob>();await locked.put(jobKey(input.id),JSON.stringify({...job,protectionReleasedAt:new Date().toISOString(),protectionReleasedBy:subject}),{onlyIf:{etagMatches:object.etag},httpMetadata:{contentType:'application/json'}});return {released:true};},true));
  return json({error:'Retention route not found'},404);
 }catch(error){return json({error:(error as Error).message},409);}
}
