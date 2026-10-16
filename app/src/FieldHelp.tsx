import React,{useId,useState} from 'react';
import {helpForField} from './field-help';
export function FieldHelp({field,children}:{field:string;children:React.ReactNode}){
 const help=helpForField(field),[open,setOpen]=useState(false),tip=useId();
 if(!help)return <span className="field-help-label">{children}</span>;
 const href='/api/help/fields#'+help.id;
 return <span className="field-help-label" data-quick-help={help.quickHelp} onMouseEnter={()=>setOpen(true)} onMouseLeave={event=>{if(!event.currentTarget.contains(document.activeElement))setOpen(false);}} onFocus={()=>setOpen(true)} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setOpen(false);}} onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();setOpen(false);}}}>
  {children}<a className="field-help-trigger" href={href} target="_blank" rel="noopener noreferrer" aria-label={'Help for '+field} aria-describedby={open?tip:undefined}>?</a>
  {open&&<span id={tip} className="field-help-popover" role="note" aria-label={field+' quick help'}>{help.quickHelp==='Ready'?<><span>{help.brief}</span><span><strong>Example:</strong> {help.example}</span></>:<span>Help for this field is being prepared.</span>}<a href={href} target="_blank" rel="noopener noreferrer">Full documentation</a></span>}
 </span>;
}
