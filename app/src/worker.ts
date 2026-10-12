import { AccessIdentityVerifier, accessIsConfigured, type AccessConfiguration, type IdentityVerifier } from "./server/access-identity";

export interface Env extends AccessConfiguration { ASSETS: Fetcher }
function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status, headers: { "content-type": "application/json", "cache-control": "no-store", "x-content-type-options": "nosniff" }
  });
}
export async function handleApiRequest(request: Request, verifier: IdentityVerifier): Promise<Response> {
  const user = await verifier.verify(request);
  if (!user) return json({ error: "Unauthorized" }, 401);
  const pathname = new URL(request.url).pathname;
  if (pathname === "/api/session") {
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
    return json({ authenticated: true, email: user.email, role: user.role });
  }
  // No catalog or attachment operation is enabled by the authentication smoke test.
  return json({ error: "Catalog API unavailable until membership and storage validation are complete" }, 503);
}
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const pathname = new URL(request.url).pathname;
    if (pathname === "/api" || pathname.startsWith("/api/")) {
      if (!accessIsConfigured(env)) return json({ error: "Authentication configuration incomplete" }, 503);
      return handleApiRequest(request, new AccessIdentityVerifier(env));
    }
    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;
