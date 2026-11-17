import React,{useEffect,useRef,useState} from 'react';
import {dimensionValue,inchesInput} from './measurements';
/** Invalid drafts remain visible and invalidate the staging model; never silently keep an old measurement. */
export function InchInput({value,onChange}:{value:number|undefined;onChange:(mm:number|undefined)=>void}){
 const [text,setText]=useState(inchesInput(value)),[error,setError]=useState('');const emitted=useRef(value);
 useEffect(()=>{if(!Object.is(value,emitted.current)){setText(inchesInput(value));setError('');emitted.current=value;}},[value]);
 return <><input type="text" value={text} aria-invalid={!!error} onChange={e=>{setText(e.target.value);try{const mm=dimensionValue(e.target.value,value)??undefined;emitted.current=mm;onChange(mm);setError('');}catch(err){emitted.current=NaN;onChange(NaN);setError((err as Error).message);}}}/>{error&&<span role="alert">{error}</span>}</>;
}
