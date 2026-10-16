import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {Miniflare,convertV4MiniflareOptions} from "miniflare";
import {handleApiRequest} from "../src/worker";
import {CutterCard,type BrowseItem} from "../src/Browse";
import type {IdentityVerifier} from "../src/server/access-identity";
const viewer:IdentityVerifier={verify:async()=>({subject:"viewer",email:"viewer@example.test",role:"viewer"})};
test("browse cards preserve unknown details and distinguish reference artwork",()=>{
 const item:BrowseItem={id:"p",shape_id:"s",name:"Synthetic cutter",quantity:1,width_mm:null,height_mm:null,reference_size_mm:95.25,location:null,source_bin:"Bin TEST",slot:null,image_id:"image",image_name:"Synthetic_Reference_Artwork.png"};
 const html=renderToStaticMarkup(React.createElement(CutterCard,{item}));
 assert.match(html,/3.75″ cutter/);assert.match(html,/Reference artwork/);assert.match(html,/Actual cutter photo still needed/);assert.match(html,/Measurements needed/);assert.match(html,/Bin TEST/);assert.doesNotMatch(html,/needs confirmation/);assert.doesNotMatch(html,/Create record|Save|Delete/);
});
test("viewer browsing is bounded, read-only, searchable, and compatible before and after import migration",async()=>{
 const runtime=new Miniflare(convertV4MiniflareOptions({modules:true,script:"export default {fetch(){return new Response('test')}}",d1Databases:{DB:"browse"}}));
 try {
  const db=await runtime.getD1Database("DB") as unknown as D1Database;
  const migrate=async(name:string)=>{const sql=readFileSync("../database/migrations/"+name,"utf8").replace(/^--.*$/gm,"");await db.batch(sql.split(";").map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));};
  await migrate("0001_initial.sql");await migrate("0002_variants_components.sql");
  await db.prepare("INSERT INTO shapes(id,name) VALUES ('s','TEST cutter 100%'),('demo','DEMO test')").run();
  for(let i=0;i<26;i++)await db.prepare("INSERT INTO physical_cutters(id,shape_id) VALUES (?,'s')").bind("p"+String(i).padStart(2,"0")).run();
  await db.prepare("INSERT INTO physical_cutters(id,shape_id) VALUES ('d','demo')").run();
  const get=(query="",method="GET")=>handleApiRequest(new Request("https://catalog.test/api/browse"+query,{method}),viewer,db);
  const first=await (await get()).json() as any;assert.equal(first.items.length,24);assert.equal(first.total,26);assert.equal(first.nextOffset,24);assert.equal(first.items[0].reference_size_mm,null);
  const next=await (await get("?offset=24")).json() as any;assert.equal(next.items.length,2);assert.equal(next.nextOffset,null);
  assert.equal((await (await get("?q=100%25")).json() as any).items.length,24);
  assert.equal((await (await get("?q=%25missing")).json() as any).items.length,0);
  assert.equal((await (await get("?demo=true&offset=24")).json() as any).items.length,3);
  assert.equal((await get("?offset=-1")).status,400);assert.equal((await get("","POST")).status,405);
  const none:IdentityVerifier={verify:async()=>null};assert.equal((await handleApiRequest(new Request("https://catalog.test/api/browse"),none,db)).status,401);
  await migrate("0003_import_reviews.sql");await migrate("0004_catalog_imports.sql");
  await db.prepare("UPDATE physical_cutters SET reference_size_mm=95.25,slot='A' WHERE id='p00'").run();
  const current=await (await get()).json() as any;assert.equal(current.items[0].reference_size_mm,95.25);assert.equal(current.items[0].slot,"A");assert.equal(current.items[0].source_bin,null);
  await db.prepare("INSERT INTO shapes(id,name,notes) VALUES ('ref','TEST source reference',?)").bind(JSON.stringify({source:{sectionPath:"Reference bin"},reviewState:"not_printed"})).run();
  const references=await (await get("?kind=reference&q=Reference%20bin")).json() as any;
  assert.equal(references.items.length,1);assert.equal(references.total,1);assert.equal(references.items[0].record_kind,"reference");assert.equal(references.items[0].quantity,null);assert.equal(references.items[0].review_state,"not_printed");
  assert.equal((await (await get("?kind=physical&offset=24")).json() as any).items.length,2);
  assert.equal((await get("?kind=invalid")).status,400);
  assert.equal((await db.prepare("SELECT count(*) AS n FROM physical_cutters").first<any>())?.n,27);
 }finally{await runtime.dispose();}
});

test('combined search matches every term across names bins and tags without duplicate results',async()=>{
 const runtime=new Miniflare(convertV4MiniflareOptions({modules:true,script:"export default {fetch(){return new Response('test')}}",d1Databases:{DB:'terms'}}));
 try{
  const db=await runtime.getD1Database('DB') as unknown as D1Database;
  for(const n of ['0001_initial.sql','0002_variants_components.sql']){const sql=readFileSync('../database/migrations/'+n,'utf8').replace(/^--.*$/gm,'');await db.batch(sql.split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));}
  await db.exec("INSERT INTO shapes(id,name,notes) VALUES ('a','Black Cat',NULL),('b','Cat',NULL),('c','Holiday star',NULL),('d','Cat Holiday',NULL),('e','Black Catfish',NULL); INSERT INTO tags(id,label) VALUES ('t','Holiday'),('u','Holiday Baking'); INSERT INTO shape_tags(shape_id,tag_id) VALUES ('a','t'),('a','u'),('c','t'),('e','t'); INSERT INTO locations(id,label) VALUES ('l','Bin 6'); INSERT INTO physical_cutters(id,shape_id,location_id) VALUES ('p','a','l');");
  const search=async(q:string,extra='')=>handleApiRequest(new Request('https://catalog.test/api/browse?q='+encodeURIComponent(q)+extra),viewer,db);
  const ids=async(q:string,extra='')=>((await (await search(q,extra)).json()) as any).items.map((x:any)=>x.shape_id).sort();
  assert.deepEqual(await ids('cat Holiday'),['a','d','e']);assert.deepEqual(await ids('cat AND Holiday'),['a','d','e']);assert.deepEqual(await ids('"Black Cat" Holiday'),['a','e']);assert.deepEqual(await ids('cat Holiday "Bin 6"'),['a']);assert.deepEqual(await ids('cat Holiday','&kind=reference'),['d','e']);assert.deepEqual(await ids('cat Holiday','&kind=physical'),['a']);assert.deepEqual(await ids('cat Missing'),[]);
  assert.equal(((await (await search('cat Holiday')).json()) as any).total,3);assert.equal((await search('"unclosed')).status,400);assert.equal((await search('a b c d e f g h i')).status,400);assert.deepEqual(await ids("%_'"),[]);
 }finally{await runtime.dispose();}
});
