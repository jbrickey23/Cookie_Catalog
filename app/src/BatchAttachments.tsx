import React,{useRef,useState} from "react";
export type ImageUploadPlan={format:"cookie-catalog-image-plan";version:1;items:{recordId:string;file:string;filename:string;sha256:string}[]};
export function validateImagePlan(value:unknown):ImageUploadPlan {
  const p=value as ImageUploadPlan;
  if(!p||p.format!=="cookie-catalog-image-plan"||p.version!==1||!Array.isArray(p.items)||p.items.length<1||p.items.length>1000)throw Error("Choose a supported image plan (1–1,000 entries).");
  const seen=new Set<string>();
  for(const i of p.items){
    if(!i||!/^[-a-zA-Z0-9_]{1,128}$/.test(i.recordId)||typeof i.file!=="string"||!/^[-a-zA-Z0-9_.]+\.(png|jpe?g|webp)$/i.test(i.file)||typeof i.filename!=="string"||i.filename.length>180||!/^[-a-zA-Z0-9_. ]+\.(png|jpe?g|webp)$/i.test(i.filename)||!/^[a-f0-9]{64}$/.test(i.sha256)||seen.has(i.recordId+":"+i.sha256))throw Error("Invalid or duplicate image mapping. Use image filenames without folders.");
    seen.add(i.recordId+":"+i.sha256);
  }
  return p;
}
export function BatchAttachments({onSaved}:{onSaved:()=>void}) {
  const [plan,setPlan]=useState<ImageUploadPlan|null>(null),[files,setFiles]=useState<File[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
  const [results,setResults]=useState<string[]>([]);const stop=useRef(false);
  async function choose(file:File|undefined){setPlan(null);setResults([]);try{if(!file||file.size>1024*1024)throw Error("Choose an image plan no larger than 1 MiB.");const p=validateImagePlan(JSON.parse(await file.text()));setPlan(p);setMessage(`${p.items.length} planned images. Select the matching source image files, then start.`);}catch(e){setMessage((e as Error).message);}}
  async function upload(){if(!plan)return;setBusy(true);stop.current=false;setResults([]);let saved=0,existing=0;
    try {
      const byName=new Map<string,File>();for(const file of files){if(byName.has(file.name))throw Error("Selected filenames must be unique.");byName.set(file.name,file);}
      for(const item of plan.items)if(!byName.has(item.file))throw Error("Missing selected file: "+item.file);
      const records=new Map<string,{sha256:string;available:boolean}[]>();
      for(let n=0;n<plan.items.length;n++){
        if(stop.current){setMessage(`Stopped between files. ${saved} uploaded; ${existing} already present. Restarting checks existing files first.`);break;}
        const item=plan.items[n],file=byName.get(item.file)!;
        setMessage(`Checking image ${n+1} of ${plan.items.length}: ${item.filename}`);
        if(file.size>25*1024*1024)throw Error("Image exceeds 25 MiB: "+file.name);
        const hash=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",await file.arrayBuffer())),v=>v.toString(16).padStart(2,"0")).join("");
        if(hash!==item.sha256)throw Error("Checksum mismatch: "+file.name);
        if(!records.has(item.recordId)){
          const r=await fetch("/api/attachments?kind=shape&recordId="+encodeURIComponent(item.recordId),{cache:"no-store"});if(!r.ok)throw Error("Could not verify target file list. Sign in and retry.");
          const body=await r.json() as {attachments:{sha256:string;available:boolean}[]};if(body.attachments.length>=200)throw Error("Target file list reached its limit; review this record separately.");records.set(item.recordId,body.attachments);
        }
        const linked=records.get(item.recordId)!;
        if(linked.some(a=>a.sha256===hash&&a.available)){existing++;setResults(r=>[...r,"Already present: "+item.filename]);continue;}
        const form=new FormData();form.set("kind","shape");form.set("recordId",item.recordId);form.set("file",file,item.filename);
        const response=await fetch("/api/attachments",{method:"POST",headers:{"X-Cookie-Catalog-Check":"attachments"},body:form});
        const body=await response.json() as {error?:string};if(!response.ok)throw Error(body.error??"Upload failed. Stop and review before retrying.");
        linked.push({sha256:hash,available:true});saved++;setResults(r=>[...r,"Uploaded: "+item.filename]);
        if(n===plan.items.length-1)setMessage(`Image batch complete: ${saved} uploaded; ${existing} already present. Verify originals in a complete catalog backup.`);
      }
      if(!stop.current)setMessage(`Image batch complete: ${saved} uploaded; ${existing} already present. Verify originals in a complete catalog backup.`);
    }catch(e){setMessage((e as Error).message+` Completed before stopping: ${saved} uploaded; ${existing} already present. Re-running checks existing checksums first.`);}
    finally{setBusy(false);onSaved();}
  }
  return <details><summary>Attach a reviewed image batch</summary><p>Use an explicit image-to-shape plan and the matching image files. Checksums are checked before each upload. Existing matching files on that shape are skipped; other originals are preserved. This does not create inventory or verify image content or measurements. Keep catalog edits idle during a batch.</p>
    <fieldset disabled={busy}><legend>Image batch inputs</legend><label>Reviewed image plan <input type="file" accept=".json" onChange={e=>void choose(e.target.files?.[0])}/></label><p><label>Source image files <input type="file" accept=".png,.jpg,.jpeg,.webp" multiple onChange={e=>setFiles(Array.from(e.target.files??[]))}/></label></p><p>{files.length} source files selected.</p><button disabled={!plan||!files.length} onClick={()=>void upload()}>Upload reviewed image batch</button></fieldset>
    {busy&&<button onClick={()=>{stop.current=true;setMessage("Stopping after the current file…");}}>Stop after current file</button>}
    <p role="status" aria-live="polite">{message}</p><details><summary>Batch results ({results.length})</summary><ul>{results.map((r,i)=><li key={i}>{r}</li>)}</ul></details>
  </details>;
}
