import { checkDevelopmentStorage } from "./server/development-storage-check";
import { handleAttachments } from "./server/attachments";
import { handleCatalog } from "./server/catalog";
import { BackupError, createDevelopmentBackup } from "./server/development-backup";
import { createDevelopmentRecoveryCheck } from "./server/development-recovery-check";
import { AccessIdentityVerifier, accessIsConfigured, type AccessConfiguration, type IdentityVerifier } from "./server/access-identity";

export interface Env extends AccessConfiguration { ASSETS: Fetcher; DB: D1Database; FILES: R2Bucket }
function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status, headers: { "content-type": "application/json", "cache-control": "no-store", "x-content-type-options": "nosniff" }
  });
}
export async function handleApiRequest(request: Request, verifier: IdentityVerifier, database?: D1Database, files?: R2Bucket): Promise<Response> {
  const user = await verifier.verify(request);
  if (!user) return json({ error: "Unauthorized" }, 401);
  const pathname = new URL(request.url).pathname;
  if (pathname.startsWith("/api/catalog/")) {
    if (user.role !== "owner") return json({ error: "Owner access required" }, 403);
    if (!["GET","POST","PUT"].includes(request.method)) return json({ error: "Method not allowed" }, 405);
    if (request.method !== "GET" && (request.headers.get("Origin") !== new URL(request.url).origin
        || request.headers.get("X-Cookie-Catalog-Check") !== "catalog")) return json({ error: "Same-origin catalog request required" },403);
    if (!database) return json({ error: "Catalog database unavailable" },503);
    return handleCatalog(request,database);
  }
  if (pathname === "/api/attachment-targets" || pathname === "/api/attachments" || pathname.startsWith("/api/attachments/")
      || pathname === "/api/attachment-orphans" || pathname.startsWith("/api/attachment-orphans/")) {
    // Current catalog has one owner. Collaborator authorization is not enabled.
    if (user.role !== "owner") return json({ error: "Owner access required" }, 403);
    if (!["GET", "POST", "DELETE"].includes(request.method)) return json({ error: "Method not allowed" }, 405);
    if (request.method !== "GET" && (request.headers.get("Origin") !== new URL(request.url).origin
        || request.headers.get("X-Cookie-Catalog-Check") !== "attachments")) {
      return json({ error: "Same-origin attachment request required" }, 403);
    }
    if (!database || !files) return json({ error: "Attachment resources unavailable" }, 503);
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
  async fetch(request: Request, env: Env): Promise<Response> {
    const pathname = new URL(request.url).pathname;
    if (pathname === "/api" || pathname.startsWith("/api/")) {
      if (!accessIsConfigured(env)) return json({ error: "Authentication configuration incomplete" }, 503);
      return handleApiRequest(request, new AccessIdentityVerifier(env), env.DB, env.FILES);
    }
    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;
