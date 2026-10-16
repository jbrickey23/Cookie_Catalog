import {sourceLocation} from '../source-location';
import {hasSourceMappings,sourceEvidenceSql} from './source-location';
import {readiness,type ReviewItem} from "../readiness";
const PAGE_SIZE=50;
export async function catalogReadiness(request: Request, db: D1Database): Promise<Response> {
  const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{"content-type":"application/json","cache-control":"no-store","x-content-type-options":"nosniff"}});
  if(request.method!=="GET")return json({error:"Method not allowed"},405);
  const url=new URL(request.url),kind=url.searchParams.get("kind")??"physical_cutter",offset=Number(url.searchParams.get("offset")??0);
  if(!["physical_cutter","printable_asset","design","unclassified"].includes(kind)||!Number.isSafeInteger(offset)||offset<0||offset>100000)
    return json({error:"Choose a valid item type and page."},400);
  const imageShape="EXISTS(SELECT 1 FROM shape_attachments l JOIN attachments a ON a.id=l.attachment_id WHERE l.shape_id=s.id AND a.media_type LIKE 'image/%') AS photo";
  try {
  const mappings=kind==="physical_cutter"&&await hasSourceMappings(db);
  let sql:string;
  if(kind==="physical_cutter")sql=`SELECT c.id,s.name,c.width_mm,c.height_mm,l.label AS location,${sourceEvidenceSql(mappings)} AS source_evidence,s.source_url,${imageShape} FROM physical_cutters c JOIN shapes s ON s.id=c.shape_id LEFT JOIN locations l ON l.id=c.location_id ORDER BY s.name,c.id`;
  else if(kind==="printable_asset")sql=`SELECT p.id,s.name,p.modeled_width_mm AS width_mm,p.modeled_height_mm AS height_mm,s.source_url,${imageShape},EXISTS(SELECT 1 FROM attachments a WHERE a.id=p.attachment_id) AS original FROM printable_assets p JOIN shapes s ON s.id=p.shape_id ORDER BY s.name,p.id`;
  else if(kind==="design")sql="SELECT d.id,d.name,d.source_url,EXISTS(SELECT 1 FROM design_attachments l JOIN attachments a ON a.id=l.attachment_id WHERE l.design_id=d.id AND a.media_type LIKE 'image/%') AS photo FROM designs d ORDER BY d.name,d.id";
  else sql=`SELECT s.id,s.name,s.source_url FROM shapes s WHERE NOT EXISTS(SELECT 1 FROM physical_cutters c WHERE c.shape_id=s.id) AND NOT EXISTS(SELECT 1 FROM printable_assets p WHERE p.shape_id=s.id) ORDER BY s.name,s.id`;
    const rows=await db.prepare(sql+" LIMIT ? OFFSET ?").bind(PAGE_SIZE+1,offset).all<{id:string;name:string;width_mm:number|null;height_mm:number|null;location:string|null;source_evidence?:string;source_url:string|null;photo:number;original:number}>();
    const items=rows.results.slice(0,PAGE_SIZE).map(row=>{
      const location=row.location??sourceLocation(row.source_evidence);
      const item:ReviewItem={id:row.id,kind:kind as ReviewItem["kind"],name:row.name,facts:{
        ...(row.width_mm!==null&&row.width_mm!==undefined?{widthMm:row.width_mm}:{}),
        ...(row.height_mm!==null&&row.height_mm!==undefined?{heightMm:row.height_mm}:{}),
        ...(location?{location}:{}),...(row.source_url?{source:row.source_url}:{}),photo:!!row.photo,original:!!row.original
      }};
      return {...item,...readiness(item)};
    });
    return json({items,nextOffset:rows.results.length>PAGE_SIZE?offset+PAGE_SIZE:null,mode:"read-only",verificationStored:false,originalAvailabilityChecked:false});
  }catch{return json({error:"The review queue could not load. Refresh and retry."},503);}
}
