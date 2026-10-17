import React,{createContext,useContext,useEffect,useState} from 'react';
const ReleaseEditingPaused=createContext(false);
export const useReleaseEditingPaused=()=>useContext(ReleaseEditingPaused);
export function ReleaseNotice({children}:{children:React.ReactNode}){
 const [active,setActive]=useState(false),[unknown,setUnknown]=useState(false);
 useEffect(()=>{let mounted=true,running=false;const controller=new AbortController();async function refresh(){if(running)return;running=true;try{const response=await fetch('/api/release-maintenance',{cache:'no-store',signal:controller.signal});if(!response.ok)throw Error();const status=await response.json() as {active:boolean};if(typeof status.active!=='boolean')throw Error();if(mounted){setActive(status.active);setUnknown(false);}}catch{if(mounted)setUnknown(true);}finally{running=false;}}void refresh();const timer=setInterval(()=>void refresh(),15000);return()=>{mounted=false;controller.abort();clearInterval(timer);};},[]);
 return <ReleaseEditingPaused.Provider value={active||unknown}>{active&&<p className="maintenance-notice" role="status">Catalog update in progress. Saving, uploads and other changes are paused. You can browse and keep your draft open; editing resumes after verification.</p>}{unknown&&<p className="maintenance-notice" role="status">Update status could not be checked. Keep your draft open while the connection recovers.</p>}{children}</ReleaseEditingPaused.Provider>;
}
