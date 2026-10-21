import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {Miniflare,convertV4MiniflareOptions} from 'miniflare';
import {handleApiRequest} from '../src/worker';
import {CutterCard,ownershipLabel,type BrowseItem} from '../src/Browse';
import type {IdentityVerifier} from '../src/server/access-identity';
const viewer:IdentityVerifier={verify:async()=>({subject:'viewer',email:'viewer@example.test',role:'viewer'})};
test('design cards show only identity image and inventory-derived human status',()=>{
 const item:BrowseItem={id:'s',shape_id:'s',name:'Christmas Tree',maker:'Producer A',inventory_count:3,image_id:'photo',image_name:'example.png',quantity:9,location:'SECRET BIN',reference_size_mm:76.2};
 const html=renderToStaticMarkup(React.createElement(CutterCard,{item}));assert.match(html,/Christmas Tree/);assert.match(html,/Producer A/);assert.match(html,/In my collection/);assert.doesNotMatch(html,/SECRET BIN|Quantity|Dimensions|76.2|Physical|Reference|example.png/);
 assert.equal(ownershipLabel({...item,inventory_count:0}),'Saved design');assert.equal(ownershipLabel({...item,inventory_count:0,review_state:'set_review'}),'Inventory needs review');assert.equal(ownershipLabel({...item,inventory_count:0,review_state:'not_printed'}),'Saved design');
});
test('unified search groups producers before pagination, matches linked ideas and never infers ownership from files',async()=>{
 const runtime=new Miniflare(convertV4MiniflareOptions({modules:true,script:"export default {fetch(){return new Response('test')}}",d1Databases:{DB:'unified'},r2Buckets:['FILES']}));
 try{
  const db=await runtime.getD1Database('DB') as unknown as D1Database,files=await runtime.getR2Bucket('FILES') as unknown as R2Bucket;
  const migrate=async(name:string)=>{const sql=readFileSync('../database/migrations/'+name,'utf8').replace(/^--.*$/gm,'');await db.batch(sql.split(';').map(s=>s.trim()).filter(Boolean).map(s=>db.prepare(s)));};
  await migrate('0001_initial.sql');await migrate('0002_variants_components.sql');
  await db.exec("INSERT INTO shapes(id,name,maker,notes) VALUES ('a','Christmas Tree','Producer A',NULL),('b','Christmas Tree','Producer B',NULL),('file','Digital star','Producer C',NULL),('review','Tree kit',NULL,'{\"reviewState\":\"set_review\"}'),('demo','DEMO tree',NULL,NULL); INSERT INTO locations(id,label) VALUES ('bin','TEST Bin 6'); INSERT INTO physical_cutters(id,shape_id,quantity,location_id) VALUES ('medium','a',2,'bin'),('large','a',1,NULL),('zero','a',0,NULL); INSERT INTO tags(id,label) VALUES ('holiday','Holiday'),('season','Winter'),('other','Winter Baking'); INSERT INTO shape_tags VALUES ('a','holiday'); INSERT INTO designs(id,name) VALUES ('idea','Snowy frosting'),('idea2','Chocolate branches'); INSERT INTO design_shape_links(id,design_id,shape_id,status,use_type) VALUES ('l1','idea','a','proposed','standard'),('l2','idea','a','tested','flip'),('l3','idea2','a','proposed','standard'); INSERT INTO design_tags VALUES ('idea','season'),('idea2','season'),('idea2','other');");
  for(const [id,type,name,created] of [['late','image/png','late.png','2026-10-21'],['early','image/png','early.png','2026-10-20'],['idea-image','image/png','idea.png','2026-10-19'],['stl','model/stl','star.stl','2026-10-18']]){
   await db.prepare('INSERT INTO attachments(id,storage_key,filename,media_type,byte_size,sha256,created_at) VALUES(?,?,?,?,1,?,?)').bind(id,'attachments/'+id,name,type,'a'.repeat(64),created).run();await files.put('attachments/'+id,'x');
  }
  await db.exec("INSERT INTO shape_attachments VALUES ('a','late','photo'),('a','early','photo'),('file','stl','original'); INSERT INTO design_attachments VALUES ('idea','idea-image','photo'),('idea2','early','photo');");
  const get=(query='',method='GET')=>handleApiRequest(new Request('https://catalog.test/api/browse'+query,{method}),viewer,db,files);
  const find=async(q:string,filter='all')=>(await (await get('?q='+encodeURIComponent(q)+'&ownership='+filter)).json()) as any;
  const tree=await find('Christmas Tree');assert.equal(tree.total,2);assert.deepEqual(tree.items.map((i:any)=>i.id),['a','b']);assert.equal(tree.items[0].inventory_count,3);assert.equal(tree.items[1].inventory_count,0);assert.equal(tree.items[0].images.length,2);assert.equal(tree.items[0].image_id,'early');assert.equal(tree.items[0].record_kind,'reference');
  assert.deepEqual((await find('Christmas','owned')).items.map((i:any)=>i.id),['a']);assert.deepEqual((await find('Christmas','saved')).items.map((i:any)=>i.id),['b']);assert.deepEqual((await find('"Producer A" Holiday "Bin 6"')).items.map((i:any)=>i.id),['a']);
  for(const query of ['Snowy','Winter','Tree AND Winter','"Chocolate branches" Holiday']){const b=await find(query);assert.equal(b.total,1,query);assert.equal(b.items[0].id,'a',query);}
  const digital=(await find('Digital')).items[0];assert.equal(digital.inventory_count,0);assert.deepEqual(digital.images,[]);assert.equal(digital.image_id,null);
  // Existing read-only attachment route exposes only explicitly linked ideas, deduplicated by original ID.
  const gallery=await (await handleApiRequest(new Request('https://catalog.test/api/attachments?kind=shape&recordId=a&ideas=true'),viewer,db,files)).json() as any;
  assert.equal(gallery.attachments.length,3);assert.equal(new Set(gallery.attachments.map((i:any)=>i.id)).size,3);assert.deepEqual(gallery.attachments.map((i:any)=>i.id),['early','late','idea-image']);assert.match(gallery.attachments.find((i:any)=>i.id==='idea-image').decoratingIdeas,/proposed|tested/);assert.equal(gallery.attachments.find((i:any)=>i.id==='idea-image').direct,false);
  const direct=await (await handleApiRequest(new Request('https://catalog.test/api/attachments?kind=shape&recordId=a'),viewer,db,files)).json() as any;assert.equal(direct.attachments.length,2);
  await migrate('0003_import_reviews.sql');await migrate('0004_catalog_imports.sql');
  await db.prepare("UPDATE physical_cutters SET reference_size_mm=76.2,slot='TEST A' WHERE id='medium'").run();const inventory=await (await handleApiRequest(new Request('https://catalog.test/api/workspace/shapes/a/inventory'),viewer,db,files)).json() as any;assert.equal(inventory.items.length,3);const medium=inventory.items.find((i:any)=>i.id==='medium');assert.equal(medium.location,'TEST Bin 6');assert.equal(medium.quantity,2);assert.equal(medium.reference_size_mm,76.2);assert.equal(medium.slot,'TEST A');
  for(let i=0;i<26;i++)await db.prepare('INSERT INTO shapes(id,name) VALUES (?,?)').bind('page'+i,'TEST page '+String(i).padStart(2,'0')).run();const first=await find('TEST page');assert.equal(first.total,26);assert.equal(first.items.length,24);assert.equal(first.nextOffset,24);const second=await (await get('?q=TEST%20page&offset=24')).json() as any;assert.equal(second.items.length,2);assert.equal(second.nextOffset,null);
  assert.equal((await get('?offset=-1')).status,400);assert.equal((await get('?ownership=invalid')).status,400);assert.equal((await get('?kind=invalid')).status,400);assert.equal((await get('','POST')).status,405);assert.equal((await get('?q=%22unclosed')).status,400);assert.equal((await get('?q=a+b+c+d+e+f+g+h+i')).status,400);assert.equal((await find("%_' OR 1=1")).total,0);
  const noIdentity:IdentityVerifier={verify:async()=>null};assert.equal((await handleApiRequest(new Request('https://catalog.test/api/browse'),noIdentity,db,files)).status,401);
  assert.equal((await db.prepare('SELECT count(*) n FROM physical_cutters').first<any>())!.n,3);assert.equal((await db.prepare('SELECT count(*) n FROM attachments').first<any>())!.n,4);
 }finally{await runtime.dispose();}
});
