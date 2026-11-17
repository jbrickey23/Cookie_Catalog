import assert from 'node:assert/strict';
import {test} from 'node:test';
import React from 'react';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://catalog.test'});
Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,Node:dom.window.Node,MutationObserver:dom.window.MutationObserver,IS_REACT_ACT_ENVIRONMENT:true,requestAnimationFrame:(fn:()=>void)=>{fn();return 0;}});
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
const {render,screen,fireEvent,waitFor,cleanup}=await import('@testing-library/react');
const {CutterCard}=await import('../src/DesignCard');
const {EntryEditor}=await import('../src/EntryEditor');
const {WorkspaceFrame}=await import('../src/WorkspaceFrame');
const base={id:'s',shape_id:'s',name:'TEST Tree',maker:'TEST Producer',image_id:'ref',image_name:'cookie.png',images:[{id:'ref',filename:'cookie.png'}]};
test('zero/one/multiple inventory cards conditionally add or link exact cutters/BINs and preserve photo distinctions',async()=>{
 const old=globalThis.fetch;globalThis.fetch=async()=>Response.json({attachments:[{id:'ref',filename:'cookie.png',mediaType:'image/png',available:true,photoKind:'design'},{id:'physical',filename:'cutter.png',mediaType:'image/png',available:true,photoKind:'physical'}],nextOffset:null});
 let added=0,opened='';
 try{
  const view=render(React.createElement(CutterCard,{item:{...base,inventory_count:0,inventory:[]},catalogMode:true,onAdd:()=>added++}));fireEvent.click(screen.getByRole('button',{name:'Add Cutter'}));assert.equal(added,1);assert.equal(screen.queryByText('Saved design'),null);await screen.findByAltText('cookie.png');fireEvent.click(screen.getByRole('button',{name:'Next image'}));assert(screen.getByText(/Physical cutter photograph/));assert(screen.getByAltText('TEST Tree — design image'));
  view.rerender(React.createElement(CutterCard,{item:{...base,inventory_count:2,inventory:[{id:'medium',name:'TEST Medium',location:'TEST BIN 42',quantity:2},{id:'large',name:'TEST Large',location:'TEST BIN 43',quantity:1}]},catalogMode:true,onAdd:()=>added++,onCutterOpen:id=>opened=id}));assert.equal(screen.queryByRole('button',{name:'Add Cutter'}),null);assert.equal(screen.queryByRole('button',{name:/Edit|View TEST/}),null);const bin=screen.getByRole('link',{name:'TEST BIN 43'});assert.equal(bin.getAttribute('href'),'/?design=s&cutter=large');fireEvent.click(bin);assert.equal(opened,'large');fireEvent.click(screen.getByRole('link',{name:'TEST Medium'}));assert.equal(opened,'medium');
  view.rerender(React.createElement(CutterCard,{item:{...base,image_id:null,images:[],maker:'',inventory_count:1,inventory:[{id:'one',name:'TEST One',location:null,quantity:1}]},catalogMode:true,onCutterOpen:id=>opened=id}));assert(screen.getByText('No design image'));assert(screen.getByText('Producer: Not recorded'));assert(screen.getByRole('link',{name:'BIN not recorded'}));
 }finally{cleanup();globalThis.fetch=old;}
});
test('an unrelated physical edit preserves exact metric dimensions; fractional edits use existing guarded save',async()=>{
 const old=globalThis.fetch;let saved:any;const metric=64.1234567890123;
 const entry={shape:{id:'s',name:'TEST Tree',maker:'TEST Producer'},cutter:{id:'c',shape_id:'s',quantity:1,origin:'unknown',width_mm:metric,height_mm:76.2},tags:[],revision:'"opened"'};
 globalThis.fetch=async(input,init)=>{if(init?.method==='PUT'){saved=JSON.parse(String(init.body));assert.equal(new Headers(init.headers).get('if-match'),'"opened"');return Response.json({...entry,...saved,revision:'"next"'});}return Response.json(String(input).endsWith('/vocabulary')?{shapes:[],locations:[],tags:[]}:entry);};
 try{render(React.createElement(EntryEditor,{kind:'cutters',id:'c',canEdit:true,canDelete:true,onDirty:()=>{},onSaved:()=>{},onDeleted:()=>{}}));fireEvent.click(await screen.findByRole('button',{name:'Change Quantity'}));fireEvent.change(screen.getByLabelText('Quantity *'),{target:{value:'2'}});fireEvent.click(screen.getByRole('button',{name:'Save changes'}));await waitFor(()=>assert(saved));assert.equal(saved.cutter.width_mm,metric);assert.equal(saved.cutter.height_mm,76.2);fireEvent.click(screen.getByRole('button',{name:'Change Width (inches)'}));fireEvent.change(screen.getByLabelText('Width (inches)'),{target:{value:'2 1/2'}});fireEvent.click(screen.getByRole('button',{name:'Save changes'}));await waitFor(()=>assert.equal(saved.cutter.width_mm,63.5));}finally{cleanup();globalThis.fetch=old;}
});
test('Owner catalog tools remain available without Admin navigation or technical panels',()=>{
 try{render(React.createElement(WorkspaceFrame,{role:'owner',catalog:'Catalog',administration:'Location management',diagnostics:'Secret diagnostics'}));assert.equal(screen.queryByRole('link',{name:'Admin'}),null);assert.equal(screen.queryByRole('button',{name:'Development & Diagnostics'}),null);fireEvent.click(screen.getByRole('button',{name:'Catalog tools'}));assert(screen.getByText('Location management'));assert.equal(screen.queryByText('Secret diagnostics'),null);}finally{cleanup();}
});
