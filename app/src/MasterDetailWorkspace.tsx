import React,{useEffect,useState} from 'react';
import {FieldHelpContext} from './FieldHelp';
/** Keep the results subtree mounted so selecting another record preserves its scroll. */
export function MasterDetailWorkspace({detail,detailKey,children}:{detail:React.ReactNode;detailKey?:string|null;children:React.ReactNode}){
 const [help,setHelp]=useState<string|null>(null),expanded=!!detail;
 useEffect(()=>{setHelp(null);},[detailKey,expanded]);
 return <FieldHelpContext.Provider value={{active:help,show:setHelp}}><div className={expanded?'browse-workspace expanded':'browse-workspace'}>
  {expanded&&<div className="browse-detail-column">{detail}</div>}<div className="browse-results" aria-label="Catalog results">{children}</div>
 </div></FieldHelpContext.Provider>;
}
