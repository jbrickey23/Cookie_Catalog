import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdtempSync,rmSync,existsSync} from "node:fs";
import {join} from "node:path";
import {tmpdir} from "node:os";
import {execFileSync,spawnSync} from "node:child_process";
import {test} from "node:test";
import {Miniflare,convertV4MiniflareOptions} from "miniflare";
import {createArchiveBackup} from "../src/server/archive-backup";
import {handleApiRequest} from "../src/worker";
import {sha256} from "../src/server/development-backup";
import {archiveStream} from "../src/archive-format";
import type {IdentityVerifier} from "../src/server/access-identity";
const origin="https://catalog.example.test";
const owner:IdentityVerifier={verify:async()=>({subject:"owner",email:"owner@example.test",role:"owner"})};
async function env() {
  const runtime=new Miniflare(convertV4MiniflareOptions({modules:true,script:"export default {fetch(){return new Response('test')}}",d1Databases:{DB:"archive"},r2Buckets:["FILES"]}));
  const db=await runtime.getD1Database("DB") as unknown as D1Database,bucket=await runtime.getR2Bucket("FILES") as unknown as R2Bucket;
  for(const name of ["0001_initial.sql","0002_variants_components.sql"]) {
    const sql=readFileSync("../database/migrations/"+name,"utf8").replace(/^--.*$/gm,"");
    await db.batch(sql.split(";").map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));
  }
  await db.prepare("CREATE TABLE d1_migrations(id INTEGER PRIMARY KEY,name TEXT,applied_at TEXT)").run();
  for(const [index,name] of ["0001_initial.sql","0002_variants_components.sql"].entries())
    await db.prepare("INSERT INTO d1_migrations(id,name,applied_at) VALUES (?,?,?)").bind(index+1,name,"2026-10-14").run();
  await db.prepare("INSERT INTO shapes(id,name) VALUES ('shape_test','TEST large original')").run();
  return {runtime,db,bucket};
}
function wrap(bucket:R2Bucket,key:string,replace:(...args:any[])=>any) {
  return new Proxy(bucket,{get(target,property){if(property===key)return replace;const value=Reflect.get(target,property);return typeof value==="function"?value.bind(target):value;}});
}
async function seed(db:D1Database,bucket:R2Bucket) {
  // Structurally valid binary STL: pad total to 84 + 50*n.
  const stl=new Uint8Array(84+50*105000);
  new DataView(stl.buffer).setUint32(80,105000,true);
  const form=new FormData();form.set("kind","shape");form.set("recordId","shape_test");form.set("file",new Blob([stl]),"large-test.stl");
  const response=await handleApiRequest(new Request(origin+"/api/attachments",{method:"POST",headers:{Origin:origin,"X-Cookie-Catalog-Check":"attachments"},body:form}),owner,db,bucket);
  assert.equal(response.status,201,await response.clone().text());
  const saved=await response.json() as any;
  return {stl,id:saved.id,key:"attachments/"+saved.id+"/original"};
}
test("larger upload archives/restores original bytes, all tables and relationships beyond old limit",async()=>{
  const {runtime,db,bucket}=await env(),directory=mkdtempSync(join(tmpdir(),"cookie-archive-"));
  try {
    const {stl,id,key}=await seed(db,bucket);
    assert.ok(stl.length>4*1024*1024);
    const manifestResponse=await handleApiRequest(new Request(origin+"/api/dev/archive",{method:"POST",headers:{Origin:origin,"X-Cookie-Catalog-Check":"archive"}}),owner,db,bucket);
    assert.equal(manifestResponse.status,200);
    const manifest=new Uint8Array(await manifestResponse.arrayBuffer());
    const packed=await archiveStream(manifest,async expected=>{
      const response=await handleApiRequest(new Request(origin+"/api/dev/archive-file",{method:"POST",headers:{Origin:origin,"X-Cookie-Catalog-Check":"archive","content-type":"application/json"},body:JSON.stringify(expected)}),owner,db,bucket);
      assert.equal(response.status,200);
      assert.equal(response.headers.get("content-type"),"application/octet-stream");
      return new Uint8Array(await response.arrayBuffer());
    });
    const bytes=Buffer.from(await new Response(packed).arrayBuffer());
    const source=join(directory,"backup.tar"),target=join(directory,"restored");writeFileSync(source,bytes);
    const helperReport=JSON.parse(execFileSync(process.execPath,["../tools/backup-helper.mjs","validate",source],{encoding:"utf8"}));
    assert.equal(helperReport.tables,16);assert.equal(helperReport.objects,1);assert.equal(helperReport.originalBytes,stl.length);assert.equal(helperReport.complete,true);
    const report=JSON.parse(execFileSync("python3",["../tools/restore_archive_backup.py",source,target],{encoding:"utf8"}));
    assert.equal(report.tables,16);assert.equal(report.objects,1);assert.equal(report.originalBytes,stl.length);assert.equal(report.complete,true);
    assert.deepEqual(readFileSync(join(target,"objects",key)),Buffer.from(stl));
    const prepared=join(directory,"cloud-prepared");
    const preparation=JSON.parse(execFileSync("python3",["../tools/prepare_cloudflare_restore.py","prepare",source,prepared],{encoding:"utf8"}));
    assert.equal(preparation.cloudExecuted,false);
    assert.equal(preparation.objects,1);
    const comparison=JSON.parse(execFileSync("python3",["../tools/prepare_cloudflare_restore.py","verify",prepared,join(target,"catalog.sqlite"),join(target,"objects")],{encoding:"utf8"}));
    assert.equal(comparison.dataComparisonPassed,true);
    assert.equal(comparison.cloudProvenanceVerified,false);
    // D1 engine import, not just SQLite syntax validation. Never a remote binding.
    const recovery=new Miniflare(convertV4MiniflareOptions({modules:true,script:"export default {fetch(){return new Response('test')}}",d1Databases:{DB:"isolated-recovery"}}));
    try {
      const recovered=await recovery.getD1Database("DB") as unknown as D1Database;
      const statements=JSON.parse(readFileSync(join(prepared,"statements.json"),"utf8")) as string[];
      await recovered.batch(statements.map(sql=>recovered.prepare(sql)));
      const expected=JSON.parse(readFileSync(join(prepared,"expected.json"),"utf8"));
      for(const [table,rows] of Object.entries(expected.database.tables)) {
        const result=await recovered.prepare('SELECT * FROM "'+table+'"').all();
        const canonical=(values:any[])=>values.map(value=>JSON.stringify(Object.fromEntries(Object.entries(value).sort()))).sort();
        assert.deepEqual(canonical(result.results),canonical(rows as any[]),table);
      }
      assert.deepEqual((await recovered.prepare("PRAGMA foreign_key_check").all()).results,[]);
    }finally{await recovery.dispose();}
    const downloaded=await handleApiRequest(new Request(origin+"/api/attachments/"+id),owner,db,bucket);
    assert.equal(downloaded.status,200);
    assert.equal(await sha256(new Uint8Array(await downloaded.arrayBuffer())),await sha256(stl));
    const row=await db.prepare("SELECT id FROM attachments WHERE id=?").bind(id).first();assert.ok(row);
    assert.equal(spawnSync("python3",["../tools/restore_archive_backup.py",source,target]).status,1);
  }finally{await runtime.dispose();rmSync(directory,{recursive:true,force:true});}
});
test("truncated, corrupted and extra archive data fail restore and remove only new output",async()=>{
  const {runtime,db,bucket}=await env(),directory=mkdtempSync(join(tmpdir(),"cookie-archive-fail-"));
  try {
    await seed(db,bucket);
    const original=Buffer.from(await new Response(await createArchiveBackup(db,bucket)).arrayBuffer());
    const corrupted=Buffer.from(original);
    const manifestSize=parseInt(corrupted.subarray(124,136).toString("ascii").replace(/\0/g,"").trim(),8);
    const objectHeader=512+Math.ceil(manifestSize/512)*512;
    assert.equal(corrupted.subarray(objectHeader,objectHeader+8).toString("ascii"),"original");
    corrupted[objectHeader+512+100]=1;
    const cases=[original.subarray(0,original.length-1024),corrupted,Buffer.concat([original,Buffer.alloc(512)])];
    for(let i=0;i<cases.length;i++){
      const source=join(directory,"bad-"+i+".tar"),target=join(directory,"out-"+i);writeFileSync(source,cases[i]);
      assert.equal(spawnSync("python3",["../tools/restore_archive_backup.py",source,target]).status,1);
      assert.equal(existsSync(target),false);
    }
  }finally{await runtime.dispose();rmSync(directory,{recursive:true,force:true});}
});
test("orphan/missing preflight fails; changed original interrupts stream before completion receipt",async()=>{
  const {runtime,db,bucket}=await env();
  try {
    const {key}=await seed(db,bucket);
    await bucket.put("unexpected-object",new Uint8Array([1]));
    await assert.rejects(createArchiveBackup(db,bucket),/Unregistered/);
    await bucket.delete("unexpected-object");
    const changed=wrap(bucket,"get",async()=>null);
    const stream=await createArchiveBackup(db,changed);
    await assert.rejects(new Response(stream).arrayBuffer(),/changed/);
    await bucket.delete(key);
    await assert.rejects(createArchiveBackup(db,bucket),/missing/);
  }finally{await runtime.dispose();}
});
test("archive endpoint rejects unauthenticated/non-owner/origin/method before reading",async()=>{
  const db={prepare(){throw Error("Must not access DB");}} as unknown as D1Database;
  const bucket={} as R2Bucket;
  const request=(headers:HeadersInit={Origin:origin,"X-Cookie-Catalog-Check":"archive"})=>new Request(origin+"/api/dev/archive",{method:"POST",headers});
  assert.equal((await handleApiRequest(request(),{verify:async()=>null},db,bucket)).status,401);
  assert.equal((await handleApiRequest(request(),{verify:async()=>({subject:"editor",email:"editor@example.test",role:"editor"})},db,bucket)).status,403);
  assert.equal((await handleApiRequest(request({Origin:"https://other.test","X-Cookie-Catalog-Check":"archive"}),owner,db,bucket)).status,403);
  assert.equal((await handleApiRequest(new Request(origin+"/api/dev/archive"),owner,db,bucket)).status,405);
});
test("archive supports more than 25 originals and rejects changed descriptors on separate file requests",async()=>{
  const {runtime,db,bucket}=await env();
  try{
    const data=new Uint8Array([1,2,3]),hash=await sha256(data);
    for(let i=0;i<26;i++){
      const id="file_archive_"+String(i).padStart(4,"0"),key="attachments/"+id+"/original";
      await db.prepare("INSERT INTO attachments(id,storage_key,filename,byte_size,sha256) VALUES (?,?,?,?,?)").bind(id,key,"TEST.bin",3,hash).run();
      await bucket.put(key,data);
    }
    const response=await handleApiRequest(new Request(origin+"/api/dev/archive",{method:"POST",headers:{Origin:origin,"X-Cookie-Catalog-Check":"archive"}}),owner,db,bucket);
    const envelope=await response.json() as any;
    const payload=JSON.parse(envelope.payloadJson);assert.equal(payload.objects.length,26);
    const original=payload.objects[0];
    const request=()=>new Request(origin+"/api/dev/archive-file",{method:"POST",headers:{Origin:origin,"X-Cookie-Catalog-Check":"archive"},body:JSON.stringify(original)});
    assert.equal((await handleApiRequest(request(),owner,db,bucket)).status,200);
    await bucket.put(original.key,new Uint8Array([4,5,6]));
    assert.notEqual((await handleApiRequest(request(),owner,db,bucket)).status,200);
  }finally{await runtime.dispose();}
});
