import React,{useEffect,useRef,useState} from 'react';

/** Keep each workspace mounted: changing context must not discard an editor or interrupt a save. */
export function WorkspaceFrame({role,catalog,administration,diagnostics}:{role:string;catalog:React.ReactNode;administration:React.ReactNode;diagnostics:React.ReactNode}) {
 const [active,setActive]=useState('catalog');
 const panel=useRef<HTMLDivElement>(null);
 useEffect(()=>{const show=()=>{window.dispatchEvent(new window.Event('catalog-context-change'));setActive('administration');};window.addEventListener('show-administration',show);return()=>window.removeEventListener('show-administration',show);},[]);
 function select(next:string){window.dispatchEvent(new window.Event('catalog-context-change'));setActive(next);requestAnimationFrame(()=>panel.current?.focus());}
 return <>
  <nav className="workspace-nav" aria-label="Workspaces">
   <button aria-current={active==='catalog'?'page':undefined} onClick={()=>select('catalog')}>Catalog</button>
   <button aria-current={active==='administration'?'page':undefined} onClick={()=>select('administration')}>Administration</button>
   {role==='owner'&&<button aria-current={active==='diagnostics'?'page':undefined} onClick={()=>select('diagnostics')}>Development &amp; Diagnostics</button>}
  </nav>
  <div ref={panel} tabIndex={-1} className="workspace-content">
   <section aria-label="Catalog workspace" hidden={active!=='catalog'}>{catalog}</section>
   <section aria-label="Administration workspace" hidden={active!=='administration'}>{administration}</section>
   {role==='owner'&&<section aria-label="Development and diagnostics workspace" hidden={active!=='diagnostics'}>{diagnostics}</section>}
  </div>
  {active!=='catalog'&&<p className="workspace-return">Your catalog task and unsaved input stay in this tab. <button onClick={()=>select('catalog')}>Return to catalog</button></p>}
 </>;
}
