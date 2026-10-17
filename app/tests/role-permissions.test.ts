import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";
import {Miniflare,convertV4MiniflareOptions} from "miniflare";
import {handleApiRequest} from "../src/worker";
import type {IdentityVerifier,AuthenticatedUser} from "../src/server/access-identity";
const origin="https://catalog.example.test";
const identity=(role:AuthenticatedUser["role"]):IdentityVerifier=>({verify:async()=>({subject:role,email:role+"@example.test",role})});
test("verified editors create catalog records/upload originals; viewers read/search/download but cannot mutate",async()=>{
  const runtime=new Miniflare(convertV4MiniflareOptions({modules:true,script:"export default {fetch(){return new Response('test')}}",d1Databases:{DB:"roles"},r2Buckets:["FILES"]}));
  try {
    const db=await runtime.getD1Database("DB") as unknown as D1Database,files=await runtime.getR2Bucket("FILES") as unknown as R2Bucket;
    for(const name of ["0001_initial.sql","0002_variants_components.sql"]){
      const sql=readFileSync("../database/migrations/"+name,"utf8").replace(/^--.*$/gm,"");
      await db.batch(sql.split(";").map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));
    }
    const create=()=>new Request(origin+"/api/catalog/shapes",{method:"POST",headers:{Origin:origin,"X-Cookie-Catalog-Check":"catalog","content-type":"application/json"},body:JSON.stringify({name:"TEST role shape"})});
    assert.equal((await handleApiRequest(create(),identity("viewer"),db,files)).status,403);
    const created=await handleApiRequest(create(),identity("editor"),db,files);assert.equal(created.status,201);
    const {record:shape}=await created.json() as {record:{id:string}};
    assert.equal((await handleApiRequest(new Request(origin+"/api/catalog/shapes?q=role"),identity("viewer"),db,files)).status,200);
    const png=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=","base64");
    const upload=()=>{const form=new FormData();form.set("kind","shape");form.set("recordId",shape.id);form.set("file",new Blob([png],{type:"image/png"}),"test.png");return new Request(origin+"/api/attachments",{method:"POST",headers:{Origin:origin,"X-Cookie-Catalog-Check":"attachments"},body:form});};
    assert.equal((await handleApiRequest(upload(),identity("viewer"),db,files)).status,403);
    const uploaded=await handleApiRequest(upload(),identity("editor"),db,files);assert.equal(uploaded.status,201,await uploaded.clone().text());
    const file=await uploaded.json() as {id:string};
    assert.equal((await handleApiRequest(new Request(origin+"/api/attachments/"+file.id),identity("viewer"),db,files)).status,200);
    const remove=()=>new Request(origin+"/api/attachments/"+file.id,{method:"DELETE",headers:{Origin:origin,"X-Cookie-Catalog-Check":"attachments"}});
    for(const role of ["viewer","editor"] as const)assert.equal((await handleApiRequest(remove(),identity(role),db,files)).status,403);
    assert.equal((await handleApiRequest(remove(),identity("owner"),db,files)).status,200);
  }finally{await runtime.dispose();}
});
test("every development/maintenance path denies non-owners before any resource access",async()=>{
  const db={prepare(){throw Error("must not query");}} as unknown as D1Database,files={} as R2Bucket;
  for(const role of ["editor","viewer"] as const) {
    for(const endpoint of ["database-check","storage-check","infrastructure-check","missing-file-check","backup","recovery-check","archive","archive-file"])
      for(const method of ["GET","POST"])
        assert.equal((await handleApiRequest(new Request(origin+"/api/dev/"+endpoint,{method}),identity(role),db,files)).status,403,role+" "+endpoint);
    assert.equal((await handleApiRequest(new Request(origin+"/api/attachment-orphans"),identity(role),db,files)).status,403);
  }
});
