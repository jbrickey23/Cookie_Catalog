import assert from 'node:assert/strict';
import {test} from 'node:test';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {handleReleaseGuardedApi as guarded} from '../src/worker';
import {preparePhotoInbox} from '../src/server/photo-inbox';
const handleReleaseGuardedApi=(request:Request,verifier:any,db?:any,files?:any)=>{const headers=new Headers(request.headers);headers.set('X-Catalog-Epoch','initial');headers.set('X-Catalog-Build','a'.repeat(40));return guarded(new Request(request,{headers}),verifier,db,files,'development','a'.repeat(40));};
const identity=(role:'owner'|'editor'|'viewer'='owner')=>({verify:async()=>({role,subject:'TEST '+role,email:null})});
const id='a1234567-1234-4123-8123-123456789abc',origin='https://catalog.test';
const png=new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,0]);
const upload=(bytes:Uint8Array=png,filename='TEST cutter.png')=>new Request(origin+'/api/photo-inbox',{method:'POST',headers:{Origin:origin,'X-Cookie-Catalog-Check':'photo-inbox','X-Photo-Id':id,'X-Photo-Filename':encodeURIComponent(filename),'X-Photo-Context':encodeURIComponent('TEST focused cutter')},body:bytes});
const runtime=()=>new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("test")}}',r2Buckets:['FILES']}));
test('private unlinked photo is preserved byte-for-byte, replayed safely and prepared without inventing extracted fields',async()=>{
 const mf=runtime();try{const files=await mf.getR2Bucket('FILES') as any,call=(r:Request)=>handleReleaseGuardedApi(r,identity('editor'),undefined,files);
 assert.equal((await call(upload())).status,201);assert.equal((await call(upload())).status,200);assert.equal((await call(upload(png,'other.png'))).status,409);
 const listing=await (await call(new Request(origin+'/api/photo-inbox'))).json() as any;assert.equal(listing.items.length,1);assert.equal(listing.items[0].context,'TEST focused cutter');assert.equal(listing.items[0].createdBy,undefined);assert.equal(listing.items[0].status,'queued');
 await preparePhotoInbox(files);await preparePhotoInbox(files);
 const item=await (await call(new Request(origin+'/api/photo-inbox/'+id))).json() as any;assert.equal(item.status,'ready-for-review');assert.deepEqual(item.analysis.proposedFields,{});assert.equal(item.analysis.provider,null);
 const original=await call(new Request(origin+'/api/photo-inbox/'+id+'/original'));assert.equal(original.headers.get('content-type'),'image/png');assert(original.headers.get('content-disposition')?.startsWith('attachment'));assert.deepEqual(new Uint8Array(await original.arrayBuffer()),png);
 assert.equal((await files.list({prefix:'catalog-photo-inbox/v1/queue/'})).objects.length,0);assert.equal((await files.list({prefix:'attachments/'})).objects.length,0);
 }finally{await mf.dispose();}
});
test('inbox rejects unauthenticated/read-only/bad-type/oversize requests and release-time uploads before originals are written',async()=>{
 const mf=runtime();try{const files=await mf.getR2Bucket('FILES') as any;assert.equal((await handleReleaseGuardedApi(upload(),{verify:async()=>null},undefined,files)).status,401);
 assert.equal((await handleReleaseGuardedApi(upload(),identity('viewer'),undefined,files)).status,403);
 assert.equal((await handleReleaseGuardedApi(upload(new Uint8Array([1,2]),'TEST.png'),identity(),undefined,files)).status,415);
 const oversize=upload();oversize.headers.set('content-length',String(11*1024*1024));assert.equal((await handleReleaseGuardedApi(oversize,identity(),undefined,files)).status,413);
 const badOrigin=upload();badOrigin.headers.set('Origin','https://other.test');assert.equal((await handleReleaseGuardedApi(badOrigin,identity(),undefined,files)).status,403);
 assert.equal((await files.list({prefix:'catalog-photo-inbox/'})).objects.length,0);
 const begin=new Request(origin+'/api/release-maintenance',{method:'POST',headers:{Origin:origin,'X-Cookie-Catalog-Check':'release-maintenance'},body:JSON.stringify({action:'begin',targetSha:'a'.repeat(40)})});assert.equal((await handleReleaseGuardedApi(begin,identity(),undefined,files)).status,201);assert.equal((await handleReleaseGuardedApi(upload(),identity(),undefined,files)).status,423);
 }finally{await mf.dispose();}
});
test('failed original verification is durable and explicit retry can prepare the corrected original',async()=>{
 const mf=runtime();try{const files=await mf.getR2Bucket('FILES') as any;await handleReleaseGuardedApi(upload(),identity(),undefined,files);await files.put('catalog-photo-inbox/v1/originals/'+id,'TEST corrupt');await preparePhotoInbox(files);
 let item=await (await files.get('catalog-photo-inbox/v1/items/'+id+'.json')).json();assert.equal(item.status,'failed');assert.equal(item.errorCode,'ORIGINAL_CHECK_FAILED');
 await files.put('catalog-photo-inbox/v1/originals/'+id,png);const retry=new Request(origin+'/api/photo-inbox/'+id+'/retry',{method:'POST',headers:{Origin:origin,'X-Cookie-Catalog-Check':'photo-inbox'}});assert.equal((await handleReleaseGuardedApi(retry,identity(),undefined,files)).status,200);await preparePhotoInbox(files);item=await (await files.get('catalog-photo-inbox/v1/items/'+id+'.json')).json();assert.equal(item.status,'ready-for-review');
 }finally{await mf.dispose();}
});

test('a retry queued during older preparation cleanup survives that cleanup',async()=>{
 const mf=runtime();try{const files=await mf.getR2Bucket('FILES') as any;await handleReleaseGuardedApi(upload(),identity(),undefined,files);await files.put('catalog-photo-inbox/v1/originals/'+id,'TEST corrupt');let raced=false;
 const proxy=new Proxy(files,{get(target,key){if(key==='delete')return async(path:string)=>{if(path.startsWith('catalog-photo-inbox/v1/queue/')&&!raced){raced=true;const retry=new Request(origin+'/api/photo-inbox/'+id+'/retry',{method:'POST',headers:{Origin:origin,'X-Cookie-Catalog-Check':'photo-inbox'}});assert.equal((await handleReleaseGuardedApi(retry,identity(),undefined,files)).status,200);}return target.delete(path);};const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value;}});
 await preparePhotoInbox(proxy);assert.equal((await files.list({prefix:'catalog-photo-inbox/v1/queue/'})).objects.length,1);
 await files.put('catalog-photo-inbox/v1/originals/'+id,png);await preparePhotoInbox(files);assert.equal((await (await files.get('catalog-photo-inbox/v1/items/'+id+'.json')).json()).status,'ready-for-review');
 }finally{await mf.dispose();}
});
