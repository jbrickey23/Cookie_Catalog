type Value = string | number | null;
const ID = /^[a-zA-Z0-9_-]{1,128}$/;
const specs = {
  shapes: { fields: ["name","maker","source_url","notes"], required: ["name"] },
  designs: { fields: ["name","source_url","notes"], required: ["name"] },
  locations: { fields: ["label","notes"], required: ["label"] },
  physical_cutters: { fields: ["shape_id","location_id","width_mm","height_mm","quantity","origin","notes"], required: ["shape_id","quantity","origin"] },
  design_shape_links: { fields: ["design_id","shape_id","status","use_type","instructions","rotation_degrees","mirrored","min_width_mm","max_width_mm"], required: ["design_id","shape_id","status","use_type","mirrored"] }
} as const;
type Kind = keyof typeof specs;
function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value),{status,headers:{"content-type":"application/json","cache-control":"no-store","x-content-type-options":"nosniff"}});
}
class InputError extends Error {}
function validate(kind: Kind, input: unknown): Record<string,Value> {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new InputError("Record must be a JSON object.");
  const source=input as Record<string,unknown>, spec=specs[kind];
  if(Object.keys(source).some(key=>!(spec.fields as readonly string[]).includes(key))) throw new InputError("Record contains unsupported fields.");
  const values: Record<string,Value>={};
  for(const key of spec.fields) {
    const value=source[key];
    const required=(spec.required as readonly string[]).includes(key);
    if(value === undefined || value === null || value === "") {
      if(required) throw new InputError("Missing "+key+".");
      values[key]=null; continue;
    }
    if(["width_mm","height_mm","min_width_mm","max_width_mm","rotation_degrees","quantity","mirrored"].includes(key)) {
      if(typeof value !== "number" || !Number.isFinite(value)) throw new InputError(key+" must be a finite number.");
      if(key === "mirrored" && value !== 0 && value !== 1) throw new InputError("Mirrored must be 0 or 1.");
      if(key === "quantity" && (!Number.isInteger(value) || value < 0 || value > 10000)) throw new InputError("Quantity must be a whole number from 0 to 10000.");
      if(key.endsWith("_mm") && (value <= 0 || value > 10000)) throw new InputError("Dimensions must be greater than zero and at most 10000 mm.");
      if(key === "rotation_degrees" && Math.abs(value)>360) throw new InputError("Rotation must be between -360 and 360 degrees.");
      values[key]=value; continue;
    }
    if(typeof value !== "string") throw new InputError(key+" must be text.");
    const text=value.trim();
    if(required && !text) throw new InputError("Missing "+key+".");
    const max=key === "notes" || key === "instructions" ? 4000 : key === "source_url" ? 2000 : 200;
    if(text.length > max || /[\x00]/.test(text)) throw new InputError(key+" is too long or invalid.");
    if(key.endsWith("_id") && !ID.test(text)) throw new InputError("Invalid linked record ID.");
    if(key === "status" && !["proposed","tested"].includes(text)) throw new InputError("Choose proposed or tested.");
    if(key === "use_type" && !["standard","flip","combination"].includes(text)) throw new InputError("Choose standard, flip or combination.");
    if(key === "origin" && !["purchased","printed","unknown"].includes(text)) throw new InputError("Choose purchased, printed or unknown.");
    if(key === "source_url" && text) {
      try { if(!["https:","http:"].includes(new URL(text).protocol)) throw Error(); }
      catch { throw new InputError("Source URL must begin with http:// or https://."); }
    }
    values[key]=text || null;
  }
  if(values.min_width_mm !== null && values.max_width_mm !== null && Number(values.min_width_mm)>Number(values.max_width_mm))
    throw new InputError("Minimum compatible width cannot exceed maximum.");
  return values;
}
async function revision(kind:Kind,record:Record<string,unknown>):Promise<string> {
  const bytes=new TextEncoder().encode(JSON.stringify([kind,Object.keys(record).sort().map(field=>[field,record[field]??null])]));
  const hash=new Uint8Array(await crypto.subtle.digest("SHA-256",bytes));
  return '"'+Array.from(hash,n=>n.toString(16).padStart(2,"0")).join("")+'"';
}
async function recordResponse(kind:Kind,record:Record<string,unknown>,status=200):Promise<Response> {
  const token=await revision(kind,record),response=json({record,revision:token},status);response.headers.set("etag",token);return response;
}
async function body(request: Request): Promise<unknown> {
  if(!request.headers.get("content-type")?.startsWith("application/json")) throw new InputError("JSON request required.");
  const reader=request.body?.getReader(); if(!reader) throw new InputError("Record is empty.");
  const parts: Uint8Array[]=[];let size=0;
  try {
    while(true) { const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>16384){await reader.cancel();throw new InputError("Record exceeds 16 KiB.");}parts.push(part.value); }
  } finally {reader.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;
  for(const part of parts){bytes.set(part,offset);offset+=part.length;}
  try {return JSON.parse(new TextDecoder().decode(bytes));}catch{throw new InputError("Invalid JSON record.");}
}
type SearchField = { column:string; field:string; label:string };
function selection(kind: Kind): { sql: string; fields: SearchField[]; order: string } {
  if(kind==="physical_cutters")return {
    sql:"SELECT c.*,s.name AS shape_name,l.label AS location_label FROM physical_cutters c JOIN shapes s ON s.id=c.shape_id LEFT JOIN locations l ON l.id=c.location_id",
    fields:[{column:"s.name",field:"shape_name",label:"Cutter shape name"},{column:"l.label",field:"location_label",label:"Storage location"},{column:"c.notes",field:"notes",label:"Cutter notes"},{column:"c.origin",field:"origin",label:"Origin"},{column:"c.width_mm",field:"width_mm",label:"Width (mm)"},{column:"c.height_mm",field:"height_mm",label:"Height (mm)"},{column:"c.quantity",field:"quantity",label:"Quantity"}],order:"s.name,c.id"};
  if(kind==="design_shape_links")return {
    sql:"SELECT l.*,d.name AS design_name,s.name AS shape_name FROM design_shape_links l JOIN designs d ON d.id=l.design_id JOIN shapes s ON s.id=l.shape_id",
    fields:[{column:"d.name",field:"design_name",label:"Design name"},{column:"s.name",field:"shape_name",label:"Cutter shape name"},{column:"l.use_type",field:"use_type",label:"Use type"},{column:"l.status",field:"status",label:"Compatibility status"},{column:"l.instructions",field:"instructions",label:"Mapping instructions"}],order:"d.name,s.name,l.id"};
  const name=kind==="locations" ? "label":"name";
  const fields=[{column:name,field:name,label:kind==="locations"?"Location label":kind==="shapes"?"Shape name":"Design name"},{column:"notes",field:"notes",label:"Notes / themes"}];
  if(kind==="shapes")fields.push({column:"maker",field:"maker",label:"Maker"});
  if(kind==="shapes" || kind==="designs")fields.push({column:"source_url",field:"source_url",label:"Source link"});
  return {sql:"SELECT * FROM "+kind,fields,order:name+",id"};
}
// Match SQLite's built-in lower(): ASCII case-insensitive, literal for other text.
function fold(value:string) { return value.replace(/[A-Z]/g,letter=>letter.toLowerCase()); }
function explain(row:Record<string,unknown>, fields:SearchField[],query:string) {
  const hits=[];
  for(let i=0;i<fields.length;i++) {
    const text=String(row["__search"+i]??"");
    delete row["__search"+i];
    const index=query?fold(text).indexOf(fold(query)):-1;
    if(index<0)continue;
    const from=Math.max(0,index-55),to=Math.min(text.length,index+query.length+55);
    const prefix=from>0?"…":"",suffix=to<text.length?"…":"";
    hits.push({field:fields[i].field,label:fields[i].label,snippet:prefix+text.slice(from,to)+suffix,start:prefix.length+index-from,length:query.length});
  }
  return {...row,searchHits:hits};
}
export async function handleCatalog(request: Request, database: D1Database): Promise<Response> {
  const url=new URL(request.url);
  const match=/^\/api\/catalog\/([a-z_]+)(?:\/([a-zA-Z0-9_-]{1,128}))?$/.exec(url.pathname);
  if(!match || !Object.hasOwn(specs,match[1]))return json({error:"Catalog route not found."},404);
  const kind=match[1] as Kind,id=match[2];
  try {
    if(request.method==="GET") {
      if(id) {
        const record=await database.prepare("SELECT * FROM "+kind+" WHERE id=?").bind(id).first<Record<string,unknown>>();
        return record ? recordResponse(kind,record):json({error:"Record not found."},404);
      }
      const q=(url.searchParams.get("q")??"").trim();
      if(q.length>120)return json({error:"Search is limited to 120 characters."},400);
      const offset=Number(url.searchParams.get("offset")??"0");
      if(!Number.isSafeInteger(offset)||offset<0||offset>100000)return json({error:"Invalid page offset."},400);
      const select=selection(kind);
      const expressions=select.fields.map(field=>"COALESCE(CAST("+field.column+" AS TEXT),'')");
      const sql=select.sql.replace("SELECT ","SELECT "+expressions.map((expression,i)=>expression+" AS __search"+i).join(",")+", ");
      // Separate field predicates prevent a phrase from matching across unrelated values.
      const where=expressions.map(expression=>"instr(lower("+expression+"),lower(?))>0").join(" OR ");
      const result=await database.prepare(sql+" WHERE ("+where+") ORDER BY "+select.order+" LIMIT 201 OFFSET ?").bind(...expressions.map(()=>q),offset).all<Record<string,unknown>>();
      return json({records:result.results.slice(0,200).map(row=>explain(row,select.fields,q)),query:q,nextOffset:result.results.length>200 ? offset+200:null});
    }
    if((request.method==="POST" && id) || (request.method==="PUT" && !id) || !["POST","PUT"].includes(request.method))return json({error:"Method not allowed."},405);
    const values=validate(kind,await body(request));
    const previous=id ? await database.prepare("SELECT * FROM "+kind+" WHERE id=?").bind(id).first<Record<string,Value>>() : null;
    if(id&&!previous)return json({error:"Record not found."},404);
    if(previous) {
      const expected=request.headers.get("if-match");
      if(!expected)return json({error:"Copy your draft, refresh the page and open the latest record before saving changes."},428);
      if(expected!==await revision(kind,previous))return json({error:"Someone changed this record. Your draft has been kept; reopen the record and compare before saving."},412);
    }
    for(const [field,table] of [["shape_id","shapes"],["design_id","designs"],["location_id","locations"]] as const) {
      if(values[field] && !await database.prepare("SELECT id FROM "+table+" WHERE id=?").bind(values[field]).first())
        return json({error:"Linked "+table+" record not found."},404);
    }
    const recordId=id ?? kind+"_"+crypto.randomUUID().replace(/-/g,"");
    const fields=specs[kind].fields;
    let saved:Record<string,unknown>|null;
    if(id&&previous) {
      // Atomic compare-and-update closes the race after the precondition read.
      // RETURNING pairs the response revision with exactly this write's values.
      const compareFields=[...fields,...(Object.hasOwn(previous,"created_at")?["created_at"]:[])];
      saved=await database.prepare("UPDATE "+kind+" SET "+fields.map(field=>field+"=?").join(",")+" WHERE id=? AND "+compareFields.map(field=>field+" IS ?").join(" AND ")+" RETURNING *")
        .bind(...fields.map(field=>values[field]),id,...compareFields.map(field=>previous[field]??null)).first<Record<string,unknown>>();
      if(!saved)return json({error:"This record changed while saving. Your draft has been kept; reopen and compare before retrying."},412);
    }
    else saved=await database.prepare("INSERT INTO "+kind+"(id,"+fields.join(",")+") VALUES (?,"+fields.map(()=>"?").join(",")+") RETURNING *").bind(recordId,...fields.map(field=>values[field])).first<Record<string,unknown>>();
    return recordResponse(kind,saved!,id?200:201);
  }catch(error) {
    if(error instanceof InputError)return json({error:error.message},400);
    const text=String(error);
    return /constraint|UNIQUE|FOREIGN KEY/i.test(text) ? json({error:"This record conflicts with an existing record or linked data. Refresh and review the values."},409)
      :json({error:"Catalog operation failed. Refresh before retrying a create request."},503);
  }
}
