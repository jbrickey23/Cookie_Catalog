import assert from 'node:assert/strict';
import {test} from 'node:test';
import {dimensionValue,inchesInput,parseInches,formatInches} from '../src/measurements';
import {configuredMemberRole,mayRead,mayWrite,mayAdmin,mayDelete,type IdentityVerifier,type AuthenticatedUser} from '../src/server/access-identity';
import {handleApiRequest,handleAdminPage} from '../src/worker';
test('decimal and mixed fractions convert centrally; untouched metric precision survives repeated edits',()=>{
 assert.equal(parseInches('2 1/2'),63.5);assert.equal(parseInches('2-1/2 inches'),63.5);assert.equal(parseInches('1/8'),3.175);assert.equal(parseInches('.5'),12.7);assert.equal(parseInches('2.5'),63.5);
 for(const bad of ['1/0','-2','2 cats','1 2 3','Infinity','400','0'])assert.throws(()=>parseInches(bad));
 let original=64.1234567890123;const exact=original;for(let i=0;i<100;i++)original=dimensionValue(inchesInput(original),original)!;assert.equal(original,exact);
 assert.equal(dimensionValue('',null),null);assert.equal(formatInches(63.5),'2.5″');assert.equal(dimensionValue('2 1/2',76.2),63.5);
});
test('Owner/Admin catalog CRUD differs from Admin-only operations; legacy editor/viewer stay restricted',async()=>{
 for(const role of ['admin','owner','editor','viewer'] as const){
  const user:AuthenticatedUser={role,subject:'test-'+role,email:null},verifier:IdentityVerifier={verify:async()=>user};
  assert(mayRead(user));assert.equal(mayWrite(user),role!=='viewer');assert.equal(mayDelete(user),role==='owner'||role==='admin');assert.equal(mayAdmin(user),role==='admin');
  if(role!=='admin')for(const path of ['/api/backups','/api/dev/infrastructure-check','/api/change-requests'])assert.equal((await handleApiRequest(new Request('https://catalog.test'+path),verifier)).status,403,role+' '+path);
  let assetsRead=0;const assets={fetch:async()=>{assetsRead++;return new Response('<html>shell</html>');}} as unknown as Fetcher;
  const page=await handleAdminPage(new Request('https://catalog.test/api/admin'),verifier,assets);assert.equal(page.status,role==='admin'?200:403);assert.equal(assetsRead,role==='admin'?1:0);
 }
 assert.equal(configuredMemberRole('[{"email":"a@example.test","role":"admin"}]','a@example.test'),'admin');
 assert.equal(configuredMemberRole('[{"email":"a@example.test","role":"owner"}]','a@example.test'),'owner');
 assert.equal((await handleAdminPage(new Request('https://catalog.test/api/admin'),{verify:async()=>null},{} as Fetcher)).status,401);
});
