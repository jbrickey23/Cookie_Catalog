import assert from 'node:assert/strict';
import {test} from 'node:test';
import {catalogEnvironment} from '../src/catalog-environment';
import worker,{handleApiRequest} from '../src/worker';
import {archiveStream,archiveHash} from '../src/archive-format';
const owner={verify:async()=>({subject:'owner',email:'owner@example.test',role:'owner' as const})};
test('environment defaults preserve development; invalid configuration fails closed',async()=>{
 assert.equal(catalogEnvironment(undefined),'development');assert.equal(catalogEnvironment('production'),'production');assert.throws(()=>catalogEnvironment('prod'));
 const session=await handleApiRequest(new Request('https://catalog.example.test/api/session'),owner,undefined,undefined,'production');assert.equal((await session.json() as any).environment,'production');
 for(const path of ['storage-check','missing-file-check','recovery-check','database-check','backup']){const response=await handleApiRequest(new Request('https://catalog.example.test/api/dev/'+path,{method:'POST'}),owner,undefined,undefined,'production');assert.equal(response.status,404);}
 const invalid=await handleApiRequest(new Request('https://catalog.example.test/api/session'),owner,undefined,undefined,'prod' as any);assert.equal(invalid.status,503);
 const entry=await worker.fetch(new Request('https://catalog.example.test/api/session'),{CATALOG_ENVIRONMENT:'prod',ACCESS_TEAM_DOMAIN:'test.cloudflareaccess.com',ACCESS_AUD:'a'.repeat(64),OWNER_EMAIL:'owner@example.test'} as any);assert.equal(entry.status,503);
});
test('portable archive accepts both declared source environments without relabeling and rejects unknown sources',async()=>{
 for(const environment of ['development','production','unknown']){
  const payloadJson=JSON.stringify({environment,objects:[]}),manifest=new TextEncoder().encode(JSON.stringify({format:'cookie-catalog-archive',version:1,payloadJson,payloadSha256:await archiveHash(new TextEncoder().encode(payloadJson))}));
  if(environment==='unknown'){await assert.rejects(()=>archiveStream(manifest,async()=>new Uint8Array()),/Invalid archive descriptors/);continue;}
  const bytes=new Uint8Array(await new Response(await archiveStream(manifest,async()=>new Uint8Array())).arrayBuffer());assert(new TextDecoder().decode(bytes).includes(payloadJson.replaceAll('"','\\"')));
 }
});
