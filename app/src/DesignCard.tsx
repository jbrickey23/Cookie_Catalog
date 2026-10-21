import React,{useEffect,useState} from 'react';
export interface BrowseItem {id:string;shape_id:string;name:string;maker?:string;inventory_count?:number;images?:{id:string;filename:string}[];image_id:string|null;image_name:string|null;review_state?:string|null;source_url?:string|null;source_reason?:string|null;focus_cutter_id?:string;record_kind?:'physical'|'reference';quantity?:number|null;source_bin?:string|null;location?:string|null;width_mm?:number|null;height_mm?:number|null;reference_size_mm?:number|null;slot?:string|null}
export function ownershipLabel(item:BrowseItem){
 if(item.review_state&&!['not_printed','not_owned'].includes(item.review_state))return 'Inventory needs review';
 const count=item.inventory_count??(item.record_kind==='physical'?1:undefined);
 return count===undefined?'Inventory status needs review':count>0?'In my collection':'Saved design';
}
export function CutterCard({item,onOpen,action='View',disabled=false,carousel=true}:{item:BrowseItem;onOpen?:()=>void;action?:string;disabled?:boolean;carousel?:boolean}){
 const images=item.images??(item.image_id?[{id:item.image_id,filename:item.image_name??item.name}]:[]);
 const [index,setIndex]=useState(0),[failed,setFailed]=useState(false),current=images[Math.min(index,Math.max(0,images.length-1))];
 useEffect(()=>{setFailed(false);},[current?.id]);
 return <article className="cutter-card design-card" onClick={disabled?undefined:onOpen}>
  <div className="cutter-image">{current&&!failed?<img loading="lazy" src={'/api/attachments/'+encodeURIComponent(current.id)+'?view=image'} alt={item.name+' — image '+(index+1)+' of '+images.length} onError={()=>setFailed(true)}/>:<span>{failed?'Image unavailable':'No image yet'}</span>}</div>
  <div className="cutter-card-body"><h3>{item.name}</h3><p>{item.maker||'Producer not recorded'}</p><p className="ownership-status">{ownershipLabel(item)}</p>
   {carousel&&images.length>1&&<nav className="card-image-navigation" aria-label={item.name+' images'} onClick={e=>e.stopPropagation()}><button aria-label={'Previous image for '+item.name} onClick={()=>setIndex(i=>(i+images.length-1)%images.length)}>‹</button><span role="status" aria-live="polite">{index+1} / {images.length}</span><button aria-label={'Next image for '+item.name} onClick={()=>setIndex(i=>(i+1)%images.length)}>›</button></nav>}
   {onOpen&&<button id={'view-'+item.shape_id} className="view-cutter" disabled={disabled} onClick={e=>{e.stopPropagation();onOpen();}}>{action} {item.name}{item.maker?' — '+item.maker:''}</button>}
  </div>
 </article>;
}
