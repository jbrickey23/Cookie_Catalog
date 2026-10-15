import {applicableFields} from './readiness';
import type {StagingItem} from './staging.mjs';
export type Classification = 'physical'|'digital'|'both';
export type QuickContext = {sourceKey:string;shapeId:string|null;imageId:string|null;reviewState:string; evidence:string;imported:boolean;ambiguous:boolean};
export function sourceReference(notes:unknown):{sourceNamespace:string;sourceKey:string;reviewState?:string;reason?:string}|null {
  try {const n=JSON.parse(typeof notes==='string'?notes:'');return n?.format==='cookie-catalog-source-reference'&&typeof n.sourceNamespace==='string'&&typeof n.sourceKey==='string'?n:null;}catch{return null;}
}
export function suggestion(item:StagingItem,context?:QuickContext):{value:Classification|null;reason:string;physicalBlocked:boolean;ambiguous:boolean} {
  const text=[item.name,item.source.pageTitle,item.source.sectionPath,item.facts?.source,context?.evidence,context?.reviewState].filter(Boolean).join(' ');
  const corrected=item.catalog?.ownership==='owned'&&['printed','not_applicable'].includes(item.catalog?.printStatus??'');
  const physicalBlocked=item.catalog?.ownership==='not_owned'||item.catalog?.printStatus==='not_printed'||!corrected&&(/not[ _-]*(printed|purchased|owned)|unprinted/i.test(text));
  const ambiguous=!!context?.ambiguous||/set_review|variant_review|duplicate_review/.test(context?.reviewState??'')||/\b(set|kit|bundle|assorted|multiple sizes|size variants|duplicate)\b/i.test(text);
  const digital=item.kind==='printable_asset'||item.files?.some(f=>f.purpose==='printable_original')||/\b(stl|3mf|digital|printable)\b/i.test(text);
  const physical=!physicalBlocked&&(item.kind==='physical_cutter'||item.catalog?.ownership==='owned'||item.catalog?.printStatus==='printed'||/\bbin\s*#?\s*\d+/i.test(item.source.sectionPath??''));
  if(item.kind==='design'||ambiguous)return {value:null,reason:item.kind==='design'?'Decorating design: use the detailed review.':'Set, size variants or possible duplicate: review individual items first.',physicalBlocked,ambiguous:true};
  return {value:physical?digital?'both':'physical':digital?'digital':null,reason:physicalBlocked?'Source says not printed or not purchased. Physical stock stays blocked until corrected in the detailed review.':physical?'Physical suggestion from source or existing review; confirm ownership.':digital?'Digital source reference; possession of an original STL/3MF is unverified.':'Insufficient evidence. Choose a classification or leave for later.',physicalBlocked,ambiguous};
}
export function classify(item:StagingItem,value:Classification,context?:QuickContext):StagingItem {
  const s=suggestion(item,context);
  if(s.ambiguous)throw Error('Review sets, variants and duplicates individually before confirming.');
  if(value!=='digital'&&s.physicalBlocked)throw Error('Correct not-owned/not-printed status in the detailed review first.');
  const next=structuredClone(item);
  next.kind=value==='digital'?'printable_asset':'physical_cutter';
  next.catalog={...next.catalog,sourceClassification:value,...(value!=='digital'?{ownership:'owned' as const}:{})};
  next.reviews=Object.fromEntries(Object.entries(next.reviews??{}).filter(([field])=>applicableFields(next.kind).includes(field as any)));
  return next;
}
