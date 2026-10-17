import assert from 'node:assert/strict';
import {test} from 'node:test';
import {backupDiagnostic,backupErrorCode} from '../src/server/backup-diagnostics';
import {backupStorageStatus,withBackupStorageLock} from '../src/server/backup-storage-lock';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
test('diagnostics distinguish storage contention and failure classes without logging raw error data',()=>{
 assert.equal(backupErrorCode(Error('Backup storage is busy. Retry shortly.')),'STORAGE_BUSY');assert.equal(backupErrorCode(Error('Backup progress changed.')),'PROGRESS_CONFLICT');assert.equal(backupErrorCode(Error('A managed original failed its stored checksum.')),'CHECKSUM_FAILED');assert.equal(backupErrorCode(Error('TEST private filename and record details')),'UNCLASSIFIED');
 const original=console.info,logs:string[]=[];console.info=(value)=>logs.push(String(value));try{backupDiagnostic('scheduled-error',{code:backupErrorCode(Error('TEST private filename and record details')),offset:4,objects:12});const value=JSON.parse(logs[0]);assert.equal(value.offset,4);assert.equal(value.code,'UNCLASSIFIED');assert.equal(logs[0].includes('private filename'),false);}finally{console.info=original;}
});
test('owner diagnostics report contention and clear it after a failed operation without changing catalog data',async()=>{
 const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("test")}}',r2Buckets:['FILES']}));
 try{const files=await mf.getR2Bucket('FILES') as any;assert.equal((await backupStorageStatus(files)).active,false);
 await assert.rejects(()=>withBackupStorageLock(files,async()=>{const status=await backupStorageStatus(files);assert.equal(status.active,true);assert(status.expiresInMs>0);assert(status.expiresInMs<=15*60*1000);await assert.rejects(()=>withBackupStorageLock(files,async()=>{}),/storage is busy/);throw Error('TEST operation failed');}),/TEST operation failed/);
 assert.equal((await backupStorageStatus(files)).active,false);assert.equal((await files.list({prefix:'attachments/'})).objects.length,0);
 }finally{await mf.dispose();}
});
