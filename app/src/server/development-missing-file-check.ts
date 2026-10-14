import {handleAttachments} from "./attachments";
import {sha256} from "./development-backup";

/** No caller-supplied identities: only this invocation's synthetic records/object are changed. */
export async function checkMissingFileRecovery(database:D1Database,bucket:R2Bucket) {
  const suffix=crypto.randomUUID().replaceAll("-",""),shape="missing_check_"+suffix,id="file_"+suffix;
  const key="attachments/"+id+"/original";
  const bytes=Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a8S8AAAAASUVORK5CYII="),c=>c.charCodeAt(0));
  const hash=await sha256(bytes);
  const original=()=>handleAttachments(new Request("https://catalog.invalid/api/attachments/"+id),database,bucket);
  const listing=async()=>{
    const response=await handleAttachments(new Request("https://catalog.invalid/api/attachments?kind=shape&recordId="+shape),database,bucket);
    const body=await response.json() as {attachments?:Array<{id:string;available:boolean}>};
    if(!response.ok||body.attachments?.length!==1||body.attachments[0].id!==id)throw Error("Fixture listing failed");
    return body.attachments[0];
  };
  const metadataIntact=async()=>{
    const row=await database.prepare("SELECT a.sha256,a.byte_size FROM attachments a JOIN shape_attachments l ON l.attachment_id=a.id WHERE a.id=? AND l.shape_id=?")
      .bind(id,shape).first<{sha256:string;byte_size:number}>();
    return row?.sha256===hash&&row.byte_size===bytes.length;
  };
  let result;
  try {
    const rows=await database.batch([
      database.prepare("INSERT INTO shapes(id,name,notes) VALUES (?,?,?)").bind(shape,"TEST missing-original recovery","Disposable development fixture"),
      database.prepare("INSERT INTO attachments(id,storage_key,filename,media_type,byte_size,sha256) VALUES (?,?,?,'image/png',?,?)")
        .bind(id,key,"TEST_ONLY_missing_recovery.png",bytes.length,hash),
      database.prepare("INSERT INTO shape_attachments(shape_id,attachment_id,purpose) VALUES (?,?,'original')").bind(shape,id)
    ]);
    if(rows.some(row=>!row.success))throw Error("Fixture creation failed");
    await bucket.put(key,bytes,{httpMetadata:{contentType:"image/png"},customMetadata:{purpose:"cookie-catalog-disposable-missing-file-check"}});
    const before=await original();
    if(before.status!==200||await sha256(new Uint8Array(await before.arrayBuffer()))!==hash||!(await listing()).available)throw Error("Fixture original verification failed");

    // Simulate object loss while retaining the attachment identity, checksum and relationship.
    await bucket.delete(key);
    if(await bucket.head(key))throw Error("Fixture loss not confirmed");
    const missing=await original(),missingBody=await missing.json() as {error?:string};
    if(missing.status!==409||missingBody.error!=="Original file is missing. Metadata is retained for recovery."
      ||(await listing()).available||!await metadataIntact())throw Error("Missing-original detection failed");

    // Recover the retained trusted bytes to the same identity; do not replace metadata/links.
    await bucket.put(key,bytes,{httpMetadata:{contentType:"image/png"},customMetadata:{purpose:"cookie-catalog-disposable-missing-file-check"}});
    const restored=await original(),actual=new Uint8Array(await restored.arrayBuffer());
    if(restored.status!==200||actual.length!==bytes.length||await sha256(actual)!==hash||!(await listing()).available||!await metadataIntact())throw Error("Original recovery verification failed");
    result={checkedAt:new Date().toISOString(),environment:"development",type:"disposable-missing-original-recovery",
      initialDownloadStatus:200,missingDownloadStatus:409,missingListedUnavailable:true,metadataAndLinkRetained:true,
      recoveredDownloadStatus:200,recoveredBytesVerified:true,recoveredBytes:bytes.length,cleanupVerified:true};
  } finally {
    let databaseClean=false,filesClean=false;
    try {
      await bucket.delete(key);filesClean=await bucket.head(key)===null;
    } catch { /* Report cleanup failure even if database cleanup succeeds. */ }
    try {
      const rows=await database.batch([
        database.prepare("DELETE FROM shape_attachments WHERE shape_id=? AND attachment_id=?").bind(shape,id),
        database.prepare("DELETE FROM attachments WHERE id=? AND storage_key=?").bind(id,key),
        database.prepare("DELETE FROM shapes WHERE id=?").bind(shape)
      ]);
      const row=await database.prepare("SELECT (SELECT COUNT(*) FROM shapes WHERE id=?) + (SELECT COUNT(*) FROM attachments WHERE id=?) + (SELECT COUNT(*) FROM shape_attachments WHERE shape_id=? OR attachment_id=?) AS remaining")
        .bind(shape,id,shape,id).first<{remaining:number}>();
      databaseClean=rows.every(row=>row.success)&&row?.remaining===0;
    } catch { /* Both independent cleanup results are required. */ }
    if(!databaseClean||!filesClean)throw Error("Missing-file check cleanup could not be verified. Stop testing and review disposable fixtures.");
  }
  if(!result)throw Error("Missing-file check did not complete");
  return result;
}
