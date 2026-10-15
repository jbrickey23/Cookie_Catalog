// Read-only, bounded browsing. Source references never imply owned physical inventory.
export async function browseCatalog(request: Request, db: D1Database): Promise<Response> {
  const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json","cache-control":"no-store","x-content-type-options":"nosniff"}});
  if(request.method!=="GET")return json({error:"Method not allowed"},405);
  const url=new URL(request.url),q=(url.searchParams.get("q")??"").trim(),offset=Number(url.searchParams.get("offset")??0),kind=url.searchParams.get("kind")??"all";
  if(q.length>120||!Number.isSafeInteger(offset)||offset<0||offset>100000||!["all","physical","reference"].includes(kind))return json({error:"Choose a valid search and page."},400);
  try {
    const columns=await db.prepare("PRAGMA table_info(physical_cutters)").all<{name:string}>();
    const has=(name:string)=>columns.results.some(c=>c.name===name);
    const mapping=await db.prepare("SELECT name FROM sqlite_schema WHERE type='table' AND name='catalog_source_mappings'").first();
    const sourceBin=mapping?"(SELECT json_extract(m.item_json,'$.source.sectionPath') FROM catalog_source_mappings m WHERE m.physical_id=c.id ORDER BY m.source_key LIMIT 1)":"NULL";
    const physical=`SELECT c.id,c.shape_id,s.name,${sourceBin} AS source_bin,c.quantity,c.width_mm,c.height_mm,l.label AS location,
      ${has("reference_size_mm")?"c.reference_size_mm":"NULL AS reference_size_mm"},${has("slot")?"c.slot":"NULL AS slot"},'physical' AS record_kind,NULL AS review_state
      FROM physical_cutters c JOIN shapes s ON s.id=c.shape_id LEFT JOIN locations l ON l.id=c.location_id`;
    const references=`SELECT s.id,s.id AS shape_id,s.name,CASE WHEN json_valid(s.notes) THEN json_extract(s.notes,'$.source.sectionPath') END AS source_bin,
      NULL AS quantity,NULL AS width_mm,NULL AS height_mm,NULL AS location,NULL AS reference_size_mm,NULL AS slot,'reference' AS record_kind,
      CASE WHEN json_valid(s.notes) THEN json_extract(s.notes,'$.reviewState') END AS review_state
      FROM shapes s WHERE NOT EXISTS(SELECT 1 FROM physical_cutters c WHERE c.shape_id=s.id)`;
    const base=kind==="physical"?physical:kind==="reference"?references:physical+" UNION ALL "+references;
    const rows=await db.prepare(`SELECT r.*,a.id AS image_id,a.filename AS image_name FROM (${base}) r
      LEFT JOIN attachments a ON a.id=(SELECT a2.id FROM shape_attachments sa JOIN attachments a2 ON a2.id=sa.attachment_id
        WHERE sa.shape_id=r.shape_id AND a2.media_type IN ('image/png','image/jpeg','image/webp') ORDER BY a2.created_at,a2.id LIMIT 1)
      WHERE (?=1 OR substr(upper(r.name),1,5)!='DEMO ')
        AND (instr(lower(r.name),lower(?))>0 OR instr(lower(coalesce(r.location,'')),lower(?))>0 OR instr(lower(coalesce(r.source_bin,'')),lower(?))>0)
      ORDER BY r.name COLLATE NOCASE,r.id LIMIT 25 OFFSET ?`).bind(url.searchParams.get("demo")==="true"?1:0,q,q,q,offset).all();
    return json({items:rows.results.slice(0,24),nextOffset:rows.results.length>24?offset+24:null});
  }catch{return json({error:"The catalog could not load. Refresh and retry."},503);}
}
