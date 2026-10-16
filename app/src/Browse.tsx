import React,{useEffect,useState,useRef,useCallback} from "react";
import {MasterDetailWorkspace} from "./MasterDetailWorkspace";
import {EntryEditor} from "./EntryEditor";
export interface BrowseItem {id:string;shape_id:string;source_bin:string|null;name:string;quantity:number|null;record_kind?:"physical"|"reference";review_state?:string|null;source_url?:string|null;source_reason?:string|null;width_mm:number|null;height_mm:number|null;reference_size_mm:number|null;location:string|null;slot:string|null;image_id:string|null;image_name:string|null}
const reviewLabel=(state:string|null|undefined)=>({not_printed:"Not printed",not_owned:"Not purchased",set_review:"Set / components need review",variant_review:"Size variants need review",duplicate_review:"Possible duplicate",print_review:"Print status needs review"}[state??""]??"Inventory needs review");
const number=(n:number)=>Number(n.toFixed(2)).toString();
export function CutterCard({item,onOpen}:{item:BrowseItem;onOpen?:()=>void}) {
  const [failed,setFailed]=useState(false);
  const artwork=/reference[ _-]*artwork/i.test(item.image_name??"");
  return <article className="cutter-card" onClick={onOpen}>
    <div className="cutter-image">{item.image_id&&!failed?<img loading="lazy" src={"/api/attachments/"+encodeURIComponent(item.image_id)+"?view=image"} alt={artwork?"Reference artwork for "+item.name:item.name+" — catalog image"} onError={()=>setFailed(true)}/>:<span>{failed?"Image unavailable":"Image needed"}</span>}</div>
    <div className="cutter-card-body"><p className="image-kind">{artwork?"Reference artwork":item.image_id?"Catalog image":"No image attached"}</p><h3>{item.name}</h3>
    <p className="reference-size">{item.record_kind==="reference"?reviewLabel(item.review_state):item.reference_size_mm?number(item.reference_size_mm/25.4)+'″ cutter':"Reference size needed"}</p>
    <dl><div><dt>Location</dt><dd>{item.location??item.source_bin??"Not recorded"}{item.slot?" · Slot "+item.slot:""}</dd></div><div><dt>Quantity</dt><dd>{item.quantity??"Not recorded as inventory"}</dd></div><div><dt>Width × height</dt><dd>{item.width_mm&&item.height_mm?`${number(item.width_mm)} × ${number(item.height_mm)} mm`:"Measurements needed"}</dd></div></dl>

    {item.record_kind==="reference"&&<p className="collection-note">Source reference · no owned physical cutter recorded.</p>}
    {artwork&&<p className="collection-note">Actual cutter photo still needed.</p>}
    {onOpen&&<button id={"view-"+item.id} className="view-cutter" onClick={e=>{e.stopPropagation();onOpen();}}>View {item.name}</button>}
    </div>
  </article>;
}
export function Browse({version=0,canEdit=false,canDelete=false}:{version?:number;canEdit?:boolean;canDelete?:boolean}) {
  const [dirty,setDirty]=useState(false),[locked,setLocked]=useState(false),[newKind,setNewKind]=useState<"shapes"|"cutters"|null>(null);
  const reportDirty=useCallback((value:boolean,busy=false)=>{setDirty(value);setLocked(busy);},[]);
  const allowChange=()=>!locked&&(!dirty||window.confirm("Discard unsaved changes before leaving this entry?"));
  const [selected,setSelected]=useState<BrowseItem|null>(null);
  const [kind,setKind]=useState("all");
  const [query,setQuery]=useState(""),[search,setSearch]=useState(""),[demo,setDemo]=useState(false),[offset,setOffset]=useState(0);
  const [total,setTotal]=useState(0);
  const [items,setItems]=useState<BrowseItem[]>([]),[next,setNext]=useState<number|null>(null),[error,setError]=useState(""),[busy,setBusy]=useState(true),[refresh,setRefresh]=useState(0);
  useEffect(()=>{let active=true;setBusy(true);setError("");
    fetch(`/api/browse?q=${encodeURIComponent(search)}&offset=${offset}&demo=${demo}&kind=${kind}`,{cache:"no-store"}).then(async r=>{if(!r.ok)throw Error();return await r.json() as {items:BrowseItem[];nextOffset:number|null;total:number};}).then(body=>{if(active){setItems(body.items);setTotal(body.total);setNext(body.nextOffset);setSelected(previous=>previous?body.items.find(i=>i.id===previous.id)??previous:null);}}).catch(()=>{if(active){setItems([]);setError("The catalog could not load. Refresh and retry.");}}).finally(()=>{if(active)setBusy(false);});return()=>{active=false;};
  },[search,demo,offset,version,refresh,kind]);
  return <section aria-labelledby="browse-title" className="catalog-browse"><div className="browse-heading"><div><p className="eyebrow">YOUR COLLECTION</p><h2 id="browse-title">Find a cutter</h2><p>Browse cutters, sizes and source references. See what still needs collecting.</p></div><button onClick={()=>{if(allowChange()){setRefresh(v=>v+1);setSelected(null);setNewKind(null);}}} disabled={busy}>Refresh catalog</button></div>
    <form className="browse-search" onSubmit={e=>{e.preventDefault();if(!allowChange())return;setSelected(null);setNewKind(null);setOffset(0);setSearch(query.trim());}}><label htmlFor="browse-search">Search by name or bin</label><div><input id="browse-search" type="search" value={query} maxLength={120} onChange={e=>setQuery(e.target.value)} placeholder="Try a name or bin…"/><button type="submit">Search</button></div></form>
    <p><label>Show entries <select value={kind} onChange={e=>{if(!allowChange())return;setKind(e.target.value);setSelected(null);setNewKind(null);setOffset(0);}}><option value="all">All catalog entries</option><option value="physical">Physical cutters</option><option value="reference">Source references / inventory needs review</option></select></label></p>
    <label className="demo-toggle"><input type="checkbox" checked={demo} onChange={e=>{if(!allowChange())return;setDemo(e.target.checked);setSelected(null);setNewKind(null);setOffset(0);}}/> Show demonstration records</label>
    <p role="status" aria-live="polite">{busy?"Loading cutters…":error||`Showing ${items.length?offset+1:0}–${offset+items.length} of ${total} catalog entries.`}</p>
    {!busy&&!error&&items.length===0&&<p>No cutters match this search.</p>}
    {canEdit&&<div className="browse-create"><button onClick={()=>{if(allowChange()){setSelected(null);setNewKind('cutters');}}}>New physical cutter</button><button onClick={()=>{if(allowChange()){setSelected(null);setNewKind('shapes');}}}>New shape reference</button></div>}
    <MasterDetailWorkspace detail={(selected||newKind)?<>
      {newKind?<section className="cutter-detail" aria-label="New catalog entry"><div className="browse-heading"><h3>{newKind==='cutters'?'New physical cutter':'New shape reference'}</h3><button onClick={()=>{if(allowChange())setNewKind(null);}}>Close new entry</button></div><EntryEditor key={'new-'+newKind} kind={newKind} canEdit={canEdit} canDelete={false} onDirty={reportDirty} onSaved={()=>{setNewKind(null);setRefresh(v=>v+1);}} onDeleted={()=>{}}/></section>:selected&&<CutterDetails key={selected.id} item={selected} canEdit={canEdit} canDelete={canDelete} onDirty={reportDirty} onSaved={entry=>{setSelected(value=>value?{...value,name:entry.shape.name,quantity:entry.cutter?.quantity??null,width_mm:entry.cutter?.width_mm??null,height_mm:entry.cutter?.height_mm??null,reference_size_mm:entry.cutter?.reference_size_mm??null}:value);setRefresh(v=>v+1);}} onDeleted={()=>{setSelected(null);setRefresh(v=>v+1);}} onClose={()=>{if(!allowChange())return;setSelected(null);requestAnimationFrame(()=>document.getElementById("view-"+selected.id)?.focus());}}/>}
    </>:null}>
    {!busy&&<div className="cutter-grid">{items.filter(item=>item.id!==selected?.id).map(item=><CutterCard key={item.id} item={item} onOpen={()=>{if(selected?.id===item.id&&!newKind)return;if(allowChange()){setNewKind(null);setSelected(item);}}}/>)}</div>}
    </MasterDetailWorkspace>
    <nav aria-label="Catalog pages" className="browse-pages"><button disabled={busy||offset===0} onClick={()=>{if(allowChange()){setSelected(null);setNewKind(null);setOffset(Math.max(0,offset-24));}}}>Previous page</button><button disabled={busy||next===null} onClick={()=>{if(next!==null&&allowChange()){setSelected(null);setNewKind(null);setOffset(next);}}}>Next page</button></nav>
    <p className="browse-note">Images and recorded sizes are reference information. An image alone does not verify dimensions or scale.</p>
  </section>;
}

function ImageWindowLink({id,filename,children}:{id:string;filename:string;children:React.ReactNode}) {
 const url="/api/attachments/"+encodeURIComponent(id)+"?view=image";
 return <a className="image-window-link" href={url} target="_blank" rel="noopener noreferrer" aria-label={"Open "+filename+" in a read-only image window"} onClick={event=>{
  if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  window.open(url,"_blank","popup=yes,width=1100,height=850,noopener,noreferrer");
 }}>{children}</a>;
}

function CutterDetails({item,onClose,canEdit,canDelete,onDirty,onSaved,onDeleted}:{item:BrowseItem;onClose:()=>void;canEdit:boolean;canDelete:boolean;onDirty:(dirty:boolean,busy?:boolean)=>void;onSaved:(entry:any)=>void;onDeleted:()=>void}) {
  const panel=useRef<HTMLElement>(null);
  useEffect(()=>{panel.current?.focus();},[]);
  const [files,setFiles]=useState<{id:string;filename:string;mediaType:string;available:boolean}[]>([]),[status,setStatus]=useState("Loading files…");
  useEffect(()=>{let active=true;fetch("/api/attachments?kind=shape&recordId="+encodeURIComponent(item.shape_id),{cache:"no-store"}).then(async r=>{if(!r.ok)throw Error();return await r.json() as {attachments:{id:string;filename:string;mediaType:string;available:boolean}[]};}).then(body=>{if(active){setFiles(body.attachments);setStatus(body.attachments.length?"":"No files attached.");}}).catch(()=>{if(active)setStatus("Files could not load. Close and reopen this cutter to retry.");});return()=>{active=false;};},[item.shape_id]);
  return <section ref={panel} tabIndex={-1} className="cutter-detail" aria-label={"Viewing "+item.name}><div className="browse-heading"><h3>Viewing: {item.name}</h3><button onClick={onClose}>Close cutter details</button></div>
    <p role="status">{status}</p><div className="detail-images">{files.map(file=><figure key={file.id}>{file.available&&["image/png","image/jpeg","image/webp"].includes(file.mediaType)&&<ImageWindowLink id={file.id} filename={file.filename}><img src={"/api/attachments/"+encodeURIComponent(file.id)+"?view=image"} alt={file.filename} loading="lazy"/></ImageWindowLink>}<figcaption>{file.filename} · {file.available&&["image/png","image/jpeg","image/webp"].includes(file.mediaType)&&<><ImageWindowLink id={file.id} filename={file.filename}>Open image</ImageWindowLink>{" · "}</>}{file.available?<a href={"/api/attachments/"+encodeURIComponent(file.id)}>Download original</a>:"Original unavailable"}</figcaption></figure>)}</div>
    {item.record_kind==='reference'&&<p>Assigned BIN: {item.location??item.source_bin??'Not recorded'}. Location is independent of physical/digital status.</p>}
    <EntryEditor kind={item.record_kind==='reference'?'shapes':'cutters'} id={item.record_kind==='reference'?item.shape_id:item.id} canEdit={canEdit} canDelete={canDelete} onDirty={onDirty} onSaved={onSaved} onDeleted={onDeleted}/>
    {item.source_reason&&<p>{item.source_reason}</p>}
    {item.source_url&&/^https?:/.test(item.source_url)&&<p><a href={item.source_url} target="_blank" rel="noreferrer">Open recorded source link</a></p>}

    <p>Files belong to the cutter shape and may be shared across its size variants. Reference artwork and decorated examples do not verify the physical cutter or its size.</p>
  </section>;
}
