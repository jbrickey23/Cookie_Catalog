import assert from 'node:assert/strict';
import {test} from 'node:test';
import React from 'react';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://catalog.test'});
Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,Node:dom.window.Node,MutationObserver:dom.window.MutationObserver,IS_REACT_ACT_ENVIRONMENT:true});
Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
const {render,screen,fireEvent,cleanup}=await import('@testing-library/react');
const {AppHeader}=await import('../src/AppHeader');
const {RecordRecovery}=await import('../src/RecordRecovery');
test('header recovery shortcut opens saved changes without discarding an existing draft',async()=>{
 const original=globalThis.fetch;const methods:string[]=[];
 globalThis.fetch=async(_url,init)=>{methods.push(init?.method??'GET');return Response.json({changes:[{id:'test',at:'2026-10-17T00:00:00Z',kind:'cutters',method:'PUT'}]});};
 try{
 render(React.createElement(React.Fragment,null,React.createElement(AppHeader,{role:'owner',environment:'production'}),React.createElement('input',{'aria-label':'Draft',defaultValue:'keep me'}),React.createElement(RecordRecovery,{version:0,onRestored:()=>{}})));
 assert(screen.getByText('Production · Your live catalog'));
 const signout=screen.getByRole('link',{name:'Sign out'});assert.equal(signout.getAttribute('href'),'/cdn-cgi/access/logout');assert.match(signout.getAttribute('title')!,/other protected/);
 fireEvent.click(screen.getByRole('button',{name:'Undo saved changes'}));await screen.findByRole('button',{name:'Review change'});
 assert.equal(document.querySelector('details')?.open,true);assert.equal((screen.getByRole('textbox',{name:'Draft'}) as HTMLInputElement).value,'keep me');assert(methods.every(m=>m==='GET'));
 }finally{cleanup();globalThis.fetch=original;}
});
test('development header links clearly to production and viewers have no recovery action',()=>{
 try{render(React.createElement(AppHeader,{role:'viewer',environment:'development'}));assert(screen.getByText('Development · Testing only'));assert.equal(screen.getByRole('link',{name:'Open production catalog'}).getAttribute('href'),'https://cookie-catalog-prod.j-brickey.workers.dev/');assert.equal(screen.queryByRole('button',{name:'Undo saved changes'}),null);}finally{cleanup();}
});
