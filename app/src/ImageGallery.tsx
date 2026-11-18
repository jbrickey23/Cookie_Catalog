import React,{useEffect,useState} from 'react';
export type GalleryFile={id:string;filename:string;mediaType:string;available:boolean;photoKind?:'design'|'physical';direct?:boolean;decoratingIdeas?:string|null};
export const isImage=(file:GalleryFile)=>['image/png','image/jpeg','image/webp'].includes(file.mediaType);
export function ImageWindowLink({id,filename,children}:{id:string;filename:string;children:React.ReactNode}){
 const url='/api/attachments/'+encodeURIComponent(id)+'?view=window';
 return <a className="image-window-link" href={url} target="_blank" rel="noopener noreferrer" aria-label={'Open '+filename+' in a read-only image window'} onClick={event=>{
  if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();window.open(url,'_blank','popup=yes,width=500,height=500,noopener,noreferrer');
 }}>{children}</a>;
}
export function CatalogPhotos({id,label,fallback=[],revision,extra=[],onPhysicalSupport}:{onPhysicalSupport?:(enabled:boolean)=>void;id:string;label:string;revision?:number|string;fallback?:{id:string;filename:string}[];extra?:GalleryFile[]}){
 const [photos,setPhotos]=useState<GalleryFile[]>([]),[photoStatus,setPhotoStatus]=useState('');
 useEffect(()=>{
  const controller=new AbortController();
  setPhotos([]);setPhotoStatus('Loading photographs…');
  async function load(){
   const all=new Map<string,GalleryFile>();
   let offset=0;
   try{
    while(!controller.signal.aborted){
     const response=await fetch('/api/attachments?kind=shape&recordId='+encodeURIComponent(id)+'&catalogPhotos=true&offset='+offset,{cache:'no-store',signal:controller.signal});
     if(!response.ok)throw Error();
     const page=await response.json() as {attachments:GalleryFile[];nextOffset?:number;physicalPhotosEnabled?:boolean};
     if(controller.signal.aborted)return;
     if(!Array.isArray(page.attachments))throw Error();
     if(typeof page.physicalPhotosEnabled==='boolean')onPhysicalSupport?.(page.physicalPhotosEnabled);
     for(const photo of page.attachments)all.set(photo.id,photo);
     setPhotos([...all.values()]);
     if(page.nextOffset==null){setPhotoStatus('');return;}
     if(!Number.isSafeInteger(page.nextOffset)||page.nextOffset<=offset||page.nextOffset>100000)throw Error();
     offset=page.nextOffset;
    }
   }catch{if(!controller.signal.aborted)setPhotoStatus('Photographs could not all load. Refresh to retry.');}
  }
  void load();
  return ()=>controller.abort();
 },[id,revision,onPhysicalSupport]);

 const direct=photos.length?photos:fallback.map(f=>({...f,mediaType:'image/png',available:true}));
 const unique=new Map<string,GalleryFile>();
 for(const file of [...direct,...extra])if(!unique.has(file.id))unique.set(file.id,file);
 const merged=[...unique.values()].sort((a,b)=>Number(a.photoKind==='physical')-Number(b.photoKind==='physical'));
 return <><PhotoViewer label={label} files={merged}/>{photoStatus&&<p role="status">{photoStatus}</p>}</>;
}
export function PhotoViewer({files,label}:{files:GalleryFile[];label:string}){
 const images=files.filter(isImage);
 const [selected,setSelected]=useState('');
 const current=images.find(file=>file.id===selected)??images[0];
 return <div className="photo-viewer" role="region" aria-label={label}>
  <div className="representative-image">{current?.available?<ImageWindowLink id={current.id} filename={current.filename}><Photo key={current.id} file={current}/></ImageWindowLink>:<span>{current?'Image unavailable':'No photographs attached.'}</span>}</div>
  <div className="image-thumbnail-strip card-photographs">{images.filter(file=>file!==current).map(file=><button type="button" key={file.id} aria-label={'Display '+file.filename} onClick={()=>setSelected(file.id)}><Photo file={file}/></button>)}</div>
 </div>;
}
function Photo({file}:{file:GalleryFile}){
 const [failed,setFailed]=useState(false);
 return file.available&&!failed?<img loading="lazy" src={'/api/attachments/'+encodeURIComponent(file.id)+'?view=image'} alt={file.filename} title={file.photoKind==='physical'?'Physical cutter photograph':file.decoratingIdeas??'Design photograph'} onError={()=>setFailed(true)}/>:<span>Image unavailable</span>;
}
