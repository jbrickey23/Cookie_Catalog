import {requestJson} from './request-json';
import type {Location} from './locations';

export type LocationRecord = Location & {notes:string|null};
export type SavedLocation = {record:LocationRecord; revision:string};
export const getLocation = (id:string) => requestJson<SavedLocation>('/api/catalog/locations/'+encodeURIComponent(id),{cache:'no-store'},true);
export async function saveLocation(label:string, previous?:SavedLocation) {
  const saved=await requestJson<SavedLocation>('/api/catalog/locations'+(previous?'/'+encodeURIComponent(previous.record.id):''),{
    method:previous?'PUT':'POST',
    headers:{'content-type':'application/json','X-Cookie-Catalog-Check':'catalog',
      ...(previous?{'If-Match':previous.revision}:{Prefer:'resolution=reuse'})},
    body:JSON.stringify({label,notes:previous?.record.notes??null})
  });
  window.dispatchEvent(new window.CustomEvent('location-saved',{detail:saved.record}));
  if(previous)window.dispatchEvent(new window.Event('location-renamed'));
  return saved;
}
export async function resolveLocation(id:string) {
  return id?.startsWith('preset:') ? (await saveLocation(id.slice(7))).record : null;
}
