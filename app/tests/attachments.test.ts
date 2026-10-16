import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import { handleApiRequest } from "../src/worker";
import type { IdentityVerifier } from "../src/server/access-identity";
const origin = "https://catalog.example.test";
const owner: IdentityVerifier = { verify: async () => ({ subject: "owner", email: "owner@example.test", role: "owner" }) };
const png = Uint8Array.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9u0AAAAASUVORK5CYII=", "base64"));
const stl = new TextEncoder().encode("solid test\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 0 1 0\nendloop\nendfacet\nendsolid test");
async function env() {
  const runtime = new Miniflare(convertV4MiniflareOptions({ modules: true, script: "export default {fetch(){return new Response('test')}}", d1Databases: { DB: "attachments" }, r2Buckets: ["FILES"] }));
  const db = await runtime.getD1Database("DB") as unknown as D1Database;
  const bucket = await runtime.getR2Bucket("FILES") as unknown as R2Bucket;
  for (const name of ["0001_initial.sql", "0002_variants_components.sql"]) {
    const sql = readFileSync("../database/migrations/"+name,"utf8").replace(/^--.*$/gm,"");
    await db.batch(sql.split(";").map(s => s.trim()).filter(Boolean).map(s => db.prepare(s)));
  }
  await db.batch([db.prepare("INSERT INTO shapes(id,name) VALUES ('shape_test','Demo shape')"),db.prepare("INSERT INTO designs(id,name) VALUES ('design_test','Demo design')")]);
  return { runtime, db, bucket };
}
function upload(bytes = png, name = "photo.png", kind = "shape", recordId = "shape_test") {
  const form = new FormData();
  form.set("kind",kind); form.set("recordId",recordId); form.set("file",new Blob([bytes as Uint8Array<ArrayBuffer>]),name);
  form.set("licenseNotes","Synthetic test only");
  return new Request(origin+"/api/attachments",{ method:"POST",headers:{Origin:origin,"X-Cookie-Catalog-Check":"attachments"},body:form });
}
function deletion(id: string) { return new Request(origin+"/api/attachments/"+id,{method:"DELETE",headers:{Origin:origin,"X-Cookie-Catalog-Check":"attachments"}}); }
function wrap(bucket: R2Bucket, method: string, fail: (...args: any[]) => any) {
  return new Proxy(bucket,{get(target,key){ if(key === method) return fail; const value=Reflect.get(target,key); return typeof value === "function" ? value.bind(target) : value; }});
}
test("persistent photo/design/STL upload, exact-byte private retrieval, association and deletion",async()=>{
  const {runtime,db,bucket}=await env();
  try {
    for (const [bytes,name,kind,id] of [[png,"photo.png","shape","shape_test"],[png,"design.png","design","design_test"],[stl,"original.stl","shape","shape_test"]] as const) {
      const saved=await handleApiRequest(upload(bytes,name,kind,id),owner,db,bucket);
      assert.equal(saved.status,201);
      const item=await saved.json() as {id:string};
      const downloaded=await handleApiRequest(new Request(origin+"/api/attachments/"+item.id),owner,db,bucket);
      assert.equal(downloaded.status,200);
      assert.match(downloaded.headers.get("content-disposition")! ,/^attachment;/);
      assert.equal(downloaded.headers.get("content-type"),"application/octet-stream");
      assert.deepEqual(new Uint8Array(await downloaded.arrayBuffer()),bytes);
      const inline=await handleApiRequest(new Request(origin+"/api/attachments/"+item.id+"?view=image"),owner,db,bucket);
      assert.equal(inline.status,name.endsWith(".stl")?415:200);
      if(!name.endsWith(".stl")){assert.equal(inline.headers.get("content-type"),"image/png");assert.match(inline.headers.get("content-disposition")!,/^inline;/);assert.equal(inline.headers.get("cache-control"),"no-store");assert.deepEqual(new Uint8Array(await inline.arrayBuffer()),bytes);}

      const viewer=await handleApiRequest(new Request(origin+"/api/attachments/"+item.id+"?view=window"),owner,db,bucket);
      assert.equal(viewer.status,name.endsWith(".stl")?415:200);
      if(!name.endsWith(".stl")){
        assert.match(viewer.headers.get("content-type")!,/^text\/html/);assert.equal(viewer.headers.get("cache-control"),"no-store");assert.match(viewer.headers.get("content-security-policy")!,/default-src 'none'/);
        const page=await viewer.text();assert.ok(page.includes('width:100vw;height:100vh;object-fit:contain'));assert.ok(page.includes('/api/attachments/'+item.id+'?view=image'));assert.ok(page.includes('Download original'));assert.ok(!page.includes('<script'));
      }
      const list=await handleApiRequest(new Request(origin+"/api/attachments?kind="+kind+"&recordId="+id),owner,db,bucket);
      assert.equal((await list.json() as any).attachments[0].available,true);
      if(name.endsWith(".stl")) assert.equal((await db.prepare("SELECT format FROM printable_assets WHERE attachment_id=?").bind(item.id).first<any>())?.format,"stl");
      assert.equal((await handleApiRequest(deletion(item.id),owner,db,bucket)).status,200);
      assert.equal(await db.prepare("SELECT id FROM attachments WHERE id=?").bind(item.id).first(),null);
      assert.equal((await bucket.list()).objects.length,0);
    }
  } finally {await runtime.dispose();}
});
test("owner-only and same-origin guards reject before touching storage",async()=>{
  const noAccess={prepare(){throw Error("must not access DB");}} as unknown as D1Database;
  const bucket={} as R2Bucket;
  const none: IdentityVerifier={verify:async()=>null};
  const editor: IdentityVerifier={verify:async()=>({subject:"editor",email:"editor@example.test",role:"editor"})};
  assert.equal((await handleApiRequest(upload(),none,noAccess,bucket)).status,401);
  assert.equal((await handleApiRequest(new Request(origin+"/api/attachments/secret",{method:"DELETE"}),editor,noAccess,bucket)).status,403);
  assert.equal((await handleApiRequest(new Request(origin+"/api/attachments",{method:"POST",headers:{Origin:"https://other.test","X-Cookie-Catalog-Check":"attachments"}}),owner,noAccess,bucket)).status,403);
  assert.equal((await handleApiRequest(new Request(origin+"/api/attachments",{method:"POST",headers:{Origin:origin}}),owner,noAccess,bucket)).status,403);
});
test("reject malformed files, unknown records, design models and oversized bodies with no writes",async()=>{
  const {runtime,db,bucket}=await env();
  try {
    for(const [request,status] of [[upload(new Uint8Array([1,2,3]),"bad.png"),415],[upload(png,"photo.png","shape","absent"),404],[upload(stl,"test.stl","design","design_test"),415],[upload(new Uint8Array(25*1024*1024+1),"big.png"),413]] as const)
      assert.equal((await handleApiRequest(request,owner,db,bucket)).status,status);
    assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM attachments").first<any>())?.n,0);
    assert.equal((await bucket.list()).objects.length,0);
  }finally{await runtime.dispose();}
});
test("missing/corrupt originals are detected; failed object deletion retains metadata for retry",async()=>{
  const {runtime,db,bucket}=await env();
  try {
    const saved=await handleApiRequest(upload(),owner,db,bucket);
    const {id}=await saved.json() as {id:string};
    const row=await db.prepare("SELECT storage_key FROM attachments WHERE id=?").bind(id).first<any>();
    const failed=wrap(bucket,"delete",async()=>{throw Error("unavailable");});
    assert.equal((await handleApiRequest(deletion(id),owner,db,failed)).status,503);
    assert.ok(await db.prepare("SELECT id FROM attachments WHERE id=?").bind(id).first());
    await bucket.put(row.storage_key,new Uint8Array([1,2]));
    assert.equal((await handleApiRequest(new Request(origin+"/api/attachments/"+id),owner,db,bucket)).status,409);
    await bucket.delete(row.storage_key);
    assert.equal((await handleApiRequest(new Request(origin+"/api/attachments/"+id),owner,db,bucket)).status,409);
    const list=await handleApiRequest(new Request(origin+"/api/attachments?kind=shape&recordId=shape_test"),owner,db,bucket);
    assert.equal((await list.json() as any).attachments[0].available,false);
    assert.equal((await handleApiRequest(deletion(id),owner,db,bucket)).status,200);
  }finally{await runtime.dispose();}
});
test("failed upload cleans metadata; failed compensation keeps a discoverable cleanup entry",async()=>{
  const {runtime,db,bucket}=await env();
  try {
    const failure=wrap(bucket,"put",async()=>{throw Error("unavailable");});
    assert.equal((await handleApiRequest(upload(),owner,db,failure)).status,503);
    assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM attachments").first<any>())?.n,0);
    const stuck=wrap(failure,"delete",async()=>{throw Error("cleanup unavailable");});
    const response=await handleApiRequest(upload(),owner,db,stuck);
    assert.equal(response.status,503);
    const {attachmentId}=await response.json() as any;
    assert.ok(attachmentId);
    const list=await handleApiRequest(new Request(origin+"/api/attachments?kind=shape&recordId=shape_test"),owner,db,bucket);
    assert.equal((await list.json() as any).attachments[0].available,false);
    assert.equal((await handleApiRequest(deletion(attachmentId),owner,db,bucket)).status,200);
  }finally{await runtime.dispose();}
});
test("orphan audit is paginated, protects recent/linked files and cleans only old generated keys",async()=>{
  const {runtime,db,bucket}=await env();
  try {
    const saved=await handleApiRequest(upload(),owner,db,bucket);
    const linked=await saved.json() as {id:string};
    const orphanId="file_"+"a".repeat(32);
    const key="attachments/"+orphanId+"/original";
    await bucket.put(key,png);
    await bucket.put("attachments/legacy_unknown/original",png);
    const audit=await handleApiRequest(new Request(origin+"/api/attachment-orphans"),owner,db,bucket);
    const report=await audit.json() as any;
    assert.equal(report.orphans.length,1); assert.equal(report.orphans[0].id,orphanId); assert.equal(report.orphans[0].removable,false);
    const removeRequest=(id: string)=>new Request(origin+"/api/attachment-orphans/"+id,{method:"DELETE",headers:{Origin:origin,"X-Cookie-Catalog-Check":"attachments"}});
    assert.equal((await handleApiRequest(removeRequest(orphanId),owner,db,bucket)).status,409);
    assert.equal((await handleApiRequest(removeRequest(linked.id),owner,db,bucket)).status,409);
    const aged=wrap(bucket,"head",async(key:string)=>{const object=await bucket.head(key);return object ? {...object,uploaded:new Date(Date.now()-2*86400000)} : null;});
    assert.equal((await handleApiRequest(removeRequest(orphanId),owner,db,aged)).status,200);
    assert.ok(await bucket.head("attachments/legacy_unknown/original"));
    assert.ok(await db.prepare("SELECT id FROM attachments WHERE id=?").bind(linked.id).first());
    const paginated=wrap(bucket,"list",async()=>({objects:[],truncated:true,cursor:"next-page"}));
    const next=await handleApiRequest(new Request(origin+"/api/attachment-orphans"),owner,db,paginated);
    assert.equal((await next.json() as any).cursor,"next-page");
  }finally{await runtime.dispose();}
});
test("deletion preserves originals used by derived assets and removes size recipes with permitted originals",async()=>{
  const {runtime,db,bucket}=await env();
  try {
    const saved=await handleApiRequest(upload(stl,"original.stl"),owner,db,bucket);
    const {id}=await saved.json() as {id:string};
    const asset=await db.prepare("SELECT id FROM printable_assets WHERE attachment_id=?").bind(id).first<any>();
    await db.batch([
      db.prepare("INSERT INTO printable_size_recipes(id,printable_asset_id,label,target_width_mm) VALUES ('recipe',?,'test',100)").bind(asset.id),
      db.prepare("INSERT INTO printable_assets(id,shape_id,attachment_id,format,original_asset_id) VALUES ('derived','shape_test',?,'stl',?)").bind(id,asset.id)
    ]);
    assert.equal((await handleApiRequest(deletion(id),owner,db,bucket)).status,409);
    const row=await db.prepare("SELECT storage_key FROM attachments WHERE id=?").bind(id).first<any>();
    assert.ok(await bucket.head(row.storage_key));
    await db.prepare("DELETE FROM printable_assets WHERE id='derived'").run();
    assert.equal((await handleApiRequest(deletion(id),owner,db,bucket)).status,200);
    assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM printable_size_recipes").first<any>())?.n,0);
  }finally{await runtime.dispose();}
});

test('read-only image window escapes filenames and leaves original retrieval to the verified image route',async()=>{
 const {runtime,db,bucket}=await env();
 try{
  const uploaded=await handleApiRequest(upload(),owner,db,bucket),{id}=await uploaded.json() as {id:string};
  await db.prepare('UPDATE attachments SET filename=? WHERE id=?').bind('\"><script>alert(1)</script>.png',id).run();
  const viewer=await handleApiRequest(new Request(origin+'/api/attachments/'+id+'?view=window'),owner,db,wrap(bucket,'get',(key:string,...args:any[])=>{if(key.startsWith('attachments/'))throw Error('Viewer must not read the image twice');return (bucket.get as any)(key,...args);}));
  assert.equal(viewer.status,200);const page=await viewer.text();assert.ok(page.includes('&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;.png'));assert.ok(!page.includes('<script>'));assert.ok(!page.includes('<form'));assert.equal(viewer.headers.get('referrer-policy'),'no-referrer');
 }finally{await runtime.dispose();}
});
