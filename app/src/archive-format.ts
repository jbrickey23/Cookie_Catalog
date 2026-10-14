export interface ArchiveObject { attachmentId:string;key:string;byteSize:number;sha256:string;contentType:string|null;etag:string }
export const ARCHIVE_FILE_LIMIT=25*1024*1024;
const encoder=new TextEncoder();
export async function archiveHash(bytes:Uint8Array) {
 const digest=await crypto.subtle.digest("SHA-256",bytes as BufferSource);
 return Array.from(new Uint8Array(digest),n=>n.toString(16).padStart(2,"0")).join("");
}
function header(path:string,size:number) {
  const bytes=new Uint8Array(512);
  const put=(offset:number,length:number,text:string)=>{
    const encoded=encoder.encode(text);if(encoded.length>length)throw new Error("TAR header limit exceeded.");bytes.set(encoded,offset);
  };
  const slash=path.lastIndexOf("/");
  put(0,100,path.slice(slash+1));put(345,155,path.slice(0,slash));
  put(100,8,"0000600\0");put(108,8,"0000000\0");put(116,8,"0000000\0");
  put(124,12,size.toString(8).padStart(11,"0")+"\0");put(136,12,"00000000000\0");
  bytes.fill(32,148,156);bytes[156]=48;put(257,6,"ustar\0");put(263,2,"00");
  put(148,8,bytes.reduce((sum,n)=>sum+n,0).toString(8).padStart(6,"0")+"\0 ");
  return bytes;
}
function chunks(path:string,bytes:Uint8Array) {
  return [header(path,bytes.length),bytes,...(bytes.length%512?[new Uint8Array(512-bytes.length%512)]:[])];
}

export async function archiveStream(manifest:Uint8Array,load:(object:ArchiveObject)=>Promise<Uint8Array>):Promise<ReadableStream<Uint8Array>> {
 const envelope=JSON.parse(new TextDecoder().decode(manifest));
 if(envelope.format!=="cookie-catalog-archive"||envelope.version!==1||await archiveHash(encoder.encode(envelope.payloadJson))!==envelope.payloadSha256)throw Error("Invalid archive manifest.");
 const payload=JSON.parse(envelope.payloadJson),objects=payload.objects as ArchiveObject[];
 if(payload.environment!=="development"||objects.length>1000||objects.some(o=>o.key!=="attachments/"+o.attachmentId+"/original"||!/^[a-zA-Z0-9_-]{8,128}$/.test(o.attachmentId)||!Number.isSafeInteger(o.byteSize)||o.byteSize<0||o.byteSize>ARCHIVE_FILE_LIMIT))throw Error("Invalid archive descriptors.");
 const total=objects.reduce((sum,o)=>sum+o.byteSize,0);
 if(total>1024*1024*1024||manifest.length>16*1024*1024)throw Error("Archive limits exceeded.");
 const manifestHash=await archiveHash(manifest);
 let queue=chunks("metadata/manifest.json",manifest),index=0,finished=false;
 return new ReadableStream<Uint8Array>({
  async pull(controller){try{
   if(queue.length){controller.enqueue(queue.shift()!);return;}
   if(index<objects.length){
    const object=objects[index++],bytes=await load(object);
    if(bytes.length!==object.byteSize||await archiveHash(bytes)!==object.sha256)throw Error("Original checksum failed during archive.");
    queue=chunks("objects/"+object.key,bytes);controller.enqueue(queue.shift()!);return;
   }
   if(!finished){finished=true;queue=chunks("metadata/complete.json",encoder.encode(JSON.stringify({manifestSha256:manifestHash,objects:objects.length,originalBytes:total})));queue.push(new Uint8Array(1024));controller.enqueue(queue.shift()!);return;}
   controller.close();
  }catch(error){queue=[];controller.error(error);}},
  cancel(){queue=[];}
 },{highWaterMark:1});
}
