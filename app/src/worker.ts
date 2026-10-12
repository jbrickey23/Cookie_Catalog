export interface Env { ASSETS: Fetcher }
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return new Response(JSON.stringify({error:"API unavailable until authentication is configured"}), {status:503,headers:{"content-type":"application/json","cache-control":"no-store"}});
    }
    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;
