import React,{useEffect,useRef,useState} from 'react';
/** Panels stay mounted so changing catalog context preserves drafts. Admin uses a guarded page. */
export function WorkspaceFrame({role,catalog,administration,diagnostics}:{role:string;catalog:React.ReactNode;administration:React.ReactNode;diagnostics:React.ReactNode}) {
 const adminPage=window.location.pathname==='/api/admin',canManage=role!=='viewer',isAdmin=role==='admin';
 const [active,setActive]=useState(adminPage?'administration':'catalog');
 const panel=useRef<HTMLDivElement>(null);
 useEffect(()=>{const show=()=>{if(!canManage)return;window.dispatchEvent(new window.Event('catalog-context-change'));setActive('administration');};window.addEventListener('show-administration',show);return()=>window.removeEventListener('show-administration',show);},[canManage]);
 function select(next:string){window.dispatchEvent(new window.Event('catalog-context-change'));setActive(next);requestAnimationFrame(()=>panel.current?.focus());}
 if(adminPage&&!isAdmin)return <p role="alert">Admin access required.</p>;
 return <>
  <nav className="workspace-nav" aria-label="Workspaces">
   {adminPage?<a href="/">Return to catalog</a>:<button aria-current={active==='catalog'?'page':undefined} onClick={()=>select('catalog')}>Catalog</button>}
   {canManage&&<button aria-current={active==='administration'?'page':undefined} onClick={()=>select('administration')}>{adminPage?'Administration':'Catalog tools'}</button>}
   {adminPage&&isAdmin&&<button aria-current={active==='diagnostics'?'page':undefined} onClick={()=>select('diagnostics')}>Development &amp; Diagnostics</button>}
   {!adminPage&&isAdmin&&<a href="/api/admin">Admin</a>}
  </nav>
  <div ref={panel} tabIndex={-1} className="workspace-content">
   {!adminPage&&<section aria-label="Catalog workspace" hidden={active!=='catalog'}>{catalog}</section>}
   {canManage&&<section aria-label="Administration workspace" hidden={active!=='administration'}>{administration}</section>}
   {adminPage&&isAdmin&&<section aria-label="Development and diagnostics workspace" hidden={active!=='diagnostics'}>{diagnostics}</section>}
  </div>
  {!adminPage&&active!=='catalog'&&<p className="workspace-return">Your catalog task and unsaved input stay in this tab. <button onClick={()=>select('catalog')}>Return to catalog</button></p>}
 </>;
}
