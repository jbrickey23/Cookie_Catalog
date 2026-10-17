import assert from 'node:assert/strict';
import {test} from 'node:test';
import React from 'react';
import {JSDOM} from 'jsdom';
import {createRequestBackup} from '../src/request-backup';
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:'https://catalog.test'});
Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,Node:dom.window.Node,MutationObserver:dom.window.MutationObserver,IS_REACT_ACT_ENVIRONMENT:true});Object.defineProperty(globalThis,'navigator',{value:dom.window.navigator,configurable:true});
const {render,screen,fireEvent,cleanup}=await import('@testing-library/react');const {RequestRecovery}=await import('../src/RequestRecovery');
test('backup recovery previews a checked file and requires confirmation before any request mutation',async()=>{
 const original=globalThis.fetch;let writes=0;globalThis.fetch=async()=>{writes++;return Response.json({recovered:true});};
 const record={id:'request_a1234567-1234-4123-8123-123456789abc',environment:'development',createdAt:new Date().toISOString(),createdBy:'TEST',status:'new',release:null,todo:null,payloadSha256:'a'.repeat(64),type:'bug',title:'TEST',description:'TEST',reason:'TEST',context:{page:'catalog',recordId:'',recordName:'',search:''}};
 try{const raw=JSON.stringify(await createRequestBackup([record],'development'));render(React.createElement(RequestRecovery,{environment:'development'}));
 fireEvent.change(screen.getByLabelText('Private request backup'),{target:{files:[{size:raw.length,text:async()=>raw}]}});
 const confirm=await screen.findByRole('button',{name:'Confirm recovery of missing requests'});assert.equal(writes,0);fireEvent.click(confirm);await screen.findByText(/Recovery checked: 1 recovered/);assert.equal(writes,1);
 }finally{cleanup();globalThis.fetch=original;}
});
