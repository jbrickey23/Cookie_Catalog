import React,{useEffect,useState} from 'react';
export type GalleryFile={id:string;filename:string;mediaType:string;available:boolean;direct?:boolean;decoratingIdeas?:string|null};
export const isImage=(file:GalleryFile)=>['image/png','image/jpeg','image/webp'].includes(file.mediaType);
export function ImageWindowLink({id,filename,children}:{id:string;filename:string;children:React.ReactNode}){
 const url='/api/attachments/'+encodeURIComponent(id)+'?view=window';
 return <a className="image-window-link" href={url} target="_blank" rel="noopener noreferrer" aria-label={'Open '+filename+' in a read-only image window'} onClick={event=>{
  if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();window.open(url,'_blank','popup=yes,width=500,height=500,noopener,noreferrer');
 }}>{children}</a>;
}
/** Gallery position is local presentation, not a saved preferred-image choice. */
export function ImageGallery({files,label}:{files:GalleryFile[];label:string}){
 const images=files.filter(isImage),[index,setIndex]=useState(0),[failed,setFailed]=useState(false);
 const file=images[Math.min(index,Math.max(0,images.length-1))];
 useEffect(()=>{setFailed(false);},[file?.id]);
 return <section className="design-gallery" aria-label={label}>
  {file?<figure>{file.available&&!failed?<ImageWindowLink id={file.id} filename={file.filename}><img src={'/api/attachments/'+encodeURIComponent(file.id)+'?view=image'} alt={file.filename} onError={()=>setFailed(true)}/></ImageWindowLink>:<p>Image unavailable. Its association is retained.</p>}
   <figcaption>{file.direct===false?'Decorating idea: '+file.decoratingIdeas:label==='Physical cutter photographs'?'Physical cutter photograph':'Design image'}{file.decoratingIdeas&&file.direct!==false?' · Also linked to '+file.decoratingIdeas:''} · {file.filename}{file.available&&<> · <a href={'/api/attachments/'+encodeURIComponent(file.id)}>Download original</a></>}</figcaption></figure>:<p>No images attached. Digital files and recorded cutters are listed separately.</p>}
  {images.length>1&&<nav aria-label={label+' navigation'}><button onClick={()=>setIndex(i=>(i+images.length-1)%images.length)}>Previous image</button><span role="status" aria-live="polite">Image {Math.min(index+1,images.length)} of {images.length}</span><button onClick={()=>setIndex(i=>(i+1)%images.length)}>Next image</button></nav>}
 </section>;
}
