import {body} from './catalog';
import {sha256} from './development-backup';
type Row=Record<string,any>;
export type RecordState={shape:Row|null;cutter:Row|null;tags:Row[]};
export type RecordChange={format:'cookie-catalog-record-change';version:1;id:string;subject:string;at:string;method:string;kind:string;recordId:string;shapeId:string;before:RecordState;after:RecordState;undoOf?:string};
const prefix='catalog-backups/record-changes/';
const idPattern=/^\d{13}_[a-f0-9]{32}$/;
const canonical=(value:any):any=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])])):value;
export const recordRevision=async(state:RecordState)=>'"'+await sha256(new TextEncoder().encode(JSON.stringify(canonical(state))))+'"';
export async function readRecordState(db:D1Database,shapeId:string,cutterId?:string):Promise<RecordState>{
 const queries=[db.prepare('SELECT * FROM shapes WHERE id=?').bind(shapeId),db.prepare('SELECT t.* FROM tags t JOIN shape_tags st ON st.tag_id=t.id WHERE st.shape_id=? ORDER BY t.id').bind(shapeId)];
 if(cutterId)queries.push(db.prepare('SELECT * FROM physical_cutters WHERE id=?').bind(cutterId));
 const result=await db.batch<Row>(queries);
 return {shape:result[0].results[0]??null,tags:result[1].results,cutter:cutterId?result[2].results[0]??null:null};
}
export function rowGuard(db:D1Database,table:string,row:Row){const fields=Object.keys(row);if(fields.some(f=>!/^[a-z_]+$/.test(f)))throw Error('Invalid recovery field.');return db.prepare(`SELECT CASE WHEN EXISTS(SELECT 1 FROM ${table} WHERE ${fields.map(f=>f+' IS ?').join(' AND ')}) THEN 1 ELSE json('workspace conflict') END`).bind(...fields.map(f=>row[f]));}
export function stateGuards(db:D1Database,state:RecordState,shapeId:string,cutterId?:string){
 const statements=[state.shape?rowGuard(db,'shapes',state.shape):db.prepare("SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM shapes WHERE id=?) THEN 1 ELSE json('workspace conflict') END").bind(shapeId)];
 if(cutterId)statements.push(state.cutter?rowGuard(db,'physical_cutters',state.cutter):db.prepare("SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM physical_cutters WHERE id=?) THEN 1 ELSE json('workspace conflict') END").bind(cutterId));
 statements.push(db.prepare("SELECT CASE WHEN (SELECT json_group_array(json_array(id,label,category)) FROM (SELECT t.* FROM tags t JOIN shape_tags st ON st.tag_id=t.id WHERE st.shape_id=? ORDER BY t.id))=? THEN 1 ELSE json('workspace conflict') END").bind(shapeId,JSON.stringify(state.tags.map(t=>[t.id,t.label,t.category??null]))));return statements;
}
export async function relationshipGuard(db:D1Database,table:'shapes'|'physical_cutters',id:string){
 const pattern=new RegExp('\\bREFERENCES\\s+(?:"'+table+'"|'+table+')\\s*\\(','i');
 const tables=(await db.prepare("SELECT name,sql FROM sqlite_schema WHERE type='table'").all<{name:string;sql:string}>()).results.filter(t=>pattern.test(t.sql??''));
 const references:string[]=[];
 for(const t of tables){if(!/^[a-z_][a-z0-9_]*$/.test(t.name))throw Error('Unsupported relationship.');const links=(await db.prepare('PRAGMA foreign_key_list('+t.name+')').all<{table:string;from:string;to:string}>()).results;for(const link of links.filter(l=>l.table===table&&l.to==='id')){if(!/^[a-z_][a-z0-9_]*$/.test(link.from))throw Error('Unsupported relationship.');references.push(`SELECT 1 FROM ${t.name} WHERE ${link.from}=?`);}}
 return references.length?[db.prepare(`SELECT CASE WHEN ${references.map(sql=>'NOT EXISTS('+sql+')').join(' AND ')} THEN 1 ELSE json('entry has relationships') END`).bind(...references.map(()=>id))]:[];
}
export async function protectRecordChange(files:R2Bucket,change:Omit<RecordChange,'format'|'version'|'id'|'at'>){
 const at=new Date().toISOString(),id=String(9999999999999-Date.now()).padStart(13,'0')+'_'+crypto.randomUUID().replaceAll('-','');
 const record:RecordChange={...change,format:'cookie-catalog-record-change',version:1,id,at};
 const bytes=new TextEncoder().encode(JSON.stringify(record));if(bytes.length>256*1024)throw Error('This entry exceeds the routine recovery limit. No change was saved.');
 const saved=await files.put(prefix+id+'.json',bytes,{sha256:await sha256(bytes),onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/json'},customMetadata:{at,method:change.method,kind:change.kind}});
 if(!saved)throw Error('The record recovery copy could not be saved. Your draft is kept.');return id;
}
async function load(files:R2Bucket,id:string){if(!idPattern.test(id))throw Error('Invalid recovery record.');const object=await files.get(prefix+id+'.json');if(!object||object.size>256*1024)throw Error('Recovery record missing or oversized.');const bytes=new Uint8Array(await object.arrayBuffer());if(!object.checksums.sha256||await sha256(bytes)!==Array.from(new Uint8Array(object.checksums.sha256),b=>b.toString(16).padStart(2,'0')).join(''))throw Error('Recovery checksum failed.');const change=JSON.parse(new TextDecoder().decode(bytes)) as RecordChange;if(change.format!=='cookie-catalog-record-change'||change.version!==1||change.id!==id)throw Error('Unsupported recovery record.');return change;}
function writeRow(db:D1Database,table:'shapes'|'physical_cutters',row:Row){const fields=Object.keys(row);if(fields.some(f=>!/^[a-z_]+$/.test(f)))throw Error('Invalid recovery field.');return db.prepare(`INSERT INTO ${table}(${fields.join(',')}) VALUES(${fields.map(()=>'?').join(',')}) ON CONFLICT(id) DO UPDATE SET ${fields.filter(f=>f!=='id').map(f=>f+'=excluded.'+f).join(',')}`).bind(...fields.map(f=>row[f]));}
export async function handleRecordRecovery(request:Request,db:D1Database,files:R2Bucket,subject:string,owner:boolean){
 const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'cache-control':'no-store'}});
 if(!owner)return json({error:'Owner/admin access required for record recovery.'},403);
 try{
  const path=new URL(request.url).pathname.slice('/api/workspace/recovery'.length);
  if(!path&&request.method==='GET'){const page=await files.list({prefix,limit:10,include:['customMetadata']});return json({changes:page.objects.map(o=>({id:o.key.slice(prefix.length,-5),...o.customMetadata})),hasMore:page.truncated});}
  const match=/^\/(\d{13}_[a-f0-9]{32})$/.exec(path);if(!match)return json({error:'Recovery route not found.'},404);
  const change=await load(files,match[1]),cutterId=change.kind==='cutters'?change.recordId:undefined;
  const current=await readRecordState(db,change.shapeId,cutterId),revision=await recordRevision(current),expected=await recordRevision(change.after),canUndo=revision===expected&&expected!==await recordRevision(change.before);
  if(request.method==='GET')return json({id:change.id,at:change.at,method:change.method,kind:change.kind,revision,canUndo,beforeName:change.before.shape?.name??null,afterName:change.after.shape?.name??null,reason:canUndo?'The entry matches the recorded result. Undo restores its previous values.':'The entry no longer matches this result, or this attempt made no change. Newer values will not be overwritten.'});
  if(request.method!=='POST')return json({error:'Method not allowed.'},405);
  const input=await body(request) as Row;if(input.approved!==true)return json({error:'Review and approve undo first.'},400);
  if(!canUndo||request.headers.get('if-match')!==revision)return json({error:'This entry changed. Review a fresh undo preview.'},412);
  const target=change.before,statements=stateGuards(db,current,change.shapeId,cutterId);
  if(current.cutter&&!target.cutter){statements.push(...await relationshipGuard(db,'physical_cutters',cutterId!));statements.push(db.prepare('DELETE FROM physical_cutters WHERE id=?').bind(cutterId));}
  if(target.shape)statements.push(writeRow(db,'shapes',target.shape));
  statements.push(db.prepare('DELETE FROM shape_tags WHERE shape_id=?').bind(change.shapeId));
  if(target.tags.length){const encoded=JSON.stringify(target.tags);
   statements.push(db.prepare("INSERT INTO tags(id,label,category) SELECT json_extract(value,'$.id'),json_extract(value,'$.label'),json_extract(value,'$.category') FROM json_each(?) WHERE true ON CONFLICT(id) DO NOTHING").bind(encoded));
   statements.push(db.prepare("SELECT CASE WHEN NOT EXISTS(SELECT 1 FROM json_each(?) j WHERE NOT EXISTS(SELECT 1 FROM tags t WHERE t.id=json_extract(j.value,'$.id') AND t.label IS json_extract(j.value,'$.label') AND t.category IS json_extract(j.value,'$.category'))) THEN 1 ELSE json('workspace conflict') END").bind(encoded));
   statements.push(db.prepare("INSERT INTO shape_tags(shape_id,tag_id) SELECT ?,json_extract(value,'$.id') FROM json_each(?)").bind(change.shapeId,encoded));
  }
  if(target.cutter)statements.push(writeRow(db,'physical_cutters',target.cutter));
  if(current.shape&&!target.shape){statements.push(...await relationshipGuard(db,'shapes',change.shapeId));statements.push(db.prepare('DELETE FROM shapes WHERE id=?').bind(change.shapeId));}
  const recoveryId=await protectRecordChange(files,{subject,method:'UNDO',kind:change.kind,recordId:change.recordId,shapeId:change.shapeId,before:current,after:target,undoOf:change.id});
  await db.batch(statements);return json({restored:true,recoveryId});
 }catch(error){const message=(error as Error).message;return json({error:/malformed JSON|constraint|FOREIGN KEY|workspace conflict|entry has relationships/i.test(message)?'Undo could not safely apply: the entry, vocabulary or relationships changed. Nothing was overwritten.':message},409);}
}
