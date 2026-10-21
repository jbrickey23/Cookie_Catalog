import React,{useEffect,useState} from 'react';
/** Native disclosure keeps fields mounted; validation always reveals its containing section. */
export function DetailSection({title,children,reveal=false,defaultOpen=false}:{title:string;children:React.ReactNode;reveal?:boolean;defaultOpen?:boolean}) {
 const [open,setOpen]=useState(defaultOpen);
 useEffect(()=>{if(reveal)setOpen(true);},[reveal]);
 return <details className="record-section" open={open||reveal} onToggle={event=>setOpen(event.currentTarget.open)}><summary>{title}</summary>{children}</details>;
}
