import {requestJson} from "./request-json";
export type ManagedBackup={lastProgressAt?:string;lastStepMs?:number;id:string;kind:'normal'|'pre-change';status:'copying'|'complete'|'failed';error?:string;offset:number;objects:number;bytes:number;tables?:number;records?:number;exportedAt:string;protectionReleasedAt?:string};
export async function backupApi<T>(path:string,body?:unknown):Promise<T>{
 return requestJson<T>('/api/backups'+path,{method:body===undefined?'GET':'POST',cache:'no-store',headers:{'content-type':'application/json','X-Cookie-Catalog-Check':'managed-backup'},...(body===undefined?{}:{body:JSON.stringify(body)})},body===undefined||/\/(advance|fresh|preview)$/.test(path));
}
export async function managedBackup(status:(message:string)=>void,kind:'normal'|'pre-change'='pre-change',resumeId?:string){
 let job=resumeId?await backupApi<ManagedBackup>('/'+resumeId+'/advance',{}):await backupApi<ManagedBackup>('',{kind});
 while(job.status!=='complete'){if(job.status==='failed')throw Error(job.error??'This snapshot failed. Start a fresh backup.');status(`Backing up originals: ${job.offset} of ${job.objects}. Keep catalog changes idle. This job can be resumed if the page closes.`);try{job=await backupApi<ManagedBackup>('/'+job.id+'/advance',{});}catch(error){if(!/progress changed/i.test((error as Error).message))throw error;const state=await backupApi<{backups:ManagedBackup[]}>('');job=state.backups.find(j=>j.id===job.id)??job;}}
 status(`Backup complete and automatically checked: ${job.objects} originals. No commands or filename handoff needed.`);return job;
}
