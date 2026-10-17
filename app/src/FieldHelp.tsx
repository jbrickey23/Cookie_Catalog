import React,{createContext,useContext,useId,useState} from 'react';
import {helpForField,type FieldHelpEntry} from './field-help';
export const FieldHelpContext=createContext<{active:FieldHelpEntry|null;show:(help:FieldHelpEntry|null)=>void}|null>(null);
export function FieldHelp({field,children}:{field:string;children:React.ReactNode}){
 const help=helpForField(field),[open,setOpen]=useState(false),tip=useId(),rail=useContext(FieldHelpContext);
 if(!help)return <span className="field-help-label">{children}</span>;
 const href='/api/help/fields#'+help.id,show=()=>{if(rail)rail.show(help);else setOpen(true);};
 return <span className="field-help-label" data-quick-help={help.quickHelp} onMouseEnter={show} onMouseLeave={event=>{if(!rail&&!event.currentTarget.contains(document.activeElement))setOpen(false);}} onFocus={show} onBlur={event=>{if(!rail&&!event.currentTarget.contains(event.relatedTarget as Node|null))setOpen(false);}} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();setOpen(false);rail?.show(null);}}}>
  {children}<a className="field-help-trigger" href={href} target="_blank" rel="noopener noreferrer" aria-label={'Help for '+field} aria-describedby={rail?.active?.id===help.id?'field-help-rail-note':open?tip:undefined}>?</a>
  {!rail&&open&&<span id={tip} className="field-help-popover" role="note" aria-label={field+' quick help'}>{help.quickHelp==='Ready'?<><span>{help.brief}</span><span><strong>Example:</strong> {help.example}</span></>:<span>Help for this field is being prepared.</span>}<a href={href} target="_blank" rel="noopener noreferrer">Full documentation</a></span>}
 </span>;
}
