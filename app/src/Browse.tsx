import React,{useEffect,useState,useRef,useCallback} from "react";
import {MasterDetailWorkspace} from "./MasterDetailWorkspace";
import {RecordPhotos} from './RecordPhotos';
import {EntryEditor} from "./EntryEditor";
export interface BrowseItem {inventory_count?:number;id:string;shape_id:string;source_bin:string|null;name:string;maker?:string;quantity:number|null;record_kind?:"physical"|"reference";review_state?:string|null;source_url?:string|null;source_reason?:string|null;width_mm:number|null;height_mm:number|null;reference_size_mm:number|null;location:string|null;slot:string|null;image_id:string|null;image_name:string|null}
const reviewLabel=(state:string|null|undefined)=>state==null?'Producer reference':({not_printed:"Not printed",not_owned:"Not purchased",set_review:"Set / components need review",variant_review:"Size variants need review",duplicate_review:"Possible duplicate",print_review:"Print status needs review"}[state??""]??"Inventory needs review");
export function ownershipLabel(item:BrowseItem) {
 if(item.review_state||item.record_kind==='physical'&&!(item.quantity!>0))return 'Inventory needs review';
 if(item.record_kind==='physical'||(item.inventory_count??0)>0)return 'Physical inventory recorded';
 return item.inventory_count===0?'No physical inventory recorded':'Inventory status not yet checked';
}
const number=(n:number)=>Number(n.toFixed(2)).toString();
export function CutterCard({item,onOpen}:{item:BrowseItem;onOpen?:()=>void}) {
  const [failed,setFailed]=useState(false);
  const artwork=/reference[ _-]*artwork/i.test(item.image_name??"");
  return <article className="cutter-card" onClick={onOpen}>
    <div className="cutter-image">{item.image_id&&!failed?<img loading="lazy" src={"/api/attachments/"+encodeURIComponent(item.image_id)+"?view=image"} alt={artwork?"Reference artwork for "+item.name:item.name+" — catalog image"} onError={()=>setFailed(true)}/>:<span>{failed?"Image unavailable":"No image attached"}</span>}</div>
    <div className="cutter-card-body"><p className="image-kind">{artwork?"Reference artwork":item.image_id?"Reference image":"No image attached"}</p><h3>{item.name}</h3><p>{item.maker??"Producer not recorded"}</p>
    <p className="ownership-status">{ownershipLabel(item)}</p><p className="reference-size">{item.record_kind==="reference"?reviewLabel(item.review_state):item.reference_size_mm?number(item.reference_size_mm/25.4)+'″ cutter':"Reference size needed"}</p>
    <dl><div><dt>Location</dt><dd>{item.location??item.source_bin??"Not recorded"}{item.slot?" · Slot "+item.slot:""}</dd></div><div><dt>Quantity</dt><dd>{item.quantity??"Not recorded as inventory"}</dd></div><div><dt>Width × height</dt><dd>{item.width_mm&&item.height_mm?`${number(item.width_mm)} × ${number(item.height_mm)} mm`:"Measurements needed"}</dd></div></dl>

    {item.record_kind==="reference"&&<p className="collection-note">Producer design · view details for sizes and recorded cutters.</p>}
    {artwork&&<p className="collection-note">Actual cutter photo still needed.</p>}
    {onOpen&&<button id={"view-"+item.id} className="view-cutter" onClick={e=>{e.stopPropagation();onOpen();}}>View {item.name}</button>}
    </div>
  </article>;
}
export function Browse({version=0,canEdit=false,canDelete=false,onContextChange,contextual=false}:{contextual?:boolean;version?:number;canEdit?:boolean;canDelete?:boolean;onContextChange?:(context:{recordId?:string;recordName?:string;search?:string})=>void}) {
  const [task,setTask]=useState(contextual?'home':'find');
  const [savedNotice,setSavedNotice]=useState('');
 const focused=(entry:any):BrowseItem=>({id:entry.cutter?.id??entry.shape.id,shape_id:entry.shape.id,name:entry.shape.name,maker:entry.shape.maker,record_kind:entry.cutter?'physical':'reference',quantity:entry.cutter?.quantity??null,location:null,source_bin:null,width_mm:entry.cutter?.width_mm??null,height_mm:entry.cutter?.height_mm??null,reference_size_mm:entry.cutter?.reference_size_mm??null,slot:entry.cutter?.slot??null,image_id:null,image_name:null});
 const [dirty,setDirty]=useState(false),[locked,setLocked]=useState(false),[newKind,setNewKind]=useState<"shapes"|"cutters"|null>(null);
  const reportDirty=useCallback((value:boolean,busy=false)=>{setDirty(value);setLocked(busy);},[]);
  const allowChange=()=>!locked&&(!dirty||window.confirm("Discard unsaved changes before leaving this entry?"));
  const [selected,setSelected]=useState<BrowseItem|null>(null);
  const [kind,setKind]=useState("all");
  const [query,setQuery]=useState(""),[search,setSearch]=useState(""),[demo,setDemo]=useState(false),[offset,setOffset]=useState(0);
  const [total,setTotal]=useState(0);
  const [items,setItems]=useState<BrowseItem[]>([]),[next,setNext]=useState<number|null>(null),[error,setError]=useState(""),[busy,setBusy]=useState(true),[refresh,setRefresh]=useState(0);
  useEffect(()=>{let active=true;setBusy(true);setError("");
    fetch(`/api/browse?q=${encodeURIComponent(search)}&offset=${offset}&demo=${demo}&kind=${kind}`,{cache:"no-store"}).then(async r=>{if(!r.ok){const detail=await r.json().catch(()=>null) as {error?:string}|null;throw Error(detail?.error??"The catalog could not load. Refresh and retry.");}return await r.json() as {items:BrowseItem[];nextOffset:number|null;total:number};}).then(body=>{if(active){setItems(body.items);setTotal(body.total);setNext(body.nextOffset);setSelected(previous=>previous?body.items.find(i=>i.id===previous.id)??previous:null);}}).catch((e:unknown)=>{if(active){setItems([]);setError(e instanceof Error&&!(e instanceof TypeError)?e.message:"The catalog could not load. Refresh and retry.");}}).finally(()=>{if(active)setBusy(false);});return()=>{active=false;};
  },[search,demo,offset,version,refresh,kind]);
  useEffect(()=>{onContextChange?.({recordId:selected?.id,recordName:selected?.name,search});},[selected?.id,selected?.name,search,onContextChange]);
  function chooseTask(nextTask:string){if(nextTask===task)return;if(!allowChange())return;setSelected(null);setNewKind(null);setOffset(0);setKind(nextTask==='mine'?'physical':'all');setTask(nextTask);requestAnimationFrame(()=>document.getElementById(nextTask==='home'?'catalog-home-title':'browse-title')?.focus());}
  return <section aria-labelledby={contextual&&task==='home'?'catalog-home-title':'browse-title'} className={"catalog-browse"+(contextual&&task==='add'?' task-add':'')}>{contextual&&<><nav className="task-nav" aria-label="Catalog tasks">{[['home','Home'],['find','Find Something'],...(canEdit?[['add','Add Something']]:[]),['mine','My Cutters']].map(([value,label])=><button key={value} aria-current={task===value?'page':undefined} disabled={locked} onClick={()=>chooseTask(value)}>{label}</button>)}</nav>{task==='home'&&<div className="catalog-home"><p className="eyebrow">YOUR COOKIE CUTTER COLLECTION</p><h2 id="catalog-home-title" tabIndex={-1}>What would you like to do?</h2><div className="task-cards"><button onClick={()=>chooseTask('find')}><strong>Find Something</strong><span>Search cutters, producer designs and tags.</span></button>{canEdit&&<button onClick={()=>chooseTask('add')}><strong>Add Something</strong><span>Record a cutter or save a design for later.</span></button>}<button onClick={()=>chooseTask('mine')}><strong>My Cutters</strong><span>Find sizes, quantities and storage locations.</span></button></div><p>Cookie Sets is planned for R2.2.</p></div>}</>}
    <div hidden={contextual&&task==='home'}><div className="browse-heading"><div><p className="eyebrow">YOUR COLLECTION</p><h2 id="browse-title" tabIndex={-1}>{!contextual?'Find a cutter':task==='mine'?'My Cutters':task==='add'?'Add Something':'Find Something'}</h2><p>{task==='add'?'Choose what you want to save, then find an existing producer design or explicitly create a new one.':'Find a design, see whether cutters are recorded, and open its details.'}</p></div><button onClick={()=>{if(allowChange()){setRefresh(v=>v+1);setSelected(null);setNewKind(null);}}} disabled={busy}>Refresh catalog</button></div>
    <div hidden={contextual&&task==='add'}><form className="browse-search" onSubmit={e=>{e.preventDefault();if(!allowChange())return;setSelected(null);setNewKind(null);setOffset(0);setSearch(query.trim());}}><label htmlFor="browse-search">Search by name, bin or tag</label><div><input id="browse-search" type="search" value={query} maxLength={120} onChange={e=>setQuery(e.target.value)} placeholder="Try cat Holiday or a bin…" aria-describedby="browse-search-help"/><button type="submit">Search</button><button type="button" disabled={locked||(!query&&!search&&kind==='all'&&!demo&&offset===0&&!selected&&!newKind)} onClick={()=>{if(!allowChange())return;setQuery('');setSearch('');setKind('all');setDemo(false);setOffset(0);setSelected(null);setNewKind(null);}}>Reset filters</button></div><p id="browse-search-help" className="browse-note">Match all words across name, producer, BIN or tags. Use quotes for a phrase.</p></form>
    <p><label>Show entries <select value={kind} onChange={e=>{if(!allowChange())return;setKind(e.target.value);setSelected(null);setNewKind(null);setOffset(0);}}><option value="all">All catalog entries</option><option value="physical">Physical cutters</option><option value="reference">All references / producer designs</option></select></label></p>
    <label className="demo-toggle"><input type="checkbox" checked={demo} onChange={e=>{if(!allowChange())return;setDemo(e.target.checked);setSelected(null);setNewKind(null);setOffset(0);}}/> Show demonstration records</label>
    <p role="status" aria-live="polite">{busy?"Loading cutters…":error||`Showing ${items.length?offset+1:0}–${offset+items.length} of ${total} catalog entries.`}</p>
    {!busy&&!error&&items.length===0&&<p>No cutters match this search.</p>}
    </div>
    {canEdit&&(!contextual||task==='add')&&<div className="browse-create"><button disabled={locked} onClick={()=>{if(allowChange()){setSelected(null);setNewKind('cutters');}}}>{contextual?'I have a cutter':'New physical cutter'}</button><button disabled={locked} onClick={()=>{if(allowChange()){setSelected(null);setNewKind('shapes');}}}>{contextual?'Save a design for later':'New reference'}</button></div>}
    <p role="status">{savedNotice}</p><MasterDetailWorkspace detailKey={selected?.id??newKind} detail={(selected||newKind)?<>
      {newKind?<section className="cutter-detail" aria-label="New catalog entry"><div className="browse-heading"><h3>{newKind==='cutters'?'Add a cutter':'Save a producer design'}</h3><button onClick={()=>{if(allowChange())setNewKind(null);}}>Close new entry</button></div><EntryEditor guided={contextual} key={'new-'+newKind} kind={newKind} canEdit={canEdit} canDelete={false} onDirty={reportDirty} onSaved={entry=>{setNewKind(null);setSelected(focused(entry));setSavedNotice(entry.photoStatus??'Saved. Viewing the persisted record.');setRefresh(v=>v+1);}} onDeleted={()=>{}}/></section>:selected&&<CutterDetails guided={contextual} key={selected.id} item={selected} canEdit={canEdit} canDelete={canDelete} onDirty={reportDirty} onNavigate={entry=>{setSelected(focused(entry));}} onSaved={entry=>{setSavedNotice(entry.photoStatus??'Saved.');setSelected(focused(entry));setRefresh(v=>v+1);}} onDeleted={()=>{setSelected(null);setRefresh(v=>v+1);}} onClose={()=>{if(!allowChange())return;setSelected(null);requestAnimationFrame(()=>document.getElementById("view-"+selected.id)?.focus());}}/>}
    </>:null}>
    {!busy&&(!contextual||task!=='add')&&<div className="cutter-grid">{items.filter(item=>item.id!==selected?.id).map(item=><CutterCard key={item.id} item={item} onOpen={()=>{if(selected?.id===item.id&&!newKind)return;if(allowChange()){setNewKind(null);setSelected(item);}}}/>)}</div>}
    </MasterDetailWorkspace>
    <div hidden={contextual&&task==='add'}><nav aria-label="Catalog pages" className="browse-pages"><button disabled={busy||offset===0} onClick={()=>{if(allowChange()){setSelected(null);setNewKind(null);setOffset(Math.max(0,offset-24));}}}>Previous page</button><button disabled={busy||next===null} onClick={()=>{if(next!==null&&allowChange()){setSelected(null);setNewKind(null);setOffset(next);}}}>Next page</button></nav>
    <p className="browse-note">Images and recorded sizes are reference information. An image alone does not verify dimensions or scale.</p>
    </div></div>
  </section>;
}

function ImageWindowLink({id,filename,children}:{id:string;filename:string;children:React.ReactNode}) {
 const url="/api/attachments/"+encodeURIComponent(id)+"?view=window";
 return <a className="image-window-link" href={url} target="_blank" rel="noopener noreferrer" aria-label={"Open "+filename+" in a read-only image window"} onClick={event=>{
  if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  window.open(url,"_blank","popup=yes,width=500,height=500,noopener,noreferrer");
 }}>{children}</a>;
}

function CutterDetails({guided=false,item,onClose,canEdit,canDelete,onDirty,onSaved,onDeleted,onNavigate}:{guided?:boolean;item:BrowseItem;onNavigate:(entry:any)=>void;onClose:()=>void;canEdit:boolean;canDelete:boolean;onDirty:(dirty:boolean,busy?:boolean)=>void;onSaved:(entry:any)=>void;onDeleted:()=>void}) {
  const panel=useRef<HTMLElement>(null);
  const [adding,setAdding]=useState(false),[photoDirty,setPhotoDirty]=useState(false),[photoBusy,setPhotoBusy]=useState(false),[entryDirty,setEntryDirty]=useState(false),[entryBusy,setEntryBusy]=useState(false);
  const reportEntry=useCallback((dirty:boolean,busy=false)=>{setEntryDirty(dirty);setEntryBusy(busy);},[]);
  useEffect(()=>{onDirty(entryDirty||photoDirty,entryBusy||photoBusy);},[entryDirty,entryBusy,photoDirty,photoBusy,onDirty]);
  useEffect(()=>()=>onDirty(false,false),[onDirty]);
  const reportPhoto=useCallback((dirty:boolean,busy:boolean)=>{setPhotoDirty(dirty);setPhotoBusy(busy);},[]);
  useEffect(()=>{panel.current?.focus();},[]);
  const [inventoryKnown,setInventoryKnown]=useState(false),[photoVersion,setPhotoVersion]=useState(0),[inventory,setInventory]=useState<any[]>([]);
  const navigate=async(kind:string,id:string)=>{if(entryBusy||photoBusy||(entryDirty||photoDirty)&&!window.confirm('Discard unsaved changes before navigating?'))return;try{const r=await fetch('/api/workspace/'+kind+'/'+encodeURIComponent(id));if(!r.ok)throw Error('Could not open the linked record.');onNavigate(await r.json());}catch(e){setStatus((e as Error).message);}};
  useEffect(()=>{let active=true;setInventoryKnown(false);fetch('/api/workspace/shapes/'+encodeURIComponent(item.shape_id)+'/inventory').then(async r=>{if(!r.ok)throw Error();return r.json() as Promise<any>;}).then(body=>{if(active){setInventory(body.items??[]);setInventoryKnown(true);}}).catch(()=>{if(active)setStatus('Linked inventory could not load. Close and reopen to retry.');});return()=>{active=false;};},[item.shape_id,photoVersion]);
  const [files,setFiles]=useState<{id:string;filename:string;mediaType:string;available:boolean;physical?:boolean}[]>([]),[status,setStatus]=useState("Loading files…");
  useEffect(()=>{
   let active=true;
   const read=async(kind:string,id:string)=>{
    const response=await fetch('/api/attachments?kind='+kind+'&recordId='+encodeURIComponent(id),{cache:'no-store'});
    if(!response.ok)throw Error('Files could not load.');
    return response.json() as Promise<{attachments:typeof files;migrationRequired?:boolean}>;
   };
   Promise.all([read('shape',item.shape_id),...(item.record_kind==='physical'?[read('cutter',item.id)]:[])]).then(bodies=>{
    if(!active)return;
    const attachments=bodies.flatMap((body,index)=>(body.attachments??[]).map(file=>({...file,physical:index===1})));
    setFiles(attachments);
    setStatus(bodies.some(body=>body.migrationRequired)?'Cutter photograph uploads are not enabled in this development catalog yet. Existing design images and files remain available.':attachments.length?'':'No files attached.');
   }).catch(()=>{if(active)setStatus('Files could not load. Close and reopen this cutter to retry.');});
   return()=>{active=false;};
  },[item.shape_id,item.id,photoVersion]);
  return <section ref={panel} tabIndex={-1} className="cutter-detail" aria-label={"Viewing "+item.name}><div className="browse-heading"><h3>{item.name}</h3><button onClick={onClose}>Close cutter details</button></div>
    <p className="ownership-status">{ownershipLabel({...item,...(inventoryKnown?{inventory_count:inventory.length}:{})})}</p><details className="record-section" open><summary>Photographs and digital files</summary><p role="status">{status}</p><div className="detail-images">{files.map(file=><figure key={(file.physical?'physical-':'reference-')+file.id}>{file.available&&["image/png","image/jpeg","image/webp"].includes(file.mediaType)&&<ImageWindowLink id={file.id} filename={file.filename}><img src={"/api/attachments/"+encodeURIComponent(file.id)+"?view=image"} alt={file.filename} loading="lazy"/></ImageWindowLink>}<figcaption><strong>{file.physical?"Physical cutter photograph":"Reference photograph / digital file"}</strong> · {file.filename} · {file.available&&["image/png","image/jpeg","image/webp"].includes(file.mediaType)&&<><ImageWindowLink id={file.id} filename={file.filename}>Open image</ImageWindowLink>{" · "}</>}{file.available?<a href={"/api/attachments/"+encodeURIComponent(file.id)}>Download original</a>:"Original unavailable"}</figcaption></figure>)}</div>
    </details>
    {item.record_kind==='reference'&&<p>Assigned BIN: {item.location??item.source_bin??'Not recorded'}. Location is independent of physical/digital status.</p>}
    {canEdit&&!adding&&<><button disabled={entryBusy||photoBusy} onClick={()=>{if(!(entryDirty||photoDirty)||window.confirm('Discard unsaved reference changes before adding a physical cutter?')){setPhotoDirty(false);setAdding(true);}}}>Add to Inventory</button><span className="browse-note"> Add another size or copy using this design.</span></>}
    <p>Producer design: {item.name}{item.maker?' — '+item.maker:''}. Reference images normally show finished cookies; physical photographs show this inventory record.</p>
    {item.record_kind==='physical'&&<button disabled={entryBusy||photoBusy} onClick={()=>navigate('shapes',item.shape_id)}>View producer design</button>}
    {inventory.length>0&&<nav aria-label="Associated inventory">{inventory.map(row=><button key={row.id} disabled={entryBusy||photoBusy} onClick={()=>navigate('cutters',row.id)}>View inventory · {row.reference_size_mm?row.reference_size_mm+' mm':'size not recorded'} · quantity {row.quantity}{row.slot?' · '+row.slot:''}</button>)}</nav>}
    {!adding&&<RecordPhotos kind={item.record_kind==='physical'?'cutter':'shape'} id={item.record_kind==='physical'?item.id:item.shape_id} canEdit={canEdit} onDirty={reportPhoto} onChanged={()=>setPhotoVersion(v=>v+1)}/>}
    {adding&&<p>Adding physical inventory for this reference. Its design and images are reused. Nothing is created until Save.</p>}
    <EntryEditor guided={guided} key={adding?'add-physical':'entry'} initialShapeId={adding?item.shape_id:undefined} onCancel={adding?()=>setAdding(false):undefined} kind={adding?'cutters':item.record_kind==='reference'?'shapes':'cutters'} id={adding?undefined:item.record_kind==='reference'?item.shape_id:item.id} canEdit={canEdit} canDelete={!adding&&canDelete} onDirty={reportEntry} onSaved={entry=>{setAdding(false);onSaved(entry);}} onDeleted={onDeleted}/>
    {item.source_reason&&<p>{item.source_reason}</p>}
    {item.source_url&&/^https?:/.test(item.source_url)&&<p><a href={item.source_url} target="_blank" rel="noreferrer">Open recorded source link</a></p>}

    <p>Reference photographs and digital files are shared across inventory. Physical photographs belong only to the selected inventory record. Reference artwork and decorated examples do not verify the physical cutter or its size.</p>
  </section>;
}
