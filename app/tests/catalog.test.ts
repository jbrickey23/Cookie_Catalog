import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {test} from "node:test";
import {Miniflare,convertV4MiniflareOptions} from "miniflare";
import {handleApiRequest} from "../src/worker";
import type {IdentityVerifier} from "../src/server/access-identity";
const origin="https://catalog.example.test";
const owner:IdentityVerifier={verify:async()=>({subject:"owner",email:"owner@example.test",role:"owner"})};
function write(kind:string,record:unknown,id?:string) {
  return new Request(origin+"/api/catalog/"+kind+(id?"/"+id:""),{method:id?"PUT":"POST",headers:{"content-type":"application/json",Origin:origin,"X-Cookie-Catalog-Check":"catalog"},body:JSON.stringify(record)});
}
async function env() {
  const runtime=new Miniflare(convertV4MiniflareOptions({modules:true,script:"export default {fetch(){return new Response('test')}}",d1Databases:{DB:"catalog"}}));
  const db=await runtime.getD1Database("DB") as unknown as D1Database;
  for(const file of ["0001_initial.sql","0002_variants_components.sql"]) {
    const sql=readFileSync("../database/migrations/"+file,"utf8").replace(/^--.*$/gm,"");
    await db.batch(sql.split(";").map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));
  }
  return {runtime,db};
}
async function create(db:D1Database,kind:string,record:unknown) {
  const response=await handleApiRequest(write(kind,record),owner,db);
  assert.equal(response.status,201,await response.clone().text());
  return (await response.json() as any).record;
}
test("owner creates linked catalog records, edits dimensions, and retrieves/searches saved state",async()=>{
  const {runtime,db}=await env();
  try {
    const shape=await create(db,"shapes",{name:"TEST Evergreen",notes:"Christmas tree",maker:"Demo"});
    const design=await create(db,"designs",{name:"TEST Holiday icing",notes:"Christmas tree"});
    const location=await create(db,"locations",{label:"TEST Drawer 2"});
    const cutter=await create(db,"physical_cutters",{shape_id:shape.id,location_id:location.id,width_mm:80,height_mm:100,quantity:1,origin:"printed"});
    const link=await create(db,"design_shape_links",{design_id:design.id,shape_id:shape.id,status:"tested",use_type:"flip",mirrored:1,instructions:"Rotate and decorate as a gnome",min_width_mm:70,max_width_mm:100});
    const updated=await handleApiRequest(write("physical_cutters",{shape_id:shape.id,location_id:location.id,width_mm:90,height_mm:100,quantity:2,origin:"printed"},cutter.id),owner,db);
    assert.equal(updated.status,200);
    const reread=await handleApiRequest(new Request(origin+"/api/catalog/physical_cutters/"+cutter.id),owner,db);
    const record=(await reread.json() as any).record;
    assert.equal(record.width_mm,90);assert.equal(record.quantity,2);
    const search=await handleApiRequest(new Request(origin+"/api/catalog/shapes?q=CHRISTMAS"),owner,db);
    assert.equal((await search.json() as any).records[0].id,shape.id);
    const locationSearch=await handleApiRequest(new Request(origin+"/api/catalog/physical_cutters?q=Drawer"),owner,db);
    assert.equal((await locationSearch.json() as any).records[0].location_label,"TEST Drawer 2");
    const links=await handleApiRequest(new Request(origin+"/api/catalog/design_shape_links?q=gnome"),owner,db);
    const mapping=(await links.json() as any).records[0];
    assert.equal(mapping.id,link.id);assert.equal(mapping.shape_name,"TEST Evergreen");assert.equal(mapping.design_name,"TEST Holiday icing");
    assert.equal(mapping.mirrored,1);assert.equal(mapping.status,"tested");
    assert.equal((await db.prepare("PRAGMA foreign_key_check").all()).results.length,0);
  }finally{await runtime.dispose();}
});
test("catalog mutations and reads require owner identity; cross-origin writes and unsupported methods fail before DB access",async()=>{
  const db={prepare(){throw Error("Must not touch DB");}} as unknown as D1Database;
  const none:IdentityVerifier={verify:async()=>null};
  const editor:IdentityVerifier={verify:async()=>({subject:"editor",email:"editor@example.test",role:"editor"})};
  assert.equal((await handleApiRequest(write("shapes",{name:"test"}),none,db)).status,401);
  assert.equal((await handleApiRequest(new Request(origin+"/api/catalog/shapes"),editor,db)).status,403);
  assert.equal((await handleApiRequest(new Request(origin+"/api/catalog/shapes",{method:"POST",headers:{Origin:"https://other.test","X-Cookie-Catalog-Check":"catalog"}}),owner,db)).status,403);
  assert.equal((await handleApiRequest(new Request(origin+"/api/catalog/shapes",{method:"POST",headers:{Origin:origin}}),owner,db)).status,403);
  assert.equal((await handleApiRequest(new Request(origin+"/api/catalog/shapes/test",{method:"DELETE"}),owner,db)).status,405);
});
test("input validation rejects invalid dimensions, enums, whitespace, URLs, unknown fields and oversized bodies",async()=>{
  const {runtime,db}=await env();
  try {
    const cases:[string,unknown][]=[
      ["shapes",{name:" "}],["shapes",{name:"test",storage_key:"arbitrary"}],["shapes",{name:"test",source_url:"javascript:alert(1)"}],
      ["physical_cutters",{shape_id:"missing",quantity:-1,origin:"printed"}],["physical_cutters",{shape_id:"missing",quantity:1.5,origin:"printed"}],
      ["physical_cutters",{shape_id:"missing",quantity:1,origin:"invalid"}],["physical_cutters",{shape_id:"missing",quantity:1,origin:"printed",width_mm:0}],
      ["design_shape_links",{design_id:"missing",shape_id:"missing",status:"tested",use_type:"flip",mirrored:2}],
      ["design_shape_links",{design_id:"missing",shape_id:"missing",status:"tested",use_type:"flip",mirrored:0,min_width_mm:100,max_width_mm:90}],
      ["shapes",{name:"test",notes:"x".repeat(20000)}]
    ];
    for(const [kind,record] of cases) assert.equal((await handleApiRequest(write(kind,record),owner,db)).status,400);
    assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM shapes").first<any>())?.n,0);
  }finally{await runtime.dispose();}
});
test("missing relationships and records fail safely; duplicate links/locations return conflict",async()=>{
  const {runtime,db}=await env();
  try {
    const shape=await create(db,"shapes",{name:"TEST shape"});
    const design=await create(db,"designs",{name:"TEST design"});
    const mapping={shape_id:shape.id,design_id:design.id,status:"proposed",use_type:"standard",mirrored:0};
    await create(db,"design_shape_links",mapping);
    assert.equal((await handleApiRequest(write("design_shape_links",mapping),owner,db)).status,409);
    await create(db,"locations",{label:"TEST drawer"});
    assert.equal((await handleApiRequest(write("locations",{label:"TEST drawer"}),owner,db)).status,409);
    assert.equal((await handleApiRequest(write("physical_cutters",{shape_id:"missing",quantity:1,origin:"unknown"}),owner,db)).status,404);
    assert.equal((await handleApiRequest(write("shapes",{name:"edited"},"missing"),owner,db)).status,404);
    assert.equal((await handleApiRequest(new Request(origin+"/api/catalog/attachments"),owner,db)).status,404);
    assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM design_shape_links").first<any>())?.n,1);
  }finally{await runtime.dispose();}
});
test("literal search resists injection/wildcards and pages without skipping rows",async()=>{
  const {runtime,db}=await env();
  try {
    await db.batch(Array.from({length:201},(_,i)=>db.prepare("INSERT INTO shapes(id,name) VALUES (?,?)").bind("shape_"+String(i).padStart(3,"0"),"TEST "+String(i).padStart(3,"0"))));
    const first=await handleApiRequest(new Request(origin+"/api/catalog/shapes"),owner,db);
    const page=(await first.json() as any);assert.equal(page.records.length,200);assert.equal(page.nextOffset,200);
    const last=await handleApiRequest(new Request(origin+"/api/catalog/shapes?offset=200"),owner,db);
    const end=await last.json() as any;assert.equal(end.records.length,1);assert.equal(end.records[0].id,"shape_200");assert.equal(end.nextOffset,null);
    for(const q of ["%","' OR 1=1 --"]) {
      const response=await handleApiRequest(new Request(origin+"/api/catalog/shapes?q="+encodeURIComponent(q)),owner,db);
      assert.equal((await response.json() as any).records.length,0);
    }
    assert.equal((await handleApiRequest(new Request(origin+"/api/catalog/shapes?offset=-1"),owner,db)).status,400);
  }finally{await runtime.dispose();}
});
test("search explains each matching metadata field and preserves the original matched text",async()=>{
  const {runtime,db}=await env();
  try {
    for(const name of ["Tree","Christmas tree","Tree house"])await create(db,"shapes",{name});
    const hidden=await create(db,"shapes",{name:"TEST Gnome",notes:"A Christmas tree cutter can flip into a gnome.",maker:"Tree Workshop"});
    const response=await handleApiRequest(new Request(origin+"/api/catalog/shapes?q=tree"),owner,db);
    const body=await response.json() as any;
    assert.equal(body.records.length,4);
    for(const row of body.records) {
      assert.ok(row.searchHits.length);
      assert.ok(!Object.keys(row).some(key=>key.startsWith("__search")));
      for(const hit of row.searchHits)assert.equal(hit.snippet.slice(hit.start,hit.start+hit.length).toLowerCase(),"tree");
    }
    const gnome=body.records.find((row:any)=>row.id===hidden.id);
    assert.deepEqual(gnome.searchHits.map((hit:any)=>hit.field),["notes","maker"]);
    assert.equal(gnome.searchHits[0].label,"Notes / themes");
    const all=await handleApiRequest(new Request(origin+"/api/catalog/shapes"),owner,db);
    assert.ok((await all.json() as any).records.every((row:any)=>row.searchHits.length===0));
  }finally{await runtime.dispose();}
});
test("phrases cannot match across field boundaries; long note hits show bounded safe context",async()=>{
  const {runtime,db}=await env();
  try {
    await create(db,"shapes",{name:"Christmas",notes:"tree"});
    await create(db,"shapes",{name:"TEST note",notes:"x".repeat(300)+"<script>TrEe</script>"+"y".repeat(300)});
    const spanning=await handleApiRequest(new Request(origin+"/api/catalog/shapes?q=Christmas%20tree"),owner,db);
    assert.equal((await spanning.json() as any).records.length,0);
    const response=await handleApiRequest(new Request(origin+"/api/catalog/shapes?q=tree"),owner,db);
    const rows=(await response.json() as any).records;
    const hit=rows.find((row:any)=>row.name==="TEST note").searchHits[0];
    assert.ok(hit.snippet.length<130);assert.equal(hit.snippet.slice(hit.start,hit.start+hit.length),"TrEe");
    assert.ok(hit.snippet.startsWith("…"));assert.ok(hit.snippet.endsWith("…"));
  }finally{await runtime.dispose();}
});
test("physical dimensions/location/origin and mapping status explain their own matches",async()=>{
  const {runtime,db}=await env();
  try {
    const shape=await create(db,"shapes",{name:"TEST star"});
    const design=await create(db,"designs",{name:"TEST holiday"});
    const location=await create(db,"locations",{label:"Tree drawer"});
    await create(db,"physical_cutters",{shape_id:shape.id,location_id:location.id,width_mm:90,height_mm:100,quantity:1,origin:"printed"});
    await create(db,"design_shape_links",{shape_id:shape.id,design_id:design.id,status:"tested",use_type:"flip",mirrored:0});
    for(const [kind,query,field] of [["physical_cutters","90.0","width_mm"],["physical_cutters","tree","location_label"],["physical_cutters","printed","origin"],["design_shape_links","tested","status"]]) {
      const response=await handleApiRequest(new Request(origin+"/api/catalog/"+kind+"?q="+query),owner,db);
      const row=(await response.json() as any).records[0];assert.ok(row);
      assert.equal(row.searchHits[0].field,field);
      const hit=row.searchHits[0];assert.equal(hit.snippet.slice(hit.start,hit.start+hit.length).toLowerCase(),query);
    }
  }finally{await runtime.dispose();}
});
