import React, { useEffect, useState } from "react";
import {catalogChoices} from "./catalog-choices";
type SearchHit = {field:string;label:string;snippet:string;start:number;length:number};
type Row = Record<string,string|number|null> & {searchHits?:SearchHit[]};
type Field = { key:string; label:string; type?: "number"|"textarea"|"url"; choices?: string[]; lookup?: "shapes"|"designs"|"locations"; required?:boolean };
const sections: Record<string,{label:string;fields:Field[]}> = {
  shapes:{label:"Cutter shapes",fields:[{key:"name",label:"Shape name",required:true},{key:"maker",label:"Maker"},{key:"source_url",label:"Source link",type:"url"},{key:"notes",label:"Notes / themes",type:"textarea"}]},
  designs:{label:"Decorating designs",fields:[{key:"name",label:"Design name",required:true},{key:"source_url",label:"Source link",type:"url"},{key:"notes",label:"Notes / themes",type:"textarea"}]},
  locations:{label:"Storage locations",fields:[{key:"label",label:"Location label",required:true},{key:"notes",label:"Notes",type:"textarea"}]},
  physical_cutters:{label:"Physical cutters",fields:[{key:"shape_id",label:"Cutter shape",lookup:"shapes",required:true},{key:"location_id",label:"Storage location",lookup:"locations"},{key:"width_mm",label:"Width (mm)",type:"number"},{key:"height_mm",label:"Height (mm)",type:"number"},{key:"quantity",label:"Quantity",type:"number",required:true},{key:"origin",label:"Origin",choices:["unknown","purchased","printed"],required:true},{key:"notes",label:"Notes",type:"textarea"}]},
  design_shape_links:{label:"Design/cutter mappings",fields:[{key:"design_id",label:"Design",lookup:"designs",required:true},{key:"shape_id",label:"Cutter shape",lookup:"shapes",required:true},{key:"status",label:"Compatibility",choices:["proposed","tested"],required:true},{key:"use_type",label:"Use",choices:["standard","flip","combination"],required:true},{key:"instructions",label:"Instructions",type:"textarea"},{key:"rotation_degrees",label:"Rotation (degrees)",type:"number"},{key:"mirrored",label:"Mirror",choices:["0","1"],required:true},{key:"min_width_mm",label:"Minimum compatible width (mm)",type:"number"},{key:"max_width_mm",label:"Maximum compatible width (mm)",type:"number"}]}
};
const defaults:Record<string,string>={quantity:"1",origin:"unknown",status:"proposed",use_type:"standard",mirrored:"0"};
function title(row:Row) { return String(row.name ?? row.label ?? row.design_name ?? row.shape_name ?? row.id); }
export function Catalog({onSaved,canEdit=true}:{onSaved:()=>void;canEdit?:boolean}) {
  const [kind,setKind]=useState("shapes"),[rows,setRows]=useState<Row[]>([]),[query,setQuery]=useState("");
  const [lookups,setLookups]=useState<Record<string,Row[]>>({shapes:[],designs:[],locations:[]});
  const [sizingFields,setSizingFields]=useState(false);
  const activeFields:Field[]=[...sections[kind].fields,...(kind==="physical_cutters"&&sizingFields?[{key:"reference_size_mm",label:"Reference size — longest edge (inches)",type:"number" as const},{key:"slot",label:"Slot (optional)"}]:[])];
  const [dirty,setDirty]=useState(false);
  useEffect(()=>{const warn=(event:BeforeUnloadEvent)=>{if(dirty){event.preventDefault();event.returnValue="";}};window.addEventListener("beforeunload",warn);return()=>window.removeEventListener("beforeunload",warn);},[dirty]);
  const [revision,setRevision]=useState("");
  const [values,setValues]=useState<Record<string,string>>({...defaults}),[editing,setEditing]=useState("");
  const [nextOffset,setNextOffset]=useState<number|null>(null),[busy,setBusy]=useState(false),[status,setStatus]=useState("");
  async function load(section=kind,q=query,offset=0) {
    const response=await fetch("/api/catalog/"+section+"?q="+encodeURIComponent(q)+"&offset="+offset,{cache:"no-store"});
    const body=await response.json() as {error?:string;records:Row[];nextOffset:number|null;fields?:string[]};
    if(!response.ok)throw Error(body.error ?? "Catalog could not load.");
    setSizingFields(section==="physical_cutters"&&!!body.fields?.includes("reference_size_mm"));setRows(body.records);setNextOffset(body.nextOffset);
  }
  async function choices() {
    const entries=await Promise.all((["shapes","designs","locations"] as const).map(async section=>[section,await catalogChoices(section)] as const));
    setLookups(Object.fromEntries(entries));
  }
  useEffect(()=>{setBusy(true);Promise.all([load("shapes",""),choices()]).catch(error=>setStatus(error.message)).finally(()=>setBusy(false));},[]);
  function reset() {setDirty(false);setRevision("");setEditing("");setValues({...defaults});}
  async function switchSection(section:string) {
    if(dirty&&!window.confirm("Switch sections and discard unsaved form changes?"))return;
    setKind(section);setQuery("");reset();setBusy(true);setStatus("");
    try{await load(section,"");}catch(error){setRows([]);setStatus((error as Error).message);}finally{setBusy(false);}
  }
  async function search(event?:React.FormEvent,offset=0) {
    event?.preventDefault();setBusy(true);
    try{await load(kind,query,offset);setStatus("");}catch(error){setStatus((error as Error).message);}finally{setBusy(false);}
  }
  async function save(event:React.FormEvent) {
    event.preventDefault();setBusy(true);setStatus("Saving record…");
    try {
      const record:Record<string,string|number|null>={};
      for(const field of activeFields) {
        const value=values[field.key]??"";
        record[field.key]=value===""?null:field.type==="number" || field.key==="mirrored"?Number(value)*(field.key==="reference_size_mm"?25.4:1):value;
      }
      const response=await fetch("/api/catalog/"+kind+(editing?"/"+editing:""),{method:editing?"PUT":"POST",headers:{"content-type":"application/json","X-Cookie-Catalog-Check":"catalog",...(editing?{"If-Match":revision}:{})},body:JSON.stringify(record)});
      const body=await response.json() as {error?:string;record:Row;revision:string};
      if(!response.ok)throw Error(body.error??"Record could not save.");
      setEditing(String(body.record.id));setRevision(body.revision);setDirty(false);
      await Promise.all([load(),choices()]);onSaved();setStatus("Saved. Refresh or search to retrieve this record.");
    }catch(error){setStatus((error as Error).message);}finally{setBusy(false);}
  }
  async function edit(row:Row) {
    if(dirty&&canEdit&&!window.confirm("Open this record and replace the current form? Keep a copy of any unsaved changes first."))return;
    setBusy(true);
    try {
      const response=await fetch("/api/catalog/"+kind+"/"+row.id,{cache:"no-store"});
      const body=await response.json() as {record:Row;revision:string;error?:string};
      if(!response.ok)throw Error(body.error??"Record could not load.");
      setDirty(false);setRevision(body.revision);setEditing(String(body.record.id));setValues(Object.fromEntries(activeFields.map(field=>[field.key,String(field.key==="reference_size_mm"&&body.record[field.key]!=null?Number((Number(body.record[field.key])/25.4).toFixed(8)):body.record[field.key]??"")])));
      setStatus((canEdit?"Editing ":"Viewing ")+title(body.record)+".");
    }catch(error){setStatus((error as Error).message);}finally{setBusy(false);}
  }
  return <section>
    <h2>Catalog records</h2>
    <p>Add a cutter shape and design, record where a physical cutter lives, then map designs to compatible shapes. Sizes are in millimeters.</p>
    <label>Browse <select disabled={busy} value={kind} onChange={event=>switchSection(event.target.value)}>{Object.entries(sections).map(([key,section])=><option value={key} key={key}>{section.label}</option>)}</select></label>
    <form onSubmit={event=>search(event)} style={{margin:"12px 0"}}>
      <label>Search record metadata <input value={query} maxLength={120} disabled={busy} onChange={event=>setQuery(event.target.value)} /></label>{" "}
      <button disabled={busy}>Search</button>
    </form>
    <ul>{rows.map(row=><li key={String(row.id)} style={{margin:"10px 0"}}>
      <strong>{title(row)}</strong>
      {kind==="physical_cutters" && <span> — {row.width_mm??"?"} × {row.height_mm??"?"} mm; reference size {row.reference_size_mm!=null?`${Number((Number(row.reference_size_mm)/25.4).toFixed(4))}″ (${row.reference_size_mm} mm)`:"unknown"}; quantity {row.quantity}; {row.location_label??"location unknown"}</span>}
      {kind==="design_shape_links" && <span> → {row.shape_name}; {row.status} {row.use_type}</span>}
      {(row.notes || row.instructions) && <span> — {row.notes??row.instructions}</span>}{" "}
      <button disabled={busy} onClick={()=>edit(row)}>{canEdit ? "Edit" : "View details"}</button>
      {!!row.searchHits?.length && <div style={{margin:"5px 0 8px 16px",fontSize:"0.95rem"}}>
        <span>Matched fields:</span>
        <ul>{row.searchHits.map(hit=><li key={hit.field}>
          <strong>{hit.label}:</strong>{" "}{hit.snippet.slice(0,hit.start)}
          <mark>{hit.snippet.slice(hit.start,hit.start+hit.length)}</mark>{hit.snippet.slice(hit.start+hit.length)}
        </li>)}</ul>
      </div>}
    </li>)}</ul>
    {!busy && rows.length===0 && <p>No matching records.</p>}
    {nextOffset!==null && <button disabled={busy} onClick={()=>search(undefined,nextOffset)}>Next page</button>}
    {(canEdit || editing) && <>
    <h3>{canEdit ? (editing?"Edit record":"New record") : "Record details"}</h3>
    {editing&&<p>Record ID for linking an import review: <code>{editing}</code></p>}
    {canEdit && editing && <button disabled={busy} onClick={()=>{if(!dirty||window.confirm("Start a new record and discard unsaved form changes?"))reset();}}>Start a new record</button>}
    <form onSubmit={event => { if (canEdit) void save(event); else event.preventDefault(); }}>
      <fieldset disabled={!canEdit} style={{border:0,padding:0}}>
      {activeFields.map(field=>{
        const value=values[field.key]??"",change=(next:string)=>{setDirty(true);setValues(previous=>({...previous,[field.key]:next}));};
        const options=field.lookup?lookups[field.lookup]:[];
        return <div key={field.key} style={{margin:"10px 0"}}><label>{field.label}{field.required?" *":""}<br />
          {field.lookup?<select required={field.required} disabled={busy} value={value} onChange={event=>change(event.target.value)}>
            <option value="">Choose a record</option>{value && !options.some(row=>row.id===value) && <option value={value}>Current record ({value})</option>}
            {options.map(row=><option key={String(row.id)} value={String(row.id)}>{title(row)}</option>)}
          </select>:field.choices?<select disabled={busy} value={value} onChange={event=>change(event.target.value)}>{field.choices.map(choice=><option key={choice} value={choice}>{field.key==="mirrored"?(choice==="1"?"Yes":"No"):choice}</option>)}</select>
            :field.type==="textarea"?<textarea disabled={busy} maxLength={4000} value={value} onChange={event=>change(event.target.value)} />
            :<input disabled={busy} required={field.required} type={field.type??"text"} step={field.type==="number"?"any":undefined} maxLength={field.type==="url"?2000:200} value={value} onChange={event=>change(event.target.value)} />}
        </label></div>;
      })}
      {canEdit && <button disabled={busy}>{busy?"Working…":editing?"Save changes":"Create record"}</button>}
      </fieldset>
    </form>
    </>}
    <p role="status" aria-live="polite">{status}</p>
    <p>Use test records during development. File attachments are managed below. Record deletion is not yet enabled.</p>
  </section>;
}
