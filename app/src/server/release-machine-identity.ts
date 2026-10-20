import {createRemoteJWKSet,jwtVerify,type JWTVerifyGetKey} from 'jose';
export interface MachineConfiguration {
 ACCESS_TEAM_DOMAIN?:string; RELEASE_ACCESS_AUD?:string; RELEASE_SERVICE_CLIENT_ID?:string;
 RELEASE_OIDC_AUD?:string; RELEASE_WORKFLOW_REF?:string; RELEASE_WORKFLOW_SHA?:string;
 RELEASE_ENVIRONMENT?:string;
}
export type ReleasePrincipal={run:string;attempt:number;workflowSha:string;sourceSha:string;recovery?:boolean};
// GitHub owner/repository names are case-insensitive; workflow file paths are not.
function workflowIdentity(value:unknown){const m=/^([^/]+)\/([^/]+)(\/\.github\/workflows\/[^@]+@.+)$/.exec(String(value));return m?m[1].toLowerCase()+'/'+m[2].toLowerCase()+m[3]:'';}
const githubIssuer='https://token.actions.githubusercontent.com';
const keys=new Map<string,JWTVerifyGetKey>();
function remote(url:string){let key=keys.get(url);if(!key){key=createRemoteJWKSet(new URL(url),{timeoutDuration:5000});keys.set(url,key);}return key;}
/** Separate from human identity: a machine never receives catalog membership. */
export async function verifyReleaseMachine(request:Request,config:MachineConfiguration,accessKey?:JWTVerifyGetKey,oidcKey?:JWTVerifyGetKey):Promise<ReleasePrincipal|null>{
 try{
  if(!/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(config.ACCESS_TEAM_DOMAIN??'')||!config.RELEASE_ACCESS_AUD||!config.RELEASE_SERVICE_CLIENT_ID||!config.RELEASE_OIDC_AUD||!config.RELEASE_ENVIRONMENT||!workflowIdentity(config.RELEASE_WORKFLOW_REF)||!/^[a-f0-9]{40}$/.test(config.RELEASE_WORKFLOW_SHA??''))return null;
  const access=request.headers.get('Cf-Access-Jwt-Assertion'),oidc=request.headers.get('X-Release-OIDC');
  if(!access||!oidc||access.length>16384||oidc.length>16384)return null;
  const issuer='https://'+config.ACCESS_TEAM_DOMAIN;
  const {payload:a}=await jwtVerify(access,accessKey??remote(issuer+'/cdn-cgi/access/certs'),{issuer,audience:config.RELEASE_ACCESS_AUD,algorithms:['RS256'],requiredClaims:['exp','iat','sub'],clockTolerance:5});
  if(a.type!=='app'||a.sub!==''||a.common_name!==config.RELEASE_SERVICE_CLIENT_ID||typeof a.iat!=='number'||a.iat>Date.now()/1000+5)return null;
  const {payload:g}=await jwtVerify(oidc,oidcKey??remote(githubIssuer+'/.well-known/jwks'),{issuer:githubIssuer,audience:config.RELEASE_OIDC_AUD,algorithms:['RS256'],requiredClaims:['exp','iat','sub','jti'],clockTolerance:5});
  if(g.repository_id!=='1415951950'||g.repository_owner_id!=='76499785'||String(g.repository).toLowerCase()!=='jbrickey23/cookie_catalog'||g.ref!=='refs/heads/main'||workflowIdentity(g.workflow_ref)!==workflowIdentity(config.RELEASE_WORKFLOW_REF)||g.job_workflow_sha!==config.RELEASE_WORKFLOW_SHA||workflowIdentity(g.job_workflow_ref)!==`jbrickey23/cookie_catalog/.github/workflows/release-engine.yml@${config.RELEASE_WORKFLOW_SHA}`||!(/^[a-f0-9]{40}$/).test(String(g.sha))||g.sha!==g.workflow_sha||g.environment!==config.RELEASE_ENVIRONMENT||g.event_name!=='workflow_dispatch'||g.runner_environment!=='github-hosted'||!/^\d+$/.test(String(g.run_id))||!/^\d+$/.test(String(g.run_attempt))||(!Number.isSafeInteger(Number(g.run_attempt))||Number(g.run_attempt)<1)||typeof g.iat!=='number'||g.iat>Date.now()/1000+5)return null;
  return {run:String(g.run_id),attempt:Number(g.run_attempt),workflowSha:String(g.job_workflow_sha),sourceSha:String(g.sha)};
 }catch{return null;}
}
