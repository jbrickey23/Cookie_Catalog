import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";
import {Miniflare,convertV4MiniflareOptions} from "miniflare";
import {handleApiRequest} from "../src/worker";
import {checkMissingFileRecovery} from "../src/server/development-missing-file-check";
import {sha256} from "../src/server/development-backup";
import type {IdentityVerifier} from "../src/server/access-identity";
const owner:IdentityVerifier={verify:async()=>({subject:"owner",email:"owner@example.test",role:"owner"})};
const url="https://catalog.example.test/api/dev/missing-file-check";
const request=()=>new Request(url,{method:"POST",headers:{Origin:"https://catalog.example.test","X-Cookie-Catalog-Check":"missing-file"}});
async function env() {
 const runtime=new Miniflare(convertV4MiniflareOptions({modules:true,script:"export default {fetch(){return new Response('test')}}",d1Databases:{DB:"missing"},r2Buckets:["FILES"]}));
 const db=await runtime.getD1Database("DB") as unknown as D1Database,bucket=await runtime.getR2Bucket("FILES") as unknown as R2Bucket;
 for(const file of ["0001_initial.sql","0002_variants_components.sql"]){
  const sql=readFileSync("../database/migrations/"+file,"utf8").replace(/^--.*$/gm,"");
  await db.batch(sql.split(";").map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));
 }
 const bytes=new Uint8Array([9,8,7]);
 await db.batch([
  db.prepare("INSERT INTO shapes(id,name) VALUES ('shape_existing','Existing owner shape')"),
  db.prepare("INSERT INTO attachments(id,storage_key,filename,media_type,byte_size,sha256) VALUES ('file_existing','attachments/file_existing/original','Private owner original','application/octet-stream',3,?)").bind(await sha256(bytes)),
  db.prepare("INSERT INTO shape_attachments(shape_id,attachment_id,purpose) VALUES ('shape_existing','file_existing','original')")
 ]);
 await bucket.put("attachments/file_existing/original",bytes);
 return {runtime,db,bucket,bytes};
}
async function assertOwnerPreserved(db:D1Database,bucket:R2Bucket,bytes:Uint8Array) {
 assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM shapes").first<{n:number}>())?.n,1);
 assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM attachments").first<{n:number}>())?.n,1);
 assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM shape_attachments").first<{n:number}>())?.n,1);
 assert.deepEqual(new Uint8Array(await (await bucket.get("attachments/file_existing/original"))!.arrayBuffer()),bytes);
 assert.equal((await db.prepare("PRAGMA foreign_key_check").all()).results.length,0);
}
test("real D1/R2 detects missing bytes, retains identity/link, restores original and cleans concurrent unique fixtures",async()=>{
 const {runtime,db,bucket,bytes}=await env();
 try {
  const responses=await Promise.all([handleApiRequest(request(),owner,db,bucket),handleApiRequest(request(),owner,db,bucket)]);
  for(const response of responses){
   assert.equal(response.status,200);assert.equal(response.headers.get("cache-control"),"no-store");
   const text=await response.text(),r=JSON.parse(text);
   assert.equal(r.initialDownloadStatus,200);assert.equal(r.missingDownloadStatus,409);assert.equal(r.missingListedUnavailable,true);
   assert.equal(r.metadataAndLinkRetained,true);assert.equal(r.recoveredDownloadStatus,200);assert.equal(r.recoveredBytesVerified,true);assert.equal(r.cleanupVerified,true);
   assert.ok(!text.includes("Private owner"));assert.ok(!text.includes("attachments/"));assert.ok(!text.includes("owner@example"));
  }
  await assertOwnerPreserved(db,bucket,bytes);assert.equal((await bucket.list()).objects.length,1);
 }finally{await runtime.dispose();}
});
test("failed initial read cleans only its fixture and never reports success",async()=>{
 const {runtime,db,bucket,bytes}=await env();
 try {
  const broken={put:bucket.put.bind(bucket),delete:bucket.delete.bind(bucket),head:bucket.head.bind(bucket),get:async()=>null} as unknown as R2Bucket;
  await assert.rejects(()=>checkMissingFileRecovery(db,broken),/Fixture original verification failed/);
  await assertOwnerPreserved(db,bucket,bytes);assert.equal((await bucket.list()).objects.length,1);
 }finally{await runtime.dispose();}
});
test("unconfirmed object cleanup is an error and preserves unrelated owner data",async()=>{
 const {runtime,db,bucket,bytes}=await env();
 try {
  const broken={put:bucket.put.bind(bucket),get:bucket.get.bind(bucket),head:bucket.head.bind(bucket),delete:async()=>{throw Error("provider details");}} as unknown as R2Bucket;
  const response=await handleApiRequest(request(),owner,db,broken),body=await response.text();
  assert.equal(response.status,503);assert.ok(body.includes("cleanup failed"));assert.ok(!body.includes("provider details"));
  await assertOwnerPreserved(db,bucket,bytes);
  assert.equal((await bucket.list()).objects.length,2); // Only its own generated orphan needs review.
 }finally{await runtime.dispose();}
});
test("auth, owner, method and origin guards prevent any fixture writes",async()=>{
 const db={prepare(){throw Error("Do not touch DB");}} as unknown as D1Database,bucket={} as R2Bucket;
 const editor:IdentityVerifier={verify:async()=>({subject:"editor",email:"editor@example.test",role:"editor"})};
 assert.equal((await handleApiRequest(request(),{verify:async()=>null},db,bucket)).status,401);
 assert.equal((await handleApiRequest(request(),editor,db,bucket)).status,403);
 assert.equal((await handleApiRequest(new Request(url),owner,db,bucket)).status,405);
 assert.equal((await handleApiRequest(new Request(url,{method:"POST"}),owner,db,bucket)).status,403);
 assert.equal((await handleApiRequest(new Request(url,{method:"POST",headers:{Origin:"https://other.example","X-Cookie-Catalog-Check":"missing-file"}}),owner,db,bucket)).status,403);
 assert.equal((await handleApiRequest(request(),owner)).status,503);
});
