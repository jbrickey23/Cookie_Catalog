import React,{useEffect,useState} from "react";
import type {ReviewItem,ReviewCheck} from "./readiness";
type QueueItem=ReviewItem & {checks:ReviewCheck[];openCount:number};
const stateLabels={unknown:"Missing / unknown",needs_verification:"Needs verification",not_applicable:"Not applicable",complete:"Complete"};
export function Readiness() {
  const [kind,setKind]=useState("physical_cutter"),[items,setItems]=useState<QueueItem[]>([]),[next,setNext]=useState<number|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
  async function load(type:string,offset=0) {
    setBusy(true);setMessage("Loading review queue…");setItems([]);setNext(null);
    try {
      const response=await fetch("/api/readiness?kind="+type+"&offset="+offset,{cache:"no-store"});
      const body=await response.json() as {items:QueueItem[];nextOffset:number|null;error?:string};
      if(!response.ok)throw Error(body.error??"Review queue unavailable.");
      setItems(body.items);setNext(body.nextOffset);setMessage(body.items.length?"Review the missing details below.":"No items of this type on this page.");
    }catch(error){setMessage((error as Error).message);}finally{setBusy(false);}
  }
  useEffect(()=>{void load(kind);},[kind]);
  return <section aria-labelledby="readiness-heading">
    <h2 id="readiness-heading">Catalog review queue</h2>
    <p>See what needs collecting next. Existing values and linked files still need human verification. This queue does not change your records.</p>
    <label>Review item type <select value={kind} disabled={busy} onChange={e=>setKind(e.target.value)}>
      <option value="physical_cutter">Physical cutters</option><option value="printable_asset">Printable files</option><option value="design">Decorating designs</option><option value="unclassified">Shapes with no physical cutter or printable file recorded</option>
    </select></label>{" "}<button disabled={busy} onClick={()=>load(kind)}>Refresh review queue</button>
    <p role="status" aria-live="polite">{message}</p>
    <ul>{items.map(item=><li key={item.id} style={{margin:"1rem 0"}}><details><summary>{item.name} — {item.openCount} details to review</summary>
      <ul>{item.checks.map(check=><li key={check.field}><strong>{check.label}: {stateLabels[check.state]}</strong><p>{check.action}</p></li>)}</ul>
    </details></li>)}</ul>
    {next!==null&&<button disabled={busy} onClick={()=>load(kind,next)}>Next review page</button>}
    <p>Photo checks inspect catalog links, not original-file availability or photo content. Scale-reference evidence and completion decisions are not saved in the live catalog yet. Physical storage is not requested for file-only entries.</p>
  </section>;
}
