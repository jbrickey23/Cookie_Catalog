import assert from 'node:assert/strict';
import {test} from 'node:test';
import React from 'react';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://catalog.example.test'});
Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,Node:dom.window.Node,MutationObserver:dom.window.MutationObserver,IS_REACT_ACT_ENVIRONMENT:true,requestAnimationFrame:(fn:()=>void)=>{fn();return 0;}});
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
const {render,screen,fireEvent,waitFor,within,cleanup,act}=await import('@testing-library/react');
const {WorkspaceFrame}=await import('../src/WorkspaceFrame');
const {FieldHelp,HELP_HOVER_MS}=await import('../src/FieldHelp');
const {Browse,ownershipLabel}=await import('../src/Browse');
const {EntryEditor}=await import('../src/EntryEditor');
const vocabulary={shapes:[{id:'s1',name:'TEST Tree',maker:'Producer A'},{id:'s2',name:'TEST Tree',maker:'Producer B'}],tags:[],locations:[{id:'b',label:'TEST Bin'}]};
const reference={shape:{id:'s1',name:'TEST Tree',maker:'Producer A',source_url:'',notes:''},cutter:null,tags:[],revision:'"r1"'};
const physical={...reference,cutter:{id:'c1',shape_id:'s1',quantity:2,origin:'unknown',location_id:'b',width_mm:null,height_mm:null,reference_size_mm:76.2,slot:'',notes:''}};
const props={kind:'cutters' as const,guided:true,canEdit:true,canDelete:false,onDirty:()=>{},onSaved:()=>{},onDeleted:()=>{}};

// No elapsed real sleeps: validate the entire dwell boundary and cancellation deterministically.
test('help waits 1500 ms, cancels transit/Escape/context/unmount and supports immediate focus/click',t=>{
 t.mock.timers.enable({apis:['setTimeout']});
 try {
  const view=render(React.createElement(FieldHelp,{field:'Slot'},'Slot'));
  const trigger=()=>screen.getByRole('link',{name:/Help for/});
  const wrapper=()=>trigger().closest('.field-help-label')!;
  fireEvent.mouseEnter(wrapper());act(()=>t.mock.timers.tick(HELP_HOVER_MS-1));assert.equal(screen.queryByRole('note'),null);
  fireEvent.mouseLeave(wrapper());act(()=>t.mock.timers.tick(1));assert.equal(screen.queryByRole('note'),null);
  fireEvent.mouseEnter(wrapper());act(()=>t.mock.timers.tick(HELP_HOVER_MS));assert(screen.getByRole('note'));assert.equal(screen.getByRole('link',{name:'Full documentation'}).getAttribute('href'),'/api/help/fields#slot');
  fireEvent.keyDown(trigger(),{key:'Escape'});assert.equal(screen.queryByRole('note'),null);
  fireEvent.mouseEnter(wrapper());fireEvent.keyDown(trigger(),{key:'Escape'});act(()=>t.mock.timers.tick(HELP_HOVER_MS));assert.equal(screen.queryByRole('note'),null);
  fireEvent.focus(trigger());assert(screen.getByRole('note'));fireEvent.keyDown(trigger(),{key:'Escape'});
  fireEvent.click(trigger());assert(screen.getByRole('note'));act(()=>window.dispatchEvent(new window.Event('catalog-context-change')));assert.equal(screen.queryByRole('note'),null);
  fireEvent.mouseEnter(wrapper());view.rerender(React.createElement(FieldHelp,{field:'Name'},'Name'));act(()=>t.mock.timers.tick(HELP_HOVER_MS));assert.equal(screen.queryByRole('note'),null);
  fireEvent.mouseEnter(wrapper());act(()=>window.dispatchEvent(new window.Event('catalog-context-change')));act(()=>t.mock.timers.tick(HELP_HOVER_MS));assert.equal(screen.queryByRole('note'),null);
  fireEvent.mouseEnter(wrapper());view.unmount();act(()=>t.mock.timers.tick(HELP_HOVER_MS));assert.equal(screen.queryByRole('note'),null);
 } finally {cleanup();t.mock.timers.reset();}
});

test('workspace navigation keeps draft DOM and busy controls mounted; diagnostics retains owner boundary',()=>{
 try {
  const view=render(React.createElement(WorkspaceFrame,{role:'owner',catalog:React.createElement('label',{},'Draft',React.createElement('input',{defaultValue:'', 'aria-label':'Draft'})),administration:React.createElement('button',{},'Review backup status'),diagnostics:React.createElement('button',{},'Technical check')}));
  const input=screen.getByLabelText('Draft');fireEvent.change(input,{target:{value:'Keep me'}});
  assert.equal(screen.queryByRole('button',{name:'Review backup status'}),null);
  fireEvent.click(screen.getByRole('button',{name:'Administration'}));assert(screen.getByRole('button',{name:'Review backup status'}));assert.equal(screen.queryByRole('textbox',{name:'Draft'}),null);
  fireEvent.click(screen.getByRole('button',{name:'Return to catalog'}));assert.equal(screen.getByLabelText('Draft'),input);assert.equal((input as HTMLInputElement).value,'Keep me');
  view.rerender(React.createElement(WorkspaceFrame,{role:'viewer',catalog:'Read only catalog',administration:'Read only details',diagnostics:'Secret'}));assert.equal(screen.queryByRole('button',{name:'Development & Diagnostics'}),null);assert.equal(screen.queryByText('Secret'),null);
 } finally {cleanup();}
});

test('unified Search routes ownership filters and guards a dirty Add draft on task change',async()=>{
 const old=globalThis.fetch,confirm=window.confirm;let accept=false;const reads:string[]=[];window.confirm=()=>accept;
 globalThis.fetch=async input=>{const path=String(input);reads.push(path);return Response.json(path.startsWith('/api/browse')?{items:[],total:0,nextOffset:null}:path.endsWith('/vocabulary')?vocabulary:reference);};
 try {
  render(React.createElement(Browse,{contextual:true,canEdit:true}));assert(screen.getByRole('heading',{name:'Search your catalog'}));assert.equal(screen.queryByRole('button',{name:'My Cutters'}),null);
  fireEvent.change(screen.getByLabelText('Ownership filter'),{target:{value:'owned'}});await waitFor(()=>assert(reads.some(p=>p.endsWith('ownership=owned'))));
  fireEvent.click(screen.getByRole('button',{name:'Add Something',exact:true}));fireEvent.click(screen.getByRole('button',{name:'I have a cutter'}));await screen.findByLabelText('Find an existing producer design');assert.equal(screen.queryByRole('button',{name:'Save changes'}),null);
  fireEvent.click(screen.getByRole('button',{name:'Create a new design'}));fireEvent.change(screen.getByLabelText('Name *'),{target:{value:'TEST retained'}});
  const searchTask=within(screen.getByRole('navigation',{name:'Catalog tasks'})).getByRole('button',{name:'Search',exact:true});fireEvent.click(searchTask);assert.equal((screen.getByLabelText('Name *') as HTMLInputElement).value,'TEST retained');
  accept=true;fireEvent.click(searchTask);await waitFor(()=>assert.equal(screen.queryByRole('button',{name:'Save changes'}),null));
 }finally{cleanup();globalThis.fetch=old;window.confirm=confirm;}
});

test('guided existing selection distinguishes producers and saves only physical details using the existing guarded API',async()=>{
 const old=globalThis.fetch;const writes:any[]=[];let result:any;
 globalThis.fetch=async(input,init)=>{if(init?.method==='POST'){writes.push({path:String(input),body:JSON.parse(String(init.body))});return Response.json(physical);}return Response.json(String(input).endsWith('/vocabulary')?vocabulary:reference);};
 try{
  render(React.createElement(EntryEditor,{...props,onSaved:entry=>{result=entry;}}));await screen.findByLabelText('Find an existing producer design');
  fireEvent.change(screen.getByLabelText('Find an existing producer design'),{target:{value:'Tree'}});assert(screen.getByRole('button',{name:'Use TEST Tree — Producer A'}));assert(screen.getByRole('button',{name:'Use TEST Tree — Producer B'}));
  fireEvent.click(screen.getByRole('button',{name:'Use TEST Tree — Producer A'}));await screen.findByRole('group',{name:'Selected producer design (read-only)'});assert.equal(screen.queryByLabelText('Name *'),null);
  fireEvent.change(screen.getByLabelText('Quantity *'),{target:{value:'2'}});fireEvent.click(screen.getByRole('button',{name:'Save changes'}));await waitFor(()=>assert(result));assert.equal(writes.length,1);assert.equal(writes[0].path,'/api/workspace/cutters');assert.equal(writes[0].body.existingShapeId,'s1');assert.equal(writes[0].body.shapeRevision,'"r1"');assert.equal(writes[0].body.cutter.quantity,2);
 }finally{cleanup();globalThis.fetch=old;}
});

test('guided design-only creation reveals collapsed invalid URL and opens persisted design without inventory',async()=>{
 const old=globalThis.fetch;let saved:any;const writes:any[]=[];
 globalThis.fetch=async(input,init)=>{if(init?.method==='POST'){writes.push(JSON.parse(String(init.body)));return Response.json(reference);}return Response.json(String(input).endsWith('/vocabulary')?vocabulary:reference);};
 try{
  render(React.createElement(EntryEditor,{...props,kind:'shapes',onSaved:entry=>{saved=entry;}}));await screen.findByRole('button',{name:'Create a new design'});fireEvent.click(screen.getByRole('button',{name:'Create a new design'}));
  fireEvent.change(screen.getByLabelText('Name *'),{target:{value:'TEST Tree'}});const source=screen.getByText('Source link and design notes').closest('details')!;fireEvent.click(screen.getByText('Source link and design notes'));source.open=true;fireEvent.change(screen.getByLabelText('Source link'),{target:{value:'example.test'}});source.open=false;fireEvent(source,new window.Event('toggle'));
  fireEvent.click(screen.getByRole('button',{name:'Save changes'}));await waitFor(()=>assert.equal(source.open,true));await waitFor(()=>assert.equal(document.activeElement,screen.getByLabelText('Source link')));assert.equal(writes.length,0);assert.equal((screen.getByLabelText('Name *') as HTMLInputElement).value,'TEST Tree');
  fireEvent.change(screen.getByLabelText('Source link'),{target:{value:'https://example.test'}});fireEvent.click(screen.getByRole('button',{name:'Save changes'}));await waitFor(()=>assert(saved));assert.equal(writes.length,1);assert.equal(writes[0].cutter,null);assert.equal(saved.cutter,null);
 }finally{cleanup();globalThis.fetch=old;}
});

test('existing design chosen for later opens without a duplicate POST',async()=>{
 const old=globalThis.fetch;let saved:any;const writes:string[]=[];globalThis.fetch=async(input,init)=>{if(init?.method==='POST')writes.push(String(input));return Response.json(String(input).endsWith('/vocabulary')?vocabulary:reference);};
 try{render(React.createElement(EntryEditor,{...props,kind:'shapes',onSaved:entry=>{saved=entry;}}));await screen.findByLabelText('Find an existing producer design');fireEvent.change(screen.getByLabelText('Find an existing producer design'),{target:{value:'Producer A'}});fireEvent.click(screen.getByRole('button',{name:'Use TEST Tree — Producer A'}));await waitFor(()=>assert(saved));assert.equal(saved.shape.id,'s1');assert.deepEqual(writes,[]);}finally{cleanup();globalThis.fetch=old;}
});

test('ownership labels rely on inventory evidence, preserve zero and review unknowns',()=>{
 const item:any={record_kind:'reference',inventory_count:0,image_id:'photo'};assert.equal(ownershipLabel(item),'Saved design');assert.equal(ownershipLabel({...item,inventory_count:2}),'In my collection');assert.equal(ownershipLabel({...item,inventory_count:undefined}),'Inventory status needs review');assert.equal(ownershipLabel({...item,inventory_count:1,record_kind:'physical',quantity:0}),'In my collection');assert.equal(ownershipLabel({...item,review_state:'set_review'}),'Inventory needs review');
});
