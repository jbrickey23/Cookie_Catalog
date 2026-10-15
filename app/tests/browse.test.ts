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
 assert.match(html,/3.75″ cutter/);assert.match(html,/Reference artwork/);assert.match(html,/Actual cutter photo still needed/);assert.match(html,/Measurements needed/);assert.match(html,/needs confirmation/);assert.doesNotMatch(html,/Create record|Save|Delete/);
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
  const first=await (await get()).json() as any;assert.equal(first.items.length,24);assert.equal(first.nextOffset,24);assert.equal(first.items[0].reference_size_mm,null);
  const next=await (await get("?offset=24")).json() as any;assert.equal(next.items.length,2);assert.equal(next.nextOffset,null);
  assert.equal((await (await get("?q=100%25")).json() as any).items.length,24);
  assert.equal((await (await get("?q=%25missing")).json() as any).items.length,0);
  assert.equal((await (await get("?demo=true&offset=24")).json() as any).items.length,3);
  assert.equal((await get("?offset=-1")).status,400);assert.equal((await get("","POST")).status,405);
  const none:IdentityVerifier={verify:async()=>null};assert.equal((await handleApiRequest(new Request("https://catalog.test/api/browse"),none,db)).status,401);
  await migrate("0003_import_reviews.sql");await migrate("0004_catalog_imports.sql");
  await db.prepare("UPDATE physical_cutters SET reference_size_mm=95.25,slot='A' WHERE id='p00'").run();
  const current=await (await get()).json() as any;assert.equal(current.items[0].reference_size_mm,95.25);assert.equal(current.items[0].slot,"A");assert.equal(current.items[0].source_bin,null);
  assert.equal((await db.prepare("SELECT count(*) AS n FROM physical_cutters").first<any>())?.n,27);
 }finally{await runtime.dispose();}
});
