import React,{createContext,useContext,useEffect,useId,useRef,useState} from 'react';
import {helpForField,type FieldHelpEntry} from './field-help';
export const FieldHelpContext=createContext<{active:FieldHelpEntry|null;show:(help:FieldHelpEntry|null)=>void}|null>(null);
export const HELP_HOVER_MS=1500;
export function FieldHelp({field,children}:{field:string;children:React.ReactNode}){
 const help=helpForField(field),[open,setOpen]=useState(false),tip=useId(),rail=useContext(FieldHelpContext);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const cancel=()=>{if(timer.current!==null){clearTimeout(timer.current);timer.current=null;}};
 useEffect(()=>{cancel();setOpen(false);const reset=()=>{cancel();setOpen(false);rail?.show(null);};window.addEventListener('catalog-context-change',reset);return()=>{cancel();window.removeEventListener('catalog-context-change',reset);};},[field,rail?.show]);
 if(!help)return <span className="field-help-label">{children}</span>;
 const href='/api/help/fields#'+help.id,show=()=>{cancel();if(rail)rail.show(help);else setOpen(true);};
 return <span className="field-help-label" data-quick-help={help.quickHelp} onMouseEnter={()=>{cancel();timer.current=setTimeout(show,HELP_HOVER_MS);}} onMouseLeave={event=>{cancel();if(!rail&&!event.currentTarget.contains(document.activeElement))setOpen(false);}} onFocus={show} onBlur={event=>{cancel();if(!rail&&!event.currentTarget.contains(event.relatedTarget as Node|null))setOpen(false);}} onKeyDown={event=>{if(event.key==='Escape'){cancel();event.preventDefault();event.stopPropagation();setOpen(false);rail?.show(null);}}}>
  {children}<a className="field-help-trigger" href={href} target="_blank" rel="noopener noreferrer" onClick={event=>{if(!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey){event.preventDefault();show();}}} aria-label={'Help for '+field} aria-describedby={rail?.active?.id===help.id?'field-help-rail-note':open?tip:undefined}>?</a>
  {!rail&&open&&<span id={tip} className="field-help-popover" role="note" aria-label={field+' quick help'}>{help.quickHelp==='Ready'?<><span>{help.brief}</span><span><strong>Example:</strong> {help.example}</span></>:<span>Help for this field is being prepared.</span>}<a href={href} target="_blank" rel="noopener noreferrer">Full documentation</a></span>}
 </span>;
}
