import React,{useState,useEffect} from 'react';
import {requestJson} from './request-json';
type Item={id:string;at:string;method:string;kind:string};
type Preview={id:string;at:string;method:string;kind:string;revision:string;canUndo:boolean;beforeName:string|null;afterName:string|null;reason:string};
async function api(path='',body?:unknown,revision?:string){return requestJson('/api/workspace/recovery'+path,{method:body===undefined?'GET':'POST',cache:'no-store',headers:{'content-type':'application/json','X-Cookie-Catalog-Check':'workspace',...(revision?{'if-match':revision}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})},body===undefined);}
export function RecordRecovery({version,onRestored}:{version:number;onRestored:()=>void}){
 const [open,setOpen]=useState(false),[items,setItems]=useState<Item[]>([]),[preview,setPreview]=useState<Preview|null>(null),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 async function list(){const result=await api();setItems(result.changes);}
 useEffect(()=>{if(open)void list().catch(e=>setMessage(e.message));},[open,version]);
 async function task(action:()=>Promise<void>){setBusy(true);setMessage('');try{await action();}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}
 return <details className="management-panel" onToggle={e=>setOpen(e.currentTarget.open)}><summary>Undo recent record changes</summary>{open&&<>
  <p>Routine edits keep a small recovery copy of the affected entry. Review a change before undoing it. Shared images and originals stay in place. A recovery record can also represent an attempt that did not commit.</p>
  <button disabled={busy} onClick={()=>void task(list)}>Refresh recent changes</button>
  <ul>{items.map(item=><li key={item.id}>{new Date(item.at).toLocaleString()} · {item.method==='DELETE'?'Delete':item.method==='POST'?'Create':item.method==='UNDO'?'Undo':'Edit'} {item.kind==='cutters'?'physical record':'shape'} {' '}<button disabled={busy} onClick={()=>void task(async()=>setPreview(await api('/'+item.id)))}>Review change</button></li>)}</ul>
  {preview&&<div><h3>Review record undo</h3><p>{preview.afterName??preview.beforeName??'Deleted entry'} · {preview.reason}</p>{preview.canUndo&&<button disabled={busy} onClick={()=>void task(async()=>{if(!window.confirm('Undo this record change? The entry must still match its recorded result. Its current values will also be retained for recovery.'))return;await api('/'+preview.id,{approved:true},preview.revision);setPreview(null);setMessage('Record change undone. Its previous values were restored.');onRestored();await list();})}>Undo this change</button>}</div>}
  <p role="status" aria-live="polite">{message}</p>
 </>}</details>;
}
