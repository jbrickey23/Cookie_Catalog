import { AccessIdentityVerifier, accessIsConfigured, type AccessConfiguration, type IdentityVerifier } from "./server/access-identity";

export interface Env extends AccessConfiguration { ASSETS: Fetcher; DB: D1Database }
function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status, headers: { "content-type": "application/json", "cache-control": "no-store", "x-content-type-options": "nosniff" }
  });
}
export async function handleApiRequest(request: Request, verifier: IdentityVerifier, database?: D1Database): Promise<Response> {
  const user = await verifier.verify(request);
  if (!user) return json({ error: "Unauthorized" }, 401);
  const pathname = new URL(request.url).pathname;
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
  // No catalog or attachment operation is enabled by the authentication smoke test.
  return json({ error: "Catalog API unavailable until membership and storage validation are complete" }, 503);
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const pathname = new URL(request.url).pathname;
    if (pathname === "/api" || pathname.startsWith("/api/")) {
      if (!accessIsConfigured(env)) return json({ error: "Authentication configuration incomplete" }, 503);
      return handleApiRequest(request, new AccessIdentityVerifier(env), env.DB);
    }
    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;
