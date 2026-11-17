import {ImageThumbnails,type GalleryFile} from './ImageGallery';
import React,{useEffect,useState} from 'react';
export interface BrowseItem {id:string;shape_id:string;name:string;maker?:string;inventory_count?:number;inventory?:{id:string;name:string;location:string|null;quantity:number}[];inventory_truncated?:boolean;add_cutter?:boolean;images?:{id:string;filename:string}[];image_id:string|null;image_name:string|null;review_state?:string|null;source_url?:string|null;source_reason?:string|null;focus_cutter_id?:string;record_kind?:'physical'|'reference';quantity?:number|null;source_bin?:string|null;location?:string|null;width_mm?:number|null;height_mm?:number|null;reference_size_mm?:number|null;slot?:string|null}
export function ownershipLabel(item:BrowseItem){
 if(item.review_state&&!['not_printed','not_owned'].includes(item.review_state))return 'Inventory needs review';
 const count=item.inventory_count??(item.record_kind==='physical'?1:undefined);
 return count===undefined?'Inventory status needs review':count>0?'In my collection':'Saved design';
}
export function CutterCard({item,onOpen,action='View',disabled=false,carousel=true,catalogMode=false,onCutterOpen,onAdd,referenceDetails}:{referenceDetails?:React.ReactNode;catalogMode?:boolean;onCutterOpen?:(id:string)=>void;onAdd?:()=>void;item:BrowseItem;onOpen?:()=>void;action?:string;disabled?:boolean;carousel?:boolean}){
 const [photos,setPhotos]=useState<GalleryFile[]>([]),[photoStatus,setPhotoStatus]=useState('');
 useEffect(()=>{if(!catalogMode)return;let active=true;setPhotos([]);setPhotoStatus('Loading photographs…');
  void(async()=>{let offset=0;const all:GalleryFile[]=[];try{while(active){const r=await fetch('/api/attachments?kind=shape&recordId='+encodeURIComponent(item.shape_id)+'&catalogPhotos=true&offset='+offset,{cache:'no-store'});if(!r.ok)throw Error();const body=await r.json() as any;if(!Array.isArray(body.attachments))throw Error();if(!active)return;all.push(...body.attachments);setPhotos([...new Map(all.map(f=>[f.id,f])).values()]);if(body.nextOffset==null){setPhotoStatus('');return;}if(!Number.isSafeInteger(body.nextOffset)||body.nextOffset<=offset||body.nextOffset>100000)throw Error();offset=body.nextOffset;}}catch{if(active)setPhotoStatus('Photographs could not all load. Refresh to retry.');}})();
  return()=>{active=false;};
 },[catalogMode,item.shape_id,item.images?.map(x=>x.id).join(',')]);

 const images=item.images??(item.image_id?[{id:item.image_id,filename:item.image_name??item.name}]:[]);
 const [index,setIndex]=useState(0),[failed,setFailed]=useState(false),current=images[Math.min(index,Math.max(0,images.length-1))];
 useEffect(()=>{setFailed(false);},[current?.id]);
 if(catalogMode)return <article className="cutter-card design-card catalog-result-card" aria-label={item.name+(item.maker?' — '+item.maker:'')}>
  <div className="cutter-image representative-image"><a id={'view-'+item.shape_id} aria-label={'Open design details for '+item.name+(item.maker?' — '+item.maker:'')} href={'/?design='+encodeURIComponent(item.shape_id)} onClick={e=>{if(!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey){e.preventDefault();if(!disabled)onOpen?.();}}}>{images[0]&&!failed?<img loading="lazy" src={'/api/attachments/'+encodeURIComponent(images[0].id)+'?view=image'} alt={item.name+' — design image'} onError={()=>setFailed(true)}/>:<span>{failed?'Image unavailable':'No design image'}</span>}</a></div>
  <div className="cutter-card-body design-information">{referenceDetails??<><h3><a aria-label={item.name+(item.maker?' — '+item.maker:'')} id={'view-'+item.shape_id} href={'/?design='+encodeURIComponent(item.shape_id)} onClick={e=>{if(!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey){e.preventDefault();if(!disabled)onOpen?.();}}}>{item.name}</a></h3><p>Producer: {item.maker||'Not recorded'}</p></>}</div>
  <section className="card-inventory" aria-label={item.name+' physical cutters'}>
   {item.inventory_count===0?(onAdd&&<button disabled={disabled} onClick={onAdd}>Add Cutter</button>):item.inventory?<><table><caption>Cutters in Inventory</caption><thead><tr><th>Cutter</th><th>BIN ID</th></tr></thead><tbody>{item.inventory.map(c=>{const href='/?design='+encodeURIComponent(item.shape_id)+'&cutter='+encodeURIComponent(c.id);const open=(e:React.MouseEvent)=>{if(!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey){e.preventDefault();if(!disabled)onCutterOpen?.(c.id);}};return <tr key={c.id}><td><a href={href} onClick={open}>{c.name}</a><small> · quantity {c.quantity}</small></td><td><a className="bin-link" href={href} onClick={open}>{c.location||'BIN not recorded'}</a></td></tr>;})}</tbody></table>{item.inventory_truncated&&<p>Showing 200 records. Open design details to review inventory.</p>}</>:<p>Inventory details unavailable. Open the design to check.</p>}
  </section>
  <section className="card-photographs" aria-label={item.name+' photographs'}><h4>Photographs</h4><p role="status">{photoStatus}</p><ImageThumbnails files={photos} label="Design and cutter photographs"/></section>
 </article>;
 return <article className="cutter-card design-card" onClick={disabled?undefined:onOpen}>
  <div className="cutter-image">{current&&!failed?<img loading="lazy" src={'/api/attachments/'+encodeURIComponent(current.id)+'?view=image'} alt={item.name+' — image '+(index+1)+' of '+images.length} onError={()=>setFailed(true)}/>:<span>{failed?'Image unavailable':'No image yet'}</span>}</div>
  <div className="cutter-card-body"><h3>{item.name}</h3><p>{item.maker||'Producer not recorded'}</p><p className="ownership-status">{ownershipLabel(item)}</p>
   {carousel&&images.length>1&&<nav className="card-image-navigation" aria-label={item.name+' images'} onClick={e=>e.stopPropagation()}><button aria-label={'Previous image for '+item.name} onClick={()=>setIndex(i=>(i+images.length-1)%images.length)}>‹</button><span role="status" aria-live="polite">{index+1} / {images.length}</span><button aria-label={'Next image for '+item.name} onClick={()=>setIndex(i=>(i+1)%images.length)}>›</button></nav>}
   {onOpen&&<button id={'view-'+item.shape_id} className="view-cutter" disabled={disabled} onClick={e=>{e.stopPropagation();onOpen();}}>{action} {item.name}{item.maker?' — '+item.maker:''}</button>}
  </div>
 </article>;
}
