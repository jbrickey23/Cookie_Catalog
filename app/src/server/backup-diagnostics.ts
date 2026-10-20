/** Logs only operation state/counts/timing, never filenames, record data or raw errors. */
export function backupErrorCode(error:unknown){
 const message=error instanceof Error?error.message:'';
 if(/storage is busy/i.test(message))return 'STORAGE_BUSY';
 if(/lease changed/i.test(message))return 'LEASE_CHANGED';
 if(/progress changed/i.test(message))return 'PROGRESS_CONFLICT';
 if(/original changed/i.test(message))return 'ORIGINAL_CHANGED';
 if(/checksum/i.test(message))return 'CHECKSUM_FAILED';
 if(/copy plan/i.test(message))return 'COPY_PLAN_FAILED';
 if(/cleanup is in progress/i.test(message))return 'RETENTION_ACTIVE';
 return 'UNCLASSIFIED';
}
export function backupDiagnostic(event:'storage-busy'|'storage-acquired'|'storage-finished'|'copy-step'|'scheduled-error'|'operation-error',values:{durationMs?:number;expiresInMs?:number;offset?:number;objects?:number;code?:string;outcome?:'success'|'error'}){
 console.info(JSON.stringify({component:'catalog-backup',event,at:new Date().toISOString(),...values}));
}
