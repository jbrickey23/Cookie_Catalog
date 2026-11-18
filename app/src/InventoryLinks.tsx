import React from 'react';
import {binDisplay,cutterHref} from './inventory';

export function CatalogLink({href,onOpen,children,...props}:React.AnchorHTMLAttributes<HTMLAnchorElement>&{href:string;onOpen?:()=>void}){
 return <a {...props} href={href} onClick={event=>{
  if(onOpen&&event.button===0&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey){event.preventDefault();onOpen();}
 }}>{children}</a>;
}
export function BinLink({location,onOpen}:{location:string|null;onOpen?:(bin:string)=>void}){
 return location?<CatalogLink className="bin-link" href={'/?bin='+encodeURIComponent(location)} aria-label={'Show all cutters in '+location} onOpen={onOpen&&(()=>onOpen(location))}>{binDisplay(location)}</CatalogLink>:<span>Not recorded</span>;
}
export function CutterLink({id,shape,name,onOpen}:{id:string;shape:string;name:string;onOpen?:(id:string)=>void}){
 return <CatalogLink href={cutterHref(shape,id)} onOpen={onOpen&&(()=>onOpen(id))}>{name}</CatalogLink>;
}
