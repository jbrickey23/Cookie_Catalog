import {test} from 'node:test';import assert from 'node:assert/strict';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {r1ReleaseBridge} from '../src/server/r1-release-bridge';
import {releaseStatus,handleReleaseMaintenance} from '../src/server/release-maintenance';
const sha='a'.repeat(40),identity={verify:async()=>({role:'editor' as const,subject:'TEST editor',email:null})};
/** External harness counts old handler promises. This is a local ingress model,
 * NOT evidence that Cloudflare can observe/terminate pre-gate production R1 work. */
test('isolated synthetic ingress settles admitted R1 work, suspends cron, bridge/rollback remain restricted',async()=>{
 const mf=new Miniflare(convertV4MiniflareOptions({modules:true,script:'export default {fetch(){return new Response("test")}}',r2Buckets:['FILES']}));
 try{const files=await mf.getR2Bucket('FILES') as any;const env={FILES:files} as any;let restricted=false,scheduled=0,active=0,entered!:()=>void,finish!:()=>void;const started=new Promise<void>(r=>entered=r),held=new Promise<void>(r=>finish=r);
 const old={fetch:async()=>new Response('R1'),scheduled:async()=>{scheduled++;}};
 const oldWrite=async()=>{if(restricted)return 503;active++;try{entered();await held;await files.put('TEST record','synthetic R1');return 200;}finally{active--;}};
 const pending=oldWrite();await started;restricted=true;assert.equal(await oldWrite(),503);assert.equal(active,1);
 if(!restricted)await old.scheduled();assert.equal(scheduled,0);finish();assert.equal(await pending,200);assert.equal(active,0); // counted completion, no sleep
 const bridge=r1ReleaseBridge(old,async()=>new Response('R1 API unchanged'),()=>({sha,version:'test'}),()=>identity);
 const ctx={waitUntil:(_p:Promise<unknown>)=>{}} as any;
 assert.equal((await bridge.fetch(new Request('https://catalog.test/api/session'),env,ctx)).status,200);
 assert.equal((await bridge.fetch(new Request('https://catalog.test/api/catalog',{method:'POST'}),env,ctx)).status,409);
 assert.equal((await bridge.fetch(new Request('https://catalog.test/api/catalog',{method:'POST',headers:{'X-Catalog-Epoch':'initial','X-Catalog-Build':sha}}),env,ctx)).status,200);
 assert.equal((await bridge.fetch(new Request('https://catalog.test/api/release-automation/status'),env,ctx)).status,401);
 const gate=await handleReleaseMaintenance(new Request('https://catalog.test/api/release-maintenance',{method:'POST',headers:{Origin:'https://catalog.test','X-Cookie-Catalog-Check':'release-maintenance'},body:JSON.stringify({action:'begin',targetSha:sha})}),files,'TEST owner',true);assert.equal(gate.status,201);assert.equal((await releaseStatus(files,true)).ready,true);
 assert.equal((await bridge.fetch(new Request('https://catalog.test/api/catalog',{method:'POST'}),env,ctx)).status,423);
 // Simulated rollback to old handler while ingress restriction is still held.
 assert.equal(restricted,true);assert.equal((await old.fetch()).status,200);assert.equal(await oldWrite(),503);
 // Only after external verification may the harness reopen the old baseline.
 restricted=false;assert.equal((await old.fetch()).status,200);assert.equal(active,0);
 }finally{await mf.dispose();}
});
