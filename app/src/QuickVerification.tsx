import {recordedLocation} from './source-location';
import React,{useState} from 'react';
import {classify,suggestion,type Classification,type QuickContext} from './quick-classification';
import {validateManifest,type StagingManifest} from './staging.mjs';
type Plan={planSha256:string;ready:number;blocked:number;alreadyLinked:number;rows:{sourceKey:string;status:string;reasons:string[]}[]};
export function QuickVerification({id,title,revision,manifest,disabled,canImport=true,onChange,onComplete,onBusy,onInspect}:{
  id:string;title:string;revision:string;manifest:StagingManifest;disabled:boolean;canImport?:boolean;
  onChange:(m:StagingManifest)=>void;onComplete:(m:StagingManifest,revision:string,message:string)=>void;onBusy:(busy:boolean)=>void;onInspect:(index:number)=>void;
}) {
  const [context,setContext]=useState<QuickContext[]|null>(null),[query,setQuery]=useState(''),[page,setPage]=useState(0),[filter,setFilter]=useState('pending');
  const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[backup,setBackup]=useState(''),[verified,setVerified]=useState(false);
  const headers=(rev=revision)=>({'content-type':'application/json','X-Cookie-Catalog-Check':'import-review','If-Match':rev});
  async function api<T>(url:string,init:RequestInit={}){const r=await fetch(url,{...init,cache:'no-store'}),data=await r.json() as any;if(!r.ok)throw Error(data.error??'Quick verification failed. Your review decisions remain in the draft.');return data as T;}
  const ctx=new Map(context?.map(c=>[c.sourceKey,c]));
  const matching=manifest.items.map((item,index)=>({item,index,c:ctx.get(item.sourceKey)})).filter(({item,c})=>{
    const matches=(item.name+' '+(item.source.sectionPath??'')+' '+(item.source.pageTitle??'')).toLowerCase().includes(query.toLowerCase());
    if(!matches)return false;
    if(filter==='all')return true;
    if(filter==='imported')return !!c?.imported;
    return !c?.imported&&(filter==='confirmed'?!!item.catalog?.sourceClassification:!item.catalog?.sourceClassification);
  });
  const visible=matching.slice(page*24,(page+1)*24);
  const eligible=manifest.items.filter(item=>['physical','both'].includes(item.catalog?.sourceClassification??'')&&!ctx.get(item.sourceKey)?.imported&&!suggestion(item,ctx.get(item.sourceKey)).ambiguous&&!suggestion(item,ctx.get(item.sourceKey)).physicalBlocked);
  function choose(keys:Set<string>,value?:Classification){
    const next=structuredClone(manifest);let count=0;
    for(let i=0;i<next.items.length;i++){
      const item=next.items[i],c=ctx.get(item.sourceKey);if(!keys.has(item.sourceKey)||c?.imported)continue;
      const s=suggestion(item,c),classification=value??s.value;
      if(!classification||s.ambiguous||classification!=='digital'&&s.physicalBlocked)continue;
      next.items[i]=classify(item,classification,c);count++;
    }
    onChange(next);setMessage(`${count} classifications confirmed in this draft. Save decisions or import to keep them.`);
  }
  async function open(){setBusy(true);onBusy(true);try{const data=await api<{items:QuickContext[]}>(`/api/import-reviews/${id}/quick-check`,{headers:headers()});setContext(data.items);setMessage('Suggestions loaded. Nothing is confirmed until you choose or confirm a group.');}catch(e){setMessage((e as Error).message);}finally{setBusy(false);onBusy(false);}}
  async function saveAndImport(importInventory:boolean){
    const selected=eligible.map(i=>({sourceKey:i.sourceKey,action:'create' as const}));
    if(importInventory&&!window.confirm(`Save review decisions and import up to ${selected.length} confirmed individual physical cutters? Digital references create no stock. Ambiguous or duplicate entries stay for review.`))return;
    setBusy(true);onBusy(true);let savedRevision:string|null=null,created=0,skipped=0;const blocked:string[]=[];
    try {
      validateManifest(manifest);
      const saved=await api<{revision:string}>(`/api/import-reviews/${id}`,{method:'PUT',headers:headers(),body:JSON.stringify({id,title,manifest})});savedRevision=saved.revision;
      if(importInventory){
        for(let offset=0;offset<selected.length;offset+=50){
          setMessage(`Importing batch ${Math.floor(offset/50)+1} of ${Math.ceil(selected.length/50)}…`);
          let choices=selected.slice(offset,offset+50);
          const prepare=()=>api<Plan>(`/api/import-reviews/${id}/catalog-plan`,{method:'POST',headers:headers(saved.revision),body:JSON.stringify({choices,ownershipConfirmed:true})});
          let plan=await prepare();skipped+=plan.alreadyLinked;
          for(const row of plan.rows.filter(r=>r.status==='blocked'))blocked.push(`${manifest.items.find(i=>i.sourceKey===row.sourceKey)?.name??row.sourceKey}: ${row.reasons.join(' ')}`);
          choices=choices.filter(c=>plan.rows.some(r=>r.sourceKey===c.sourceKey&&r.status==='ready'));
          if(!choices.length)continue;
          // Removing blockers changes the signed selection. Always prepare the exact subset.
          if(choices.length!==plan.rows.length)plan=await prepare();
          if(plan.blocked)throw Error('Inventory changed during planning. Saved decisions are kept; reopen before retrying.');
          const result=await api<{created?:number;alreadyLinked?:number}>(`/api/import-reviews/${id}/apply`,{method:'POST',headers:headers(saved.revision),body:JSON.stringify({choices,ownershipConfirmed:true,planSha256:plan.planSha256,backupReference:backup.trim(),backupConfirmed:verified})});
          created+=result.created??0;skipped+=result.alreadyLinked??0;
        }
      }
      const summary=`Review decisions saved. ${created} physical records imported; ${skipped} already imported entries skipped. ${blocked.length} entries need detailed review.`;
      onComplete(manifest,saved.revision,summary+(blocked.length?' '+blocked.join(' | '):''));
    }catch(e){const summary=`${(e as Error).message} ${created} physical records completed before stopping. Retry skips completed source mappings.`;if(savedRevision)onComplete(manifest,savedRevision,summary);else setMessage(summary);}
    finally{setBusy(false);onBusy(false);}
  }
  return <section className="quick-verification" aria-labelledby="quick-heading">
    <h3 id="quick-heading">Quick verification</h3>
    <p>Physical = an owned cutter. Digital = a source reference to a printable design. Both = both. A digital reference does not mean an original STL/3MF is stored.</p>
    {!context?<button disabled={disabled||busy} onClick={()=>void open()}>Open quick verification</button>:<>
      <fieldset disabled={disabled||busy}><legend>Confirm your collection</legend>
        <div className="quick-filters"><label>Find source entries <input type="search" maxLength={120} value={query} onChange={e=>{setQuery(e.target.value);setPage(0);}} placeholder="Name or bin"/></label><label>Review entries <select value={filter} onChange={e=>{setFilter(e.target.value);setPage(0);}}><option value="pending">Needs confirmation</option><option value="confirmed">Confirmed</option><option value="imported">Already imported</option><option value="all">All source entries</option></select></label></div>
        <p>{matching.length} matching entries. {eligible.length} confirmed physical candidates across this review.</p>
        <button onClick={()=>choose(new Set(matching.filter(({item,c})=>!item.catalog?.sourceClassification&&!c?.imported).map(({item})=>item.sourceKey)))}>Confirm safe suggestions in this group</button>
        <label>Set filtered group classification <select value="" onChange={e=>{if(e.target.value)choose(new Set(matching.filter(({c})=>!c?.imported).map(({item})=>item.sourceKey)),e.target.value as Classification);}}><option value="">Choose a group classification…</option><option value="physical">Physical</option><option value="digital">Digital</option><option value="both">Both</option></select></label>
        <p>Group confirmation applies to all matching unconfirmed entries, including other pages. Sets, variants, duplicates and unknown suggestions stay for review.</p>
        <div className="quick-list">{visible.map(({item,index,c})=>{const s=suggestion(item,c);return <article key={item.sourceKey} className="quick-row">
          {c?.imageId?<img loading="lazy" src={'/api/attachments/'+encodeURIComponent(c.imageId)+'?view=image'} alt={item.name+' — source image'}/>:<div className="quick-no-image">No image</div>}
          <div><strong>{item.name}</strong><p>Bin/location: {recordedLocation(item)??"Not recorded"} · {item.source.pageTitle??item.source.pageId}</p><p>{c?.imported?'Already imported — inventory is preserved.':s.reason}</p>
          {!c?.imported&&<label>Classification for {item.name} <select value={item.catalog?.sourceClassification??''} disabled={s.ambiguous} onChange={e=>{
            if(e.target.value)choose(new Set([item.sourceKey]),e.target.value as Classification);
            else{const next=structuredClone(manifest);delete next.items[index].catalog?.sourceClassification;onChange(next);}
          }}><option value="">{s.value?'Suggested: '+({physical:'Physical',digital:'Digital',both:'Both'}[s.value]):'Leave for later'}</option><option value="physical" disabled={s.physicalBlocked}>Physical</option><option value="digital">Digital</option><option value="both" disabled={s.physicalBlocked}>Both</option></select></label>}
          <button onClick={()=>onInspect(index)}>Review details for {item.name}</button>
          <details><summary>Source evidence</summary><pre className="quick-evidence">{c?.evidence||item.facts?.source||item.source.pageTitle||item.source.pageId}</pre></details></div>
        </article>;})}</div>
        <p><button disabled={page===0} onClick={()=>setPage(p=>p-1)}>Previous review page</button> Page {page+1} <button disabled={(page+1)*24>=matching.length} onClick={()=>setPage(p=>p+1)}>Next review page</button></p>
        {canImport&&<><p><label>Verified protected backup reference <input maxLength={500} value={backup} onChange={e=>{setBackup(e.target.value);setVerified(false);}} placeholder="Pre-change backup filename or receipt"/></label></p>
        <p><label><input type="checkbox" checked={verified} onChange={e=>setVerified(e.target.checked)}/> I saved and verified a protected pre-change backup for this import.</label></p></>}
        <button onClick={()=>void saveAndImport(false)}>Save checklist decisions</button>{' '}{canImport&&<button disabled={!eligible.length||!backup.trim()||!verified} onClick={()=>void saveAndImport(true)}>Save decisions and import confirmed cutters</button>}
        {!canImport&&<p>An owner/admin applies inventory imports. You can save checklist decisions for review.</p>}
        <p>Imports run in batches of at most 50. Existing shapes and photos are reused. OneNote bins are accepted as location assignments, independently of Physical/Digital. Missing measurements stay in the collection queue. Digital-only choices save review decisions without creating physical stock or uploading originals.</p>
      </fieldset>
    </>}
    <p role="status" aria-live="polite">{message}</p>
  </section>;
}
