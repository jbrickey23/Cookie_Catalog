import assert from 'node:assert/strict';
import {test} from 'node:test';
import {suggestion,classify,type QuickContext} from '../src/quick-classification';
import {validateManifest,type StagingItem} from '../src/staging.mjs';
const item=(patch:Partial<StagingItem>={}):StagingItem=>({sourceKey:'test',kind:'unclassified',name:'TEST tree',source:{pageId:'page',sectionPath:'Bin 001'},...patch});
const context=(patch:Partial<QuickContext>={}):QuickContext=>({sourceKey:'test',shapeId:'shape',imageId:null,reviewState:'',evidence:'Mentions STL',imported:false,ambiguous:false,...patch});
test('source suggestions distinguish digital references from physical ownership and preserve measurements and files',()=>{
 const i=item({facts:{widthMm:50},files:[{path:'tree.png',purpose:'source_page'}]});
 assert.equal(suggestion(i,context()).value,'both');assert.equal(i.catalog,undefined);
 const result=classify(i,'both',context());assert.equal(result.kind,'physical_cutter');assert.equal(result.catalog?.ownership,'owned');assert.equal(result.catalog?.quantity,undefined);assert.equal(result.facts?.widthMm,50);assert.equal(result.facts?.heightMm,undefined);assert.deepEqual(result.files,i.files);
 validateManifest({format:'cookie-catalog-staging',version:1,sourceNamespace:'TEST',items:[result]});
 const digital=classify(i,'digital',context());assert.equal(digital.kind,'printable_asset');assert.equal(digital.catalog?.ownership,undefined);assert(!digital.files?.some(f=>f.purpose==='printable_original'));
});
test('negative print/purchase evidence overrides bin suggestions; only explicit detailed correction unblocks physical classification',()=>{
 for(const reviewState of ['not_printed','not_owned']){
  const c=context({reviewState});assert.equal(suggestion(item(),c).value,'digital');assert.throws(()=>classify(item(),'physical',c),/Correct/);
  assert.equal(classify(item(),'digital',c).catalog?.ownership,undefined);
  assert.equal(classify(item({catalog:{ownership:'owned',printStatus:'printed'}}),'both',c).kind,'physical_cutter');
 }
 assert.equal(suggestion(item({source:{pageId:'x'}})).value,null);
});
test('sets, multiple sizes, designs and duplicate source shapes require individual review without invented quantities',()=>{
 for(const i of [item({name:'TEST set of trees'}),item({name:'TEST multiple sizes'}),item({kind:'design'})])assert.throws(()=>classify(i,'both',context()),/individually/);
 assert.throws(()=>classify(item(),'physical',context({ambiguous:true})),/individually/);
 assert.throws(()=>validateManifest({format:'cookie-catalog-staging',version:1,sourceNamespace:'TEST',items:[item({catalog:{sourceClassification:'invalid' as any}})]}),/Invalid ownership/);
});
