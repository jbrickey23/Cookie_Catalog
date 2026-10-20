import {releaseHealth} from './release-health';
import {AccessIdentityVerifier,type AccessConfiguration,type IdentityVerifier,mayRead} from './access-identity';
import {handleReleaseMachine,requireReleaseEpoch,type RuntimeIdentity} from './release-machine';
import {verifyReleaseMachine,type MachineConfiguration} from './release-machine-identity';
import {withReleaseWrite,handleReleaseMaintenance,ReleaseGateError} from './release-maintenance';
type BridgeEnv=AccessConfiguration&MachineConfiguration&{FILES:R2Bucket;DB:D1Database;ASSETS:Fetcher;CATALOG_ENVIRONMENT?:string};
type Api=(request:Request,verifier:IdentityVerifier,db:D1Database,files:R2Bucket,environment:any)=>Promise<Response>;
/** Overlay over the exact accepted R1 source. No R2 catalog/change/photo routes.
 * Runtime identity comes from the immutable bridge build and version binding. */
export function r1ReleaseBridge(original:{fetch:Function;scheduled:Function},api:Api,identity:(env:BridgeEnv)=>RuntimeIdentity,verifier?:(env:BridgeEnv)=>IdentityVerifier){
 return {
  async fetch(request:Request,env:BridgeEnv,ctx:ExecutionContext){
   const path=new URL(request.url).pathname;if(!path.startsWith('/api/'))return original.fetch(request,env,ctx);
   const runtime=identity(env);
   if(path.startsWith('/api/release-automation/')){const machine=await verifyReleaseMachine(request,env);if(!machine)return Response.json({error:'Machine authorization denied'},{status:401});try{return await handleReleaseMachine(request,env.FILES,machine,{...runtime,health:await releaseHealth(env.DB,env.FILES)});}catch{return Response.json({error:'Release status unavailable'},{status:503});}}
   const human=await (verifier?.(env)??new AccessIdentityVerifier(env)).verify(request);if(!mayRead(human)||!human)return Response.json({error:'Unauthorized'},{status:401});
   try{
    if(path==='/api/release-maintenance'){const response=await handleReleaseMaintenance(request,env.FILES,human.subject,human.role==='owner');if(request.method==='GET'&&response.ok)return Response.json({...await response.json() as object,build:runtime.sha},{headers:{'cache-control':'no-store'}});return response;}
    const action=()=>api(request,{verify:async()=>human},env.DB,env.FILES,env.CATALOG_ENVIRONMENT??'development');
    if(['GET','HEAD','OPTIONS'].includes(request.method))return action();
    return await withReleaseWrite(env.FILES,async()=>{await requireReleaseEpoch(request,env.FILES,runtime.sha);return action();});
   }catch(error){return Response.json({error:error instanceof ReleaseGateError?error.message:'Write outcome requires review. Keep your draft.'},{status:error instanceof ReleaseGateError?error.status:503});}
  },
  async scheduled(event:ScheduledController,env:BridgeEnv,ctx:ExecutionContext){
   // Capture all R1 waitUntil promises inside the registered operation.
   ctx.waitUntil(withReleaseWrite(env.FILES,async()=>{const pending:Promise<unknown>[]=[];await original.scheduled(event,env,{...ctx,waitUntil:(p:Promise<unknown>)=>pending.push(p)});await Promise.all(pending);}).catch(error=>{if(!(error instanceof ReleaseGateError))throw error;}));
  }
 };
}
