import React,{useEffect,useState} from 'react';
import {requestJson} from './request-json';
import {useReleaseEditingPaused} from './ReleaseNotice';
export async function uploadRecordPhoto(kind:'shape'|'cutter',id:string,file:File){
 if(file.size===0||file.size>25*1024*1024)throw Error('Choose a photograph from 1 byte to 25 MiB.');
 const form=new FormData();form.set('kind',kind);form.set('recordId',id);form.set('file',file);
 return requestJson('/api/attachments',{method:'POST',headers:{'X-Cookie-Catalog-Check':'attachments'},body:form});
}
export function RecordPhotos({kind,id,canEdit,onChanged,onDirty}:{kind:'shape'|'cutter';id:string;canEdit:boolean;onDirty:(dirty:boolean,busy:boolean)=>void;onChanged:()=>void}){
 const paused=useReleaseEditingPaused(),[file,setFile]=useState<File|null>(null),[busy,setBusy]=useState(false),[status,setStatus]=useState('');
 useEffect(()=>{onDirty(!!file,busy);return()=>onDirty(false,false);},[file,busy,onDirty]);
 return <form onSubmit={async e=>{e.preventDefault();if(!file||paused)return;setBusy(true);setStatus('Saving photograph…');try{await uploadRecordPhoto(kind,id,file);setFile(null);setStatus('Photograph saved.');onChanged();}catch(e){setStatus((e as Error).message);}finally{setBusy(false);}}}>
 {canEdit&&<><label>{kind==='shape'?'Add finished-cookie reference photograph':'Add physical cutter photograph'} (optional)<input type="file" accept=".png,.jpg,.jpeg,.webp" disabled={busy||paused} onChange={e=>setFile(e.target.files?.[0]??null)}/></label><button disabled={!file||busy||paused}>Save photograph</button></>}
 <p role="status">{status}</p></form>;
}
