import {buildInformation} from './server/build-information';
export type ReleaseView={active:boolean;epoch:string;build:string};
/** One page lifetime pins one epoch/build. Reading a new token never refreshes a
 * stale page's authority. All writes, including uploads and Undo, share this path. */
export class ReleaseSession {
 private first?:ReleaseView;private current?:ReleaseView;private uncertain=false;
 observe(value:ReleaseView){if(typeof value.active!=='boolean'||!value.epoch||!value.build)throw Error('Release state unavailable');this.first??={...value};this.current={...value};}
 get changed(){return !!this.first&&!!this.current&&(this.first.epoch!==this.current.epoch||this.first.build!==this.current.build);}
 get paused(){return !this.current||this.current.active||this.changed||this.uncertain;}
 get hasUncertainWrite(){return this.uncertain;}
 headers(build:string){if(this.paused||build!==this.first?.build)throw Error('Keep your draft. Refresh and review the catalog version before saving.');return {'X-Catalog-Epoch':this.first!.epoch,'X-Catalog-Build':build};}
 unknownWrite(){this.uncertain=true;}
}
export const releaseSession=new ReleaseSession();
export let pendingReleaseWrites=0;
export function installReleaseFetch(session=releaseSession,build=buildInformation().commit??''){
 const original=window.fetch.bind(window);
 // Capture every mutable API request, rather than relying on each form to opt in.
 window.fetch=async(input,init)=>{
  const request=input instanceof Request?input:undefined;const url=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url,window.location.href);
  const method=(init?.method??request?.method??'GET').toUpperCase();
  if(url.origin!==window.location.origin||!url.pathname.startsWith('/api/')||['GET','HEAD','OPTIONS'].includes(method))return original(input,init);
  const headers=new Headers(init?.headers??request?.headers);
  try{for(const [k,v] of Object.entries(session.headers(build)))headers.set(k,v);}catch(error){return Response.json({error:(error as Error).message},{status:409});}
  pendingReleaseWrites++;try{const response=await original(input,{...init,headers});if(response.status>=500)session.unknownWrite();return response;}catch(error){session.unknownWrite();throw error;}finally{pendingReleaseWrites--;}
 };
}
