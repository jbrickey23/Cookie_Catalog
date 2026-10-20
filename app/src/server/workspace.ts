import type {CatalogEnvironment} from '../catalog-environment';
import {body,validate} from './catalog';
import {hasSourceMappings,sourceEvidenceSql} from './source-location';
import {sourceLocation} from '../source-location';
import {protectRecordChange,handleRecordRecovery,type RecordState} from './record-recovery';
import {advanceManagedBackup,assertFreshBackup,listManagedBackups,startManagedBackup} from './managed-backups';
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'cache-control':'no-store'}});
const normalize=(value:string)=>value.normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('en-US');
const hash=async(value:unknown)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value)))),n=>n.toString(16).padStart(2,'0')).join('');
const token=async(value:unknown)=>'"'+await hash(value)+'"';
const idPattern=/^[a-zA-Z0-9_-]{1,128}$/;
type Row=Record<string,any>;
async function tags(db:D1Database,shapeId:string){return (await db.prepare('SELECT t.* FROM tags t JOIN shape_tags st ON st.tag_id=t.id WHERE st.shape_id=? ORDER BY t.id').bind(shapeId).all<Row>()).results;}
async function state(db:D1Database,kind:string,id:string){
 const cutter=kind==='cutters'?await db.prepare('SELECT * FROM physical_cutters WHERE id=?').bind(id).first<Row>():null;
 const shape=await db.prepare('SELECT * FROM shapes WHERE id=?').bind(kind==='cutters'?cutter?.shape_id??'':id).first<Row>();
 if(!shape||kind==='cutters'&&!cutter)return null;
 return {shape,cutter,tags:await tags(db,shape.id)};
}
function guard(db:D1Database,table:string,row:Row){const fields=Object.keys(row);return db.prepare(`SELECT CASE WHEN EXISTS(SELECT 1 FROM ${table} WHERE ${fields.map(f=>f+' IS ?').join(' AND ')}) THEN 1 ELSE json('workspace conflict') END`).bind(...fields.map(f=>row[f]));}
async function vocabulary(db:D1Database,includeShapes=true){const [shapes,tags,locations]=await db.batch([db.prepare(includeShapes?'SELECT id,name,maker,source_url FROM shapes ORDER BY id LIMIT 10001':'SELECT id,name,maker,source_url FROM shapes WHERE 0'),db.prepare('SELECT * FROM tags ORDER BY id LIMIT 1001'),db.prepare('SELECT id,label FROM locations ORDER BY label LIMIT 1001')]);if(shapes.results.length>10000||tags.results.length>1000||locations.results.length>1000)throw Error('Vocabulary exceeds the supported workspace limit.');return {shapes:shapes.results as Row[],tags:tags.results as Row[],locations:locations.results as Row[]};}
// Guard a vocabulary snapshot so duplicate detection cannot race another writer.
function vocabularyGuard(db:D1Database,table:'shapes'|'tags',rows:Row[]){const fields=table==='shapes'?['id','name','maker','source_url']:['id','label','category'];return db.prepare(`SELECT CASE WHEN (SELECT json_group_array(json_array(${fields.join(',')})) FROM (SELECT * FROM ${table} ORDER BY id))=? THEN 1 ELSE json('workspace conflict') END`).bind(JSON.stringify(rows.map(r=>fields.map(f=>r[f]??null))));}
export async function handleWorkspace(request:Request,db:D1Database,files:R2Bucket,subject:string,owner:boolean,environment:CatalogEnvironment='development'){
 try{
  const path=new URL(request.url).pathname.slice('/api/workspace'.length);
  if(path==='/recovery'||path.startsWith('/recovery/'))return handleRecordRecovery(request,db,files,subject,owner);
  const related=/^\/shapes\/([a-zA-Z0-9_-]{1,128})\/inventory$/.exec(path);
  if(related&&request.method==='GET')return json({items:(await db.prepare('SELECT id,shape_id,quantity,reference_size_mm,width_mm,height_mm,slot FROM physical_cutters WHERE shape_id=? ORDER BY id LIMIT 200').bind(related[1]).all()).results});
  if(path==='/vocabulary'&&request.method==='GET')return json(await vocabulary(db));
  // Editors may create/advance their own protection point, without archive/restore access.
  if(path==='/checkpoint'&&request.method==='POST'){
   const input=await body(request) as Row;
   if(input.id){if(typeof input.id!=='string'||!/^backup_[a-f0-9]{32}$/.test(input.id))return json({error:'Invalid checkpoint.'},400);const job=(await listManagedBackups(files)).find(j=>j.id===input.id&&j.createdBy===subject&&j.kind==='pre-change');if(!job)return json({error:'Checkpoint not found.'},404);try{return json(await advanceManagedBackup(files,input.id));}catch(error){if(!/progress changed/i.test((error as Error).message))throw error;const latest=(await listManagedBackups(files)).find(j=>j.id===input.id);if(!latest)throw error;return json(latest);}}
   const jobs=await listManagedBackups(files),pending=jobs.find(j=>j.status==='copying'&&j.kind==='pre-change'&&j.createdBy===subject);
   if(pending)return json(pending);
   const latest=jobs.find(j=>j.status==='complete'&&j.kind==='pre-change');
   if(latest){try{await assertFreshBackup(db,files,latest.id);return json(latest);}catch{/* A changed catalog needs its own recovery point. */}}
   return json(await startManagedBackup(db,files,subject,'pre-change',environment),201);
  }
  const match=/^\/(shapes|cutters)(?:\/([a-zA-Z0-9_-]{1,128}))?$/.exec(path);if(!match)return json({error:'Workspace route not found.'},404);
  const [,kind,id]=match;
  const previous=id?await state(db,kind,id):null;
  if(id&&!previous)return json({error:'Entry not found.'},404);
  if(request.method==='GET'&&previous){const mappings=await hasSourceMappings(db);const evidence=previous.cutter?await db.prepare(`SELECT ${sourceEvidenceSql(mappings)} AS evidence FROM physical_cutters c WHERE c.id=?`).bind(id).first<{evidence:string}>():null;return json({...previous,sizes:(await db.prepare('SELECT id,label,target_width_mm,target_height_mm FROM shape_size_variants WHERE shape_id=? ORDER BY label LIMIT 200').bind(previous.shape.id).all()).results,revision:await token(previous),sourceBin:sourceLocation(evidence?.evidence??previous.shape.notes)});}
  if(!['POST','PUT','DELETE'].includes(request.method)||request.method==='POST'&&id||request.method!=='POST'&&!id)return json({error:'Method not allowed.'},405);
  if(previous&&request.headers.get('if-match')!==await token(previous))return json({error:'This entry changed. Your draft is kept. Compare with the latest record before saving.'},412);
  if(request.method==='DELETE'&&!owner)return json({error:'Owner approval is required to delete entries.'},403);
  const input=await body(request) as Row;
  const statements:D1PreparedStatement[]=[];
  if(previous){statements.push(guard(db,'shapes',previous.shape));if(previous.cutter)statements.push(guard(db,'physical_cutters',previous.cutter));statements.push(db.prepare("SELECT CASE WHEN (SELECT json_group_array(tag_id) FROM (SELECT tag_id FROM shape_tags WHERE shape_id=? ORDER BY tag_id))=? THEN 1 ELSE json('workspace conflict') END").bind(previous.shape.id,JSON.stringify(previous.tags.map(t=>t.id))));statements.push(db.prepare("SELECT CASE WHEN (SELECT json_group_array(json_array(id,label,category)) FROM (SELECT t.* FROM tags t JOIN shape_tags st ON st.tag_id=t.id WHERE st.shape_id=? ORDER BY t.id))=? THEN 1 ELSE json('workspace conflict') END").bind(previous.shape.id,JSON.stringify(previous.tags.map(t=>[t.id,t.label,t.category??null]))));}
  let shapeId=previous?.shape.id,recordId=id;
  let recoveryBefore:RecordState=previous??{shape:null,cutter:null,tags:[]},recoveryAfter:RecordState={shape:kind==='cutters'?previous?.shape??null:null,cutter:null,tags:kind==='cutters'?previous?.tags??[]:[]};
  if(request.method==='DELETE'){
   if(input.approved!==true)return json({error:'Confirm deletion of this entry.'},400);
   const table=kind==='cutters'?'physical_cutters':'shapes';
   // Every inbound relationship blocks deletion, including CASCADE associations.
   const pattern=new RegExp('\\bREFERENCES\\s+(?:"'+table+'"|'+table+')\\s*\\(','i');
   const tables=(await db.prepare("SELECT name,sql FROM sqlite_schema WHERE type='table'").all<{name:string;sql:string}>()).results.filter(t=>pattern.test(t.sql??''));
   const references:string[]=[];
   for(const t of tables){if(!/^[a-z_][a-z0-9_]*$/.test(t.name))throw Error('Unsupported relationship.');const links=(await db.prepare('PRAGMA foreign_key_list('+t.name+')').all<{table:string;from:string;to:string}>()).results;for(const link of links.filter(l=>l.table===table&&l.to==='id')){if(!/^[a-z_][a-z0-9_]*$/.test(link.from))throw Error('Unsupported relationship.');references.push(`SELECT 1 FROM ${t.name} WHERE ${link.from}=?`);}}
   if(references.length)statements.push(db.prepare(`SELECT CASE WHEN ${references.map(sql=>'NOT EXISTS('+sql+')').join(' AND ')} THEN 1 ELSE json('entry has relationships') END`).bind(...references.map(()=>id)));
   statements.push(db.prepare('DELETE FROM '+table+' WHERE id=?').bind(id));
  }else{
   if(Object.keys(input).some(k=>!['shape','cutter','tags','existingShapeId','shapeRevision'].includes(k)))return json({error:'Unsupported entry fields.'},400);
   const vocab=await vocabulary(db,!previous&&!input.existingShapeId);let target=previous;
   if(!previous&&input.existingShapeId){if(typeof input.existingShapeId!=='string'||!idPattern.test(input.existingShapeId))throw Error('Invalid shape reference.');target=await state(db,'shapes',input.existingShapeId);if(!target||input.shapeRevision!==await token(target))return json({error:'The selected shape changed. Select it again before saving.'},412);shapeId=target.shape.id;statements.push(guard(db,'shapes',target.shape));statements.push(db.prepare("SELECT CASE WHEN (SELECT json_group_array(tag_id) FROM (SELECT tag_id FROM shape_tags WHERE shape_id=? ORDER BY tag_id))=? THEN 1 ELSE json('workspace conflict') END").bind(shapeId,JSON.stringify(target.tags.map(t=>t.id))));}
   recoveryBefore=target??{shape:null,cutter:null,tags:[]};
   const linkedCreate=!previous&&!!input.existingShapeId;
   let shape:Row;
   if(linkedCreate){
    if(kind!=='cutters')return json({error:'Select an existing reference only when adding physical inventory.'},400);
    const expectedShape={...target!.shape};
    try{const metadata=JSON.parse(expectedShape.notes);if(metadata?.source)expectedShape.notes=metadata.catalogNotes??'';}catch{/* Plain notes stay plain. */}
    const editable={name:expectedShape.name,maker:expectedShape.maker,source_url:expectedShape.source_url,notes:expectedShape.notes};
    const expectedTags=target!.tags.map(t=>t.id).sort();
    if(!Array.isArray(input.tags)||JSON.stringify(input.tags.map((t:Row)=>t?.id).sort())!==JSON.stringify(expectedTags)||!input.shape||Object.keys(input.shape).some(k=>!Object.hasOwn(editable,k))||Object.entries(editable).some(([key,value])=>String(input.shape[key]??'').trim()!==String(value??'').trim()))
     return json({error:'Add to Inventory cannot change the shared reference. Re-select it and edit physical details only.'},400);
    shape={...target!.shape};
   }else shape=validate('shapes',input.shape);
   // Imported notes also hold immutable source provenance. Only catalogNotes is editable.
   if(!linkedCreate&&target?.shape.notes){try{const metadata=JSON.parse(target.shape.notes);if(metadata&&typeof metadata==='object'&&!Array.isArray(metadata)&&metadata.source)shape.notes=JSON.stringify({...metadata,catalogNotes:shape.notes});}catch{/* Plain notes stay plain. */}}
   if(!shapeId){const normalized=normalize(String(shape.name));if(vocab.shapes.some(s=>normalize(s.name)===normalized&&normalize(s.maker??'')===normalize(String(shape.maker??''))))return json({error:'A reference with this name and producer already exists. Select it to add inventory, or distinguish the producer/design in the name.'},409);shapeId='shape_'+crypto.randomUUID().replaceAll('-','');statements.push(vocabularyGuard(db,'shapes',vocab.shapes));const createdAt=new Date().toISOString();statements.push(db.prepare('INSERT INTO shapes(id,name,maker,source_url,notes,created_at) VALUES (?,?,?,?,?,?)').bind(shapeId,shape.name,shape.maker,shape.source_url,shape.notes,createdAt));recoveryAfter.shape={id:shapeId,...shape,created_at:createdAt};}
   else if(!linkedCreate){statements.push(db.prepare('UPDATE shapes SET name=?,maker=?,source_url=?,notes=? WHERE id=?').bind(shape.name,shape.maker,shape.source_url,shape.notes,shapeId));recoveryAfter.shape={...target!.shape,...shape};}
   if(linkedCreate)recoveryAfter.shape={...target!.shape};
   if(!Array.isArray(input.tags)||input.tags.length>50)return json({error:'Choose at most 50 tags.'},400);
   if(linkedCreate)recoveryAfter.tags=target!.tags;
   else {
   statements.push(vocabularyGuard(db,'tags',vocab.tags));const selected=new Set<string>(),createdTags=new Map<string,string>();
   for(const t of input.tags){if(!t||typeof t!=='object'||Array.isArray(t)||Object.keys(t).some(k=>!['id','label'].includes(k)))return json({error:'Invalid tag.'},400);let tagId:string;
    if(t.id){const found=vocab.tags.find(tag=>tag.id===t.id);if(!found)return json({error:'A selected tag no longer exists.'},409);tagId=found.id;}
    else{if(typeof t.label!=='string'||!t.label.trim()||t.label.trim().length>200||/[\x00-\x1f]/.test(t.label))return json({error:'Tags need a label of 1–200 characters.'},400);const normalized=normalize(t.label),found=vocab.tags.find(tag=>normalize(tag.label)===normalized);tagId=found?.id??'tag_'+await hash(normalized);if(!found)createdTags.set(tagId,t.label.trim().replace(/\s+/g,' '));}
    selected.add(tagId);
   }
   recoveryAfter.tags=[...selected].sort().map(id=>vocab.tags.find(t=>t.id===id)??{id,label:createdTags.get(id)!,category:null});
   if(createdTags.size)statements.push(db.prepare("INSERT INTO tags(id,label) SELECT json_extract(value,'$[0]'),json_extract(value,'$[1]') FROM json_each(?) WHERE true ON CONFLICT(id) DO NOTHING").bind(JSON.stringify([...createdTags])));
   statements.push(db.prepare('DELETE FROM shape_tags WHERE shape_id=?').bind(shapeId));if(selected.size)statements.push(db.prepare('INSERT INTO shape_tags(shape_id,tag_id) SELECT ?,value FROM json_each(?)').bind(shapeId,JSON.stringify([...selected])));
   }
   if(kind==='cutters'){
    if(!input.cutter||Object.hasOwn(input.cutter,'shape_id'))return json({error:'Choose the shape through the shape reference.'},400);
    const columns=(await db.prepare('PRAGMA table_info(physical_cutters)').all<{name:string}>()).results.map(r=>r.name);
    const fields=['shape_id','location_id','width_mm','height_mm','quantity','origin','notes',...(columns.includes('reference_size_mm')?['reference_size_mm','slot']:[])];
    const cutter=validate('physical_cutters',{...input.cutter,shape_id:shapeId},fields);
    if(cutter.location_id&&!vocab.locations.some(l=>l.id===cutter.location_id))return json({error:'Select an existing BIN/location. New BIN IDs cannot be created here.'},400);
    if(previous)statements.push(db.prepare('UPDATE physical_cutters SET '+fields.map(f=>f+'=?').join(',')+' WHERE id=?').bind(...fields.map(f=>cutter[f]),id));
    else{recordId='cutter_'+crypto.randomUUID().replaceAll('-','');statements.push(db.prepare('INSERT INTO physical_cutters(id,'+fields.join(',')+') VALUES (?,'+fields.map(()=>'?').join(',')+')').bind(recordId,...fields.map(f=>cutter[f])));}
   recoveryAfter.cutter={id:recordId??id,...cutter};
   }else if(input.cutter)return json({error:'A shape reference does not create physical inventory.'},400);
   else recordId=shapeId;
  }
  const recoveryId=await protectRecordChange(files,{subject,method:request.method,kind,recordId:recordId!,shapeId:shapeId!,before:recoveryBefore,after:recoveryAfter});
  await db.batch(statements);
  if(request.method==='DELETE')return json({deleted:true,recoveryId});
  const saved=await state(db,kind,recordId!);return json({...saved,recoveryId,revision:await token(saved)},previous?200:201);
 }catch(error){const message=(error as Error).message;if(/malformed JSON/i.test(message)&&request.method==='DELETE'){const match=/\/(shapes|cutters)\/([a-zA-Z0-9_-]+)$/.exec(new URL(request.url).pathname);const current=match?await state(db,match[1],match[2]):null;if(current&&await token(current)===request.headers.get('if-match'))return json({error:'This entry is still linked to inventory, tags, files, designs or source history. Reconcile those relationships before deletion.'},409);}
  if(/workspace conflict|malformed JSON/i.test(message))return json({error:'The entry or vocabulary changed. Your draft is kept; compare before retrying.'},412);if(/entry has relationships|FOREIGN KEY/i.test(message))return json({error:'This entry is still linked to inventory, tags, files, designs or source history. Remove/reconcile those relationships before deletion.'},409);if(/constraint|UNIQUE/i.test(message))return json({error:'This change conflicts with another record. Your draft is kept.'},409);return json({error:message.includes('D1_')?'The change could not be committed. Your draft is kept.':message},400);}
}
