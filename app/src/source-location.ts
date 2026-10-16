import type {StagingItem} from './staging.mjs';
/** A declared OneNote bin is its location assignment, independent of ownership/printing. */
export function oneNoteBin(source:{sectionPath?:string;pageTitle?:string;pageId?:string}):string|null {
  for(const text of [source.sectionPath,source.pageTitle,source.pageId]){
    if(!text)continue;
    const ids=[...text.matchAll(/\bbin\s*(?:#|-)?\s*(\d+[a-z]?)(?![a-z0-9])/gi)].map(m=>m[1]);
    const unique=[...new Set(ids.map(id=>id.toUpperCase()))];
    if(unique.length>1)return null;
    if(unique.length===1)return 'Bin '+unique[0];
  }
  return null;
}
export function recordedLocation(item:Pick<StagingItem,'source'|'facts'>):string|null {
  return item.facts?.location?.trim()||oneNoteBin(item.source);
}
/** Imported source snapshots are immutable; a later explicit catalog location takes priority. */
export function sourceLocation(evidence:unknown):string|null {
  try {
    const value=typeof evidence==='string'?JSON.parse(evidence):evidence;
    const entries=Array.isArray(value)?value:[value];
    const locations=[...new Set(entries.filter(v=>v&&typeof v==='object'&&v.source).map(v=>recordedLocation(v)).filter((v):v is string=>!!v))];
    return locations.length===1?locations[0]:null;
  }catch{return null;}
}
