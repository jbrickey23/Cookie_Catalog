const lockKey='catalog-backups/control/storage-operation.json';
export const cleanupKey='catalog-backups/control/retention.json';
type Lease={id:string;active:boolean;expiresAt:number};
export async function retentionInProgress(files:R2Bucket){const object=await files.get(cleanupKey);if(!object)return false;const job=await object.json<{status:string}>();return job.status!=='complete';}
export async function assertNoRetention(files:R2Bucket){if(await retentionInProgress(files))throw Error('Backup cleanup is in progress. Resume cleanup before starting another backup, import or restore.');}
/** Serializes backup-store mutations; routine catalog edits do not acquire this lease. */
export async function withBackupStorageLock<T>(files:R2Bucket,action:(guarded:R2Bucket)=>Promise<T>,allowRetention=false):Promise<T>{
 const prior=await files.get(lockKey),state=prior?await prior.json<Lease>():null;
 if(state?.active&&state.expiresAt>Date.now())throw Error('Backup storage is busy. Retry shortly.');
 const id=crypto.randomUUID(),lease=()=>({id,active:true,expiresAt:Date.now()+15*60*1000});
 const claim=await files.put(lockKey,JSON.stringify(lease()),{onlyIf:prior?{etagMatches:prior.etag}:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'}});
 if(!claim)throw Error('Backup storage is busy. Retry shortly.');
 let renewedAt=Date.now();
 async function renew(){if(Date.now()-renewedAt<5*60*1000)return;const current=await files.get(lockKey);if(!current||(await current.json<Lease>()).id!==id)throw Error('Backup storage lease changed. Refresh and resume.');const saved=await files.put(lockKey,JSON.stringify(lease()),{onlyIf:{etagMatches:current.etag},httpMetadata:{contentType:'application/json'}});if(!saved)throw Error('Backup storage lease changed. Refresh and resume.');renewedAt=Date.now();}
 const guarded=new Proxy(files,{get(target,property){const value=Reflect.get(target,property);if(property==='put'||property==='delete')return async(...args:any[])=>{await renew();return value.apply(target,args);};return typeof value==='function'?value.bind(target):value;}});
 try{if(!allowRetention)await assertNoRetention(files);return await action(guarded);}finally{const current=await files.get(lockKey);if(current&&(await current.json<Lease>()).id===id)await files.put(lockKey,JSON.stringify({id,active:false,expiresAt:0}),{onlyIf:{etagMatches:current.etag},httpMetadata:{contentType:'application/json'}});}
}
