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
test("saved review UI retains reference sizing, unknown quantity and unsaved edits after a conflict",async()=>{
  const original=globalThis.fetch;let saved:any;
  globalThis.fetch=async(input,init)=>{
    if(init?.method==="POST"&&String(input).endsWith("/api/import-reviews")){
      saved=JSON.parse(String(init.body));return Response.json({id:saved.id,title:saved.title,revision:'"review-1"',saved:true},{status:201});
    }
    if(init?.method==="PUT")return Response.json({error:"The saved review changed. Your draft is kept."},{status:412});
    throw Error("Unexpected request "+String(input));
  };
  try{
    render(React.createElement(ImportReview,{enableSavedReviews:true}));await open(fixture());
    fireEvent.change(screen.getByLabelText("Ownership"),{target:{value:"owned"}});
    fireEvent.change(screen.getByLabelText("Reference size — longest edge (inches)"),{target:{value:"4"}});
    fireEvent.change(screen.getByLabelText("Original size label / units"),{target:{value:'4" by 2"'}});
    fireEvent.change(screen.getByLabelText("Slot (optional)"),{target:{value:"001"}});
    fireEvent.click(screen.getByRole("button",{name:"Save new review"}));
    await screen.findByText(/Review saved with version history/);
    assert.equal(saved.manifest.items[0].catalog.referenceSizeMm,101.6);assert.equal(saved.manifest.items[0].catalog.quantity,undefined);assert.equal(saved.manifest.items[0].catalog.slot,"001");
    assert.equal(saved.manifest.items[0].facts.widthMm,90);assert.equal(saved.manifest.items[0].facts.heightMm,100);
    fireEvent.change(screen.getByLabelText("Item name"),{target:{value:"TEST retained draft"}});
    fireEvent.click(screen.getByRole("button",{name:"Save review changes"}));
    await screen.findByText("The saved review changed. Your draft is kept.");
    assert.equal((screen.getByLabelText("Item name") as HTMLInputElement).value,"TEST retained draft");
    assert.equal((screen.getByRole("button",{name:"Record import preview"}) as HTMLButtonElement).disabled,true);
  }finally{cleanup();globalThis.fetch=original;}
});
test("saved review can be reopened after leaving the browser tab without importing catalog records",async()=>{
  const original=globalThis.fetch,m=fixture(),id="review_"+"a".repeat(32);m.items[0].catalog={ownership:"not_owned",referenceSizeMm:101.6};
  globalThis.fetch=async input=>String(input).includes("?offset=")
    ?Response.json({workspaces:[{id,title:"TEST saved",current_revision:2}],nextOffset:null})
    :Response.json({id,title:"TEST saved",revision:'"review-2"',loadedRevision:String(input).includes("revision=1")?1:2,manifest:m,versions:[{revision:2,item_count:3,saved_at:"2026-10-15"},{revision:1,item_count:3,saved_at:"2026-10-14"}],previews:[]});
  try{
    render(React.createElement(ImportReview,{enableSavedReviews:true}));
    fireEvent.click(screen.getByRole("button",{name:"List saved reviews"}));await screen.findByLabelText("Saved review");
    fireEvent.click(screen.getByRole("button",{name:"Open saved review"}));await screen.findByText(/3 source items/);
    assert.equal((screen.getByLabelText("Ownership") as HTMLSelectElement).value,"not_owned");
    assert.equal((screen.getByLabelText("Reference size — longest edge (inches)") as HTMLInputElement).value,"4");
    assert.ok(screen.getByRole("button",{name:"Save review changes"}));
    fireEvent.click(screen.getByRole("button",{name:"Open version 1 as draft"}));await screen.findByText(/Earlier version opened as a draft/);
    assert.equal((screen.getByRole("button",{name:"Record import preview"}) as HTMLButtonElement).disabled,true);
  }finally{cleanup();globalThis.fetch=original;}
});
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

test("inventory import UI starts with no selections and requires a plan plus backup confirmation before applying",async()=>{
 const {CatalogImport}=await import('../src/CatalogImport');const original=globalThis.fetch,confirm=window.confirm,m=fixture();let applied:any;const calls:string[]=[];
 globalThis.fetch=async(input,init)=>{calls.push(String(input));const body=JSON.parse(String(init?.body));
  if(String(input).endsWith('/catalog-plan'))return Response.json({planSha256:'a'.repeat(64),ready:1,blocked:0,alreadyLinked:0,selected:1,rows:[{sourceKey:m.items[0].sourceKey,name:m.items[0].name,status:'ready',targetId:'TEST target',referenceSizeMm:76.2,reasons:[],candidates:[]}]});
  if(String(input).endsWith('/apply')){applied=body;return Response.json({created:1,linked:0,alreadyLinked:0});}throw Error('Unexpected request');
 };window.confirm=()=>true;
 try{
  render(React.createElement(CatalogImport,{id:'review_'+'a'.repeat(32),revision:'"review-1"',manifest:m,disabled:false,onBusy:()=>{}}));
  fireEvent.click(screen.getByText('Import reviewed entries into inventory'));
  assert.equal(calls.length,0);assert.equal((screen.getByRole('button',{name:'Prepare inventory plan'}) as HTMLButtonElement).disabled,true);
  fireEvent.change(screen.getByLabelText('Inventory action for '+m.items[0].name),{target:{value:'create'}});
  fireEvent.click(screen.getByLabelText(/I confirm that the selected physical cutters are owned/));
  fireEvent.click(screen.getByRole('button',{name:'Prepare inventory plan'}));await screen.findByText(/1 ready, 0 blocked/);
  assert.equal((screen.getByRole('button',{name:'Import selected entries'}) as HTMLButtonElement).disabled,true);
  fireEvent.change(screen.getByLabelText('Protected pre-change backup reference'),{target:{value:'TEST protected backup receipt'}});
  fireEvent.click(screen.getByLabelText(/I saved and verified a protected pre-change backup/));
  fireEvent.click(screen.getByRole('button',{name:'Import selected entries'}));await screen.findByText(/Import recorded: 1 new inventory records/);assert.equal(applied.ownershipConfirmed,true);assert.equal(applied.backupConfirmed,true);assert.equal(applied.choices.length,1);
 }finally{cleanup();globalThis.fetch=original;window.confirm=confirm;}
});
