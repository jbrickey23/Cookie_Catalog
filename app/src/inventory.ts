export type InventoryRow = {
 id:string; shape_id:string; name:string; location:string|null; quantity:number;
 reference_size_mm:number|null; notes:string|null;
};
export function binDisplay(label:string){return /^bin\s*[#-]?\s*(\d+[a-z]?)$/i.exec(label.trim())?.[1]??label;}
export const cutterHref=(shape:string,id:string)=>'/?design='+encodeURIComponent(shape)+'&cutter='+encodeURIComponent(id);

export async function readInventory(path:string,signal:AbortSignal){
 const rows:InventoryRow[]=[];
 let after='';
 do {
  const url=new URL('/api/workspace/'+path,window.location.origin);
  if(after)url.searchParams.set('after',after);
  const res=await fetch(url.pathname+url.search,{signal,cache:'no-store'});
  if(!res.ok)throw Error();
  const page=await res.json() as {items:InventoryRow[];nextCursor?:string};
  if(!Array.isArray(page.items)||page.nextCursor&&page.nextCursor<=after)throw Error();
  rows.push(...page.items);after=page.nextCursor??'';
 }while(after);
 return rows;
}
