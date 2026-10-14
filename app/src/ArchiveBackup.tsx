import React, {useState} from "react";
import {archiveStream} from "./archive-format";
type SaveHandle = {createWritable:()=>Promise<WritableStream<Uint8Array>>};
export function ArchiveBackup() {
  const [busy,setBusy]=useState(false),[status,setStatus]=useState("");
  async function download() {
    setBusy(true);setStatus("Choose a private backup location, then keep catalog changes idle until the download finishes.");
    let handle:SaveHandle|undefined;
    try {
      const picker=(window as unknown as {showSaveFilePicker?:(options:unknown)=>Promise<SaveHandle>}).showSaveFilePicker;
      if(picker)handle=await picker.call(window,{suggestedName:"Cookie_Catalog_"+new Date().toISOString().replace(/[:.]/g,"-")+".tar",types:[{description:"Cookie Catalog archive",accept:{"application/x-tar":[".tar"]}}]});
      else {setStatus("Use desktop Chrome or Edge for a larger archive saved directly to your private folder.");return;}
      const response=await fetch("/api/dev/archive",{method:"POST",cache:"no-store",headers:{"X-Cookie-Catalog-Check":"archive"}});
      if(!response.ok){const body=await response.json() as {error?:string};throw Error(body.error??"Archive could not start.");}
      if(response.headers.get("content-type")!=="application/json")throw Error("Sign in again before archiving.");
      setStatus("Saving catalog records and originals. Keep edits/uploads/deletions idle…");
      const manifest=new Uint8Array(await response.arrayBuffer());
      const stream=await archiveStream(manifest,async object=>{
        setStatus("Saving original "+object.attachmentId+"… Keep catalog changes idle.");
        const file=await fetch("/api/dev/archive-file",{method:"POST",cache:"no-store",headers:{"content-type":"application/json","X-Cookie-Catalog-Check":"archive"},body:JSON.stringify(object)});
        if(!file.ok||file.headers.get("content-type")!=="application/octet-stream")throw Error("An original changed or could not download. Retry while catalog is idle.");
        return new Uint8Array(await file.arrayBuffer());
      });
      await stream.pipeTo(await handle.createWritable());
      setStatus("Archive saved. Keep it private and verify recovery before relying on it.");
    }catch(error){
      setStatus((error as Error).name==="AbortError"?"Archive cancelled.":"Archive did not complete: "+(error as Error).message+". Do not rely on a partial file.");
    }finally{setBusy(false);}
  }
  return <section>
    <h2>Catalog archive</h2>
    <p>Save a TAR archive containing catalog records, original files and checksums directly into your private backup folder.</p>
    <p>Development limits: 1 GiB of originals total, 1,000 originals, 25 MiB per original and 10,000 rows per table. Desktop Chrome or Edge required for direct folder saving.</p>
    <button disabled={busy} onClick={download}>{busy?"Saving…":"Save catalog archive"}</button>
    <p role="status" aria-live="polite">{status}</p>
  </section>;
}
