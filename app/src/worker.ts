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

export interface Env extends AccessConfiguration { ASSETS: Fetcher; DB: D1Database; FILES: R2Bucket }
function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status, headers: { "content-type": "application/json", "cache-control": "no-store", "x-content-type-options": "nosniff" }
  });
}
export async function handleApiRequest(request: Request, verifier: IdentityVerifier, database?: D1Database, files?: R2Bucket): Promise<Response> {
  const user = await verifier.verify(request);
  if (!mayRead(user)) return json({ error: "Unauthorized" }, 401);
  if (!user) return json({ error: "Unauthorized" }, 401);
  const pathname = new URL(request.url).pathname;
  if(pathname==="/api/backups"||pathname.startsWith("/api/backups/")){
    if(user.role!=="owner")return json({error:"Owner/admin access required"},403);
    if(!database||!files)return json({error:"Backup resources unavailable"},503);
    if(request.method!=="GET"&&(request.headers.get("Origin")!==new URL(request.url).origin||request.headers.get("X-Cookie-Catalog-Check")!=="managed-backup"))return json({error:"Same-origin backup request required"},403);
    return handleManagedBackups(request,database,files,user.subject);
  }
  const restoreGate=async()=>{try{return files&&await restoreInProgress(files)?json({error:"Catalog restore is in progress. Resume or review recovery from Backups."},423):null;}catch{return json({error:"Recovery status unavailable. Retry before accessing catalog data."},503);}};
  // Maintenance, archive/export and synthetic fixtures are owner-only.
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
    try{return json(await inspectInfrastructure(database,files));}
    catch{return json({error:"Read-only infrastructure verification failed. Check development bindings/migrations."},503);}
  }
  if (pathname === "/api/dev/archive" || pathname === "/api/dev/archive-file") {
    if(user.role !== "owner")return json({error:"Owner access required"},403);
    if(request.method !== "POST")return json({error:"Method not allowed"},405);
    if(request.headers.get("Origin") !== new URL(request.url).origin || request.headers.get("X-Cookie-Catalog-Check") !== "archive")return json({error:"Same-origin archive request required"},403);
    if(!database || !files)return json({error:"Archive resources unavailable"},503);
    {const blocked=await restoreGate();if(blocked)return blocked;}
    try {
      if(pathname === "/api/dev/archive-file")return await archiveOriginal(request,database,files);
      const manifest=await createArchiveManifest(database,files);
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
    return json({ authenticated: true, email: user.email, role: user.role });
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
export default {
  async scheduled(_event:ScheduledController,env:Env,ctx:ExecutionContext){ctx.waitUntil(scheduledBackups(env.DB,env.FILES));},
  async fetch(request: Request, env: Env): Promise<Response> {
    const pathname = new URL(request.url).pathname;
    if (pathname === "/api" || pathname.startsWith("/api/")) {
      if (!accessIsConfigured(env)) return json({ error: "Authentication configuration incomplete" }, 503);
      return handleApiRequest(request, new AccessIdentityVerifier(env), env.DB, env.FILES);
    }
    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;
