import assert from 'node:assert/strict';
import {test} from 'node:test';
import React from 'react';
import {JSDOM} from 'jsdom';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://catalog.test'});
Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,Node:dom.window.Node,MutationObserver:dom.window.MutationObserver,IS_REACT_ACT_ENVIRONMENT:true});Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
const {render,screen,fireEvent,cleanup}=await import('@testing-library/react');const {ChangeRequest}=await import('../src/ChangeRequest');
test('request preserves captured context and draft after failed save, and writes only after explicit review confirmation',async()=>{
 const original=globalThis.fetch;const calls:any[]=[];globalThis.fetch=async(_url,init)=>{calls.push(JSON.parse(String(init?.body)));return Response.json({error:'TEST rejected'},{status:400});};
 try{render(React.createElement(ChangeRequest,{context:{recordId:'TEST id',recordName:'TEST name'},onClose:()=>{}}));
 fireEvent.change(screen.getByLabelText('Title *'),{target:{value:'TEST title'}});fireEvent.change(screen.getByLabelText('Requested change *'),{target:{value:'TEST change'}});fireEvent.change(screen.getByLabelText('Why it helps *'),{target:{value:'TEST reason'}});assert.equal(calls.length,0);
 fireEvent.click(screen.getByRole('button',{name:'Review request'}));assert.equal(calls.length,0);fireEvent.click(screen.getByRole('button',{name:'Confirm and save request'}));await screen.findByText('TEST rejected');assert.equal(calls.length,1);assert.equal(calls[0].context.recordId,'TEST id');assert.equal(calls[0].approved,true);
 fireEvent.click(screen.getByRole('button',{name:'Back to request'}));assert.equal((screen.getByLabelText('Title *') as HTMLInputElement).value,'TEST title');
 }finally{cleanup();globalThis.fetch=original;}
});
