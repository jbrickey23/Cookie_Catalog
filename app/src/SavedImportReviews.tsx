import {CatalogImport} from "./CatalogImport";
import React,{useState} from "react";
import {validateManifest,type StagingManifest} from "./staging.mjs";
import type {importPreview} from "./import-preview";
type Workspace={id:string;title:string;current_revision:number};
type Saved={id:string;title:string;revision:string;loadedRevision:number;manifest:StagingManifest;versions:{revision:number;item_count:number;saved_at:string}[];previews:{id:string;revision:number;created_at:string;result:ReturnType<typeof importPreview>}[]};
export function SavedImportReviews({draft,dirty,onOpen,onSaved,onBusy}:{draft:StagingManifest|null;dirty:boolean;onOpen:(manifest:StagingManifest,unsaved?:boolean)=>void;onSaved:()=>void;onBusy:(busy:boolean)=>void}){
  const [workspaces,setWorkspaces]=useState<Workspace[]>([]),[selected,setSelected]=useState(""),[nextOffset,setNextOffset]=useState<number|null>(null);
  const [current,setCurrent]=useState<Saved|null>(null),[title,setTitle]=useState(""),[newId]=useState(()=>"review_"+crypto.randomUUID().replaceAll("-",""));
  const [message,setMessage]=useState(""),[busy,setBusy]=useState(false),[preview,setPreview]=useState<ReturnType<typeof importPreview>|null>(null);
  async function task(action:()=>Promise<void>){setBusy(true);onBusy(true);try{await action();}catch(error){setMessage((error as Error).message);}finally{setBusy(false);onBusy(false);}}
  async function api<T>(url:string,init:RequestInit={}){
    const response=await fetch(url,{...init,cache:"no-store"});
    const result=await response.json() as {error?:string};if(!response.ok)throw Error(result.error??"Saved review unavailable. Your draft is kept.");return result as T;
  }
  const headers=(revision?:string)=>({"content-type":"application/json","X-Cookie-Catalog-Check":"import-review",...(revision?{"If-Match":revision}:{})});
  async function list(offset=0){
    const data=await api<{workspaces:Workspace[];nextOffset:number|null}>("/api/import-reviews?offset="+offset);
    setWorkspaces(data.workspaces);setNextOffset(data.nextOffset);setSelected(data.workspaces[0]?.id??"");setMessage(data.workspaces.length?"Choose a saved review to reopen.":"No saved reviews on this page.");
  }
  async function load(id:string,revision?:number){
    if(dirty&&!window.confirm("Replace the unsaved browser draft? Save or download it first to keep your changes."))return;
    const data=await api("/api/import-reviews/"+id+(revision?"?revision="+revision:"")) as Saved;
    const manifest=validateManifest(data.manifest);setCurrent(data);setTitle(data.title);setPreview(null);onOpen(manifest,data.loadedRevision!==Number(/^"review-(\d+)"$/.exec(data.revision)![1]));
    setMessage(revision?"Earlier version opened as a draft. Saving creates a new version; existing history is retained.":"Saved review opened. Your catalog records have not changed.");
  }
  async function save(){
    if(!draft)return;
    const manifest=validateManifest(draft),name=title.trim()||manifest.sourceNamespace.slice(0,120);
    const result=await api<{id:string;title:string;revision:string}>("/api/import-reviews"+(current?"/"+current.id:""),{method:current?"PUT":"POST",headers:headers(current?.revision),body:JSON.stringify({id:current?.id??newId,title:name,manifest})});
    const savedRevision=Number(/^"review-(\d+)"$/.exec(result.revision)![1]);
    setCurrent({id:result.id,title:result.title,revision:result.revision,loadedRevision:savedRevision,manifest,
      versions:[{revision:savedRevision,item_count:manifest.items.length,saved_at:new Date().toISOString()},...(current?.versions??[])].slice(0,50),previews:current?.previews??[]});
    setTitle(result.title);setPreview(null);onSaved();
    setMessage("Review saved with version history. Source file references are metadata; no originals or catalog records were imported.");
  }
  return <section aria-labelledby="saved-review-heading">
    <h3 id="saved-review-heading">Saved import reviews</h3>
    <p>Save classifications, missing-detail notes, ownership, sizes and source references in your private catalog. Keep file originals separately. Saving a review does not create inventory.</p>
    <button disabled={busy} onClick={()=>void task(()=>list())}>List saved reviews</button>
    {!!workspaces.length&&<><p><label>Saved review <select value={selected} onChange={e=>setSelected(e.target.value)}>{workspaces.map(w=><option key={w.id} value={w.id}>{w.title} — version {w.current_revision}</option>)}</select></label></p><button disabled={busy||!selected} onClick={()=>void task(()=>load(selected))}>Open saved review</button></>}
    {nextOffset!==null&&<button disabled={busy} onClick={()=>void task(()=>list(nextOffset))}>Next saved reviews</button>}
    {draft&&<>
      <p><label>Saved review title <input maxLength={120} value={title} placeholder={draft.sourceNamespace.slice(0,120)} onChange={e=>setTitle(e.target.value)} /></label></p>
      <button disabled={busy} onClick={()=>void task(save)}>{current?"Save review changes":"Save new review"}</button>{" "}
      <button disabled={busy||!current||dirty} onClick={()=>void task(async()=>{
        const result=await api<ReturnType<typeof importPreview>&{id:string;revision:number}>("/api/import-reviews/"+current!.id+"/preview",{method:"POST",headers:headers(current!.revision)});
        setPreview(result);setCurrent(previous=>previous?{...previous,previews:[{id:result.id,revision:result.revision,created_at:new Date().toISOString(),result},...previous.previews].slice(0,20)}:previous);setMessage("Preview recorded for this saved version. No catalog records changed.");
      })}>Record import preview</button>
      <p>Save changes before recording a preview. A preview checks metadata; it does not verify original file bytes or apply an import.</p>
    </>}
    {current&&draft&&<CatalogImport key={current.id+current.revision} id={current.id} revision={current.revision} manifest={draft} disabled={busy||dirty||JSON.stringify(current.manifest)!==JSON.stringify(draft)} onBusy={onBusy} />}
    {current&&<details><summary>Saved versions and preview history</summary>
      <ul>{current.versions.map(v=><li key={v.revision}>Version {v.revision} · {v.item_count} entries · {v.saved_at}{" "}<button disabled={busy} onClick={()=>void task(()=>load(current.id,v.revision))}>Open version {v.revision} as draft</button></li>)}</ul>
      <p>Showing at most 50 recent versions and 20 recent previews. Older history remains in backups.</p>
      <ul>{current.previews.map(p=><li key={p.id}>Preview of version {p.revision} · {p.created_at} · {p.result.counts.items} entries</li>)}</ul>
    </details>}
    {preview&&<div><h4>Import preview</h4><p>{preview.counts.physical} physical candidates, {preview.counts.printables} printable candidates, {preview.counts.designs} designs, {preview.counts.unclassified} unclassified.</p>
      <ul>{preview.blockers.map(b=><li key={b}>{b}</li>)}</ul><p>{preview.counts.referenceSizeUnknown} reference sizes, {preview.counts.dimensionsUnknown} width/height pairs and {preview.counts.originalReferenceMissing} printable-original references need collecting.</p><p>{preview.next}</p></div>}
    <p role="status" aria-live="polite">{message}</p>
  </section>;
}
