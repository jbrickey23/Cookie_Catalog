// Portable private request backup. Checksums detect corruption, not authorship.
export const REQUEST_BACKUP_LIMIT=8*1024*1024;
export type RequestRecord={id:string;environment:'development'|'production';createdAt:string;createdBy:string;status:string;release:string|null;todo:string|null;payloadSha256:string;type:string;title:string;description:string;reason:string;context:{page:string;recordId:string;recordName:string;search:string};plannedAt?:string;plannedBy?:string};
export const requestId=(id:unknown):id is string=>typeof id==='string'&&/^request_[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(id);
export async function requestHash(raw:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw)))).map(x=>x.toString(16).padStart(2,'0')).join('');}
export function validateRequestRecord(value:any):asserts value is RequestRecord{
 const bounded=(v:unknown,n:number,required=false)=>typeof v==='string'&&v.length<=n&&!v.includes('\0')&&(!required||!!v.trim());
 if(!value||!requestId(value.id)||!['development','production'].includes(value.environment)||!bounded(value.createdBy,1000,true)||!bounded(value.createdAt,40,true)||!Number.isFinite(Date.parse(value.createdAt))||value.status!=='new'||!['bug','improvement','feature','data-correction'].includes(value.type)||!bounded(value.title,120,true)||!bounded(value.description,4000,true)||!bounded(value.reason,1000,true)||!/^[a-f0-9]{64}$/.test(value.payloadSha256??''))throw Error('Invalid request backup record.');
 if(value.release!==null&&(typeof value.release!=='string'||value.release.length>40||!/^(?:R[0-9]+(?:\.[0-9]+)*|v[0-9]+\.[0-9]+\.[0-9]+)$/.test(value.release)))throw Error('Invalid request release.');
 if(value.todo!==null&&(typeof value.todo!=='string'||value.todo.length>40||!/^CC-TODO-[0-9]{3,}$/.test(value.todo)))throw Error('Invalid request TODO.');
 const c=value.context;if(!c||c.page!=='catalog'||!bounded(c.recordId,200)||!bounded(c.recordName,200)||!bounded(c.search,120))throw Error('Invalid request context.');
 if(value.plannedAt!==undefined&&(!bounded(value.plannedAt,40,true)||!Number.isFinite(Date.parse(value.plannedAt))))throw Error('Invalid request planning date.');
 if(value.plannedBy!==undefined&&!bounded(value.plannedBy,1000,true))throw Error('Invalid request planning identity.');
 if(new TextEncoder().encode(JSON.stringify(value)).length>32768)throw Error('Request backup record is too large.');
}
export type RequestBackup={format:'cookie-catalog-request-backup';version:1;exportedAt:string;payloadJson:string;payloadSha256:string};
export async function createRequestBackup(requests:unknown[],environment:string):Promise<RequestBackup>{
 if(!['development','production'].includes(environment)||requests.length>2000)throw Error('Invalid request backup size or environment.');
 const seen=new Set<string>();for(const item of requests){validateRequestRecord(item);if(item.environment!==environment||seen.has(item.id))throw Error('Duplicate or mixed-environment request backup.');seen.add(item.id);}
 const payloadJson=JSON.stringify({environment,requests});if(new TextEncoder().encode(payloadJson).length>REQUEST_BACKUP_LIMIT)throw Error('Request backup exceeds 8 MiB.');
 const backup:RequestBackup={format:'cookie-catalog-request-backup',version:1,exportedAt:new Date().toISOString(),payloadJson,payloadSha256:await requestHash(payloadJson)};if(new TextEncoder().encode(JSON.stringify(backup)).length>REQUEST_BACKUP_LIMIT)throw Error('Request backup exceeds 8 MiB.');return backup;
}
export async function parseRequestBackup(raw:string){
 if(new TextEncoder().encode(raw).length>REQUEST_BACKUP_LIMIT)throw Error('Request backup exceeds 8 MiB.');
 const backup=JSON.parse(raw) as RequestBackup;if(backup.format!=='cookie-catalog-request-backup'||backup.version!==1||typeof backup.payloadJson!=='string'||await requestHash(backup.payloadJson)!==backup.payloadSha256||!Number.isFinite(Date.parse(backup.exportedAt)))throw Error('Request backup format or checksum failed.');
 const payload=JSON.parse(backup.payloadJson);if(!Array.isArray(payload.requests))throw Error('Request backup records missing.');await createRequestBackup(payload.requests,payload.environment);
 return {backup,environment:payload.environment as 'development'|'production',requests:payload.requests as RequestRecord[]};
}
