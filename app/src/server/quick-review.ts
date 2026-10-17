import {openReview} from './import-reviews';
import {sourceReference,type QuickContext} from '../quick-classification';
export async function quickReviewContext(request:Request,db:D1Database,id:string):Promise<Response> {
  const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
  try {
    const saved=await openReview(db,id,null);
    if(!saved)return json({error:'Saved review not found.'},404);
    if(request.headers.get('If-Match')!==`"review-${saved.head.current_revision}"`)return json({error:'The saved review changed. Reopen it before checking suggestions.'},412);
    const shapes=await db.prepare(`SELECT s.id,s.notes,(SELECT a.id FROM shape_attachments sa JOIN attachments a ON a.id=sa.attachment_id WHERE sa.shape_id=s.id AND a.media_type IN ('image/png','image/jpeg','image/webp') ORDER BY a.created_at,a.id LIMIT 1) AS image_id FROM shapes s ORDER BY s.id LIMIT 5001`).all<{id:string;notes:string|null;image_id:string|null}>();
    if(shapes.results.length>5000)return json({error:'Quick verification supports up to 5000 shapes. Use the detailed review.'},400);
    const mappings=await db.prepare('SELECT source_key FROM catalog_source_mappings WHERE source_namespace=? ORDER BY source_key LIMIT 10001').bind(saved.manifest.sourceNamespace).all<{source_key:string}>();
    if(mappings.results.length>10000)return json({error:'Source mapping limit exceeded.'},400);
    const byKey=new Map<string,typeof shapes.results>();
    for(const shape of shapes.results){const ref=sourceReference(shape.notes);if(ref?.sourceNamespace===saved.manifest.sourceNamespace)byKey.set(ref.sourceKey,[...(byKey.get(ref.sourceKey)??[]),shape]);}
    const imported=new Set(mappings.results.map(m=>m.source_key));
    const items:QuickContext[]=saved.manifest.items.map(item=>{
      const matches=byKey.get(item.sourceKey)??[],shape=matches.length===1?matches[0]:null,ref=sourceReference(shape?.notes);
      return {sourceKey:item.sourceKey,shapeId:shape?.id??null,imageId:shape?.image_id??null,reviewState:ref?.reviewState??'',evidence:shape?.notes?.slice(0,4000)??'',imported:imported.has(item.sourceKey),ambiguous:matches.length>1};
    });
    return json({revision:`"review-${saved.head.current_revision}"`,items});
  }catch{return json({error:'Quick verification unavailable. Reopen the saved review; the detailed review remains available.'},503);}
}
