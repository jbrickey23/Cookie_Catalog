import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";
import React from "react";
import {JSDOM} from "jsdom";
const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:"https://catalog.example.test"});
Object.assign(globalThis,{window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,Node:dom.window.Node,MutationObserver:dom.window.MutationObserver,IS_REACT_ACT_ENVIRONMENT:true});
Object.defineProperty(globalThis,"navigator",{value:dom.window.navigator,configurable:true});
const {render,screen,fireEvent,waitFor,within,cleanup}=await import("@testing-library/react");
const {ImportReview}=await import("../src/ImportReview");
const fixture=()=>JSON.parse(readFileSync("../samples/staging_manifest.synthetic.json","utf8"));
async function open(manifest:unknown){
  fireEvent.change(screen.getByLabelText("Prepared manifest (JSON)"),{target:{files:[{size:JSON.stringify(manifest).length,text:async()=>JSON.stringify(manifest)}]}});
  await screen.findByText(/3 source items/);
}
test("local review edits measurements/files, splits page items and downloads a round-trippable manifest without network",async()=>{
  let calls=0,downloaded:Blob|null=null;
  const originalFetch=globalThis.fetch,createUrl=URL.createObjectURL,revokeUrl=URL.revokeObjectURL,timer=globalThis.setTimeout;
  globalThis.fetch=async()=>{calls++;throw Error("Local review must not call a server");};
  URL.createObjectURL=blob=>{downloaded=blob as Blob;return "blob:synthetic-review";};URL.revokeObjectURL=()=>{};
  dom.window.HTMLAnchorElement.prototype.click=()=>{};dom.window.confirm=()=>true;
  globalThis.setTimeout=((handler:Parameters<typeof setTimeout>[0],delay?:number,...args:unknown[])=>{const value=timer(handler,delay,...args);if(delay===60000)value.unref();return value;}) as typeof setTimeout;
  try{
    render(React.createElement(ImportReview));await open(fixture());
    fireEvent.change(screen.getByLabelText("Storage location"),{target:{value:"TEST Shelf A"}});
    const dimensions=screen.getByRole("group",{name:/Width and height/});
    fireEvent.change(within(dimensions).getByLabelText("Review status"),{target:{value:"complete"}});
    fireEvent.change(within(dimensions).getByLabelText("Evidence reference (measured)"),{target:{value:"TEST measured across cutting edge, front-view width/height"}});
    fireEvent.click(screen.getByRole("button",{name:"Add source file reference"}));
    fireEvent.change(screen.getByLabelText("Relative source file path"),{target:{value:"photos/tree with ruler.png"}});
    fireEvent.change(screen.getByLabelText("Relative source file path"),{target:{value:"photos/tree scaled.png"}});
    fireEvent.change(screen.getByLabelText("Purpose"),{target:{value:"scale_photo"}});
    fireEvent.click(screen.getByRole("button",{name:"Download reviewed manifest"}));
    await waitFor(()=>assert.ok(downloaded));
    const saved=JSON.parse(await downloaded!.text());assert.equal(saved.items[0].facts.location,"TEST Shelf A");assert.equal(saved.items[0].reviews.dimensions.evidence.method,"measured");assert.equal(saved.items[0].files[0].path,"photos/tree scaled.png");
    fireEvent.click(screen.getByRole("button",{name:"Describe another item from this page"}));
    await screen.findByText(/4 source items/);
    fireEvent.change(screen.getByLabelText("Item type"),{target:{value:"design"}});
    assert.equal(screen.queryByLabelText("Storage location"),null);assert.equal(screen.queryByLabelText("Width (mm)"),null);
    fireEvent.click(screen.getByRole("button",{name:"Download reviewed manifest"}));
    const split=JSON.parse(await downloaded!.text());assert.equal(split.items.length,4);assert.equal(new Set(split.items.map((i:any)=>i.sourceKey)).size,4);assert.equal(split.items[3].source.pageId,split.items[0].source.pageId);assert.equal(split.items[3].kind,"design");
    assert.equal(calls,0);
  }finally{cleanup();globalThis.fetch=originalFetch;URL.createObjectURL=createUrl;URL.revokeObjectURL=revokeUrl;globalThis.setTimeout=timer;}
});
test("invalid manifests are rejected and incomplete evidence cannot be downloaded as a complete decision",async()=>{
  let downloads=0;const create=URL.createObjectURL;URL.createObjectURL=()=>{downloads++;return "blob:test";};
  try{
    render(React.createElement(ImportReview));
    const invalid=fixture();invalid.items.push(invalid.items[0]);
    fireEvent.change(screen.getByLabelText("Prepared manifest (JSON)"),{target:{files:[{size:100,text:async()=>JSON.stringify(invalid)}]}});
    await screen.findByText("Invalid or duplicate source item.");assert.equal(screen.queryByRole("button",{name:"Download reviewed manifest"}),null);
    await open(fixture());
    const dimensions=screen.getByRole("group",{name:/Width and height/});fireEvent.change(within(dimensions).getByLabelText("Review status"),{target:{value:"complete"}});
    fireEvent.click(screen.getByRole("button",{name:"Download reviewed manifest"}));await screen.findByText("Complete requires a specific evidence reference and method.");assert.equal(downloads,0);
  }finally{cleanup();URL.createObjectURL=create;}
});

test("catalog conflict keeps the editor draft and sends the opened revision",async()=>{
  const {Catalog}=await import("../src/Catalog");const originalFetch=globalThis.fetch;const writes:any[]=[];
  globalThis.fetch=async (input,init)=>{
    const url=String(input);
    if(init?.method==="PUT"){writes.push(init);return Response.json({error:"Someone changed this record. Your draft has been kept; reopen the record and compare before saving."},{status:412});}
    if(url.endsWith("/shapes/tree"))return Response.json({record:{id:"tree",name:"TEST Tree",notes:"original"},revision:'"opened-revision"'});
    return Response.json({records:url.includes("/locations")?[{id:"shelf",label:"TEST Shelf"}]:[{id:"tree",name:"TEST Tree"}],nextOffset:null});
  };
  try{
    render(React.createElement(Catalog,{canEdit:true,onSaved:()=>{throw Error("conflict must not report saved");}}));
    const edit=await screen.findByRole("button",{name:"Edit",exact:true});await waitFor(()=>assert.equal(edit.hasAttribute("disabled"),false));fireEvent.click(edit);
    await screen.findByText("Editing TEST Tree.");fireEvent.change(screen.getByLabelText("Notes / themes"),{target:{value:"my retained draft"}});
    fireEvent.click(screen.getByRole("button",{name:"Save changes"}));await screen.findByText(/Someone changed this record/);
    assert.equal((screen.getByLabelText("Notes / themes") as HTMLTextAreaElement).value,"my retained draft");assert.equal(writes.length,1);assert.equal(writes[0].headers["If-Match"],'"opened-revision"');
  }finally{cleanup();globalThis.fetch=originalFetch;}
});
