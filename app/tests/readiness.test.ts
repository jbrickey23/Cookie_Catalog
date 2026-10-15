import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {Miniflare,convertV4MiniflareOptions} from "miniflare";
import {readiness,type ReviewItem} from "../src/readiness";
import {ImportReview} from "../src/ImportReview";
import {Readiness} from "../src/Readiness";
import {handleApiRequest} from "../src/worker";
import type {IdentityVerifier} from "../src/server/access-identity";
const origin="https://catalog.example.test";
const viewer:IdentityVerifier={verify:async()=>({subject:"viewer",email:"viewer@example.test",role:"viewer"})};
test("review distinguishes physical inventory, unprinted files and designs without false completion",()=>{
  const physical:ReviewItem={id:"p",kind:"physical_cutter",name:"Test",facts:{widthMm:80,heightMm:90,location:"Test bin",photo:true}};
  let result=readiness(physical);
  assert.equal(result.complete,false);
  assert.equal(result.checks.find(c=>c.field==="dimensions")?.state,"needs_verification");
  assert.equal(result.checks.find(c=>c.field==="scale_photo")?.state,"unknown");
  physical.reviews={dimensions:{state:"complete",evidence:{method:"visual_review",reference:"unscaled photo"}}};
  assert.notEqual(readiness(physical).checks.find(c=>c.field==="dimensions")?.state,"complete");
  physical.reviews.dimensions={state:"complete",evidence:{method:"measured",reference:"manual ruler measurement, width across front; test fixture"}};
  assert.equal(readiness(physical).checks.find(c=>c.field==="dimensions")?.state,"complete");
  const printable=readiness({id:"f",kind:"printable_asset",name:"File",facts:{}});
  assert.ok(!printable.checks.some(c=>c.field==="location"||c.field==="scale_photo"));
  assert.equal(printable.checks.find(c=>c.field==="original")?.state,"unknown");
  assert.deepEqual(readiness({id:"d",kind:"design",name:"Design",facts:{}}).checks.map(c=>c.field),["photo","source"]);
  physical.reviews={photo:{state:"not_applicable",note:"Owner reviewed exception"},source:{state:"not_applicable",note:"cannot discard provenance"}};
  assert.equal(readiness(physical).checks.find(c=>c.field==="photo")?.state,"not_applicable");
  assert.notEqual(readiness(physical).checks.find(c=>c.field==="source")?.state,"not_applicable");
});
test("review UI has labels, status feedback and no mutation controls",()=>{
  const html=renderToStaticMarkup(React.createElement(Readiness));
  assert.match(html,/Review item type/);assert.match(html,/aria-live="polite"/);
  assert.doesNotMatch(html,/type="file"|Save changes|Create record|Delete original/);
});
test("import review opens only explicit local drafts and explains persistence boundaries",()=>{
  const html=renderToStaticMarkup(React.createElement(ImportReview));
  assert.match(html,/Prepared manifest/);assert.match(html,/stays in this tab/);assert.match(html,/aria-live="polite"/);
  assert.doesNotMatch(html,/Download reviewed manifest|fetch|iframe/);
});
test("authenticated readiness queue pages actual D1 metadata without writes and never certifies linked files",async()=>{
  const runtime=new Miniflare(convertV4MiniflareOptions({modules:true,script:"export default {fetch(){return new Response('test')}}",d1Databases:{DB:"readiness"}}));
  try {
    const db=await runtime.getD1Database("DB") as unknown as D1Database;
    for(const name of ["0001_initial.sql","0002_variants_components.sql"]){
      const sql=readFileSync("../database/migrations/"+name,"utf8").replace(/^--.*$/gm,"");
      await db.batch(sql.split(";").map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));
    }
    await db.prepare("INSERT INTO shapes(id,name,source_url) VALUES ('s','TEST evergreen','https://example.test/source')").run();
    await db.prepare("INSERT INTO shapes(id,name) VALUES ('unknown','TEST unclassified')").run();
    await db.prepare("INSERT INTO attachments(id,storage_key,filename,media_type) VALUES ('photo','missing/photo','test.png','image/png')").run();
    await db.prepare("INSERT INTO shape_attachments VALUES ('s','photo','photo')").run();
    await db.prepare("INSERT INTO printable_assets(id,shape_id,attachment_id,format) VALUES ('file','s','photo','stl')").run();
    for(let i=0;i<52;i++)await db.prepare("INSERT INTO physical_cutters(id,shape_id,width_mm,height_mm) VALUES (?,'s',90,100)").bind('p'+String(i).padStart(3,'0')).run();
    const before=await db.prepare("SELECT * FROM physical_cutters ORDER BY id").all();
    const get=(query="")=>handleApiRequest(new Request(origin+"/api/readiness"+query),viewer,db);
    const response=await get();assert.equal(response.status,200);assert.equal(response.headers.get("cache-control"),"no-store");
    const first=await response.json();assert.equal(first.items.length,50);assert.equal(first.nextOffset,50);assert.equal(first.originalAvailabilityChecked,false);
    assert.equal(first.items[0].checks.find((c:any)=>c.field==="photo").state,"needs_verification");
    assert.equal(first.items[0].checks.find((c:any)=>c.field==="location").state,"unknown");
    const next=await (await get("?offset=50")).json();assert.equal(next.items.length,2);assert.equal(next.nextOffset,null);
    assert.equal(new Set([...first.items,...next.items].map(i=>i.id)).size,52);
    const file=await (await get("?kind=printable_asset")).json();assert.ok(!file.items[0].checks.some((c:any)=>c.field==="location"));
    const unknown=await (await get("?kind=unclassified")).json();assert.equal(unknown.items.length,1);assert.equal(unknown.items[0].id,"unknown");
    for(const query of ["?kind=shapes;DROP","?offset=-1","?offset=NaN","?offset=1.5"])assert.equal((await get(query)).status,400);
    assert.equal((await handleApiRequest(new Request(origin+"/api/readiness",{method:"POST"}),viewer,db)).status,405);
    assert.deepEqual((await db.prepare("SELECT * FROM physical_cutters ORDER BY id").all()).results,before.results);
  }finally{await runtime.dispose();}
});
test("queue authentication runs before database access and errors do not leak private details",async()=>{
  const broken={prepare(){throw Error("private database content");}} as unknown as D1Database;
  const req=new Request(origin+"/api/readiness");
  assert.equal((await handleApiRequest(req,{verify:async()=>null},broken)).status,401);
  const result=await handleApiRequest(req,viewer,broken);assert.equal(result.status,503);assert.doesNotMatch(await result.text(),/private database content/);
});
