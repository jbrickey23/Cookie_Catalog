import {SavedImportReviews} from "./SavedImportReviews";
import React,{useEffect,useState} from "react";
import {validateManifest,kinds,purposes,type StagingManifest,type StagingItem} from "./staging.mjs";
import {applicableFields,readiness,type ReviewField,type ReviewState,type FieldReview,type Evidence} from "./readiness";
const kindNames={physical_cutter:"Physical cutter",printable_asset:"Printable file",design:"Decorating design",unclassified:"Not classified yet"};
const states:ReviewState[]=["unknown","needs_verification","not_applicable","complete"];
const stateNames={unknown:"Missing / unknown",needs_verification:"Needs verification",not_applicable:"Not applicable",complete:"Complete"};
function method(field:ReviewField):Evidence["method"] {return field==="dimensions"?"measured":field==="original"?"file_check":["photo","scale_photo","location"].includes(field)?"visual_review":"source_review";}
export function ImportReview({enableSavedReviews=false,canImport=false,onCatalogChanged}:{enableSavedReviews?:boolean;canImport?:boolean;onCatalogChanged?:()=>void}={}) {
  const [networkBusy,setNetworkBusy]=useState(false),[workspaceReset,setWorkspaceReset]=useState(0);
  const [dirty,setDirty]=useState(false);
  useEffect(()=>{const warn=(event:BeforeUnloadEvent)=>{if(dirty){event.preventDefault();event.returnValue="";}};window.addEventListener("beforeunload",warn);return()=>window.removeEventListener("beforeunload",warn);},[dirty]);
  const [draft,setDraft]=useState<StagingManifest|null>(null),[selected,setSelected]=useState(0),[message,setMessage]=useState("");
  async function open(file:File|undefined) {
    if(!file)return;
    if(draft&&dirty&&!window.confirm("Replace this local draft? Download it first to keep your review changes."))return;
    try {
      if(file.size>16*1024**2)throw Error("Choose a staging manifest no larger than 16 MiB.");
      const manifest=validateManifest(JSON.parse(await file.text()));
      setDraft(manifest);setDirty(false);setSelected(0);setWorkspaceReset(x=>x+1);setMessage("Local review draft opened. Nothing was uploaded or imported.");
    }catch(error){setMessage((error as Error).message);}
  }
  function update(change:(item:StagingItem)=>void) {
    setDraft(previous=>{
      if(!previous)return null;const next=structuredClone(previous);change(next.items[selected]);return next;
    });
    setDirty(true);setMessage("Draft changed in this browser tab. Save or download the reviewed manifest to keep it.");
  }
  function review(field:ReviewField,patch:Partial<FieldReview>) {
    update(item=>{item.reviews??={};item.reviews[field]={state:"unknown",...item.reviews[field],...patch};});
  }
  function download() {
    try {
      const manifest=validateManifest(draft),json=JSON.stringify(manifest,null,2)+"\n";
      if(new TextEncoder().encode(json).byteLength>16*1024**2)throw Error("Draft exceeds 16 MiB; prepare smaller stable batches.");
      const url=URL.createObjectURL(new Blob([json],{type:"application/json"})),link=document.createElement("a");
      link.href=url;link.download="Cookie_Catalog_Reviewed_Manifest_"+new Date().toISOString().replace(/[:.]/g,"-")+".json";document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
      setDirty(false);setMessage("Reviewed manifest download started. Source files are separate; run offline preparation to check their bytes. No catalog import ran.");
    }catch(error){setMessage((error as Error).message);}
  }
  const item=draft?.items[selected];
  const checks=item?readiness({id:item.sourceKey,kind:item.kind,name:item.name,facts:{...item.facts,source:item.facts?.source||item.source.pageId,
    photo:!!item.files?.some(f=>["cutter_photo","design_photo","scale_photo"].includes(f.purpose)),scalePhoto:!!item.files?.some(f=>f.purpose==="scale_photo"),original:!!item.files?.some(f=>f.purpose==="printable_original")},reviews:item.reviews}).checks:[];
  return <section aria-labelledby="import-review-heading">
    <h2 id="import-review-heading">Prepare an import review</h2>
    <fieldset disabled={networkBusy} style={{border:0,padding:0,margin:0}}>
    <p>Open a prepared manifest to classify items and collect missing details. Work stays in this tab until you download it or explicitly save a review. Your inventory and source notebook are unchanged.</p>
    <label>Prepared manifest (JSON) <input type="file" accept=".json,application/json" onChange={event=>{void open(event.target.files?.[0]);event.target.value="";}} /></label>
    <p role="status" aria-live="polite">{message}</p>
    {enableSavedReviews&&<SavedImportReviews canImport={canImport} onCatalogChanged={onCatalogChanged} key={workspaceReset} draft={draft} dirty={dirty} onBusy={setNetworkBusy} onInspect={index=>{setSelected(index);requestAnimationFrame(()=>document.getElementById("source-item-details")?.scrollIntoView({behavior:"smooth"}));}} onOpen={(manifest,unsaved=false)=>{setDraft(manifest);setDirty(unsaved);setSelected(0);setMessage("Saved source review opened. Catalog inventory is unchanged.");}} onSaved={()=>{setDirty(false);setMessage("Review saved.");}} />}

    {draft&&<>
      <p>{draft.items.length} source items. Namespace: {draft.sourceNamespace}</p>
      <button onClick={download}>Download reviewed manifest</button>{" "}
      <button onClick={()=>{if(window.confirm("Discard this local draft? Download it first to keep changes.")){setDraft(null);setDirty(false);setMessage("Local draft closed.");}}}>Close local draft</button>
      {item&&<>
        <p id="source-item-details"><label>Item <select value={selected} onChange={e=>setSelected(Number(e.target.value))}>{draft.items.map((entry,i)=><option key={entry.sourceKey} value={i}>{i+1}. {entry.name}</option>)}</select></label></p>
        <p>Source: {item.source.pageTitle??item.source.pageId}{item.source.sectionPath?" / "+item.source.sectionPath:""}</p>
        <p><label>Item name <input maxLength={200} value={item.name} onChange={e=>update(item=>{item.name=e.target.value;})} /></label></p>
        <p><label>Item type <select value={item.kind} onChange={e=>update(item=>{
          item.kind=e.target.value as StagingItem["kind"];item.catalog={};
          item.reviews=Object.fromEntries(Object.entries(item.reviews??{}).filter(([field])=>applicableFields(item.kind).includes(field as ReviewField)).map(([field,review])=>[field,{...review,state:"needs_verification"}]));
        })}>{kinds.map(kind=><option key={kind} value={kind}>{kindNames[kind]}</option>)}</select></label></p>
        <p>Changing the type resets ownership/quantity assertions and review completion. Applicable review notes remain; keep the original manifest for reference.</p>
        <button onClick={()=>{
          const copy=structuredClone(item);copy.sourceKey+="#split-"+crypto.randomUUID();copy.name=(copy.name+" — another item").slice(0,200);copy.kind="unclassified";copy.facts={};copy.catalog={};copy.reviews={};copy.files=copy.files?.map(f=>({...f,purpose:f.purpose==="source_page"?"source_page":"unknown"}));
          if(copy.sourceKey.length>2000){setMessage("Source identifier is too long to split here; use a shorter stable identifier in the prepared manifest.");return;}
          setDirty(true);setDraft({...draft,items:[...draft.items,copy]});setSelected(draft.items.length);setMessage("Another draft item created from this page. Classify it and assign only its own files; no live record was created.");
        }}>Describe another item from this page</button>
        {["physical_cutter","printable_asset"].includes(item.kind)&&<fieldset><legend>Dimensions</legend>
          {(["widthMm","heightMm"] as const).map(key=><p key={key}><label>{key==="widthMm"?"Width (mm)":"Height (mm)"} <input type="number" min="0.001" max="10000" step="any" value={item.facts?.[key]??""} onChange={e=>update(item=>{item.facts??={};if(e.target.value==="")delete item.facts[key];else item.facts[key]=Number(e.target.value);})} /></label></p>)}
          <p>Record orientation and how you measured in the dimension review notes. A scale photo alone does not establish verified dimensions.</p>
        </fieldset>}
        {item.kind==="physical_cutter"&&<p><label>Storage location <input maxLength={4000} value={item.facts?.location??""} onChange={e=>update(item=>{item.facts??={};item.facts.location=e.target.value;})} /></label></p>}
        {["physical_cutter","printable_asset"].includes(item.kind)&&<fieldset><legend>Ownership and reference size</legend>
          <p><label>Ownership <select value={item.catalog?.ownership??"unknown"} onChange={e=>update(item=>{item.catalog??={};item.catalog.ownership=e.target.value as "unknown"|"owned"|"not_owned";})}><option value="unknown">Unknown / needs checking</option><option value="owned">Owned</option><option value="not_owned">Not owned / not purchased</option></select></label></p>
          <p><label>Print status <select value={item.catalog?.printStatus??"unknown"} onChange={e=>update(item=>{item.catalog??={};item.catalog.printStatus=e.target.value as "unknown"|"printed"|"not_printed"|"not_applicable";})}><option value="unknown">Unknown / needs checking</option><option value="printed">Printed</option><option value="not_printed">Not printed</option><option value="not_applicable">Not applicable</option></select></label></p>
          {item.kind==="physical_cutter"&&<><p><label>Physical quantity (blank means unknown) <input type="number" min="0" max="100000" step="1" value={item.catalog?.quantity??""} onChange={e=>update(item=>{item.catalog??={};if(e.target.value==="")delete item.catalog.quantity;else item.catalog.quantity=Number(e.target.value);})} /></label></p><p><label>Slot (optional) <input maxLength={200} value={item.catalog?.slot??""} onChange={e=>update(item=>{item.catalog??={};item.catalog.slot=e.target.value;})} /></label></p></>}
          <p><label>Reference size — longest edge (inches) <input type="number" min="0.001" step="any" value={item.catalog?.referenceSizeMm===undefined?"":Number((item.catalog.referenceSizeMm/25.4).toFixed(8))} onChange={e=>update(item=>{item.catalog??={};if(e.target.value==="")delete item.catalog.referenceSizeMm;else item.catalog.referenceSizeMm=Number(e.target.value)*25.4;})} /></label></p>
          <p><label>Original size label / units <input maxLength={200} value={item.catalog?.originalSizeLabel??""} onChange={e=>update(item=>{item.catalog??={};item.catalog.originalSizeLabel=e.target.value;})} /></label></p>
          <p>A 4 by 2 inch cookie has a 4 inch reference size. Keep oriented measured width/height separately. Do not use packaging or assembled-set dimensions for an individual cutter.</p>
        </fieldset>}
        <h3>Source files</h3>
        <p>These are references to your separate source folder. This page does not open, upload or verify their bytes.</p>
        <ul>{item.files?.map((file,i)=><li key={i}><label>Relative source file path <input maxLength={2000} value={file.path} onChange={e=>update(item=>{item.files![i].path=e.target.value;})} /></label>{" "}<label>Purpose <select value={file.purpose} onChange={e=>update(item=>{item.files![i].purpose=e.target.value as typeof file.purpose;})}>{purposes.map(purpose=><option key={purpose} value={purpose}>{purpose.replaceAll("_"," ")}</option>)}</select></label>{" "}
          <button onClick={()=>update(item=>{item.files!.splice(i,1);})}>Exclude reference from this draft item</button>
        </li>)}</ul>
        <button onClick={()=>update(item=>{item.files??=[];item.files.push({path:"",purpose:"unknown"});})}>Add source file reference</button>
        <h3>Collection checklist</h3>
        {checks.map(check=>{const decision=item.reviews?.[check.field];return <fieldset key={check.field} style={{margin:"1rem 0"}}><legend>{check.label} — {stateNames[check.state]}</legend>
          <p>{check.action}</p>
          <label>Review status <select value={decision?.state??check.state} onChange={e=>review(check.field,{state:e.target.value as ReviewState,...(e.target.value==="complete"?{evidence:{reference:decision?.evidence?.reference??"",method:method(check.field)}}:{})})}>
            {states.filter(state=>state!=="not_applicable"||!["classification","source","original"].includes(check.field)).map(state=><option key={state} value={state}>{stateNames[state]}</option>)}
          </select></label>
          <p><label>Review notes / exception reason <textarea maxLength={4000} value={decision?.note??""} onChange={e=>review(check.field,{note:e.target.value})} /></label></p>
          {decision?.state==="complete"&&<p><label>Evidence reference ({method(check.field).replaceAll("_"," ")}) <input maxLength={2000} value={decision.evidence?.reference??""} onChange={e=>review(check.field,{evidence:{method:method(check.field),reference:e.target.value}})} /></label></p>}
        </fieldset>;})}
        <p>Complete records your supplied evidence; the offline preparation step still validates references and file checksums. Unknown details can stay unknown. Save or download before closing this tab.</p>
      </>}
    </>}
    </fieldset>
  </section>;
}
