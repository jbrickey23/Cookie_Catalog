import {CutterLink} from './InventoryLinks';
import {CutterTable,type CardField} from './CutterTable';
import {readInventory,type InventoryRow} from './inventory';
import {useCatalogHistory,type CatalogView} from './useCatalogHistory';
import React,{useEffect,useState,useRef,useCallback} from 'react';
import {MasterDetailWorkspace} from './MasterDetailWorkspace';
import {RecordPhotos} from './RecordPhotos';
import {EntryEditor} from './EntryEditor';
import {DetailSection} from './DetailSection';
import {CatalogPhotos,isImage,type GalleryFile} from './ImageGallery';
import {CutterCard,ownershipLabel,type BrowseItem} from './DesignCard';
export {CutterCard,ownershipLabel,type BrowseItem} from './DesignCard';
export function Browse({version=0,canEdit=false,canDelete=false,onContextChange,contextual=false}:{version?:number;canEdit?:boolean;canDelete?:boolean;contextual?:boolean;onContextChange?:(context:{recordId?:string;recordName?:string;search?:string})=>void}){
 const [task,setTask]=useState('find'),[savedNotice,setSavedNotice]=useState('');
 const focused=(entry:any):BrowseItem=>({id:entry.shape.id,shape_id:entry.shape.id,name:entry.shape.name,maker:entry.shape.maker,record_kind:'reference',focus_cutter_id:entry.cutter?.id,image_id:null,image_name:null});
 const [dirty,setDirty]=useState(false),[locked,setLocked]=useState(false),[newKind,setNewKind]=useState<'shapes'|'cutters'|null>(null),[selected,setSelected]=useState<BrowseItem|null>(null);
 const reportDirty=useCallback((value:boolean,busy=false)=>{setDirty(value);setLocked(busy);},[]);
 const cardEdits=useRef(new Map<string,{dirty:boolean;busy:boolean}>()),[cardState,setCardState]=useState({dirty:false,busy:false}),[cardEpoch,setCardEpoch]=useState(0);
 const reportCard=useCallback((id:string,dirty:boolean,busy=false)=>{if(dirty||busy)cardEdits.current.set(id,{dirty,busy});else cardEdits.current.delete(id);const next={dirty:[...cardEdits.current.values()].some(x=>x.dirty),busy:[...cardEdits.current.values()].some(x=>x.busy)};setCardState(previous=>previous.dirty===next.dirty&&previous.busy===next.busy?previous:next);},[]);
 const [detailEpoch,setDetailEpoch]=useState(0);
 const allowChange=()=>{if(locked||cardState.busy)return false;if((dirty||cardState.dirty)&&!window.confirm('Discard unsaved changes before leaving this entry?'))return false;if(dirty)setDetailEpoch(v=>v+1);if(cardState.dirty){cardEdits.current.clear();setCardState({dirty:false,busy:false});setCardEpoch(n=>n+1);}return true;};
 function savedCard(entry:any){setItems(previous=>previous.map(item=>item.shape_id===entry.shape.id?{...item,name:entry.shape.name,maker:entry.shape.maker,source_url:entry.shape.source_url,inventory:item.inventory?.map(c=>({...c,name:entry.shape.name}))}:item));setSavedNotice('Design saved. Your results and other drafts are preserved.');}

 const [bin,setBin]=useState<string|null>(()=>new URLSearchParams(window.location.search).get('bin'));
 const [ownership,setOwnership]=useState('all'),[query,setQuery]=useState(''),[search,setSearch]=useState(''),[demo,setDemo]=useState(false),[offset,setOffset]=useState(0);
 const restoreHistory=(view:CatalogView)=>{if(view.bin!==bin||view.search!==search||view.ownership!==ownership||view.demo!==demo||view.offset!==offset)setBusy(true);setBin(view.bin??null);setSelected(view.selected);setNewKind(view.newKind);setTask(view.task);setQuery(view.query);setSearch(view.search);setOwnership(view.ownership);setDemo(view.demo);setOffset(view.offset);};
 const [total,setTotal]=useState(0),[items,setItems]=useState<BrowseItem[]>([]),[next,setNext]=useState<number|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(true),[refresh,setRefresh]=useState(0);
 const returnToResults=useCatalogHistory({bin,selected,newKind,task,query,search,ownership,demo,offset},restoreHistory,allowChange,busy);
 useEffect(()=>{if(bin){setBusy(false);return;}let active=true;setBusy(true);setError('');fetch(`/api/browse?q=${encodeURIComponent(search)}&offset=${offset}&demo=${demo}&ownership=${ownership}`,{cache:'no-store'}).then(async r=>{const b=await r.json() as any;if(!r.ok)throw Error(b.error??'The catalog could not load. Refresh and retry.');if(!Array.isArray(b.items)||typeof b.total!=='number')throw Error('The catalog response was incomplete. Refresh and retry.');return b as {items:BrowseItem[];total:number;nextOffset:number|null};}).then(body=>{if(active){setItems(body.items);setTotal(body.total);setNext(body.nextOffset);setSelected(previous=>previous?{...previous,...body.items.find(i=>i.shape_id===previous.shape_id)}:null);}}).catch(e=>{if(active){setItems([]);setError(e instanceof Error&&!(e instanceof TypeError)?e.message:'The catalog could not load. Refresh and retry.');}}).finally(()=>{if(active)setBusy(false);});return()=>{active=false;};},[search,demo,offset,version,refresh,ownership,bin]);
 useEffect(()=>{const params=new URLSearchParams(window.location.search),design=params.get('design'),cutter=params.get('cutter');if(!design||!/^[a-zA-Z0-9_-]{1,128}$/.test(design)||cutter&&!/^[a-zA-Z0-9_-]{1,128}$/.test(cutter))return;let active=true;fetch('/api/workspace/'+(cutter?'cutters/'+encodeURIComponent(cutter):'shapes/'+encodeURIComponent(design)),{cache:'no-store'}).then(async r=>{if(!r.ok)throw Error();const entry=await r.json() as any;if(entry.shape?.id!==design)throw Error();if(active)setSelected(focused(entry));}).catch(()=>{if(active)setError('The linked catalog entry could not load. Search to find it.');});const cancel=()=>{active=false;};window.addEventListener('popstate',cancel);return()=>{active=false;window.removeEventListener('popstate',cancel);};},[]);
 useEffect(()=>{onContextChange?.({recordId:selected?.shape_id,recordName:selected?.name,search});},[selected?.shape_id,selected?.name,search,onContextChange]);
 function chooseTask(value:string){if(value===task||!allowChange())return;setTask(value);setSelected(null);setNewKind(null);requestAnimationFrame(()=>document.getElementById('browse-title')?.focus());}
 function openBin(value:string){if(!allowChange())return;setSelected(null);setNewKind(null);setQuery('');setSearch('');setOwnership('all');setDemo(false);setOffset(0);setTask('find');setBin(value);}
 function reset(){if(!allowChange())return;setBin(null);setQuery('');setSearch('');setOwnership('all');setDemo(false);setOffset(0);setSelected(null);setNewKind(null);}
 function saved(entry:any){setNewKind(null);setSelected(prev=>prev&&prev.shape_id===entry.shape.id?{...prev,...focused(entry),focus_cutter_id:entry.cutter?.id??prev.focus_cutter_id}:focused(entry));setSavedNotice(entry.photoStatus??'Saved. Viewing the persisted record.');setRefresh(v=>v+1);}
 return <section className={'catalog-browse'+(task==='add'?' task-add':'')} aria-labelledby="browse-title">

  <div className="browse-heading"><div><h2 id="browse-title" tabIndex={-1}>{task==='add'?'Add Something':'Search your catalog'}</h2><p>{task==='add'?'Record a cutter or save a design for later.':'Search, choose a design, then see its images and your cutters.'}</p></div><button disabled={busy||locked} onClick={()=>{if(allowChange()){setRefresh(v=>v+1);setSelected(null);setNewKind(null);}}}>Refresh catalog</button></div>
  <div hidden={task==='add'}><form className="browse-search" onSubmit={e=>{e.preventDefault();if(!allowChange())return;setBin(null);setSelected(null);setNewKind(null);setOffset(0);setSearch(query.trim());}}><label htmlFor="browse-search">Search by name, bin or tag</label><div><input id="browse-search" type="search" maxLength={120} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Try Christmas Tree…" aria-describedby="browse-search-help"/><label className="ownership-filter">Filter <select aria-label="Ownership filter" value={ownership} disabled={locked} onChange={e=>{if(!allowChange())return;setBin(null);setOwnership(e.target.value);setSelected(null);setNewKind(null);setOffset(0);}}><option value="all">All designs</option><option value="owned">In my collection</option><option value="saved">Saved designs</option></select></label><button disabled={locked}>Search</button><button type="button" disabled={locked||(!bin&&!query&&!search&&ownership==='all'&&!demo&&!offset&&!selected&&!newKind)} onClick={reset}>Reset filters</button></div><p id="browse-search-help" className="browse-note">Match all words across names, producers, tags, storage locations and linked decorating ideas. Use quotes for a phrase.</p></form>
   <details className="search-options"><summary>Search options</summary><label><input type="checkbox" checked={demo} onChange={e=>{if(!allowChange())return;setBin(null);setDemo(e.target.checked);setOffset(0);setSelected(null);setNewKind(null);}}/> Show demonstration records</label></details>
   <p hidden={!!bin} role="status" aria-live="polite">{busy?'Loading designs…':error||`Showing ${items.length?offset+1:0}–${offset+items.length} of ${total} designs.`}</p>{!bin&&!busy&&!error&&!items.length&&<p>No designs match this search.</p>}
  </div>
  {canEdit&&(!contextual||task==='add')&&<div className="browse-create"><button disabled={locked} onClick={()=>{if(allowChange()){setSelected(null);setNewKind('cutters');}}}>{contextual?'I have a cutter':'New physical cutter'}</button><button disabled={locked} onClick={()=>{if(allowChange()){setSelected(null);setNewKind('shapes');}}}>{contextual?'Save a design for later':'New reference'}</button></div>}
  <p role="status">{savedNotice}</p><MasterDetailWorkspace detailKey={selected?.shape_id??newKind} detail={newKind?<section className="cutter-detail" aria-label="New catalog entry"><div className="browse-heading"><h3>{newKind==='cutters'?'Add a cutter':'Save a producer design'}</h3><button disabled={locked} onClick={()=>{if(allowChange())setNewKind(null);}}>Close new entry</button></div><EntryEditor guided={contextual} key={'new-'+newKind} kind={newKind} canEdit={canEdit} canDelete={false} onDirty={reportDirty} onSaved={saved} onDeleted={()=>{}}/></section>:selected?<CutterDetails key={selected.shape_id+'-'+detailEpoch} item={selected} guided={contextual} canEdit={canEdit} canDelete={canDelete} version={version} onBin={openBin} onFocusCutter={id=>setSelected(prev=>prev?{...prev,focus_cutter_id:id??undefined,add_cutter:false}:null)} onImagesChanged={()=>setRefresh(v=>v+1)} onDirty={reportDirty} onSaved={saved} onDeleted={()=>{setSelected(null);setRefresh(v=>v+1);}} onClose={returnToResults}/>:null}>
   {bin&&!selected&&!newKind&&<BinResults key={bin+'-'+refresh} bin={bin} open={row=>{if(allowChange())setSelected({id:row.shape_id,shape_id:row.shape_id,name:row.name,image_id:null,image_name:null,focus_cutter_id:row.id});}}/>}
   {!bin&&!busy&&task!=='add'&&<div className="cutter-grid">{items.map(item=><CutterCard key={item.shape_id} item={item} catalogMode onBin={openBin} referenceDetails={<ReferenceCardEditor key={item.shape_id+'-'+cardEpoch} id={item.shape_id} openDesign={()=>{if(allowChange()){setNewKind(null);setSelected(item);}}} canEdit={canEdit&&!selected&&!newKind} report={reportCard} onSaved={savedCard}/>} onCutterOpen={id=>{if(allowChange()){setNewKind(null);setSelected({...item,focus_cutter_id:id});}}} onAdd={canEdit?()=>{if(allowChange()){setNewKind(null);setSelected({...item,add_cutter:true});}}:undefined} onOpen={()=>{if(allowChange()){setNewKind(null);setSelected(item);}}}/>)}</div>}
  </MasterDetailWorkspace>
  <div hidden={task==='add'||!!selected||!!newKind||!!bin}><nav className="browse-pages" aria-label="Catalog pages"><button disabled={busy||locked||!offset} onClick={()=>{if(allowChange()){setSelected(null);setOffset(Math.max(0,offset-24));}}}>Previous page</button><button disabled={busy||locked||next===null} onClick={()=>{if(next!==null&&allowChange()){setSelected(null);setOffset(next);}}}>Next page</button></nav></div>
 </section>;
}

function ReferenceCardEditor({id,canEdit,report,onSaved,openDesign}:{openDesign:()=>void;id:string;canEdit:boolean;report:(id:string,dirty:boolean,busy?:boolean)=>void;onSaved:(entry:any)=>void}){
 const onDirty=useCallback((dirty:boolean,busy=false)=>report(id,dirty,busy),[id,report]);
 return <EntryEditor referenceTable openDesign={openDesign} kind="shapes" id={id} canEdit={canEdit} canDelete={false} onDirty={onDirty} onSaved={onSaved} onDeleted={()=>{}}/>;
}

function BinResults({bin,open}:{bin:string;open:(row:InventoryRow)=>void}){
 const [rows,setRows]=useState<InventoryRow[]>([]),[status,setStatus]=useState('Loading inventory…');
 useEffect(()=>{
  const controller=new AbortController();
  readInventory('inventory?bin='+encodeURIComponent(bin),controller.signal).then(all=>{
   if(!controller.signal.aborted){setRows(all);setStatus(all.length+' cutter records');}
  }).catch(()=>{if(!controller.signal.aborted)setStatus('Inventory could not load. Refresh to retry.');});
  return ()=>controller.abort();
 },[bin]);
 return <section aria-label={'Inventory in '+bin}><h3>Inventory in {bin}</h3><p role="status">{status}</p>
  {rows.length>0&&<table><thead><tr><th>Cutter</th><th>Quantity</th><th>BIN ID</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td><CutterLink shape={row.shape_id} id={row.id} name={row.name} onOpen={()=>open(row)}/></td><td>{row.quantity}</td><td>{row.location}</td></tr>)}</tbody></table>}</section>;
}

type Report=(key:string,dirty:boolean,busy?:boolean)=>void;
function InventoryCard({row,focused,onOpen,onBin,canEdit,canDelete,report,onSaved,onDeleted,onPhoto}:{row:InventoryRow;focused:boolean;onOpen:(id:string)=>void;onBin:(bin:string)=>void;canEdit:boolean;canDelete:boolean;report:Report;onSaved:()=>void;onDeleted:()=>void;onPhoto:()=>void}){
 const [field,setField]=useState<CardField|null>(null),[visited,setVisited]=useState(focused);
 const panel=useRef<HTMLElement>(null);
 const reportEntry=useCallback((d:boolean,b=false)=>report(row.id,d,b),[report,row.id]);
 const reportPhoto=useCallback((d:boolean,b=false)=>report('photo-'+row.id,d,b),[report,row.id]);
 useEffect(()=>{if(focused){setVisited(true);panel.current?.focus();}},[focused]);
 return <article className="inventory-card" ref={panel} tabIndex={-1} aria-label={'Cutter details '+row.id}>
  {field||focused?<EntryEditor kind="cutters" id={row.id} physicalCard={{row,field,onField:setField,onBin,onOpen}} canEdit={canEdit} canDelete={canDelete} onDirty={reportEntry} onCancel={()=>setField(null)} onSaved={()=>{setField(null);onSaved();}} onDeleted={onDeleted}/>
  :<CutterTable row={row} onBin={onBin} onOpen={onOpen} onEdit={canEdit?setField:undefined}/>}
  {(visited||focused)&&<div hidden={!focused}><RecordPhotos kind="cutter" id={row.id} canEdit={canEdit} onDirty={reportPhoto} onChanged={onPhoto}/></div>}
 </article>;
}
function CutterDetails({item,guided,canEdit,canDelete,onDirty,onSaved,onDeleted,onClose,version,onImagesChanged,onBin,onFocusCutter}:{onFocusCutter:(id:string|null)=>void;onBin:(bin:string)=>void;onImagesChanged:()=>void;item:BrowseItem;guided:boolean;canEdit:boolean;canDelete:boolean;version:number;onDirty:(dirty:boolean,busy?:boolean)=>void;onSaved:(entry:any)=>void;onDeleted:()=>void;onClose:()=>void}){
 const focus=item.focus_cutter_id??(item.record_kind==='physical'?item.id:null);
 const [adding,setAdding]=useState(!!item.add_cutter),[revision,setRevision]=useState(0),[photoRevision,setPhotoRevision]=useState(0);
 const edits=useRef(new Map<string,{dirty:boolean;busy:boolean}>());
 const report=useCallback<Report>((key,dirty,busy=false)=>{
  if(dirty||busy)edits.current.set(key,{dirty,busy});else edits.current.delete(key);
  const states=[...edits.current.values()];onDirty(states.some(s=>s.dirty),states.some(s=>s.busy));
 },[onDirty]);
 const designDirty=useCallback((d:boolean,b=false)=>report('design',d,b),[report]);
 const photoDirty=useCallback((d:boolean,b=false)=>report('photo',d,b),[report]);
 const addDirty=useCallback((d:boolean,b=false)=>report('add',d,b),[report]);
 const [inventory,setInventory]=useState<InventoryRow[]>([]),[inventoryStatus,setInventoryStatus]=useState('Loading your cutters…');
 const [physicalPhotos,setPhysicalPhotos]=useState<boolean|null>(null);
 const [files,setFiles]=useState<GalleryFile[]>([]),[fileStatus,setFileStatus]=useState('');
 const panel=useRef<HTMLElement>(null);
 useEffect(()=>{panel.current?.focus();},[]);
 useEffect(()=>{
  const controller=new AbortController();
  readInventory('shapes/'+encodeURIComponent(item.shape_id)+'/inventory',controller.signal).then(rows=>{
   if(!controller.signal.aborted){setInventory(rows);setInventoryStatus(rows.length?'':'No physical cutters recorded for this design.');}
  }).catch(()=>{if(!controller.signal.aborted)setInventoryStatus('Your cutters could not load. Refresh to retry.');});
  return ()=>controller.abort();
 },[item.shape_id,revision,version]);
 useEffect(()=>{
  let active=true;fetch('/api/attachments?kind=shape&recordId='+encodeURIComponent(item.shape_id)+'&ideas=true',{cache:'no-store'}).then(async r=>{if(!r.ok)throw Error();return r.json() as Promise<any>;}).then(b=>{if(active){setFiles(b.attachments??[]);setFileStatus(b.truncated?'Additional linked files may exist beyond the first 200.':'');}}).catch(()=>{if(active)setFileStatus('Linked files could not load.');});return()=>{active=false;};
 },[item.shape_id,photoRevision]);
 function imagesChanged(){setPhotoRevision(v=>v+1);onImagesChanged();}
 function changed(){setRevision(v=>v+1);onImagesChanged();}
 const photos=<section aria-label="Images and decorating ideas"><h4>Photographs</h4><CatalogPhotos id={item.shape_id} label="Design images" onPhysicalSupport={setPhysicalPhotos} revision={photoRevision} extra={files.filter(isImage)}/>
  <RecordPhotos kind="shape" id={item.shape_id} canEdit={canEdit} onDirty={photoDirty} onChanged={imagesChanged}/></section>;
 return <section ref={panel} tabIndex={-1} className="cutter-detail design-details" aria-label={'Viewing '+item.name}>
  <div className="browse-heading"><h3>{item.name}</h3><button onClick={onClose}>Back to results</button></div>
  <div className="design-detail-layout"><section aria-label="Design information">
   <EntryEditor flat referenceTable detailPhotos={photos} kind="shapes" id={item.shape_id} canEdit={canEdit} canDelete={canDelete} onDirty={designDirty} onSaved={onSaved} onDeleted={onDeleted}/>
   <DetailSection title="Files and advanced information"><p role="status">{fileStatus}</p><ul>{files.filter(f=>!isImage(f)).map(f=><li key={f.id}>{f.filename} · {f.available?<a href={'/api/attachments/'+encodeURIComponent(f.id)}>Download original</a>:'Original unavailable'}</li>)}</ul>{item.source_reason&&<p>{item.source_reason}</p>}</DetailSection>
  </section><section aria-label="Associated cutters"><div className="browse-heading"><h4>Cutters in Inventory</h4>{canEdit&&!adding&&<button onClick={()=>setAdding(true)}>{inventory.length?'Add another size or copy':'Add a cutter'}</button>}</div>
  <p role="status">{inventoryStatus}</p>{focus&&physicalPhotos===false&&<p>Cutter photograph uploads are not enabled in this catalog yet.</p>}
  {inventory.map(row=><InventoryCard key={row.id} row={{...row,name:item.name}} focused={row.id===focus} onOpen={onFocusCutter} onBin={onBin} canEdit={canEdit} canDelete={canDelete} report={report} onSaved={changed} onDeleted={()=>{onFocusCutter(null);changed();}} onPhoto={imagesChanged}/>)}
  {adding&&<section aria-label="Add a cutter to this design"><h4>Add a cutter</h4><EntryEditor guided={guided} kind="cutters" initialShapeId={item.shape_id} canEdit={canEdit} canDelete={false} onDirty={addDirty} onCancel={()=>setAdding(false)} onSaved={entry=>{setAdding(false);changed();onSaved(entry);}} onDeleted={()=>{}}/></section>}
  </section></div>
 </section>;
}
