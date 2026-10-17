import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";
import {Miniflare,convertV4MiniflareOptions} from "miniflare";
import {handleApiRequest} from "../src/worker";
import type {IdentityVerifier} from "../src/server/access-identity";
const owner:IdentityVerifier={verify:async()=>({subject:"owner",email:"owner@example.test",role:"owner"})};
const url="https://catalog.example.test/api/dev/infrastructure-check";
async function env() {
  const runtime=new Miniflare(convertV4MiniflareOptions({modules:true,script:"export default {fetch(){return new Response('test')}}",d1Databases:{DB:"infra"},r2Buckets:["FILES"]}));
  const db=await runtime.getD1Database("DB") as unknown as D1Database,bucket=await runtime.getR2Bucket("FILES") as unknown as R2Bucket;
  for(const file of ["0001_initial.sql","0002_variants_components.sql"]){
    const sql=readFileSync("../database/migrations/"+file,"utf8").replace(/^--.*$/gm,"");
    await db.batch(sql.split(";").map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));
  }
  await db.prepare("CREATE TABLE d1_migrations(id INTEGER PRIMARY KEY,name TEXT)").run();
  await db.batch([db.prepare("INSERT INTO d1_migrations VALUES (1,'0001_initial.sql')"),db.prepare("INSERT INTO d1_migrations VALUES (2,'0002_variants_components.sql')")]);
  return {runtime,db,bucket};
}
test("infrastructure report reads real D1/R2 without changing existing data or exposing keys/account values",async()=>{
  const {runtime,db,bucket}=await env();
  try{
    await db.prepare("INSERT INTO attachments(id,storage_key,filename,byte_size) VALUES ('file_private','attachments/file_private/original','Private name.png',3)").run();
    await bucket.put("attachments/file_private/original",new Uint8Array([1,2,3]));
    const response=await handleApiRequest(new Request(url),owner,db,bucket),text=await response.text(),report=JSON.parse(text);
    assert.equal(response.status,200);assert.equal(response.headers.get("cache-control"),"no-store");
    assert.equal(report.checksPassed,true);assert.equal(report.database.schemaTables,16);assert.equal(report.database.requiredMigrationsApplied,true);
    assert.equal(report.storage.sampledAttachments,1);assert.equal(report.storage.missingOriginals,0);
    assert.equal(report.worker.build.commit,null);assert.equal(report.worker.sourceCommitAvailable,false);
    assert.ok(!text.includes("Private name"));assert.ok(!text.includes("attachments/file_private"));assert.ok(!text.includes("owner@example"));
    assert.ok(await db.prepare("SELECT id FROM attachments WHERE id='file_private'").first());
    assert.deepEqual(new Uint8Array(await (await bucket.get("attachments/file_private/original"))!.arrayBuffer()),new Uint8Array([1,2,3]));
  }finally{await runtime.dispose();}
});
test("missing migrations and missing originals fail health without deleting metadata",async()=>{
  const {runtime,db,bucket}=await env();
  try{
    await db.prepare("DELETE FROM d1_migrations WHERE id=2").run();
    await db.prepare("INSERT INTO attachments(id,storage_key,filename,byte_size) VALUES ('file_missing','attachments/file_missing/original','TEST missing',3)").run();
    const response=await handleApiRequest(new Request(url),owner,db,bucket),report=await response.json() as any;
    assert.equal(report.checksPassed,false);assert.equal(report.database.requiredMigrationsApplied,false);assert.equal(report.storage.missingOriginals,1);
    assert.ok(await db.prepare("SELECT id FROM attachments WHERE id='file_missing'").first());
  }finally{await runtime.dispose();}
});
test("owner auth/read-only method/resource guards run before infrastructure reads",async()=>{
  const db={prepare(){throw Error("No read allowed");}} as unknown as D1Database,bucket={} as R2Bucket;
  const editor:IdentityVerifier={verify:async()=>({subject:"editor",email:"editor@example.test",role:"editor"})};
  assert.equal((await handleApiRequest(new Request(url),{verify:async()=>null},db,bucket)).status,401);
  assert.equal((await handleApiRequest(new Request(url),editor,db,bucket)).status,403);
  assert.equal((await handleApiRequest(new Request(url,{method:"POST"}),owner,db,bucket)).status,405);
  assert.equal((await handleApiRequest(new Request(url),owner)).status,503);
  const failure=await handleApiRequest(new Request(url),owner,db,bucket);
  assert.equal(failure.status,503);assert.ok(!(await failure.text()).includes("No read allowed"));
});
