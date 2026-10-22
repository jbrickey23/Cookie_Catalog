import assert from 'node:assert/strict';
import {test} from 'node:test';
import React from 'react';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://catalog.example.test'});
Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,Node:dom.window.Node,MutationObserver:dom.window.MutationObserver,IS_REACT_ACT_ENVIRONMENT:true});
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
const {render,screen,fireEvent,cleanup,act,within}=await import('@testing-library/react');
const {FieldHelp,HELP_HOVER_MS,HELP_TRANSIT_MS}=await import('../src/FieldHelp');
const {MasterDetailWorkspace}=await import('../src/MasterDetailWorkspace');
const help=()=>React.createElement(FieldHelp,{field:'Slot'},'Slot');
const trigger=()=>screen.getByRole('link',{name:'Help for Slot'});
const popup=()=>screen.queryByRole('note',{name:'Slot quick help'});

test('only the question mark starts dwell; early departure cancels; pointer popup closes with a bounded transit grace',t=>{
 t.mock.timers.enable({apis:['setTimeout']});
 try{
  render(help());fireEvent.mouseEnter(screen.getByText('Slot',{exact:true}));act(()=>t.mock.timers.tick(HELP_HOVER_MS));assert.equal(popup(),null);
  fireEvent.mouseEnter(trigger());act(()=>t.mock.timers.tick(1199));assert.equal(popup(),null);fireEvent.mouseLeave(trigger());act(()=>t.mock.timers.tick(2000));assert.equal(popup(),null);
  fireEvent.mouseEnter(trigger());act(()=>t.mock.timers.tick(1200));assert(popup());
  fireEvent.mouseLeave(trigger());act(()=>t.mock.timers.tick(HELP_TRANSIT_MS-1));assert(popup());fireEvent.mouseEnter(popup()!);act(()=>t.mock.timers.tick(1));assert(popup());
  fireEvent.mouseLeave(popup()!);act(()=>t.mock.timers.tick(HELP_TRANSIT_MS));assert.equal(popup(),null);act(()=>t.mock.timers.tick(2000));assert.equal(popup(),null);
 }finally{cleanup();t.mock.timers.reset();}
});

test('focus/click open immediately, links retain access, focus departure/outside click/Escape close without reopening',()=>{
 try{
  render(React.createElement('div',{},help(),React.createElement('button',{},'Elsewhere')));
  act(()=>trigger().focus());assert(popup());fireEvent.keyDown(trigger(),{key:'Tab'});assert.equal(document.activeElement,within(popup()!).getByRole('button',{name:'Close help'}));fireEvent.keyDown(document.activeElement!,{key:'Tab',shiftKey:true});assert.equal(document.activeElement,trigger());assert(popup());const full=within(popup()!).getByRole('link',{name:'Full documentation'});act(()=>full.focus());assert(popup());assert.equal(full.getAttribute('href'),'/api/help/fields#slot');assert.equal(full.getAttribute('target'),'_blank');
  fireEvent.keyDown(full,{key:'Escape'});assert.equal(popup(),null);assert.equal(document.activeElement,trigger());
  fireEvent.click(trigger());assert(popup());act(()=>screen.getByRole('button',{name:'Elsewhere'}).focus());assert.equal(popup(),null);
  fireEvent.click(trigger());assert(popup());fireEvent.pointerDown(screen.getByRole('button',{name:'Elsewhere'}));assert.equal(popup(),null);
  fireEvent.click(trigger());const close=within(popup()!).getByRole('button',{name:'Close help'});act(()=>close.focus());fireEvent.click(close);assert.equal(popup(),null);assert.equal(document.activeElement,trigger());
 }finally{cleanup();}
});

test('focus leaving during dwell cancels delayed reopening, including context change and unmount',t=>{
 t.mock.timers.enable({apis:['setTimeout']});
 try{
  const view=render(help());fireEvent.mouseEnter(trigger());fireEvent.blur(trigger(),{relatedTarget:document.body});act(()=>t.mock.timers.tick(2000));assert.equal(popup(),null);
  fireEvent.mouseEnter(trigger());act(()=>window.dispatchEvent(new window.Event('catalog-context-change')));act(()=>t.mock.timers.tick(2000));assert.equal(popup(),null);
  fireEvent.mouseEnter(trigger());view.rerender(React.createElement(FieldHelp,{field:'Name'},'Name'));act(()=>t.mock.timers.tick(2000));assert.equal(screen.queryByRole('note'),null);
  fireEvent.mouseEnter(screen.getByRole('link',{name:'Help for Name'}));view.unmount();act(()=>t.mock.timers.tick(2000));assert.equal(screen.queryByRole('note'),null);
 }finally{cleanup();t.mock.timers.reset();}
});

test('dismissal and positioning listeners exist only while open and are removed on context change/unmount',t=>{
 const active=new Set<EventListenerOrEventListenerObject>(),add=document.addEventListener.bind(document),remove=document.removeEventListener.bind(document);
 t.mock.method(document,'addEventListener',(type:any,listener:any,options:any)=>{if(['pointerdown','focusin','keydown'].includes(type)&&options===true)active.add(listener);add(type,listener,options);});
 t.mock.method(document,'removeEventListener',(type:any,listener:any,options:any)=>{active.delete(listener);remove(type,listener,options);});
 try{
  const view=render(help());assert.equal(active.size,0);fireEvent.click(trigger());assert.equal(active.size,2); // outside shared by pointerdown/focusin; Escape is separate
  fireEvent.pointerDown(document.body);assert.equal(active.size,0);fireEvent.click(trigger());assert.equal(active.size,2);
  act(()=>window.dispatchEvent(new window.Event('catalog-context-change')));assert.equal(active.size,0);fireEvent.click(trigger());view.unmount();assert.equal(active.size,0);
 }finally{cleanup();t.mock.restoreAll();}
});

test('portal placement clamps to narrow viewport, flips above the trigger and leaves workspace structure unchanged',t=>{
 t.mock.method(HTMLElement.prototype,'getBoundingClientRect',function(this:HTMLElement){return (this.classList.contains('field-help-trigger')?{left:window.innerWidth-40,right:window.innerWidth-20,top:window.innerHeight-60,bottom:window.innerHeight-40,width:20,height:20}:{left:0,top:0,right:304,bottom:220,width:304,height:220}) as DOMRect;});
 const oldWidth=window.innerWidth,oldHeight=window.innerHeight;
 try{
  const view=render(React.createElement(MasterDetailWorkspace,{detail:help(),detailKey:'test'},React.createElement('button',{},'Result')));const workspace=view.container.querySelector('.browse-workspace')!,structure=Array.from(workspace.children);
  fireEvent.click(trigger());assert.equal(popup()!.parentElement,document.body);assert.equal((popup()! as HTMLElement).style.left,'712px');assert.equal((popup()! as HTMLElement).style.top,'482px');assert.equal(workspace.className,'browse-workspace expanded');assert.deepEqual(Array.from(workspace.children),structure);
  Object.defineProperty(window,'innerWidth',{configurable:true,value:320});Object.defineProperty(window,'innerHeight',{configurable:true,value:200});act(()=>window.dispatchEvent(new window.Event('resize')));
  assert.equal((popup()! as HTMLElement).style.left,'8px');assert.equal((popup()! as HTMLElement).style.top,'8px');assert.equal((popup()! as HTMLElement).style.maxHeight,'126px');
  fireEvent.keyDown(trigger(),{key:'Escape'});assert.deepEqual(Array.from(workspace.children),structure);
 }finally{cleanup();Object.defineProperty(window,'innerWidth',{configurable:true,value:oldWidth});Object.defineProperty(window,'innerHeight',{configurable:true,value:oldHeight});t.mock.restoreAll();}
});

test('workspace context coordinates one popup and record changes remove it without replacing the mounted results',()=>{
 try{
  const details=React.createElement('div',{},help(),React.createElement(FieldHelp,{field:'Name'},'Name'));const view=render(React.createElement(MasterDetailWorkspace,{detail:details,detailKey:'a'},'Results'));
  fireEvent.click(trigger());assert(popup());fireEvent.click(screen.getByRole('link',{name:'Help for Name'}));assert.equal(popup(),null);assert.equal(screen.getAllByRole('note').length,1);
  view.rerender(React.createElement(MasterDetailWorkspace,{detail:details,detailKey:'b'},'Results'));assert.equal(screen.queryByRole('note'),null);assert(screen.getByText('Results'));
 }finally{cleanup();}
});
