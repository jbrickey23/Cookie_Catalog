import assert from 'node:assert/strict';
import {test,beforeEach} from 'node:test';
import React from 'react';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://catalog.test'});
Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,Node:dom.window.Node,MutationObserver:dom.window.MutationObserver,IS_REACT_ACT_ENVIRONMENT:true,requestAnimationFrame:(fn:()=>void)=>{fn();return 0;}});
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
const {render,screen,fireEvent,waitFor,within,cleanup,act}=await import('@testing-library/react');
const {Browse}=await import('../src/Browse');
const items=['a','b'].map(id=>({id,shape_id:id,name:'TEST '+id,maker:'Producer '+id,image_id:null,image_name:null,inventory_count:0,inventory:[]}));
const entry=(id:string)=>({shape:{id,name:'TEST '+id,maker:'Producer '+id,source_url:'',notes:''},cutter:null,tags:[],revision:'"r1"'});
let requests:string[]=[];
beforeEach(()=>{window.history.replaceState(null,'','/');window.scrollTo=()=>{};window.confirm=()=>true;requests=[];});
const original=globalThis.fetch;
function fixtures(){globalThis.fetch=async(input,init)=>{const path=String(input);requests.push((init?.method??'GET')+' '+path);if(path.startsWith('/api/browse'))return Response.json({items,total:48,nextOffset:24});if(path.includes('/attachments'))return Response.json({attachments:[]});if(path.endsWith('/inventory'))return Response.json({items:[]});if(path.endsWith('/vocabulary'))return Response.json({shapes:[],tags:[],locations:[]});return Response.json(entry(path.split('/').at(-1)!));};}
const open=async(id:string)=>{fireEvent.click(await screen.findByRole('link',{name:'Open design details for TEST '+id+' — Producer '+id}));await screen.findByRole('region',{name:'Viewing TEST '+id});};
const move=async(delta:number)=>{await act(async()=>{window.history.go(delta);await new Promise(r=>setTimeout(r,20));});};

test('native Back and Forward restore results, query/filter/page/position and design without writes or duplicate entries',async()=>{
 fixtures();try{
  render(React.createElement(Browse,{canEdit:true}));await screen.findByRole('link',{name:/Open design details for TEST a/});
  fireEvent.change(screen.getByLabelText('Search by name, bin or tag'),{target:{value:'TEST'}});fireEvent.click(screen.getByRole('button',{name:'Search'}));await waitFor(()=>assert(!screen.queryByText('Loading designs…')));
  fireEvent.change(screen.getByLabelText('Ownership filter'),{target:{value:'saved'}});await waitFor(()=>assert(!screen.queryByText('Loading designs…')));
  fireEvent.click(screen.getByRole('button',{name:'Next page'}));await screen.findByText('Showing 25–26 of 48 designs.');
  const results=screen.getByLabelText('Catalog results');results.scrollTop=140;let restored=-1;results.scrollTo=({top}:any)=>{restored=top;};
  const before=window.history.length;await open('a');assert.equal(window.location.search,'?design=a');assert.equal(window.history.length,before+1);
  await move(-1);await waitFor(()=>assert(!screen.queryByRole('region',{name:'Viewing TEST a'})));assert.equal(window.location.search,'');assert.equal((screen.getByLabelText('Search by name, bin or tag') as HTMLInputElement).value,'TEST');assert.equal((screen.getByLabelText('Ownership filter') as HTMLSelectElement).value,'saved');assert(screen.getByText('Showing 25–26 of 48 designs.'));assert.equal(restored,140);assert.equal(document.activeElement?.id,'view-a');
  await move(1);await screen.findByRole('region',{name:'Viewing TEST a'});assert.equal(window.history.length,before+1);
  fireEvent.click(screen.getByRole('button',{name:'Back to results'}));await waitFor(()=>assert(!screen.queryByRole('region',{name:'Viewing TEST a'})));await move(1);await screen.findByRole('region',{name:'Viewing TEST a'});
  assert.equal(requests.filter(p=>!p.startsWith('GET ')).length,0);
 }finally{cleanup();globalThis.fetch=original;}
});

test('native history protects dirty drafts and busy saves, restores the declined URL, and permits explicit discard',async()=>{
 fixtures();let accept=false,confirms=0;window.confirm=()=>{confirms++;return accept;};
 try{
  render(React.createElement(Browse,{canEdit:true}));await open('a');const detail=screen.getByRole('region',{name:'Viewing TEST a'});fireEvent.click(await within(detail).findByRole('button',{name:'Change Name'}));fireEvent.change(within(detail).getByLabelText('Name *'),{target:{value:'TEST unsaved'}});
  await move(-1);await waitFor(()=>assert.equal(window.location.search,'?design=a'));assert.equal(confirms,1);assert.equal((within(detail).getByLabelText('Name *') as HTMLInputElement).value,'TEST unsaved');
  accept=true;await move(-1);await waitFor(()=>assert(!screen.queryByRole('region',{name:'Viewing TEST a'})));assert.equal(confirms,2);
  const card=await screen.findByRole('region',{name:'Design details for TEST b'});fireEvent.click(within(card).getByRole('button',{name:'Change Notes'}));fireEvent.change(within(card).getByLabelText('Notes'),{target:{value:'TEST result draft'}});accept=false;await move(1);await waitFor(()=>assert.equal(window.location.search,''));assert.equal((within(card).getByLabelText('Notes') as HTMLTextAreaElement).value,'TEST result draft');accept=true;
  await move(1);await screen.findByRole('region',{name:'Viewing TEST a'});const beforeBusy=confirms;
  const again=screen.getByRole('region',{name:'Viewing TEST a'});assert(within(again).getByRole('button',{name:'Change Name'}));fireEvent.click(within(again).getByRole('button',{name:'Change Name'}));fireEvent.change(within(again).getByLabelText('Name *'),{target:{value:'TEST saving'}});
  let resolveSave!:(value:Response)=>void;const reads=globalThis.fetch;globalThis.fetch=async(input,init)=>init?.method==='PUT'?await new Promise<Response>(r=>{resolveSave=r;}):reads(input,init);
  fireEvent.click(within(again).getByRole('button',{name:'Save changes'}));await waitFor(()=>assert(!!resolveSave));await move(-1);await waitFor(()=>assert.equal(window.location.search,'?design=a'));assert.equal(confirms,beforeBusy,'busy save cannot be discarded');assert(within(again).getByText('Saving changes…'));
  await act(async()=>resolveSave(Response.json({...entry('a'),shape:{...entry('a').shape,name:'TEST saving'},revision:'"r2"'})));await screen.findByText('Saved. Viewing the persisted record.');await move(-1);await waitFor(()=>assert(!screen.queryByRole('region',{name:/Viewing TEST/})));
 }finally{cleanup();globalThis.fetch=original;}
});

test('successive design visits and Back/Forward and return-to-results use the same history, with listeners removed on unmount',async()=>{
 fixtures();try{
  render(React.createElement(Browse));await open('a');assert.equal(screen.queryByRole('link',{name:/Open design details for TEST b/}),null);await move(-1);await open('b');assert.equal(window.location.search,'?design=b');await move(-1);await screen.findByRole('link',{name:/Open design details for TEST a/});await move(1);await screen.findByRole('region',{name:'Viewing TEST b'});
  fireEvent.click(screen.getByRole('button',{name:'Back to results'}));await waitFor(()=>assert(!screen.queryByRole('region',{name:/Viewing TEST/})));assert.equal(window.location.search,'');
  cleanup();const n=requests.length;await move(1);assert.equal(requests.length,n,'unmounted history listener does not fetch or render');
 }finally{cleanup();globalThis.fetch=original;}
});

test('direct links close safely; remount restores the history snapshot; late link reads cannot reopen after Back',async()=>{
 fixtures();try{
  window.history.replaceState(null,'','/?design=a');render(React.createElement(Browse));await screen.findByRole('region',{name:'Viewing TEST a'});fireEvent.click(screen.getByRole('button',{name:'Back to results'}));await waitFor(()=>assert(!screen.queryByRole('region',{name:'Viewing TEST a'})));assert.equal(window.location.search,'');
  await open('b');cleanup();const reads=globalThis.fetch,replies:((value:Response)=>void)[]=[];globalThis.fetch=async(input,init)=>String(input)==='/api/workspace/shapes/b'?await new Promise<Response>(r=>replies.push(r)):reads(input,init);
  render(React.createElement(Browse));await screen.findByRole('region',{name:'Viewing TEST b'});await waitFor(()=>assert(replies.length>0));await move(-1);await waitFor(()=>assert(!screen.queryByRole('region',{name:/Viewing TEST/})));assert.equal(window.location.search,'');await act(async()=>{for(const reply of replies)reply(Response.json(entry('b')));});assert(!screen.queryByRole('region',{name:/Viewing TEST/}));
 }finally{cleanup();globalThis.fetch=original;}
});

test('BIN links discard incompatible search filters and Back restores the original results',async()=>{
 fixtures();const read=globalThis.fetch;const lookups:string[]=[];
 globalThis.fetch=async(input,init)=>{
  const path=String(input);
  if(path.startsWith('/api/workspace/inventory?')){lookups.push(path);return Response.json({items:['a','b'].map(id=>({id:'c'+id,shape_id:id,name:'TEST '+id,quantity:1,location:'Bin 2'}))});}
  if(path.startsWith('/api/browse'))return Response.json({items:[{...items[0],inventory_count:1,inventory:[{id:'ca',name:'TEST a',location:'Bin 2',quantity:1}]}],total:1,nextOffset:null});
  return read(input,init);
 };
 try{
  render(React.createElement(Browse));await screen.findByRole('link',{name:'Show all cutters in Bin 2'});
  fireEvent.change(screen.getByLabelText('Search by name, bin or tag'),{target:{value:'TEST a'}});fireEvent.click(screen.getByRole('button',{name:'Search'}));
  fireEvent.click(await screen.findByRole('link',{name:'Show all cutters in Bin 2'}));
  const results=await screen.findByRole('region',{name:'Inventory in Bin 2'});assert((await within(results).findByRole('link',{name:'TEST b'})).getAttribute('href')==='/?design=b&cutter=cb');
  assert.equal(lookups[0],'/api/workspace/inventory?bin=Bin%202');assert.equal(new URLSearchParams(window.location.search).get('bin'),'Bin 2');
  await move(-1);await screen.findByRole('link',{name:'Show all cutters in Bin 2'});assert.equal((screen.getByLabelText('Search by name, bin or tag') as HTMLInputElement).value,'TEST a');
 }finally{cleanup();globalThis.fetch=original;}
});
