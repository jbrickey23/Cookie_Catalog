import assert from 'node:assert/strict';
import {test} from 'node:test';
import {fieldHelp,fieldHelpPage,helpForField} from '../src/field-help';
import {shapeFields,cutterFields} from '../src/inline-fields';
import {handleApiRequest} from '../src/worker';
import type {IdentityVerifier} from '../src/server/access-identity';
test('every focused field has a Ready or Missing quick-help item and ready content is complete',()=>{
 const labels=[...shapeFields,...cutterFields].map(f=>f.label).concat('Tags');
 assert.equal(new Set(fieldHelp.map(h=>h.id)).size,fieldHelp.length);
 for(const label of labels){const h=helpForField(label);assert(h,label);assert.match(h.id,/^[a-z-]+$/);assert(['Ready','Missing'].includes(h.quickHelp));if(h.quickHelp==='Ready'){assert(h.brief);assert(h.example);assert(h.details);}}
 assert.equal(helpForField('BIN / location')?.quickHelp,'Ready');assert.equal(helpForField('Slot')?.quickHelp,'Ready');assert.match(fieldHelpPage(),/id="bin"/);assert.match(fieldHelpPage(),/id="slot"/);assert.match(fieldHelpPage(),/independent of Physical or Digital/);assert.doesNotMatch(fieldHelpPage(),/<script|<form/);
});
test('full field documentation is authenticated read-only HTML without catalog bindings',async()=>{
 for(const role of ['owner','editor','viewer'] as const){const verifier:IdentityVerifier={verify:async()=>({subject:'test',email:'test@example.test',role})};const response=await handleApiRequest(new Request('https://catalog.test/api/help/fields'),verifier);assert.equal(response.status,200);assert.match(response.headers.get('content-type')!,/^text\/html/);assert.equal(response.headers.get('cache-control'),'no-store');assert.match(response.headers.get('content-security-policy')!,/default-src 'none'/);assert.match(await response.text(),/Catalog field guide/);assert.equal((await handleApiRequest(new Request('https://catalog.test/api/help/fields',{method:'POST'}),verifier)).status,405);}
 const none:IdentityVerifier={verify:async()=>null};assert.equal((await handleApiRequest(new Request('https://catalog.test/api/help/fields'),none)).status,401);
});
