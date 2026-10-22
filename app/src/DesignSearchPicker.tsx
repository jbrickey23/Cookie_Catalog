import React,{useEffect,useState} from 'react';
import {CutterCard,type BrowseItem} from './DesignCard';

// The same bounded producer-design query and visual card as ordinary Search;
// only the action differs: select a design for Add, never open its details.
export function DesignSearchPicker({disabled,label,onSelect}:{disabled:boolean;label:string;onSelect:(id:string,item:BrowseItem)=>void}){
 const [query,setQuery]=useState(''),[offset,setOffset]=useState(0),[items,setItems]=useState<BrowseItem[]>([]),[next,setNext]=useState<number|null>(null),[total,setTotal]=useState(0),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{
  let active=true;setItems([]);setNext(null);setError('');
  if(!query.trim()){setBusy(false);setTotal(0);return;}
  setBusy(true);
  fetch(`/api/browse?q=${encodeURIComponent(query.trim())}&offset=${offset}&demo=false&ownership=all`,{cache:'no-store'}).then(async r=>{
   const b=await r.json() as any;
   if(!r.ok)throw Error(b.error??'Designs could not load. Change the search and retry.');
   if(!Array.isArray(b.items)||typeof b.total!=='number')throw Error('The catalog response was incomplete. Change the search and retry.');
   return b as {items:BrowseItem[];total:number;nextOffset:number|null};
  }).then(b=>{if(active){setItems(b.items);setTotal(b.total);setNext(b.nextOffset);}}).catch(e=>{if(active)setError(e instanceof Error&&!(e instanceof TypeError)?e.message:'Designs could not load. Change the search and retry.');}).finally(()=>{if(active)setBusy(false);});
  return()=>{active=false;};
 },[query,offset]);
 return <section aria-label="Choose an existing design">
  <label htmlFor="shape-search">{label}</label><div className="design-picker-search"><input id="shape-search" type="search" maxLength={120} value={query} disabled={disabled} onChange={e=>{setQuery(e.target.value);setOffset(0);}} placeholder="Search by design name, producer or tag" aria-describedby="design-picker-help"/><button disabled={disabled||!query} onClick={()=>{setQuery('');setOffset(0);document.getElementById('shape-search')?.focus();}}>Reset search</button></div>
  <p id="design-picker-help">Choose Use this design to add your cutter to it. Shared design details stay unchanged.</p>
  {query.trim()&&<><p role="status" aria-live="polite">{busy?'Finding designs…':error||(!items.length?'No designs match this search.':`Showing ${offset+1}–${offset+items.length} of ${total} designs.`)}</p><div className="cutter-grid">{items.map(item=><CutterCard key={item.shape_id} item={item} action="Use this design:" carousel={false} disabled={disabled||busy} onOpen={()=>onSelect(item.shape_id,item)}/>)}</div><nav aria-label="Design selection pages"><button disabled={disabled||busy||!offset} onClick={()=>setOffset(Math.max(0,offset-24))}>Previous designs</button><button disabled={disabled||busy||next===null} onClick={()=>{if(next!==null)setOffset(next);}}>Next designs</button></nav></>}
 </section>;
}
