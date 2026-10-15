import {applicableFields} from "./readiness.ts";
const kinds=['physical_cutter','printable_asset','design','unclassified'];
const purposes=['cutter_photo','scale_photo','design_photo','printable_original','source_page','unknown'];
function text(value,max=4000){return typeof value==='string'&&value.length<=max&&!/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value);}
function keys(value,allowed){return value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).every(k=>allowed.includes(k));}

export function validateManifest(manifest){
  if(!keys(manifest,['format','version','sourceNamespace','items'])||manifest.format!=='cookie-catalog-staging'||manifest.version!==1||!text(manifest.sourceNamespace,200)||!manifest.sourceNamespace.trim()||!Array.isArray(manifest.items)||manifest.items.length>10000)throw Error('Unsupported staging manifest.');
  const seen=new Set();
  for(const item of manifest.items){
    if(!keys(item,['sourceKey','kind','name','source','facts','files','reviews'])||!text(item.sourceKey,2000)||!item.sourceKey.trim()||seen.has(item.sourceKey)||!kinds.includes(item.kind)||!text(item.name,200)||!item.name.trim())throw Error('Invalid or duplicate source item.');
    seen.add(item.sourceKey);
    if(!keys(item.source,['pageId','pageTitle','sectionPath','url'])||!Object.values(item.source).every(v=>text(v,4000))||!item.source.pageId?.trim())throw Error('Preserve a source page/file identifier.');
    if(item.source.url){try{const u=new URL(item.source.url);if(!['http:','https:','onenote:'].includes(u.protocol))throw Error();}catch{throw Error('Unsupported source URL.');}}
    const f=item.facts??{};
    if(!keys(f,['widthMm','heightMm','location','source'])||Object.entries(f).some(([k,v])=>k.endsWith('Mm')?typeof v!=='number'||!Number.isFinite(v)||v<=0||v>10000:!text(v,4000)))throw Error('Invalid facts; retain unknown dimensions by omitting them.');
    if(item.files!==undefined&&(!Array.isArray(item.files)||item.files.length>100||item.files.some(f=>!keys(f,['path','purpose','sha256'])||!text(f.path,2000)||!purposes.includes(f.purpose)||(f.sha256!==undefined&&!/^[a-f0-9]{64}$/.test(f.sha256)))))throw Error('Invalid file descriptor.');
    const reviews=item.reviews??{};
    if(!keys(reviews,['classification','dimensions','location','photo','scale_photo','original','source']))throw Error('Invalid review fields.');
    for(const [field,r]of Object.entries(reviews)){
      if(!applicableFields(item.kind).includes(field)||!keys(r,['state','note','evidence'])||!['unknown','needs_verification','not_applicable','complete'].includes(r.state)||(r.note!==undefined&&!text(r.note)))throw Error('Invalid review decision.');
      if(r.state==='not_applicable'&&(!r.note?.trim()||['classification','source','original'].includes(field)))throw Error('Not-applicable requires an allowed field and reason.');
      if(r.evidence!==undefined&&(!keys(r.evidence,['reference','method'])||!text(r.evidence.reference,2000)||!['measured','visual_review','source_review','file_check'].includes(r.evidence.method)))throw Error('Invalid review evidence.');
      if(r.state==='complete'&&(!r.evidence?.reference?.trim()||!r.evidence.method))throw Error('Complete requires a specific evidence reference and method.');
    }
  }
  return manifest;
}

export {kinds,purposes,text};
