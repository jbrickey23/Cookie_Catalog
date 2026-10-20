/** Load linked-record choices without silently truncating at the first API page. */
export type Choice = {id:string;name?:string;maker?:string;label?:string};
export async function catalogChoices(kind:"shapes"|"designs"|"locations",fetcher:typeof fetch=fetch):Promise<Choice[]> {
  const choices:Choice[]=[],seen=new Set<string>();let offset=0;
  for(let page=0;page<50;page++) {
    const response=await fetcher("/api/catalog/"+kind+"?offset="+offset,{cache:"no-store"});
    const body=await response.json() as {records?:unknown;nextOffset?:unknown;error?:string};
    if(!response.ok)throw Error(body.error??"Linked records could not load.");
    if(!Array.isArray(body.records)||body.records.length>200)throw Error("Unexpected linked-record page. Refresh and retry.");
    for(const raw of body.records) {
      if(!raw||typeof raw!=="object"||typeof raw.id!=="string"||typeof (raw.name??raw.label)!=="string")throw Error("Invalid linked record. Refresh and retry.");
      if(seen.has(raw.id))throw Error("Linked records changed while loading. Refresh and retry.");
      seen.add(raw.id);choices.push({id:raw.id,...(typeof raw.name==="string"?{name:raw.name}:{}),...(typeof raw.maker==="string"?{maker:raw.maker}:{}),...(typeof raw.label==="string"?{label:raw.label}:{})});
    }
    if(body.nextOffset===null)return choices;
    if(!Number.isSafeInteger(body.nextOffset)||Number(body.nextOffset)<=offset)throw Error("Invalid linked-record pagination. Refresh and retry.");
    offset=Number(body.nextOffset);
  }
  throw Error("More than 10,000 linked choices require a searchable selector. No partial list was selected; ask for selector support.");
}
