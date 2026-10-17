import assert from 'node:assert/strict';
import {test} from 'node:test';
import {oneNoteBin,recordedLocation,sourceLocation} from '../src/source-location';
import {readiness} from '../src/readiness';
import {suggestion} from '../src/quick-classification';
test('OneNote bin assignment preserves identifiers and is independent of physical or digital status',()=>{
 assert.equal(oneNoteBin({sectionPath:'Cookie Catalog / Bin #001.pdf'}),'Bin 001');
 assert.equal(oneNoteBin({sectionPath:'Notebook / BIN-07b'}),'Bin 07B');
 assert.equal(oneNoteBin({sectionPath:'Bin 01 / Bin 02'}),null);
 assert.equal(oneNoteBin({sectionPath:'Christmas'}),null);
 assert.equal(recordedLocation({source:{pageId:'tree',sectionPath:'Bin 001'},facts:{location:'Moved to Bin 009'}}),'Moved to Bin 009');
 for(const kind of ['unclassified','printable_asset'] as const){
  const item={sourceKey:'tree',kind,name:'TEST tree',source:{pageId:'page',sectionPath:'Bin 001'}};
  assert.equal(recordedLocation(item),'Bin 001');assert.notEqual(suggestion(item).value,'physical');assert.notEqual(suggestion(item).value,'both');
 }
 assert.equal(sourceLocation(JSON.stringify([{source:{sectionPath:'Bin #001'}},{source:{sectionPath:'Bin 001'}}])),'Bin 001');
 assert.equal(sourceLocation(JSON.stringify([{source:{sectionPath:'Bin 001'}},{source:{sectionPath:'Bin 002'}}])),null);
 assert.equal(sourceLocation('not JSON'),null);
});
test('recorded locations need no repeated confirmation while unknown locations and dimensions remain separate',()=>{
 const item={id:'TEST',kind:'physical_cutter' as const,name:'Tree',facts:{location:'Bin 001',widthMm:50,heightMm:80},reviews:{location:{state:'needs_verification' as const}}};
 const checks=readiness(item).checks;
 assert.equal(checks.find(c=>c.field==='location')?.state,'complete');
 assert.equal(checks.find(c=>c.field==='dimensions')?.state,'needs_verification');
 assert.equal(readiness({...item,facts:{}}).checks.find(c=>c.field==='location')?.state,'unknown');
});
