import {hasSourceMappings,sourceSectionSql} from './source-location';
// One row per producer design. Every related match uses EXISTS, never a multiplicative join.
export async function browseCatalog(request:Request,db:D1Database):Promise<Response>{
 const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
 if(request.method!=='GET')return json({error:'Method not allowed'},405);
 const url=new URL(request.url),q=(url.searchParams.get('q')??'').trim(),offset=Number(url.searchParams.get('offset')??0),legacy=url.searchParams.get('kind')??'all';
 const ownership=url.searchParams.get('ownership')??(legacy==='physical'?'owned':'all');
 if(q.length>120||!Number.isSafeInteger(offset)||offset<0||offset>100000||!['all','physical','reference'].includes(legacy)||!['all','owned','saved'].includes(ownership))return json({error:'Choose a valid search and page.'},400);
 if((q.match(/"/g)?.length??0)%2)return json({error:'Close each quoted search phrase.'},400);
 const terms=[...q.matchAll(/"([^"]+)"|([^\s"]+)/g)].filter(m=>m[1]!==undefined||!/^and$/i.test(m[2])).map(m=>(m[1]??m[2]).trim()).filter(Boolean);
 if(terms.length>8||(q&&!terms.length))return json({error:'Search for one to eight words or quoted phrases.'},400);
 try{
  const sourceBin=sourceSectionSql(await hasSourceMappings(db));
  const base=`SELECT s.id,s.id AS shape_id,s.name,s.maker,s.source_url,
   CASE WHEN json_valid(s.notes) THEN json_extract(s.notes,'$.source.sectionPath') END AS source_bin,
   CASE WHEN json_valid(s.notes) THEN json_extract(s.notes,'$.reviewState') END AS review_state,
   CASE WHEN json_valid(s.notes) THEN json_extract(s.notes,'$.reason') END AS source_reason,
   (SELECT count(*) FROM physical_cutters c WHERE c.shape_id=s.id) AS inventory_count FROM shapes s`;
  const termFilter=`(instr(lower(r.name),lower(?))>0 OR instr(lower(coalesce(r.maker,'')),lower(?))>0 OR instr(lower(coalesce(r.source_bin,'')),lower(?))>0
   OR EXISTS(SELECT 1 FROM physical_cutters c LEFT JOIN locations l ON l.id=c.location_id WHERE c.shape_id=r.id AND (instr(lower(coalesce(l.label,'')),lower(?))>0 OR instr(lower(coalesce(${sourceBin},'')),lower(?))>0))
   OR EXISTS(SELECT 1 FROM shape_tags st JOIN tags t ON t.id=st.tag_id WHERE st.shape_id=r.id AND instr(lower(t.label),lower(?))>0)
   OR EXISTS(SELECT 1 FROM design_shape_links dl JOIN designs d ON d.id=dl.design_id WHERE dl.shape_id=r.id AND (instr(lower(d.name),lower(?))>0
    OR EXISTS(SELECT 1 FROM design_tags dt JOIN tags t ON t.id=dt.tag_id WHERE dt.design_id=d.id AND instr(lower(t.label),lower(?))>0))))`;
  const filter=`WHERE (?=1 OR substr(upper(r.name),1,5)!='DEMO ')`+(ownership==='owned'?' AND r.inventory_count>0':ownership==='saved'?' AND r.inventory_count=0':'')+terms.map(()=>' AND '+termFilter).join('');
  const params=[url.searchParams.get('demo')==='true'?1:0,...terms.flatMap(t=>Array(8).fill(t))];
  const total=await db.prepare(`SELECT count(*) AS total FROM (${base}) r ${filter}`).bind(...params).first<{total:number}>();
  const rows=await db.prepare(`SELECT r.*,(SELECT json_group_array(json_object('id',id,'filename',filename)) FROM (
   SELECT a.id,a.filename FROM shape_attachments sa JOIN attachments a ON a.id=sa.attachment_id WHERE sa.shape_id=r.id AND a.media_type IN ('image/png','image/jpeg','image/webp')
   ORDER BY CASE WHEN sa.purpose='photo' THEN 0 ELSE 1 END,a.created_at,a.id LIMIT 200)) AS image_list_json
   FROM (${base}) r ${filter} ORDER BY r.name COLLATE NOCASE,coalesce(r.maker,''),r.id LIMIT 25 OFFSET ?`).bind(...params,offset).all<any>();
  return json({total:total?.total??0,items:rows.results.slice(0,24).map(row=>{const {image_list_json,...item}=row;const images=JSON.parse(image_list_json);return {...item,record_kind:'reference',images,image_id:images[0]?.id??null,image_name:images[0]?.filename??null};}),nextOffset:rows.results.length>24?offset+24:null});
 }catch{return json({error:'The catalog could not load. Refresh and retry.'},503);}
}
