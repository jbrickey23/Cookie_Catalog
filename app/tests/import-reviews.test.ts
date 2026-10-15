import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {execFileSync,spawnSync} from "node:child_process";
import {test} from "node:test";
import {Miniflare,convertV4MiniflareOptions} from "miniflare";
import {handleApiRequest} from "../src/worker";
import {createArchiveBackup} from "../src/server/archive-backup";
import {archiveStream} from "../src/archive-format";
import {createDevelopmentBackup,sha256} from "../src/server/development-backup";
import {validateManifest,type StagingManifest} from "../src/staging.mjs";
import {importPreview} from "../src/import-preview";
import type {IdentityVerifier} from "../src/server/access-identity";
const origin="https://catalog.example.test",id="review_"+"a".repeat(32);
const owner:IdentityVerifier={verify:async()=>({subject:"owner",email:"owner@example.test",role:"owner"})};
const files=["0001_initial.sql","0002_variants_components.sql","0003_import_reviews.sql"];
async function environment(reviews=true){
  const runtime=new Miniflare(convertV4MiniflareOptions({modules:true,script:"export default {fetch(){return new Response('test')}}",d1Databases:{DB:"reviews"},r2Buckets:["FILES"]}));
  const db=await runtime.getD1Database("DB") as unknown as D1Database,bucket=await runtime.getR2Bucket("FILES") as unknown as R2Bucket;
  const applyFiles=reviews?files:files.slice(0,2);
  for(const name of applyFiles){const sql=readFileSync("../database/migrations/"+name,"utf8").replace(/^--.*$/gm,"");await db.batch(sql.split(";").map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));}
  await db.prepare("CREATE TABLE d1_migrations(id INTEGER PRIMARY KEY,name TEXT,applied_at TEXT)").run();
  await db.batch(applyFiles.map((name,i)=>db.prepare("INSERT INTO d1_migrations VALUES (?,?,?)").bind(i+1,name,"2026-10-15")));
  return {runtime,db,bucket};
}
function manifest():StagingManifest{return {format:"cookie-catalog-staging",version:1,sourceNamespace:"test-notebook",items:[{sourceKey:"page-1",kind:"physical_cutter",name:"TEST O'Brien tree 雪",source:{pageId:"page-1",sectionPath:"Bin 01"},facts:{widthMm:50.8,heightMm:101.6},catalog:{ownership:"unknown",printStatus:"not_printed",referenceSizeMm:101.6,originalSizeLabel:'4" x 2"',slot:"001"},reviews:{source:{state:"needs_verification",note:"TEST evidence only"}}}]};}
function request(path="",method="GET",value?:unknown,revision?:string){return new Request(origin+"/api/import-reviews"+path,{method,headers:{Origin:origin,"X-Cookie-Catalog-Check":"import-review","content-type":"application/json",...(revision?{"If-Match":revision}:{})},...(value===undefined?{}:{body:JSON.stringify(value)})});}
async function create(db:D1Database,m=manifest()){
  const response=await handleApiRequest(request("","POST",{id,title:"TEST review",manifest:m}),owner,db);assert.equal(response.status,201,await response.clone().text());return response.json() as Promise<any>;
}
test("saved reviews survive reopening, retain earlier versions, keep identifiers and reject stale writes atomically",async()=>{
  const {runtime,db}=await environment();try{
    const first=await create(db);assert.equal(first.revision,'"review-1"');
    const old=await (await handleApiRequest(request("/"+id),owner,db)).json() as any;assert.deepEqual(old.manifest,manifest());
    const changed=manifest();changed.items[0].name="TEST revised";changed.items[0].catalog!.ownership="owned";changed.items[0].catalog!.quantity=2;
    const save=()=>handleApiRequest(request("/"+id,"PUT",{title:"TEST updated",manifest:changed},first.revision),owner,db);
    const responses=await Promise.all([save(),save()]);assert.deepEqual(responses.map(r=>r.status).sort(),[200,412]);
    const reopened=await (await handleApiRequest(request("/"+id),owner,db)).json() as any;
    assert.equal(reopened.manifest.items[0].name,"TEST revised");assert.equal(reopened.versions.length,2);assert.equal(reopened.manifest.items[0].catalog.slot,"001");
    const prior=await (await handleApiRequest(request("/"+id+"?revision=1"),owner,db)).json() as any;
    assert.deepEqual(prior.manifest,manifest());assert.equal(prior.revision,'"review-2"');assert.equal(prior.loadedRevision,1);
    assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM import_review_items").first<any>())?.n,2);
    assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM shapes").first<any>())?.n,0);
    assert.deepEqual((await db.prepare("PRAGMA foreign_key_check").all()).results,[]);
    assert.equal((await handleApiRequest(request("/"+id,"PUT",{title:"TEST",manifest:changed}),owner,db)).status,428);
    changed.sourceNamespace="different";assert.equal((await handleApiRequest(request("/"+id,"PUT",{title:"TEST",manifest:changed},'"review-2"'),owner,db)).status,412);
  }finally{await runtime.dispose();}
});
test("replayed creation is safe and metadata previews record gaps without importing inventory or verifying bytes",async()=>{
  const {runtime,db}=await environment();try{
    await create(db);
    const replay=await handleApiRequest(request("","POST",{id,title:"TEST review",manifest:manifest()}),owner,db);assert.equal(replay.status,200);assert.equal((await replay.json() as any).replayed,true);
    const preview=await handleApiRequest(request("/"+id+"/preview","POST",undefined,'"review-1"'),owner,db);assert.equal(preview.status,201,await preview.clone().text());
    const result=await preview.json() as any;assert.equal(result.liveWrites,false);assert.equal(result.filesVerified,false);assert.equal(result.counts.notPrintedPhysical,1);assert.equal(result.counts.quantityUnknown,1);assert.equal(result.counts.ownershipUnknown,1);
    const load=await (await handleApiRequest(request("/"+id),owner,db)).json() as any;assert.equal(load.previews.length,1);assert.equal(load.previews[0].revision,1);
    assert.equal((await handleApiRequest(request("/"+id+"/preview","POST",undefined,'"review-2"'),owner,db)).status,412);
    assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM physical_cutters").first<any>())?.n,0);
    const list=await (await handleApiRequest(request(),owner,db)).json() as any;assert.equal(list.workspaces.length,1);
  }finally{await runtime.dispose();}
});
test("review authentication, editor membership, origin and methods are enforced before database access",async()=>{
  const broken={prepare(){throw Error("must not read private DB");}} as unknown as D1Database;
  const viewer:IdentityVerifier={verify:async()=>({subject:"v",email:"v@example.test",role:"viewer"})};
  assert.equal((await handleApiRequest(request(),{verify:async()=>null},broken)).status,401);
  assert.equal((await handleApiRequest(request(),viewer,broken)).status,403);
  assert.equal((await handleApiRequest(request("","DELETE"),owner,broken)).status,405);
  assert.equal((await handleApiRequest(new Request(origin+"/api/import-reviews",{method:"POST",headers:{Origin:"https://other.test","X-Cookie-Catalog-Check":"import-review"}}),owner,broken)).status,403);
  const unavailable=await handleApiRequest(request(),owner,broken);assert.equal(unavailable.status,503);assert.doesNotMatch(await unavailable.text(),/must not read private DB/);
  const {runtime,db}=await environment();try{
    const editor:IdentityVerifier={verify:async()=>({subject:"e",email:"e@example.test",role:"editor"})};
    assert.equal((await handleApiRequest(request("","POST",{id,title:"TEST",manifest:manifest()}),editor,db)).status,201);
  }finally{await runtime.dispose();}
});
test("bounded rows, invalid catalog assertions and oversized reviews fail without partial snapshots",async()=>{
  const {runtime,db}=await environment();try{
    for(const change of [(m:any)=>m.items[0].catalog.quantity=-1,(m:any)=>m.items[0].catalog.referenceSizeMm=NaN,(m:any)=>m.items[0].catalog.ownership="assumed",(m:any)=>m.items[0].catalog.slot="x".repeat(201)]){
      const m=manifest();change(m);assert.throws(()=>validateManifest(m));
    }
    const m=manifest();m.items[0].files=Array.from({length:30},(_,i)=>({path:String(i)+"x".repeat(1500),purpose:"unknown" as const}));
    assert.equal((await handleApiRequest(request("","POST",{id,title:"TEST",manifest:m}),owner,db)).status,400);
    const many=manifest();many.items=Array.from({length:1001},(_,i)=>({...many.items[0],sourceKey:"page"+i}));
    assert.equal((await handleApiRequest(request("","POST",{id,title:"TEST",manifest:many}),owner,db)).status,400);
    assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM import_review_workspaces").first<any>())?.n,0);
  }finally{await runtime.dispose();}
});
test("review snapshots and preview history recover through TAR, Windows helper, JSON and isolated D1 preparation",async()=>{
  const {runtime,db,bucket}=await environment(),directory=mkdtempSync(join(tmpdir(),"cookie-review-recovery-"));
  try{
    const m=manifest();m.items[0].reviews!.source!.note="TEST 'quoted' 雪 "+"a".repeat(3900);m.items[0].source.pageTitle="b".repeat(3900);m.items[0].facts!.source="c".repeat(3900);m.items[0].files=Array.from({length:10},(_,i)=>({path:String(i)+"d".repeat(1000),purpose:"unknown" as const}));await create(db,m);
    await handleApiRequest(request("/"+id+"/preview","POST",undefined,'"review-1"'),owner,db);
    const archive=join(directory,"reviews.tar");writeFileSync(archive,Buffer.from(await new Response(await createArchiveBackup(db,bucket)).arrayBuffer()));
    const validate=JSON.parse(execFileSync(process.execPath,["../tools/backup-helper.mjs","validate",archive],{encoding:"utf8"}));assert.equal(validate.tables,20);
    // Pure constraint functions are allowed; arbitrary schema functions remain denied.
    const tar=readFileSync(archive),manifestLength=parseInt(tar.subarray(124,136).toString("ascii").replace(/\0/g,""),8);
    const envelope=JSON.parse(tar.subarray(512,512+manifestLength).toString()),payload=JSON.parse(envelope.payloadJson);
    payload.database.schema.find((s:any)=>s.name==="shapes").sql="CREATE TABLE shapes(id TEXT PRIMARY KEY,name TEXT NOT NULL,notes TEXT CHECK(randomblob(4) IS NOT NULL))";
    envelope.payloadJson=JSON.stringify(payload);envelope.payloadSha256=await sha256(new TextEncoder().encode(envelope.payloadJson));
    const malicious=join(directory,"arbitrary-function.tar");writeFileSync(malicious,Buffer.from(await new Response(await archiveStream(new TextEncoder().encode(JSON.stringify(envelope)),async()=>new Uint8Array())).arrayBuffer()));
    const rejected=spawnSync(process.execPath,["../tools/backup-helper.mjs","validate",malicious],{encoding:"utf8"});assert.equal(rejected.status,1);assert.match(rejected.stderr,/not authorized to use function: randomblob/);
    const restored=join(directory,"restored");const report=JSON.parse(execFileSync("python3",["../tools/restore_archive_backup.py",archive,restored],{encoding:"utf8"}));assert.equal(report.tables,20);
    const cloud=join(directory,"cloud");execFileSync("python3",["../tools/prepare_cloudflare_restore.py","prepare",archive,cloud]);
    const check=JSON.parse(execFileSync("python3",["../tools/prepare_cloudflare_restore.py","verify",cloud,join(restored,"catalog.sqlite"),join(cloud,"objects")],{encoding:"utf8"}));assert.equal(check.dataComparisonPassed,true);
    const backup=join(directory,"reviews.json");writeFileSync(backup,await createDevelopmentBackup(db,bucket));
    const jsonReport=JSON.parse(execFileSync("python3",["../tools/restore_development_backup.py",backup,join(directory,"json-restore")],{encoding:"utf8"}));assert.equal(jsonReport.tables,20);
    const statements=JSON.parse(readFileSync(join(cloud,"statements.json"),"utf8"));assert.ok(statements.every((s:string)=>new TextEncoder().encode(s).length<=100000));
    const recovery=new Miniflare(convertV4MiniflareOptions({modules:true,script:"export default {fetch(){return new Response('test')}}",d1Databases:{DB:"recovered-reviews"}}));
    try{
      const recovered=await recovery.getD1Database("DB") as unknown as D1Database;await recovered.batch(statements.map((s:string)=>recovered.prepare(s)));
      const reopened=await (await handleApiRequest(request("/"+id),owner,recovered)).json() as any;
      assert.deepEqual(reopened.manifest,m);assert.equal(reopened.previews.length,1);assert.equal(reopened.revision,'"review-1"');
    }finally{await recovery.dispose();}
  }finally{await runtime.dispose();rmSync(directory,{recursive:true,force:true});}
});
test("preview separates reference size from actual axes and respects explicit non-ownership",()=>{
  const m=manifest();m.items[0].catalog={ownership:"not_owned",quantity:0,referenceSizeMm:101.6};
  const preview=importPreview(validateManifest(m));assert.equal(preview.counts.notOwned,1);assert.equal(preview.counts.referenceSizeUnknown,0);assert.equal(preview.counts.dimensionsUnknown,0);assert.equal(m.items[0].facts?.widthMm,50.8);
});
test("backup refuses partial review migrations and missing matching migration records",async()=>{
  const {runtime,db,bucket}=await environment();try{
    await db.prepare("DELETE FROM d1_migrations WHERE name='0003_import_reviews.sql'").run();
    await assert.rejects(createDevelopmentBackup(db,bucket),/migration records/);
    await db.prepare("DROP TABLE import_review_runs").run();
    await assert.rejects(createDevelopmentBackup(db,bucket),/schema has changed/);
  }finally{await runtime.dispose();}
});
test("dashboard activation upgrades legacy D1 twice safely while preserving existing catalog records",async()=>{
  const {runtime,db,bucket}=await environment(false);try{
    await db.prepare("INSERT INTO shapes(id,name) VALUES ('preserved','TEST existing cutter shape')").run();
    const before=(await db.prepare("SELECT * FROM shapes").all()).results;
    const sql=readFileSync("../tools/Activate-Saved-Reviews.sql","utf8").replace(/^--.*$/gm,"");
    for(let i=0;i<2;i++)await db.batch(sql.split(";").map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));
    assert.deepEqual((await db.prepare("SELECT * FROM shapes").all()).results,before);
    assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM d1_migrations").first<any>())?.n,3);
    const backup=JSON.parse(JSON.parse(await createDevelopmentBackup(db,bucket)).payloadJson);assert.equal(Object.keys(backup.database.tables).length,20);
    assert.equal((await handleApiRequest(request(),owner,db)).status,200);
  }finally{await runtime.dispose();}
});
