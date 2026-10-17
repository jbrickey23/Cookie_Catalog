import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {stageCatalog,validateManifest} from '../stage-catalog.mjs';
function fixture(){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'catalog-staging-雪-')),source=path.join(dir,'source files');fs.mkdirSync(source);
  fs.writeFileSync(path.join(source,'cutter.png'),'synthetic photo bytes');
  const manifest={format:'cookie-catalog-staging',version:1,sourceNamespace:'stable-demo',items:[{sourceKey:'notebook/page#physical',kind:'physical_cutter',name:'TEST Tree',source:{pageId:'page-1',pageTitle:'Tree'},facts:{widthMm:90,heightMm:100},files:[{path:'cutter.png',purpose:'cutter_photo'}],reviews:{}}]};
  const input=path.join(dir,'manifest.json');
  const write=()=>fs.writeFileSync(input,JSON.stringify(manifest));write();
  return {dir,source,manifest,input,write,output:n=>path.join(dir,n),cleanup:()=>fs.rmSync(dir,{recursive:true,force:true})};
}
const report=(dir)=>JSON.parse(fs.readFileSync(path.join(dir,'review.json'),'utf8'));
test('stages Unicode/space paths, preserves originals and source references without false verification',()=>{
  const f=fixture();try{
    const before=fs.readFileSync(path.join(f.source,'cutter.png'));
    const result=stageCatalog(f.input,f.source,f.output('review'));
    assert.equal(result.liveWrites,false);assert.equal(result.summary.items,1);
    const item=report(f.output('review')).items[0];
    assert.equal(item.source.pageId,'page-1');assert.equal(item.kind,'physical_cutter');
    assert.equal(item.checks.find(c=>c.field==='dimensions').state,'needs_verification');
    assert.equal(item.checks.find(c=>c.field==='photo').state,'needs_verification');
    assert.equal(item.checks.find(c=>c.field==='scale_photo').state,'unknown');
    assert.deepEqual(fs.readFileSync(path.join(f.output('review'),item.files[0].stored)),before);
    assert.deepEqual(fs.readFileSync(path.join(f.source,'cutter.png')),before);
    assert.throws(()=>stageCatalog(f.input,f.source,f.output('review')),/already exists/);
  }finally{f.cleanup();}
});
test('reruns reconcile stable identity, changed/new/absent records and duplicate candidates without merging',()=>{
  const f=fixture();try{
    stageCatalog(f.input,f.source,f.output('first'));const first=report(f.output('first'));
    stageCatalog(f.input,f.source,f.output('again'),path.join(f.output('first'),'review.json'));
    assert.equal(report(f.output('again')).items[0].change,'unchanged');
    f.manifest.items[0].facts.location='Test bin';
    f.manifest.items.push({...structuredClone(f.manifest.items[0]),sourceKey:'different-page#physical',kind:'printable_asset'});f.write();
    stageCatalog(f.input,f.source,f.output('second'),path.join(f.output('first'),'review.json'));
    const second=report(f.output('second'));assert.equal(second.items[0].id,first.items[0].id);assert.deepEqual(second.items.map(i=>i.change),['changed','new']);
    assert.equal(second.items[0].duplicateCandidates.length,1);assert.equal(second.items.length,2);
    assert.ok(!second.items[1].checks.some(c=>c.field==='location'));
    f.manifest.items.shift();f.write();
    stageCatalog(f.input,f.source,f.output('third'),path.join(f.output('second'),'review.json'));
    assert.deepEqual(report(f.output('third')).absentFromInput,[first.items[0].id]);
  }finally{f.cleanup();}
});
test('missing, traversal, symlink and checksum-mismatched sources are quarantined and cannot count as photos',()=>{
  const f=fixture();try{
    fs.symlinkSync(path.join(f.source,'cutter.png'),path.join(f.source,'linked.png'));
    f.manifest.items[0].files=[{path:'missing.png',purpose:'cutter_photo'},{path:'../outside',purpose:'cutter_photo'},{path:'linked.png',purpose:'cutter_photo'},{path:'cutter.png',purpose:'cutter_photo',sha256:'a'.repeat(64)}];f.write();
    stageCatalog(f.input,f.source,f.output('issues'));
    const item=report(f.output('issues')).items[0];assert.equal(item.files.length,0);assert.equal(item.issues.length,4);
    assert.equal(item.checks.find(c=>c.field==='photo').state,'unknown');
  }finally{f.cleanup();}
});
test('complete requires valid per-field evidence; not-applicable requires a reason and cannot waive source',()=>{
  const f=fixture();try{
    f.manifest.items[0].reviews={dimensions:{state:'complete'}};f.write();assert.throws(()=>stageCatalog(f.input,f.source,f.output('bad')),/evidence/);assert.ok(!fs.existsSync(f.output('bad')));
    f.manifest.items[0].reviews={dimensions:{state:'complete',evidence:{reference:'unscaled photo',method:'visual_review'}},location:{state:'not_applicable',note:'Reviewed owner exception'}};f.write();
    stageCatalog(f.input,f.source,f.output('wrong-method'));const item=report(f.output('wrong-method')).items[0];assert.match(item.issues[0],/complete claim/);assert.notEqual(item.checks.find(c=>c.field==='dimensions').state,'complete');
    f.manifest.items[0].reviews.dimensions.evidence.method='measured';f.write();stageCatalog(f.input,f.source,f.output('measured'));assert.equal(report(f.output('measured')).items[0].checks.find(c=>c.field==='dimensions').state,'complete');
    f.manifest.items[0].reviews.source={state:'not_applicable',note:'ignored'};assert.throws(()=>validateManifest(f.manifest),/Not-applicable/);
  }finally{f.cleanup();}
});
test('unsafe or ambiguous manifests fail before creating output',()=>{
  const f=fixture();try{
    f.manifest.items.push(structuredClone(f.manifest.items[0]));assert.throws(()=>validateManifest(f.manifest),/duplicate/);f.manifest.items.pop();
    f.manifest.items[0].source.url='javascript:alert(1)';assert.throws(()=>validateManifest(f.manifest),/URL/);delete f.manifest.items[0].source.url;
    f.manifest.items[0].facts.widthMm=-1;assert.throws(()=>validateManifest(f.manifest),/facts/);
  }finally{f.cleanup();}
});
test('private reports refuse git destinations, nested source output and cross-namespace baselines',()=>{
  const f=fixture();try{
    fs.mkdirSync(f.output('repository'));fs.mkdirSync(path.join(f.output('repository'),'.git'));
    assert.throws(()=>stageCatalog(f.input,f.source,path.join(f.output('repository'),'report')),/outside git/);
    assert.throws(()=>stageCatalog(f.input,f.source,path.join(f.source,'report')),/outside the source/);
    stageCatalog(f.input,f.source,f.output('first'));f.manifest.sourceNamespace='different';f.write();
    assert.throws(()=>stageCatalog(f.input,f.source,f.output('second'),path.join(f.output('first'),'review.json')),/same namespace/);
  }finally{f.cleanup();}
});
test('HTML report escapes source text and cannot execute imported markup or load remote resources',()=>{
  const f=fixture();try{
    f.manifest.items[0].name='<script>alert(1)</script>';f.write();stageCatalog(f.input,f.source,f.output('report'));
    const html=fs.readFileSync(path.join(f.output('report'),'review.html'),'utf8');assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script/);assert.match(html,/default-src 'none'/);
  }finally{f.cleanup();}
});

test('HTML audit output feeds staging and retains raw source/hash while classification stays reviewable',()=>{
  const f=fixture();try{
    fs.writeFileSync(path.join(f.source,'page.html'),'<html><title>TEST Tree</title><p>size unknown</p><img src="cutter.png"></html>');
    const audit=f.output('audit');
    execFileSync('python3',[fileURLToPath(new URL('../audit-onenote-html.py',import.meta.url)),f.source,audit,'--namespace','stable-html-demo']);
    stageCatalog(path.join(audit,'manifest.json'),f.source,f.output('initial'));
    const initial=report(f.output('initial'));assert.equal(initial.items[0].kind,'unclassified');assert.equal(initial.items[0].files.length,2);
    const manifest=JSON.parse(fs.readFileSync(path.join(audit,'manifest.json')));manifest.items[0].kind='physical_cutter';manifest.items[0].files.find(file=>file.path==='cutter.png').purpose='cutter_photo';
    fs.writeFileSync(f.input,JSON.stringify(manifest));stageCatalog(f.input,f.source,f.output('reviewed'),path.join(f.output('initial'),'review.json'));
    const item=report(f.output('reviewed')).items[0];assert.equal(item.id,initial.items[0].id);assert.equal(item.change,'changed');assert.equal(item.checks.find(c=>c.field==='dimensions').state,'unknown');assert.equal(item.checks.find(c=>c.field==='photo').state,'needs_verification');
    assert.ok(item.files.find(file=>file.purpose==='source_page').sha256);
  }finally{f.cleanup();}
});
