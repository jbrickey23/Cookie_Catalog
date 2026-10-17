import React,{useEffect,useState} from 'react';
import {FieldHelpContext} from './FieldHelp';
import type {FieldHelpEntry} from './field-help';
/** Keep the results subtree mounted so selecting another record preserves its scroll. */
export function MasterDetailWorkspace({detail,detailKey,children}:{detail:React.ReactNode;detailKey?:string|null;children:React.ReactNode}){
 const [help,setHelp]=useState<FieldHelpEntry|null>(null),expanded=!!detail;
 useEffect(()=>{setHelp(null);},[detailKey,expanded]);
 return <FieldHelpContext.Provider value={{active:help,show:setHelp}}><div className={expanded?'browse-workspace expanded'+(help?' with-help':''):'browse-workspace'}>
  {expanded&&help&&<aside className="field-help-rail" aria-label="Context help" onKeyDown={event=>{if(event.key==='Escape'){event.stopPropagation();setHelp(null);}}}><div className="field-help-heading"><h3>{help.field}</h3><button type="button" onClick={()=>setHelp(null)}>Close help</button></div><div id="field-help-rail-note" role="note" aria-label={help.field+' quick help'}>{help.quickHelp==='Ready'?<><p>{help.brief}</p><p><strong>Example:</strong> {help.example}</p></>:<p>Help for this field is being prepared.</p>}<a href={'/api/help/fields#'+help.id} target="_blank" rel="noopener noreferrer">Full documentation</a></div></aside>}
  {expanded&&<div className="browse-detail-column">{detail}</div>}<div className="browse-results" aria-label="Catalog results">{children}</div>
 </div></FieldHelpContext.Provider>;
}
