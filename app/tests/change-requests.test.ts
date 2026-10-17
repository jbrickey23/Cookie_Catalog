import assert from 'node:assert/strict';
import {test} from 'node:test';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {handleApiRequest} from '../src/worker';
import type {IdentityVerifier} from '../src/server/access-identity';
const identity=(role:'owner'|'editor'|'viewer'='owner',subject='TEST owner'):IdentityVerifier=>({verify:async()=>({role,subject,email:null})});
const draft={id:'a1234567-1234-4123-8123-123456789abc',type:'bug',title:'TEST summary',description:'TEST detail',reason:'TEST outcome',approved:true,context:{recordId:'TEST record',recordName:'TEST cutter',search:'TEST'}};
const req=(body:unknown=draft,headers:Record<string,string>={})=>new Request('https://catalog.test/api/change-requests',{method:'POST',headers:{Origin:'https://catalog.test','content-type':'application/json','X-Cookie-Catalog-Check':'change-request',...headers},body:JSON.stringify(body)});
test('requests save privately without catalog DB, survive repeat submission and are owner-exportable only',async()=>{
 const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("test")}}',r2Buckets:['FILES']}));
 try{const files=await mf.getR2Bucket('FILES');const created=await handleApiRequest(req(),identity('viewer'),undefined,files as any,'development');assert.equal(created.status,201);const receipt=await created.json() as any;
 assert.equal((await handleApiRequest(req(),identity('viewer'),undefined,files as any)).status,200);
 assert.equal((await handleApiRequest(req({...draft,title:'different'}),identity('viewer'),undefined,files as any)).status,409);
 assert.equal((await handleApiRequest(req(),identity('viewer','someone else'),undefined,files as any)).status,409);
 const get=new Request('https://catalog.test/api/change-requests');assert.equal((await handleApiRequest(get,identity('editor'),undefined,files as any)).status,403);
 const exported=await (await handleApiRequest(get,identity(),undefined,files as any)).json() as any;assert.equal(exported.requests.length,1);assert.equal(exported.requests[0].id,receipt.id);assert.equal(exported.requests[0].title,draft.title);assert.equal(exported.requests[0].environment,'development');assert.equal(exported.requests[0].release,null);
 const planning=(revision:string)=>new Request('https://catalog.test/api/change-requests',{method:'PATCH',headers:{Origin:'https://catalog.test','content-type':'application/json','X-Cookie-Catalog-Check':'change-request','if-match':revision},body:JSON.stringify({id:receipt.id,release:'R2',todo:'CC-TODO-018'})});
 assert.equal((await handleApiRequest(planning(exported.requests[0].revision),identity('viewer'),undefined,files as any)).status,403);
 assert.equal((await handleApiRequest(planning('stale'),identity(),undefined,files as any)).status,412);
 assert.equal((await handleApiRequest(planning(exported.requests[0].revision),identity(),undefined,files as any)).status,200);
 const updated=await (await handleApiRequest(get,identity(),undefined,files as any)).json() as any;assert.equal(updated.requests[0].release,'R2');assert.equal(updated.requests[0].todo,'CC-TODO-018');
 assert.equal((await files.list()).objects.length,1);
 }finally{await mf.dispose();}
});
test('request API rejects unauthenticated, cross-origin, unconfirmed, oversized and invalid submissions before writing',async()=>{
 const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("test")}}',r2Buckets:['FILES']}));
 try{const files=await mf.getR2Bucket('FILES');const call=(r:Request)=>handleApiRequest(r,identity(),undefined,files as any);
 assert.equal((await handleApiRequest(req(),{verify:async()=>null},undefined,files as any)).status,401);
 assert.equal((await call(req(draft,{Origin:'https://other.test'}))).status,403);
 for(const body of [{...draft,approved:false},{...draft,type:'unknown'},{...draft,title:''},{...draft,title:'x'.repeat(121)},{...draft,context:{recordName:'x'.repeat(201)}}])assert.equal((await call(req(body))).status,400);
 assert.equal((await call(req({...draft,description:'x'.repeat(17000)}))).status,413);assert.equal((await files.list()).objects.length,0);
 }finally{await mf.dispose();}
});
