import React,{createContext,useCallback,useContext,useEffect,useId,useLayoutEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {helpForField} from './field-help';
export const FieldHelpContext=createContext<{active:string|null;show:React.Dispatch<React.SetStateAction<string|null>>}|null>(null);
export const HELP_HOVER_MS=1500;
export const HELP_TRANSIT_MS=120;
export function FieldHelp({field,children}:{field:string;children:React.ReactNode}){
 const help=helpForField(field),[localOpen,setLocalOpen]=useState(false),tip=useId(),shared=useContext(FieldHelpContext);
 const open=shared?shared.active===tip:localOpen;
 const trigger=useRef<HTMLAnchorElement>(null),popup=useRef<HTMLSpanElement>(null),mode=useRef<'pointer'|'intent'>('pointer'),suppressFocus=useRef(false);
 const hover=useRef<ReturnType<typeof setTimeout>|null>(null),transit=useRef<ReturnType<typeof setTimeout>|null>(null);
 const [position,setPosition]=useState<{left:number;top:number;width:number;maxHeight:number}|null>(null);
 const cancel=useCallback(()=>{for(const timer of [hover,transit]){if(timer.current!==null)clearTimeout(timer.current);timer.current=null;}},[]);
 const close=useCallback(()=>{cancel();setLocalOpen(false);shared?.show(current=>current===tip?null:current);},[cancel,shared?.show,tip]);
 const inside=(target:EventTarget|null)=>target instanceof Node&&(!!trigger.current?.contains(target)||!!popup.current?.contains(target));
 const show=(intent:'pointer'|'intent')=>{cancel();mode.current=intent;if(shared)shared.show(tip);else setLocalOpen(true);};
 const leave=(target:EventTarget|null)=>{cancel();if(!inside(target)&&mode.current==='pointer')transit.current=setTimeout(close,HELP_TRANSIT_MS);};
 const dismissAndRestoreFocus=()=>{const restore=popup.current?.contains(document.activeElement);close();if(restore){suppressFocus.current=true;trigger.current?.focus({preventScroll:true});suppressFocus.current=false;}};
 useEffect(()=>{close();window.addEventListener('catalog-context-change',close);return()=>{cancel();window.removeEventListener('catalog-context-change',close);shared?.show(current=>current===tip?null:current);};},[field,close,cancel,shared?.show,tip]);
 useLayoutEffect(()=>{
  if(!open)return;
  const place=()=>{
   const anchor=trigger.current?.getBoundingClientRect(),box=popup.current;
   if(!anchor||!box)return;
   const w=window.innerWidth,h=window.innerHeight,margin=8,gap=6,width=Math.min(304,w-margin*2);
   if(anchor.bottom<0||anchor.top>h||anchor.right<0||anchor.left>w){close();return;}
   const lower=Math.max(margin,anchor.bottom+gap),upper=Math.min(h-margin,anchor.top-gap);
   const below=Math.max(0,h-lower-margin),above=Math.max(0,upper-margin);
   const height=Math.max(box.scrollHeight+2,box.getBoundingClientRect().height);
   const down=height<=below||below>=above,maxHeight=down?below:above;
   setPosition({left:Math.max(margin,Math.min(anchor.left,w-width-margin)),top:down?lower:Math.max(margin,upper-Math.min(height,maxHeight)),width,maxHeight});
  };
  place();window.addEventListener('resize',place);window.addEventListener('scroll',place,true);
  return()=>{window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true);};
 },[open,field,close]);
 useEffect(()=>{
  if(!open)return;
  const outside=(event:Event)=>{if(!inside(event.target))close();};
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();dismissAndRestoreFocus();}};
  document.addEventListener('pointerdown',outside,true);document.addEventListener('focusin',outside,true);document.addEventListener('keydown',escape,true);window.addEventListener('blur',close);
  return()=>{cancel();document.removeEventListener('pointerdown',outside,true);document.removeEventListener('focusin',outside,true);document.removeEventListener('keydown',escape,true);window.removeEventListener('blur',close);};
 },[open,close,cancel]);
 if(!help)return <span className="field-help-label">{children}</span>;
 const href='/api/help/fields#'+help.id;
 return <span className="field-help-label" data-quick-help={help.quickHelp}>
  {children}<a ref={trigger} className="field-help-trigger" href={href} target="_blank" rel="noopener noreferrer"
   onMouseEnter={()=>{cancel();if(!open)hover.current=setTimeout(()=>show('pointer'),HELP_HOVER_MS);}}
   onMouseLeave={event=>leave(event.relatedTarget)}
   onFocus={()=>{if(!suppressFocus.current)show('intent');}}
   onBlur={event=>{cancel();if(!inside(event.relatedTarget))close();}}
   onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();dismissAndRestoreFocus();}else if(event.key==='Tab'&&!event.shiftKey&&open){event.preventDefault();popup.current?.querySelector<HTMLButtonElement>('button')?.focus();}}}
   onClick={event=>{if(!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey){event.preventDefault();show('intent');}}}
   aria-label={'Help for '+field} aria-describedby={open?tip:undefined}>?</a>
  {open&&createPortal(<span ref={popup} id={tip} className="field-help-popover" role="note" aria-label={field+' quick help'} style={position??{visibility:'hidden'}}
   onKeyDown={event=>{if(event.key==='Tab'){if(event.shiftKey&&event.target===popup.current?.querySelector('button')){event.preventDefault();trigger.current?.focus({preventScroll:true});}else if(!event.shiftKey&&event.target===popup.current?.querySelector('a')){dismissAndRestoreFocus();}}}}
   onMouseEnter={cancel} onMouseLeave={event=>leave(event.relatedTarget)} onFocus={()=>{cancel();mode.current='intent';}} onBlur={event=>{cancel();if(!inside(event.relatedTarget))close();}}>
   <button className="help-close" type="button" aria-label="Close help" onClick={dismissAndRestoreFocus}>×</button>
   {help.quickHelp==='Ready'?<><span>{help.brief}</span><span><strong>Example:</strong> {help.example}</span></>:<span>Help for this field is being prepared.</span>}
   <a href={href} target="_blank" rel="noopener noreferrer">Full documentation</a>
  </span>,document.body)}
 </span>;
}
