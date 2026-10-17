import assert from 'node:assert/strict';
import {test} from 'node:test';
import React from 'react';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://catalog.test'});Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,Node:dom.window.Node,MutationObserver:dom.window.MutationObserver,IS_REACT_ACT_ENVIRONMENT:true});Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
const {render,screen,fireEvent,cleanup,waitFor}=await import('@testing-library/react');const {PhotoInbox}=await import('../src/PhotoInbox');
test('photo batch isolates failures and retries only failed files with stable identities and captured context',async()=>{
 const original=globalThis.fetch,calls:{id:string;filename:string;context:string}[]=[];let failed=true;
 globalThis.fetch=async(_url,init)=>{if(init?.method!=='POST')return Response.json({items:[],nextCursor:null});const h=new Headers(init.headers);const filename=decodeURIComponent(h.get('X-Photo-Filename')!);calls.push({id:h.get('X-Photo-Id')!,filename,context:decodeURIComponent(h.get('X-Photo-Context')!)});if(filename==='TEST first.png'&&failed)return Response.json({error:'TEST upload failed'},{status:400});return Response.json({status:'queued'});};
 try{const {rerender}=render(React.createElement(PhotoInbox,{context:{recordId:'TEST id',recordName:'TEST cutter'}}));const details=screen.getByText('Photo inbox').closest('details')!;details.open=true;fireEvent(details,new dom.window.Event('toggle'));await waitFor(()=>assert(screen.getByLabelText('Inbox photos')));
 fireEvent.change(screen.getByLabelText('Inbox photos'),{target:{files:[new File(['TEST'],'TEST first.png'),new File(['TEST'],'TEST second.png')]}});rerender(React.createElement(PhotoInbox,{context:{recordName:'Different focus'}}));assert.equal(calls.length,0);
 fireEvent.click(screen.getByRole('button',{name:'Upload / retry selected photos'}));await screen.findByText('TEST first.png · failed · TEST upload failed');await screen.findByText('TEST second.png · saved');assert.equal(calls.length,2);assert.equal(calls[0].context,'TEST cutter · TEST id');
 failed=false;await waitFor(()=>assert.equal((screen.getByRole('button',{name:'Upload / retry selected photos'}) as HTMLButtonElement).disabled,false));fireEvent.click(screen.getByRole('button',{name:'Upload / retry selected photos'}));await screen.findByText('TEST first.png · saved');assert.equal(calls.length,3);assert.equal(calls[0].id,calls[2].id);assert.equal(calls[2].context,calls[0].context);
 }finally{cleanup();globalThis.fetch=original;}
});
