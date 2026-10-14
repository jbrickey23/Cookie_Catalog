import {test} from "node:test";
import assert from "node:assert/strict";
import {archiveBlob,archiveStream,archiveHash} from "../src/archive-format";
test("bounded TAR download retains a complete manifest/original/footer archive",async()=>{
 const original=new Uint8Array(5*1024*1024+84).fill(7),id="file_download_test";
 const payloadJson=JSON.stringify({environment:"development",objects:[{attachmentId:id,key:`attachments/${id}/original`,byteSize:original.length,sha256:await archiveHash(original),contentType:"model/stl",etag:"example"}]});
 const manifest=new TextEncoder().encode(JSON.stringify({format:"cookie-catalog-archive",version:1,payloadJson,payloadSha256:await archiveHash(new TextEncoder().encode(payloadJson))}));
 const blob=await archiveBlob(await archiveStream(manifest,async()=>original));
 const bytes=new Uint8Array(await blob.arrayBuffer());
 assert.equal(blob.type,"application/x-tar");assert.ok(bytes.length>original.length);
 assert.ok(new TextDecoder().decode(bytes.slice(0,512)).includes("manifest.json"));
 assert.ok(new TextDecoder().decode(bytes.slice(-2048)).includes("complete.json"));
 assert.deepEqual(bytes.slice(-1024),new Uint8Array(1024));
});
test("oversize and failed streams cannot produce a partial download",async()=>{
 let cancelled=false;
 const stream=new ReadableStream<Uint8Array>({start(c){c.enqueue(new Uint8Array(4));c.enqueue(new Uint8Array(4));},cancel(){cancelled=true;}});
 await assert.rejects(()=>archiveBlob(stream,5),/32 MiB download limit/);assert.equal(cancelled,true);
 const broken=new ReadableStream<Uint8Array>({start(c){c.enqueue(new Uint8Array(3));c.error(Error("original changed"));}});
 await assert.rejects(()=>archiveBlob(broken),/original changed/);
});
