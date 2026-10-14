import {BackupError,createDatabaseSnapshot,sha256} from "./development-backup";
import {ARCHIVE_FILE_LIMIT,archiveStream,type ArchiveObject} from "../archive-format";
export {ARCHIVE_FILE_LIMIT} from "../archive-format";
export async function createArchiveManifest(database:D1Database,files:R2Bucket):Promise<Uint8Array> {
 const snapshot=await createDatabaseSnapshot(database,10000);
 if(snapshot.tables.attachments.length>1000)throw new BackupError("Archive supports at most 1000 originals.");
 const keys=new Set(snapshot.tables.attachments.map(row=>String(row.storage_key)));
 const listed=new Map<string,R2Object>();let cursor:string|undefined,pages=0;
 do {
  const page=await files.list({limit:1000,cursor});
  if(++pages>100)throw new BackupError("Storage audit limit exceeded.");
  for(const object of page.objects){
   if(!object.key.startsWith("dev-checks/")&&!keys.has(object.key))throw new BackupError("Unregistered storage files must be reconciled before archiving.");
   if(keys.has(object.key))listed.set(object.key,object);
  }
  cursor=page.truncated?page.cursor:undefined;
 }while(cursor);
 const objects:ArchiveObject[]=[];let total=0;
 for(const row of snapshot.tables.attachments){
  if(typeof row.id!=="string"||!/^[a-zA-Z0-9_-]{8,128}$/.test(row.id)||row.storage_key!=="attachments/"+row.id+"/original"
    ||typeof row.byte_size!=="number"||!Number.isSafeInteger(row.byte_size)||row.byte_size<0||row.byte_size>ARCHIVE_FILE_LIMIT
    ||typeof row.sha256!=="string"||!/^[a-f0-9]{64}$/i.test(row.sha256))throw new BackupError("An original lacks supported size/checksum metadata. Reconcile before archiving.");
  const key=row.storage_key as string,object=listed.get(key);
  if(!object||object.size!==row.byte_size)throw new BackupError("An original is missing or changed size.");
  total+=object.size;if(total>1024*1024*1024)throw new BackupError("Archive exceeds the 1 GiB development limit.");
  objects.push({attachmentId:row.id,key,byteSize:object.size,sha256:row.sha256.toLowerCase(),contentType:typeof row.media_type==="string"?row.media_type:null,etag:object.etag});
 }
 const encoder=new TextEncoder(),payloadJson=JSON.stringify({environment:"development",database:snapshot,objects});
 const manifest=encoder.encode(JSON.stringify({format:"cookie-catalog-archive",version:1,exportedAt:new Date().toISOString(),payloadJson,payloadSha256:await sha256(encoder.encode(payloadJson))}));
 if(manifest.length>16*1024*1024)throw new BackupError("Archive manifest exceeds 16 MiB.");
 return manifest;
}
// Local integration helper exercises the same archive assembler used by the browser.
export async function createArchiveBackup(database:D1Database,files:R2Bucket) {
 return archiveStream(await createArchiveManifest(database,files),async expected=>{
  const object=await files.get(expected.key);
  if(!object||object.etag!==expected.etag||object.size!==expected.byteSize)throw new BackupError("Original changed during download.");
  return new Uint8Array(await object.arrayBuffer());
 });
}
export async function archiveOriginal(request:Request,database:D1Database,files:R2Bucket):Promise<Response>{
 const reader=request.body?.getReader();if(!reader)throw new BackupError("Original request is empty.");
 const pieces:Uint8Array[]=[];let size=0;
 try {while(true){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>2048){await reader.cancel();throw new BackupError("Original request too large.");}pieces.push(part.value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let offset=0;for(const part of pieces){bytes.set(part,offset);offset+=part.length;}
 const expected=JSON.parse(new TextDecoder().decode(bytes)) as ArchiveObject;
 if(typeof expected.attachmentId!=="string"||!/^[a-zA-Z0-9_-]{8,128}$/.test(expected.attachmentId)||typeof expected.etag!=="string"||expected.etag.length>128||typeof expected.sha256!=="string"||!/^[a-f0-9]{64}$/.test(expected.sha256)||!Number.isSafeInteger(expected.byteSize)||expected.byteSize<0||expected.byteSize>ARCHIVE_FILE_LIMIT)throw new BackupError("Invalid original descriptor.");
 const row=await database.prepare("SELECT storage_key,sha256,byte_size FROM attachments WHERE id=?").bind(expected.attachmentId).first<{storage_key:string;sha256:string;byte_size:number}>();
 if(!row||row.storage_key!=="attachments/"+expected.attachmentId+"/original"||row.sha256!==expected.sha256||row.byte_size!==expected.byteSize)throw new BackupError("Original metadata changed since snapshot.");
 const object=await files.get(row.storage_key);
 if(!object||object.etag!==expected.etag||object.size!==expected.byteSize)throw new BackupError("Original changed since snapshot.");
 return new Response(object.body,{headers:{"content-type":"application/octet-stream","cache-control":"no-store","x-content-type-options":"nosniff"}});
}
