import assert from 'node:assert/strict';
import {test} from 'node:test';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {handleApiRequest} from '../src/worker';
import {createRequestBackup,parseRequestBackup,requestHash} from '../src/request-backup';
const owner={verify:async()=>({role:'owner' as const,subject:'TEST owner',email:null})};
const viewer={verify:async()=>({role:'viewer' as const,subject:'TEST viewer',email:null})};
const bucket=()=>new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("test")}}',r2Buckets:['FILES']}));
const post=(body:unknown,suffix='')=>new Request('https://catalog.test/api/change-requests'+suffix,{method:'POST',headers:{Origin:'https://catalog.test','content-type':'application/json','X-Cookie-Catalog-Check':'change-request'},body:JSON.stringify(body)});
const draft={id:'a1234567-1234-4123-8123-123456789abc',type:'bug',title:'TEST independent backup',description:'TEST original details',reason:'TEST recovery',approved:true};
test('isolated request recovery uses only a downloaded verified bundle after source bucket is disposed',async()=>{
 const source=bucket();let archive:string;
 try{const files=await source.getR2Bucket('FILES');assert.equal((await handleApiRequest(post(draft),owner,undefined,files as any,'development')).status,201);
 const list=await (await handleApiRequest(new Request('https://catalog.test/api/change-requests'),owner,undefined,files as any,'development')).json() as any;
 const records=list.requests.map(({revision,...record}:any)=>record);archive=JSON.stringify(await createRequestBackup(records,'development'));
 }finally{await source.dispose();}
 const target=bucket();try{const files=await target.getR2Bucket('FILES'),parsed=await parseRequestBackup(archive!);assert.equal(parsed.requests.length,1);const json=JSON.stringify(parsed.requests[0]),body={json,sha256:await requestHash(json),approved:true};
 const recover=()=>post(body,'?recover=missing');
 assert.equal((await handleApiRequest(recover(),viewer,undefined,files as any,'development')).status,403);
 assert.equal((await handleApiRequest(post({...body,approved:false},'?recover=missing'),owner,undefined,files as any,'development')).status,400);
 assert.equal((await handleApiRequest(recover(),owner,undefined,files as any,'production')).status,400);
 assert.equal((await handleApiRequest(post({...body,json:json+' '},'?recover=missing'),owner,undefined,files as any,'development')).status,400);
 assert.equal((await files.list()).objects.length,0);
 assert.equal((await handleApiRequest(recover(),owner,undefined,files as any,'development')).status,201);
 assert.equal((await handleApiRequest(recover(),owner,undefined,files as any,'development')).status,200);
 const restored=await files.get('catalog-requests/v1/'+parsed.requests[0].id+'.json');assert.equal(await restored!.text(),json);
 const other=JSON.stringify({...parsed.requests[0],title:'TEST conflicting value'});
 assert.equal((await handleApiRequest(post({json:other,sha256:await requestHash(other),approved:true},'?recover=missing'),owner,undefined,files as any,'development')).status,409);
 assert.equal(await (await files.get('catalog-requests/v1/'+parsed.requests[0].id+'.json'))!.text(),json);
 assert.equal((await files.list({prefix:'attachments/'})).objects.length,0);
 const corrupted=JSON.parse(archive!);corrupted.payloadJson+=' ';await assert.rejects(()=>parseRequestBackup(JSON.stringify(corrupted)),/checksum/);
 await assert.rejects(()=>createRequestBackup([...parsed.requests,...parsed.requests],'development'),/Duplicate/);
 await assert.rejects(()=>createRequestBackup(parsed.requests,'production'),/mixed-environment/);
 }finally{await target.dispose();}
});
test('request endpoints reject non-object JSON without unhandled exceptions',async()=>{const mf=bucket();try{const files=await mf.getR2Bucket('FILES');for(const value of [null,[],1,'text'])assert.equal((await handleApiRequest(post(value),owner,undefined,files as any)).status,400);}finally{await mf.dispose();}});
