import React, {useState} from "react";
import {archiveBlob,archiveStream} from "./archive-format";
type SaveHandle = {createWritable:()=>Promise<WritableStream<Uint8Array>>};
export function ArchiveBackup() {
  const [busy,setBusy]=useState(false),[status,setStatus]=useState("");
  async function download(small=false) {
    setBusy(true);setStatus(small?"Preparing a TAR download up to 64 MiB. Keep catalog changes idle.":"Choose a private backup location, then keep catalog changes idle until the download finishes.");
    let handle:SaveHandle|undefined;
    try {
      const filename="Cookie_Catalog_"+new Date().toISOString().replace(/[:.]/g,"-")+".tar";
      if(!small){
      const picker=(window as unknown as {showSaveFilePicker?:(options:unknown)=>Promise<SaveHandle>}).showSaveFilePicker;
      if(picker)handle=await picker.call(window,{suggestedName:filename,types:[{description:"Cookie Catalog backup",accept:{"application/x-tar":[".tar"]}}]});
      else {setStatus("Use Download small backup (TAR) for up to 64 MiB, or desktop Chrome/Edge to save a larger backup directly.");return;}
      }
      const response=await fetch("/api/dev/archive",{method:"POST",cache:"no-store",headers:{"X-Cookie-Catalog-Check":"archive"}});
      if(!response.ok){const body=await response.json() as {error?:string};throw Error(body.error??"Backup could not start.");}
      if(response.headers.get("content-type")!=="application/json")throw Error("Sign in again before backing up.");
      setStatus("Saving catalog records and originals. Keep edits/uploads/deletions idle…");
      const manifest=new Uint8Array(await response.arrayBuffer());
      const stream=await archiveStream(manifest,async object=>{
        setStatus("Saving original "+object.attachmentId+"… Keep catalog changes idle.");
        const file=await fetch("/api/dev/archive-file",{method:"POST",cache:"no-store",headers:{"content-type":"application/json","X-Cookie-Catalog-Check":"archive"},body:JSON.stringify(object)});
        if(!file.ok||file.headers.get("content-type")!=="application/octet-stream")throw Error("An original changed or could not download. Retry while catalog is idle.");
        return new Uint8Array(await file.arrayBuffer());
      });
      if(small){
        const blob=await archiveBlob(stream),url=URL.createObjectURL(blob),link=document.createElement("a");
        link.href=url;link.download=filename;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
        setStatus("Backup download started. Keep it private and verify the saved file before relying on it.");
      }else{
        await stream.pipeTo(await handle!.createWritable());
        setStatus("Backup saved. Keep it private and verify recovery before relying on it.");
      }
    }catch(error){
      const name=(error as Error).name;
      setStatus(name==="AbortError"?"Backup cancelled.":!small&&(name==="SecurityError"||name==="NotAllowedError")?"Direct folder saving is unavailable in this browser. Use Download small backup (TAR) for up to 64 MiB.":"Backup did not complete: "+(error as Error).message+". Do not rely on a partial file.");
    }finally{setBusy(false);}
  }
  return <section>
    <h2>Catalog backup</h2>
    <p>Save a TAR backup containing catalog records, original files and checksums directly into your private backup folder.</p>
    <p>Development limits: 1 GiB of originals total, 1,000 originals, 25 MiB per original and 10,000 rows per table. Desktop Chrome or Edge required for direct folder saving.</p>
    <button disabled={busy} onClick={()=>download()}>{busy?"Saving…":"Save catalog backup"}</button>{" "}
    <button disabled={busy} onClick={()=>download(true)}>Download small backup (TAR)</button>
    <p>If direct folder saving is unavailable, download a TAR backup up to 64 MiB. Larger backups still require direct folder saving.</p>
    <p role="status" aria-live="polite">{status}</p>
  </section>;
}
