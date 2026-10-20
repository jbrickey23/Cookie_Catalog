import {releaseHealth} from './server/release-health';
import {buildInformation} from './server/build-information';
import {handleReleaseMachine,requireReleaseEpoch} from './server/release-machine';
import {verifyReleaseMachine,type MachineConfiguration} from './server/release-machine-identity';
import {handlePhotoInbox,preparePhotoInbox} from './server/photo-inbox';
import {withReleaseWrite,handleReleaseMaintenance,ReleaseGateError} from './server/release-maintenance';
import {handleChangeRequests} from './server/change-requests';
import {catalogEnvironment,type CatalogEnvironment} from './catalog-environment';
import {fieldHelpPage} from './field-help';
import {withBackupStorageLock} from './server/backup-storage-lock';
import {handleWorkspace} from './server/workspace';
import {handleManagedBackups,restoreInProgress,scheduledBackups} from './server/managed-backups';
import {quickReviewContext} from './server/quick-review';
import {handleCatalogImportSetup} from "./server/catalog-import-setup";
import {handleCatalogImport} from "./server/catalog-import";
import {handleImportReviews} from "./server/import-reviews";
import {browseCatalog} from "./server/browse";
import {catalogReadiness} from "./server/readiness";
import { checkDevelopmentStorage } from "./server/development-storage-check";
import { handleAttachments } from "./server/attachments";
import { handleCatalog } from "./server/catalog";
import { createArchiveManifest, archiveOriginal } from "./server/archive-backup";
import { BackupError, createDevelopmentBackup } from "./server/development-backup";
import { createDevelopmentRecoveryCheck } from "./server/development-recovery-check";
import { AccessIdentityVerifier, accessIsConfigured, mayRead, mayWrite, type AccessConfiguration, type IdentityVerifier } from "./server/access-identity";
import {inspectInfrastructure} from "./server/infrastructure-check";
import {checkMissingFileRecovery} from "./server/development-missing-file-check";

export interface Env extends AccessConfiguration,MachineConfiguration { CF_VERSION_METADATA?:{id:string}; CATALOG_ENVIRONMENT?:string; ASSETS: Fetcher; DB: D1Database; FILES: R2Bucket }
function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status, headers: { "content-type": "application/json", "cache-control": "no-store", "x-content-type-options": "nosniff" }
  });
}
export async function handleApiRequest(request: Request, verifier: IdentityVerifier, database?: D1Database, files?: R2Bucket, environment:CatalogEnvironment='development'): Promise<Response> {
  try{catalogEnvironment(environment);}catch{return json({error:'Invalid catalog environment configuration'},503);}
  const user = await verifier.verify(request);
  if (!mayRead(user)) return json({ error: "Unauthorized" }, 401);
  if (!user) return json({ error: "Unauthorized" }, 401);
  const pathname = new URL(request.url).pathname;
  if(pathname==='/api/photo-inbox'||pathname.startsWith('/api/photo-inbox/')){if(!files)return json({error:'Photo storage unavailable'},503);return handlePhotoInbox(request,files,user);}
  if(pathname==='/api/change-requests'){if(!files)return json({error:'Request storage unavailable'},503);return handleChangeRequests(request,files,user,environment);}
  if(pathname==='/api/help/fields'){
    if(request.method!=='GET')return json({error:'Method not allowed'},405);
    return new Response(fieldHelpPage(),{headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','content-security-policy':"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"}});
  }
  if(pathname==="/api/backups"||pathname.startsWith("/api/backups/")){
    if(user.role!=="owner")return json({error:"Owner/admin access required"},403);
    if(!database||!files)return json({error:"Backup resources unavailable"},503);
    if(request.method!=="GET"&&(request.headers.get("Origin")!==new URL(request.url).origin||request.headers.get("X-Cookie-Catalog-Check")!=="managed-backup"))return json({error:"Same-origin backup request required"},403);
    return handleManagedBackups(request,database,files,user.subject,environment);
  }
  const restoreGate=async()=>{try{return files&&await restoreInProgress(files)?json({error:"Catalog restore is in progress. Resume or review recovery from Backups."},423):null;}catch{return json({error:"Recovery status unavailable. Retry before accessing catalog data."},503);}};
  if(pathname.startsWith('/api/workspace/')){
    if(request.method!=='GET'&&!mayWrite(user))return json({error:'Editing access required'},403);
    if(!['GET','POST','PUT','DELETE'].includes(request.method))return json({error:'Method not allowed'},405);
    if(request.method!=='GET'&&(request.headers.get('Origin')!==new URL(request.url).origin||request.headers.get('X-Cookie-Catalog-Check')!=='workspace'))return json({error:'Same-origin workspace request required'},403);
    if(!database||!files)return json({error:'Workspace resources unavailable'},503);
    {const blocked=await restoreGate();if(blocked)return blocked;}
    return handleWorkspace(request,database,files,user.subject,user.role==='owner',environment);
  }
  // Maintenance, archive/export and synthetic fixtures are owner-only.
  if(environment==='production'&&pathname.startsWith('/api/dev/')&&!['/api/dev/archive','/api/dev/archive-file','/api/dev/infrastructure-check'].includes(pathname))return json({error:'Development checks are unavailable in production'},404);
  if(pathname.startsWith("/api/dev/") && user.role!=="owner")return json({error:"Owner access required"},403);
  if(pathname === "/api/dev/missing-file-check") {
    if(user.role!=="owner")return json({error:"Owner access required"},403);
    if(request.method!=="POST")return json({error:"Method not allowed"},405);
    if(request.headers.get("Origin")!==new URL(request.url).origin||request.headers.get("X-Cookie-Catalog-Check")!=="missing-file")return json({error:"Same-origin check required"},403);
    if(!database||!files)return json({error:"Development bindings unavailable"},503);
    {const blocked=await restoreGate();if(blocked)return blocked;}
    try{return json(await checkMissingFileRecovery(database,files));}
    catch{return json({error:"Missing-file test or fixture cleanup failed. Stop testing and review development fixtures."},503);}
  }
  if(pathname === "/api/dev/infrastructure-check") {
    if(user.role !== "owner")return json({error:"Owner access required"},403);
    if(request.method !== "GET")return json({error:"Method not allowed"},405);
    if(!database||!files)return json({error:"Development bindings unavailable"},503);
    {const blocked=await restoreGate();if(blocked)return blocked;}
    try{return json(await inspectInfrastructure(database,files,environment));}
    catch{return json({error:"Read-only infrastructure verification failed. Check catalog bindings/migrations."},503);}
  }
  if (pathname === "/api/dev/archive" || pathname === "/api/dev/archive-file") {
    if(user.role !== "owner")return json({error:"Owner access required"},403);
    if(request.method !== "POST")return json({error:"Method not allowed"},405);
    if(request.headers.get("Origin") !== new URL(request.url).origin || request.headers.get("X-Cookie-Catalog-Check") !== "archive")return json({error:"Same-origin archive request required"},403);
    if(!database || !files)return json({error:"Archive resources unavailable"},503);
    {const blocked=await restoreGate();if(blocked)return blocked;}
    try {
      if(pathname === "/api/dev/archive-file")return await archiveOriginal(request,database,files);
      const manifest=await createArchiveManifest(database,files,environment);
      return new Response(manifest.buffer as ArrayBuffer,{headers:{"content-type":"application/json","cache-control":"no-store","x-content-type-options":"nosniff"}});
    }catch(error){return json({error:error instanceof BackupError?error.message:"Archive preparation failed."},503);}
  }
  if (pathname === "/api/import-reviews" || pathname.startsWith("/api/import-reviews/")) {
    if(!mayWrite(user))return json({error:"Editing access required"},403);
    if(!["GET","POST","PUT"].includes(request.method))return json({error:"Method not allowed"},405);
    if(request.method!=="GET"&&(request.headers.get("Origin")!==new URL(request.url).origin||request.headers.get("X-Cookie-Catalog-Check")!=="import-review"))return json({error:"Same-origin review request required"},403);
    if(!database)return json({error:"Catalog database unavailable"},503);
    {const blocked=await restoreGate();if(blocked)return blocked;}
    if(pathname==="/api/import-reviews/import-setup"){
      if(!["GET","POST"].includes(request.method))return json({error:"Method not allowed"},405);
      if(request.method==="POST"&&user.role!=="owner")return json({error:"Owner/admin access required to activate importing"},403);
      return handleCatalogImportSetup(request,database);
    }
    const quick=/^\/api\/import-reviews\/(review_[a-f0-9]{32})\/quick-check$/.exec(pathname);
    if(quick){
      if(request.method!=="GET")return json({error:"Method not allowed"},405);
      return quickReviewContext(request,database,quick[1]);
    }
    const importer=/^\/api\/import-reviews\/(review_[a-f0-9]{32})\/(catalog-plan|apply)$/.exec(pathname);
    if(importer){
      if(request.method!=="POST")return json({error:"Method not allowed"},405);
      if(importer[2]==="apply"&&user.role!=="owner")return json({error:"Owner/admin access required to import inventory"},403);
      if(importer[2]==="apply"&&files){try{return await withBackupStorageLock(files,locked=>handleCatalogImport(request,database,user.subject,importer[1],true,locked));}catch(error){return json({error:(error as Error).message},409);}}
      return handleCatalogImport(request,database,user.subject,importer[1],importer[2]==="apply",files);
    }
    return handleImportReviews(request,database,user.subject);
  }
  if (pathname === "/api/browse") {
    if (!database) return json({error:"Catalog database unavailable"},503);
    {const blocked=await restoreGate();if(blocked)return blocked;}
    return browseCatalog(request,database);
  }
  if (pathname === "/api/readiness") {
    if (!database) return json({error:"Catalog database unavailable"},503);
    {const blocked=await restoreGate();if(blocked)return blocked;}
    return catalogReadiness(request,database);
  }
  if (pathname.startsWith("/api/catalog/")) {
    if(request.method!=="GET"&&!mayWrite(user))return json({error:"Editing access required"},403);
    if (!["GET","POST","PUT"].includes(request.method)) return json({ error: "Method not allowed" }, 405);
    if (request.method !== "GET" && (request.headers.get("Origin") !== new URL(request.url).origin
        || request.headers.get("X-Cookie-Catalog-Check") !== "catalog")) return json({ error: "Same-origin catalog request required" },403);
    if (!database) return json({ error: "Catalog database unavailable" },503);
    {const blocked=await restoreGate();if(blocked)return blocked;}
    return handleCatalog(request,database);
  }
  if (pathname === "/api/attachment-targets" || pathname === "/api/attachments" || pathname.startsWith("/api/attachments/")
      || pathname === "/api/attachment-orphans" || pathname.startsWith("/api/attachment-orphans/")) {
    const maintenance=pathname.startsWith("/api/attachment-orphans");
    if((maintenance||request.method==="DELETE")&&user.role!=="owner")return json({error:"Owner access required"},403);
    if(request.method!=="GET"&&!mayWrite(user))return json({error:"Editing access required"},403);
    if (!["GET", "POST", "DELETE"].includes(request.method)) return json({ error: "Method not allowed" }, 405);
    if (request.method !== "GET" && (request.headers.get("Origin") !== new URL(request.url).origin
        || request.headers.get("X-Cookie-Catalog-Check") !== "attachments")) {
      return json({ error: "Same-origin attachment request required" }, 403);
    }
    if (!database || !files) return json({ error: "Attachment resources unavailable" }, 503);
    {const blocked=await restoreGate();if(blocked)return blocked;}
    return handleAttachments(request, database, files);
  }
  if (pathname === "/api/dev/backup" || pathname === "/api/dev/recovery-check") {
    const recoveryCheck = pathname === "/api/dev/recovery-check";
    if (user.role !== "owner") return json({ error: "Owner access required" }, 403);
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
    if (request.headers.get("Origin") !== new URL(request.url).origin
        || request.headers.get("X-Cookie-Catalog-Check") !== (recoveryCheck ? "recovery" : "backup")) {
      return json({ error: "Same-origin backup request required" }, 403);
    }
    if (!database || !files) return json({ error: "Development backup resources unavailable" }, 503);
    {const blocked=await restoreGate();if(blocked)return blocked;}
    try {
      const document = recoveryCheck ? await createDevelopmentRecoveryCheck(database, files)
        : await createDevelopmentBackup(database, files);
      return new Response(document, { headers: {
        "content-type": "application/json", "cache-control": "no-store",
        "x-content-type-options": "nosniff",
        "content-disposition": `attachment; filename="cookie-catalog-dev-${recoveryCheck ? "recovery-" : ""}${new Date().toISOString().replace(/[:.]/g, "-")}.json"`
      } });
    } catch (error) {
      return json({ error: error instanceof BackupError ? error.message : "Development backup failed. No download was created." }, 503);
    }
  }
  if (pathname === "/api/session") {
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
    return json({ authenticated: true, email: user.email, role: user.role, environment });
  }
  if (pathname === "/api/dev/database-check") {
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
    if (!database) return json({ error: "Development database unavailable" }, 503);
    try {
      const row = await database.prepare(`SELECT d.name AS design, s.name AS shape, c.width_mm, c.height_mm
        FROM designs d
        JOIN design_shape_links l ON l.design_id = d.id
        JOIN shapes s ON s.id = l.shape_id
        JOIN physical_cutters c ON c.shape_id = s.id
        WHERE d.id = ? AND s.id = ? AND c.id = ? AND l.id = ?`)
        .bind("design_dev_tree", "shape_dev_tree", "cutter_dev_tree", "link_dev_tree")
        .first<{ design: string; shape: string; width_mm: number; height_mm: number }>();
      if (!row) return json({ error: "Development fixture missing" }, 404);
      return json({
        databaseConnected: true,
        fixtureMatches: row.design === "DEMO Holiday tree" && row.shape === "DEMO Evergreen tree"
          && row.width_mm === 90 && row.height_mm === 100,
        record: row
      });
    } catch {
      return json({ error: "Development database check failed" }, 503);
    }
  }
  if (pathname === "/api/dev/storage-check") {
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
    if (request.headers.get("Origin") !== new URL(request.url).origin
        || request.headers.get("X-Cookie-Catalog-Check") !== "storage") {
      return json({ error: "Same-origin check required" }, 403);
    }
    if (!files) return json({ error: "Development storage unavailable" }, 503);
    {const blocked=await restoreGate();if(blocked)return blocked;}
    try {
      return json(await checkDevelopmentStorage(files));
    } catch {
      return json({ error: "Development storage verification or cleanup failed" }, 503);
    }
  }
  // General catalog CRUD and collaborator membership remain unavailable.
  return json({ error: "Catalog API unavailable until membership and storage validation are complete" }, 503);
}
export async function handleReleaseGuardedApi(request:Request,verifier:IdentityVerifier,database?:D1Database,files?:R2Bucket,environment:CatalogEnvironment='development',buildSha=buildInformation().commit??''):Promise<Response>{
 const user=await verifier.verify(request);if(!user||!mayRead(user))return json({error:'Unauthorized'},401);
 const memo={verify:async()=>user};
 try{
  if(new URL(request.url).pathname==='/api/release-maintenance'){if(!files)return json({error:'Release storage unavailable'},503);const response=await handleReleaseMaintenance(request,files,user.subject,user.role==='owner');if(request.method==='GET'&&response.ok)return json({...await response.json() as object,build:buildSha});return response;}
  if(['GET','HEAD','OPTIONS'].includes(request.method))return handleApiRequest(request,memo,database,files,environment);
  if(!files)return json({error:'Release safety storage unavailable'},503);
  return await withReleaseWrite(files,async()=>{await requireReleaseEpoch(request,files,buildSha);return handleApiRequest(request,memo,database,files,environment);});
 }catch(error){return json({error:error instanceof ReleaseGateError?error.message:'Release safety status unavailable. Keep your draft and retry.'},error instanceof ReleaseGateError?error.status:503);}
}
export default {
  async scheduled(_event:ScheduledController,env:Env,ctx:ExecutionContext){ctx.waitUntil(withReleaseWrite(env.FILES,async()=>{await scheduledBackups(env.DB,env.FILES,new Date(),catalogEnvironment(env.CATALOG_ENVIRONMENT));await preparePhotoInbox(env.FILES);}).catch(error=>{if(!(error instanceof ReleaseGateError))throw error;}));},
  async fetch(request: Request, env: Env): Promise<Response> {
    const pathname = new URL(request.url).pathname;
    if (pathname === "/api" || pathname.startsWith("/api/")) {
      if(pathname.startsWith('/api/release-automation/')){
        const principal=await verifyReleaseMachine(request,env);if(!principal)return json({error:'Machine authorization denied'},401);
        try{return await handleReleaseMachine(request,env.FILES,principal,{sha:buildInformation().commit??'',version:env.CF_VERSION_METADATA?.id??'',health:await releaseHealth(env.DB,env.FILES)});}catch{return json({error:'Release safety state unavailable'},503);}
      }
      if (!accessIsConfigured(env)) return json({ error: "Authentication configuration incomplete" }, 503);
      let environment:CatalogEnvironment;
      try{environment=catalogEnvironment(env.CATALOG_ENVIRONMENT);}catch{return json({error:'Invalid catalog environment configuration'},503);}
      return handleReleaseGuardedApi(request, new AccessIdentityVerifier(env), env.DB, env.FILES, environment);
    }
    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;
