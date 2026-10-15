import {validateManifest,type StagingManifest} from "../staging.mjs";
import {importPreview} from "../import-preview";
import {sha256} from "./development-backup";
const MAX_BYTES=1024*1024,MAX_ITEMS=1000;
const idPattern=/^review_[a-f0-9]{32}$/;
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{"cache-control":"no-store","x-content-type-options":"nosniff"}});
const token=(revision:number)=>`"review-${revision}"`;
type Head={id:string;title:string;source_namespace:string;current_revision:number;revision:number;manifest_sha256:string;item_count:number;updated_at:string};
class InputError extends Error {}
async function body(request:Request){
  const reader=request.body?.getReader();if(!reader)throw new InputError("Request body is required.");
  const chunks:Uint8Array[]=[];let size=0;
  try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>MAX_BYTES){await reader.cancel();throw new InputError("Saved reviews support at most 1 MiB; use smaller stable batches.");}chunks.push(part.value);}}
  finally{reader.releaseLock();}
  const data=new Uint8Array(size);let offset=0;for(const chunk of chunks){data.set(chunk,offset);offset+=chunk.length;}
  try{return JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(data));}catch{throw new InputError("Choose a valid JSON review.");}
}
function checkedManifest(value:unknown){
  let manifest:StagingManifest;try{manifest=validateManifest(value);}catch(error){throw new InputError((error as Error).message);}
  if(manifest.items.length>MAX_ITEMS)throw new InputError("Save at most 1000 source items per review; use stable smaller batches.");
  if(manifest.items.some(item=>new TextEncoder().encode(JSON.stringify(item)).length>32000))throw new InputError("A source item exceeds the 32000-byte portable recovery limit; split its file references or notes.");
  return {format:manifest.format,version:manifest.version,sourceNamespace:manifest.sourceNamespace,items:manifest.items};
}
async function open(db:D1Database,id:string,requestedRevision:number|null){
  const head=await db.prepare(`SELECT w.id,w.title,w.source_namespace,w.current_revision,w.updated_at,v.revision,v.manifest_sha256,v.item_count
    FROM import_review_workspaces w JOIN import_review_versions v ON v.workspace_id=w.id AND v.revision=COALESCE(?,w.current_revision) WHERE w.id=?`).bind(requestedRevision,id).first<Head>();
  if(!head)return null;
  const rows=await db.prepare("SELECT item_json FROM import_review_items WHERE workspace_id=? AND revision=? ORDER BY position LIMIT 1001").bind(id,head.revision).all<{item_json:string}>();
  if(rows.results.length!==head.item_count)throw Error("Incomplete saved review");
  const manifest=checkedManifest({format:"cookie-catalog-staging",version:1,sourceNamespace:head.source_namespace,items:rows.results.map(row=>JSON.parse(row.item_json))});
  if(await sha256(new TextEncoder().encode(JSON.stringify(manifest)))!==head.manifest_sha256)throw Error("Saved review checksum mismatch");
  return {head,manifest};
}
export async function handleImportReviews(request:Request,db:D1Database,subject:string):Promise<Response>{
  const url=new URL(request.url),parts=url.pathname.split("/").filter(Boolean).slice(2),id=parts[0];
  if(parts.length>2||id&&!idPattern.test(id)||parts[1]&&parts[1]!=="preview")return json({error:"Review not found."},404);
  try{
    if(request.method==="GET"&&!id){
      const offset=Number(url.searchParams.get("offset")??0);
      if(!Number.isSafeInteger(offset)||offset<0||offset>100000)throw new InputError("Choose a valid review page.");
      const rows=await db.prepare("SELECT id,title,source_namespace,current_revision,updated_at FROM import_review_workspaces ORDER BY updated_at DESC,id LIMIT 21 OFFSET ?").bind(offset).all();
      return json({workspaces:rows.results.slice(0,20),nextOffset:rows.results.length>20?offset+20:null});
    }
    if(request.method==="GET"&&id&&!parts[1]){
      const value=url.searchParams.get("revision"),revision=value===null?null:Number(value);
      if(revision!==null&&(!Number.isSafeInteger(revision)||revision<1))throw new InputError("Choose a valid saved version.");
      const saved=await open(db,id,revision);if(!saved)return json({error:"Review not found."},404);
      const [versions,runs]=await db.batch([
        db.prepare("SELECT revision,item_count,saved_at FROM import_review_versions WHERE workspace_id=? ORDER BY revision DESC LIMIT 50").bind(id),
        db.prepare("SELECT id,revision,created_at,result_json FROM import_review_runs WHERE workspace_id=? ORDER BY created_at DESC,id DESC LIMIT 20").bind(id)
      ]);
      return json({id,title:saved.head.title,revision:token(saved.head.current_revision),loadedRevision:saved.head.revision,manifest:saved.manifest,
        versions:versions.results,previews:(runs.results as {id:string;revision:number;created_at:string;result_json:string}[]).map(row=>({id:row.id,revision:row.revision,created_at:row.created_at,result:JSON.parse(row.result_json)}))});
    }
    if(request.method==="POST"&&id&&parts[1]==="preview"){
      const saved=await open(db,id,null);if(!saved)return json({error:"Review not found."},404);
      if(request.headers.get("If-Match")!==token(saved.head.current_revision))return json({error:"The saved review changed. Reopen it before preparing a preview."},412);
      const result=importPreview(saved.manifest),runId="preview_"+crypto.randomUUID().replaceAll("-","");
      const stored=await db.prepare(`INSERT INTO import_review_runs(id,workspace_id,revision,manifest_sha256,mode,result_json,created_by,created_at)
        SELECT ?,id,current_revision,?,'preview',?,?,? FROM import_review_workspaces WHERE id=? AND current_revision=? RETURNING id`)
        .bind(runId,saved.head.manifest_sha256,JSON.stringify(result),subject,new Date().toISOString(),id,saved.head.current_revision).all();
      if(!stored.results.length)return json({error:"The saved review changed. Reopen it before preparing a preview."},412);
      return json({id:runId,revision:saved.head.current_revision,...result},201);
    }
    if((request.method==="POST"&&!id)||(request.method==="PUT"&&id&&!parts[1])){
      const input=await body(request);
      if(!input||typeof input!=="object"||Array.isArray(input)||Object.keys(input).some(key=>!["id","title","manifest"].includes(key))||typeof input.title!=="string"||!input.title.trim()||input.title.length>120||/[\x00-\x1f]/.test(input.title))throw new InputError("Give the saved review a title of 1–120 characters.");
      const manifest=checkedManifest(input.manifest),workspaceId=id??input.id;
      if(typeof workspaceId!=="string"||!idPattern.test(workspaceId)||(id&&input.id!==undefined&&input.id!==id))throw new InputError("Invalid saved review identifier.");
      const manifestHash=await sha256(new TextEncoder().encode(JSON.stringify(manifest))),now=new Date().toISOString(),saveToken=crypto.randomUUID();
      let revision=1;
      if(id){
        const match=/^"review-([1-9]\d*)"$/.exec(request.headers.get("If-Match")??"");
        if(!match||!Number.isSafeInteger(Number(match[1]))||Number(match[1])>=Number.MAX_SAFE_INTEGER)return json({error:"Reopen the saved review before saving changes."},428);
        revision=Number(match[1])+1;
      }else{
        const existing=await open(db,workspaceId,null);
        if(existing)return existing.head.manifest_sha256===manifestHash&&existing.head.title===input.title.trim()
          ?json({id:workspaceId,title:existing.head.title,revision:token(existing.head.current_revision),saved:true,replayed:true})
          :json({error:"This review identifier already exists. Reopen it before saving changes."},409);
      }
      const statement=id?db.prepare(`UPDATE import_review_workspaces SET title=?,current_revision=current_revision+1,save_token=?,updated_at=?
        WHERE id=? AND current_revision=? AND source_namespace=? RETURNING id,current_revision`).bind(input.title.trim(),saveToken,now,id,revision-1,manifest.sourceNamespace)
        :db.prepare(`INSERT INTO import_review_workspaces(id,title,source_namespace,current_revision,save_token,created_at,updated_at)
          VALUES (?,?,?,1,?,?,?) ON CONFLICT(id) DO NOTHING RETURNING id,current_revision`).bind(workspaceId,input.title.trim(),manifest.sourceNamespace,saveToken,now,now);
      // All writes share one D1 transaction. A stale update inserts no version/items.
      const result=await db.batch([statement,
        db.prepare(`INSERT INTO import_review_versions(workspace_id,revision,manifest_sha256,item_count,saved_by,saved_at)
          SELECT id,current_revision,?,?,?,? FROM import_review_workspaces WHERE id=? AND save_token=?`).bind(manifestHash,manifest.items.length,subject,now,workspaceId,saveToken),
        db.prepare(`INSERT INTO import_review_items(workspace_id,revision,source_key,position,item_json)
          SELECT w.id,w.current_revision,json_extract(j.value,'$.sourceKey'),CAST(j.key AS INTEGER),j.value
          FROM import_review_workspaces w,json_each(?) j WHERE w.id=? AND w.save_token=?`).bind(JSON.stringify(manifest.items),workspaceId,saveToken)
      ]);
      if(!result[0].results.length&&!id){
        const existing=await open(db,workspaceId,null);
        return existing&&existing.head.manifest_sha256===manifestHash&&existing.head.title===input.title.trim()
          ?json({id:workspaceId,title:existing.head.title,revision:token(existing.head.current_revision),saved:true,replayed:true})
          :json({error:"This review identifier already exists. Reopen it before saving changes."},409);
      }
      if(!result[0].results.length)return json({error:"The saved review changed or its source namespace differs. Your draft is kept; reopen and compare before saving."},412);
      return json({id:workspaceId,title:input.title.trim(),revision:token(revision),saved:true},id?200:201);
    }
    return json({error:"Method not allowed."},405);
  }catch(error){
    if(error instanceof InputError)return json({error:error.message},400);
    return json({error:"Saved reviews are unavailable. Check the review migration and retry; your browser draft is kept."},503);
  }
}
