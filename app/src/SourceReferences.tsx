import React,{useRef,useState} from "react";
type Reference={name:string;source_url?:string|null;notes:string};
type Plan={format:"cookie-catalog-reference-plan";version:1;items:Reference[]};
function identity(notes:string):string|null {try{const n=JSON.parse(notes);return n.format==="cookie-catalog-source-reference"&&typeof n.sourceNamespace==="string"&&n.sourceNamespace.trim()&&typeof n.sourceKey==="string"&&n.sourceKey.trim()?JSON.stringify([n.sourceNamespace,n.sourceKey]):null;}catch{return null;}}
export function validateReferencePlan(value:unknown):Plan {
 const p=value as Plan;
 if(!p||p.format!=="cookie-catalog-reference-plan"||p.version!==1||!Array.isArray(p.items)||!p.items.length||p.items.length>1000)throw Error("Choose a source-reference plan with 1–1,000 entries.");
 const seen=new Set<string>();
 for(const r of p.items){if(!r||Object.keys(r).some(k=>!["name","source_url","notes"].includes(k))||typeof r.name!=="string"||!r.name.trim()||r.name.length>200||typeof r.notes!=="string"||r.notes.length>4000||!identity(r.notes))throw Error("Every reference needs a name and preserved source identity.");const key=identity(r.notes)!;if(seen.has(key))throw Error("Duplicate source identity in this plan.");seen.add(key);
  if(r.source_url){try{if(r.source_url.length>2000||!["http:","https:"].includes(new URL(r.source_url).protocol))throw Error();}catch{throw Error("Unsupported source URL.");}}
 }
 return p;
}
export function SourceReferences({onSaved}:{onSaved:()=>void}) {
 const [plan,setPlan]=useState<Plan|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 const [results,setResults]=useState<{sourceKey:string;shapeId:string;name:string;status:string}[]>([]);const stop=useRef(false);
 async function choose(file:File|undefined){setPlan(null);setResults([]);try{if(!file||file.size>2*1024*1024)throw Error("Choose a reference plan no larger than 2 MiB.");const p=validateReferencePlan(JSON.parse(await file.text()));setPlan(p);setMessage(`${p.items.length} source references ready for review. No physical quantities, ownership, measurements or printable originals will be created.`);}catch(e){setMessage((e as Error).message);}}
 async function create(){if(!plan)return;setBusy(true);stop.current=false;setResults([]);let created=0,existing=0;
  try {
   const known=new Map<string,{id:string;name:string;notes:string}>();let offset=0;
   for(let page=0;page<50;page++){
    const response=await fetch("/api/catalog/shapes?offset="+offset,{cache:"no-store"});if(!response.ok)throw Error("Existing source references could not load.");
    const body=await response.json() as {records:{id:string;name:string;notes:string|null}[];nextOffset:number|null};
    for(const r of body.records){const key=r.notes&&identity(r.notes);if(key){if(known.has(key))throw Error("Existing duplicate source identities require reconciliation.");known.set(key,{id:r.id,name:r.name,notes:r.notes!});}}
    if(body.nextOffset===null)break;if(page===49||!Number.isSafeInteger(body.nextOffset)||body.nextOffset<=offset)throw Error("Reference list exceeded the supported bound.");offset=body.nextOffset;
   }
   for(let n=0;n<plan.items.length;n++){
    if(stop.current)break;const item=plan.items[n],key=identity(item.notes)!,prior=known.get(key),sourceKey=JSON.parse(item.notes).sourceKey;
    setMessage(`Importing source reference ${n+1} of ${plan.items.length}: ${item.name}`);
    if(prior){if(prior.name!==item.name.trim()||prior.notes!==item.notes.trim())throw Error("Source reference changed: "+item.name+". Review it before retrying.");existing++;setResults(r=>[...r,{sourceKey,shapeId:prior.id,name:item.name,status:"already present"}]);continue;}
    const response=await fetch("/api/catalog/shapes",{method:"POST",headers:{"content-type":"application/json","X-Cookie-Catalog-Check":"catalog"},body:JSON.stringify({name:item.name,source_url:item.source_url??null,notes:item.notes})});
    const body=await response.json() as {error?:string;record?:{id:string}};if(!response.ok||!body.record?.id)throw Error(body.error??"Source reference did not save. Stop and review before retrying.");
    created++;known.set(key,{id:body.record.id,name:item.name.trim(),notes:item.notes.trim()});setResults(r=>[...r,{sourceKey,shapeId:body.record!.id,name:item.name,status:"created"}]);
   }
   setMessage(`${stop.current?"Stopped between records":"Source-reference batch complete"}: ${created} created; ${existing} already present. No physical inventory was created.`);
  }catch(e){setMessage((e as Error).message+` Completed: ${created} created; ${existing} already present. Existing source identities are checked on retry.`);}
  finally{setBusy(false);onSaved();}
 }
 function download(){const url=URL.createObjectURL(new Blob([JSON.stringify({format:"cookie-catalog-reference-results",version:1,items:results},null,2)],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download="Source_Reference_Results.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);}
 return <details><summary>Import reviewed source references</summary><p>Preserve unresolved sets, unprinted files and other source entries as cutter-shape references. This creates no owned physical inventory, quantities, measurements or printable originals. Existing matching source identities are skipped. Keep catalog edits idle during the batch.</p><label>Reviewed source-reference plan <input disabled={busy} type="file" accept=".json" onChange={e=>void choose(e.target.files?.[0])}/></label><p><button disabled={busy||!plan} onClick={()=>void create()}>Create reviewed source references</button>{busy&&<button onClick={()=>{stop.current=true;}}>Stop after current record</button>}</p><p role="status" aria-live="polite">{message}</p>{!!results.length&&<button disabled={busy} onClick={download}>Download source-reference results</button>}</details>;
}
