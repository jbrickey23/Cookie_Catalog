import {buildInformation} from './server/build-information';
import {releaseSession,pendingReleaseWrites,type ReleaseView} from './release-client';
import React,{createContext,useContext,useEffect,useState} from 'react';
const ReleaseEditingPaused=createContext(false);
export const useReleaseEditingPaused=()=>useContext(ReleaseEditingPaused);
export function ReleaseNotice({children}:{children:React.ReactNode}){
 const [view,setView]=useState<ReleaseView|null>(null),[unknown,setUnknown]=useState(true),[stale,setStale]=useState(false),[clock,setClock]=useState(Date.now());
 useEffect(()=>{
  let mounted=true,running=false,dirty=false;
  const changed=()=>{dirty=true;};document.addEventListener('input',changed,true);document.addEventListener('change',changed,true);
  const controller=new AbortController();
  async function refresh(){
   if(running)return;running=true;
   try{
    const response=await fetch('/api/release-maintenance',{cache:'no-store',signal:controller.signal});if(!response.ok)throw Error();
    const status=await response.json() as ReleaseView;releaseSession.observe(status);
    const changedVersion=releaseSession.changed||!!buildInformation().commit&&status.build!==buildInformation().commit;
    if(changedVersion&&!status.active&&!dirty&&!pendingReleaseWrites&&!releaseSession.hasUncertainWrite){window.location.reload();return;}
    if(mounted){setView(status);setStale(changedVersion||releaseSession.hasUncertainWrite);setUnknown(false);}
   }catch{if(mounted)setUnknown(true);}finally{running=false;}
  }
  void refresh();const poll=setInterval(()=>void refresh(),15000),tick=setInterval(()=>setClock(Date.now()),1000);
  return()=>{mounted=false;document.removeEventListener('input',changed,true);document.removeEventListener('change',changed,true);controller.abort();clearInterval(poll);clearInterval(tick);};
 },[]);
 const seconds=view?.notice?Math.max(0,Math.ceil((Date.parse(view.notice.startsAt)-clock)/1000)):null;
 const active=!!view?.active||seconds===0;
 return <ReleaseEditingPaused.Provider value={active||unknown||stale}>
  {seconds!==null&&!active&&<p className="maintenance-notice" role="status">Catalog maintenance starts in {Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}. Please save or finish your edits. Keep unsaved work on this page.</p>}
  {active&&<p className="maintenance-notice" role="status">Catalog update in progress. Editing, saving, uploads and scheduled work are paused. You can browse and keep your draft open; editing resumes after verification.</p>}
  {unknown&&<p className="maintenance-notice" role="status">Update status could not be checked. Keep your draft open while the connection recovers.</p>}
  {stale&&<p className="maintenance-notice" role="alert">The catalog version changed or a save outcome is uncertain. Your work is kept on this page. Copy unsaved text and review saved records before refreshing; do not repeat an uncertain save. <button onClick={()=>{if(window.confirm('Have you copied unsaved work and checked uncertain saves? Refreshing clears this page.'))window.location.reload();}}>Refresh after review</button></p>}
  {!active&&!unknown&&!stale&&view?.outcome&&<p className="maintenance-notice" role="status">{view.outcome==='canceled'?'Catalog maintenance was postponed. Editing is available again.':'Catalog maintenance is complete. Editing is available again.'}</p>}
  {children}
 </ReleaseEditingPaused.Provider>;
}
