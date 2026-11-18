import React,{useId,useState} from 'react';
import {isPreset,locationChoices,locationKey,type Location} from './locations';
import {getLocation,saveLocation,type SavedLocation} from './location-client';

type Props = {
  value:string; locations:Location[]; source?:string|null; label:string; disabled?:boolean; autoFocus?:boolean; invalid?:boolean;
  onChange:(id:string)=>void; onBusy:(busy:boolean)=>void;
};
export function LocationSelector({value,locations,source,label,disabled,autoFocus,invalid,onChange,onBusy}:Props) {
  const input=React.useRef<HTMLInputElement>(null);
  React.useEffect(()=>{if(invalid)input.current?.focus();},[invalid]);
  const id=useId(),choices=React.useMemo(()=>locationChoices(locations),[locations]);
  const selected=choices.find(item=>item.id===value);
  const [query,setQuery]=useState<string|null>(null),[index,setIndex]=useState(-1);
  const [manage,setManage]=useState(false),[name,setName]=useState(''),[previous,setPrevious]=useState<SavedLocation>();
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const available=source?[{id:'',label:source},...choices.filter(item=>item.label!==source||item.id===value)]:choices;
  const matches=available.filter(item=>locationKey(item.label).includes(locationKey(query??'')));
  React.useEffect(()=>{if(index>=0)document.getElementById(id+'-'+index)?.scrollIntoView?.({block:'nearest'});},[index,id]);
  function exactMatch(text:string){
    const exact=matches.find(item=>item.label===text.trim());
    const equivalent=matches.filter(item=>locationKey(item.label)===locationKey(text));
    return exact??(equivalent.length===1?equivalent[0]:undefined);
  }
  function finishInput(){
    const exact=query?.trim()?exactMatch(query):undefined;
    if(exact)choose(exact);else close();
  }
  function close(){setQuery(null);setIndex(-1);}
  function choose(item:Location){onChange(item.id);close();}
  function openManager(){close();setManage(true);setName(query?.trim()??'');setPrevious(undefined);setError('');}
  async function rename(){
    if(!selected)return;
    setBusy(true);onBusy(true);setError('');
    try{const current=await getLocation(selected.id);setPrevious(current);setName(current.record.label);}
    catch(e){setError((e as Error).message);}finally{setBusy(false);onBusy(false);}
  }
  async function store(){
    setBusy(true);onBusy(true);setError('');
    try{const saved=await saveLocation(name.trim(),previous);choose(saved.record);setManage(false);}
    catch(e){setError((e as Error).message);}finally{setBusy(false);onBusy(false);}
  }
  return <div className="location-selector" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))finishInput();}}>
    <div className="location-controls"><input ref={input} aria-invalid={invalid} autoFocus={autoFocus} role="combobox" aria-label={label} aria-expanded={query!==null}
      aria-autocomplete="list" aria-controls={id} aria-activedescendant={query!==null&&matches[index]?id+'-'+index:undefined}
      disabled={disabled||busy} placeholder="Choose a location" value={query??selected?.label??(value?.startsWith('preset:')?value.slice(7):source??'')}
      onFocus={()=>{if(!manage){setQuery('');setIndex(-1);}}} onChange={e=>{setQuery(e.target.value);setIndex(-1);}}
      onKeyDown={e=>{
        if(e.nativeEvent.isComposing)return;
        if(e.key==='Escape'){e.preventDefault();close();return;}
        if(e.key==='ArrowDown'||e.key==='ArrowUp'){
          e.preventDefault();setQuery(query??'');setIndex(i=>Math.max(0,Math.min(matches.length-1,i+(e.key==='ArrowDown'?1:-1))));return;
        }
        if(query!==null&&(e.key==='Enter'||e.key==='Tab'&&!e.shiftKey&&query.trim())){
          if(e.key==='Enter')e.preventDefault();
          const match=matches[index]??exactMatch(query)??matches[0];
          if(match)choose(match);
        }
      }}/>
      <button type="button" aria-label="Show location choices" disabled={disabled||busy} onMouseDown={e=>e.preventDefault()} onClick={e=>{const input=e.currentTarget.previousElementSibling as HTMLInputElement;input.focus();setQuery('');setIndex(-1);}}>▾</button>
      <button type="button" className="field-pencil" aria-label="Manage custom locations" disabled={disabled||busy} onClick={openManager}>✎</button>
    </div>
    {query!==null&&<ul id={id} role="listbox" aria-label="Locations">{matches.map((item,i)=>
      <li role="option" aria-selected={i===index} key={item.id} id={id+'-'+i} onMouseDown={e=>e.preventDefault()} onClick={()=>choose(item)}>{item.label}{item.id===''?' (OneNote)':''}</li>
    )}{!matches.length&&<li role="presentation">No matching location. Use the pencil to create one.</li>}</ul>}
    {manage&&<div role="group" aria-label="Manage custom locations">
      <label>{previous?'New name for '+previous.record.label:'Custom location name'}<input maxLength={200} value={name} disabled={disabled||busy} onChange={e=>setName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.nativeEvent.isComposing){e.preventDefault();if(name.trim())void store();}}}/></label>
      {previous&&<p>Renaming updates the label for every cutter assigned here.</p>}
      <button type="button" disabled={disabled||busy||!name.trim()} onClick={store}>{previous?'Save location name':'Create or use location'}</button>
      {!previous&&selected&&!isPreset(selected.label)&&<button type="button" disabled={disabled||busy} onClick={rename}>Rename {selected.label}</button>}
      <button type="button" disabled={busy} onClick={()=>setManage(false)}>Close</button>
      {error&&<p role="alert">{error}</p>}
    </div>}
  </div>;
}
