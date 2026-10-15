import assert from "node:assert/strict";
import { test } from "node:test";
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from "jose";
import { AccessIdentityVerifier, accessIsConfigured } from "../src/server/access-identity";
import worker, { handleApiRequest } from "../src/worker";

const domain = "synthetic-team.cloudflareaccess.com";
const issuer = `https://${domain}`;
const audience = "a".repeat(64);
const config = { ACCESS_TEAM_DOMAIN: domain, ACCESS_AUD: audience, OWNER_EMAIL: "owner@example.test" };
const pair = await generateKeyPair("RS256");
const publicJwk = await exportJWK(pair.publicKey);
const keys = createLocalJWKSet({ keys: [{ ...publicJwk, kid: "key-1", alg: "RS256" }] });
const verifier = new AccessIdentityVerifier(config, keys);
async function token(claims: Record<string, unknown> = {}, signingKey = pair.privateKey, kid = "key-1") {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ type: "app", email: "owner@example.test", iss: issuer, aud: [audience],
    sub: "synthetic-owner", iat: now, exp: now + 300, ...claims })
    .setProtectedHeader({ alg: "RS256", kid }).sign(signingKey);
}
function request(jwt?: string, path = "/api/session", method = "GET") {
  return new Request(`https://catalog.example.test${path}`, {
    method, headers: jwt ? { "Cf-Access-Jwt-Assertion": jwt } : {}
  });
}

test("accepts a signed owner token and returns an uncached session", async () => {
  const jwt = await token();
  assert.deepEqual(await verifier.verify(request(jwt)), {
    subject: "synthetic-owner", email: "owner@example.test", role: "owner"
  });
  const response = await handleApiRequest(request(jwt), verifier);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { authenticated: true, email: "owner@example.test", role: "owner" });
});
test("missing JWT and spoofed email headers are rejected", async () => {
  const spoof = new Request("https://catalog.example.test/api/session", {
    headers: { "Cf-Access-Authenticated-User-Email": "owner@example.test" }
  });
  assert.equal(await verifier.verify(spoof), null);
  assert.equal((await handleApiRequest(spoof, verifier)).status, 401);
});
test("registered claims, membership and token type are enforced", async () => {
  const now = Math.floor(Date.now() / 1000);
  for (const claims of [
    { aud: ["b".repeat(64)] }, { iss: "https://other.cloudflareaccess.com" },
    { exp: now - 60 }, { nbf: now + 600 }, { iat: now + 600 },
    { email: "stranger@example.test" }, { email: "" }, { sub: "" }, { type: "service" },
    { exp: undefined }, { iat: undefined }, { sub: undefined }
  ]) assert.equal(await verifier.verify(request(await token(claims))), null, JSON.stringify(claims));
});
test("forged signatures, unknown keys, and malformed tokens are rejected", async () => {
  const rogue = await generateKeyPair("RS256");
  assert.equal(await verifier.verify(request(await token({}, rogue.privateKey))), null);
  assert.equal(await verifier.verify(request(await token({}, pair.privateKey, "unknown"))), null);
  assert.equal(await verifier.verify(request("not.a.token")), null);
});
test("JWKS failures and incomplete configuration fail closed", async () => {
  const broken = new AccessIdentityVerifier(config, async () => { throw new Error("key service unavailable"); });
  assert.equal(await broken.verify(request(await token())), null);
  assert.equal(accessIsConfigured({ ...config, ACCESS_TEAM_DOMAIN: "evil.test/path" }), false);
  assert.equal(await new AccessIdentityVerifier({ ...config, OWNER_EMAIL: undefined }, keys).verify(request(await token())), null);
  const response = await worker.fetch(request(), { ASSETS: { fetch: async () => new Response("assets") } } as never);
  assert.equal(response.status, 503);
});
test("catalog operations remain disabled and session endpoint is read only", async () => {
  const jwt = await token();
  assert.equal((await handleApiRequest(request(jwt, "/api/shapes"), verifier)).status, 503);
  assert.equal((await handleApiRequest(request(jwt, "/api/session", "POST"), verifier)).status, 405);
  assert.equal((await handleApiRequest(request(undefined, "/api/files/demo"), verifier)).status, 401);
});
test("key rotation can validate either trusted signing key", async () => {
  const rotated = await generateKeyPair("RS256");
  const jwk = await exportJWK(rotated.publicKey);
  const both = createLocalJWKSet({ keys: [
    { ...publicJwk, kid: "key-1", alg: "RS256" }, { ...jwk, kid: "key-2", alg: "RS256" }
  ] });
  const rotationVerifier = new AccessIdentityVerifier(config, both);
  assert.ok(await rotationVerifier.verify(request(await token())));
  assert.ok(await rotationVerifier.verify(request(await token({}, rotated.privateKey, "key-2"))));
});

test("optional membership uses only verified subject/email, rejects claimed roles and observes revocation",async()=>{
  let active=true,calls=0;
  const memberVerifier=new AccessIdentityVerifier(config,keys,{resolve:async(subject,email)=>{
    calls++;return active&&subject==="member-subject"&&email==="member@example.test"?"editor":null;
  }});
  const memberToken=await token({sub:"member-subject",email:"Member@Example.Test",role:"owner"});
  assert.equal((await memberVerifier.verify(request(memberToken)))?.role,"editor");
  active=false;assert.equal(await memberVerifier.verify(request(memberToken)),null);
  assert.equal(await memberVerifier.verify(request(await token({sub:"other",email:"member@example.test"}))),null);
  const before=calls;
  assert.equal(await memberVerifier.verify(request(await token({sub:"member-subject",email:"member@example.test",aud:["wrong"]}))),null);
  assert.equal(calls,before,"membership must not run before JWT validation");
  assert.equal(await verifier.verify(request(memberToken)),null,"runtime without resolver remains owner-only");
});
test("membership outages and invalid resolver roles fail closed while owner bootstrap stays available",async()=>{
  const broken=new AccessIdentityVerifier(config,keys,{resolve:async()=>{throw Error("membership unavailable");}});
  assert.equal(await broken.verify(request(await token({sub:"member",email:"member@example.test"}))),null);
  assert.equal((await broken.verify(request(await token())))?.role,"owner");
  const invalid=new AccessIdentityVerifier(config,keys,{resolve:async()=>"owner" as never});
  assert.equal(await invalid.verify(request(await token({sub:"member",email:"member@example.test"}))),null);
});

test("deployed database check authenticates before querying and scopes the fixture", async () => {
  let calls = 0;
  const database = {
    prepare(sql: string) {
      calls++;
      assert.ok(sql.includes("c.id = ?"));
      return {
        bind(...ids: string[]) {
          assert.deepEqual(ids, ["design_dev_tree", "shape_dev_tree", "cutter_dev_tree", "link_dev_tree"]);
          return { first: async () => ({ design: "DEMO Holiday tree", shape: "DEMO Evergreen tree", width_mm: 90, height_mm: 100 }) };
        }
      };
    }
  } as unknown as D1Database;
  assert.equal((await handleApiRequest(request(undefined, "/api/dev/database-check"), verifier, database)).status, 401);
  assert.equal(calls, 0);
  const response = await handleApiRequest(request(await token(), "/api/dev/database-check"), verifier, database);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).fixtureMatches, true);
  assert.equal(calls, 1);
  assert.equal((await handleApiRequest(request(await token(), "/api/dev/database-check", "POST"), verifier, database)).status, 405);
  assert.equal(calls, 1);
});
test("database check handles missing fixtures and query failures without leaking details", async () => {
  const missing = { prepare: () => ({ bind: () => ({ first: async () => null }) }) } as unknown as D1Database;
  const broken = { prepare: () => { throw new Error("private database detail"); } } as unknown as D1Database;
  const jwt = await token();
  assert.equal((await handleApiRequest(request(jwt, "/api/dev/database-check"), verifier, missing)).status, 404);
  const response = await handleApiRequest(request(jwt, "/api/dev/database-check"), verifier, broken);
  assert.equal(response.status, 503);
  assert.ok(!(await response.text()).includes("private database detail"));
});

test("storage mutation requires a verified owner, POST, origin and custom header", async () => {
  let writes = 0;
  const files = { put: async () => { writes++; throw new Error("synthetic stop"); },
    delete: async () => {}, head: async () => null } as unknown as R2Bucket;
  const url = "https://catalog.example.test/api/dev/storage-check";
  assert.equal((await handleApiRequest(new Request(url, { method: "POST" }), verifier, undefined, files)).status, 401);
  const jwt = await token();
  for (const headers of [
    { Origin: "https://other.example.test", "X-Cookie-Catalog-Check": "storage" },
    { Origin: "https://catalog.example.test" }
  ]) {
    const req = new Request(url, { method: "POST", headers: { ...headers, "Cf-Access-Jwt-Assertion": jwt } });
    assert.equal((await handleApiRequest(req, verifier, undefined, files)).status, 403);
  }
  assert.equal(writes, 0);
  const req = new Request(url, { method: "POST", headers: {
    Origin: "https://catalog.example.test", "X-Cookie-Catalog-Check": "storage", "Cf-Access-Jwt-Assertion": jwt
  } });
  assert.equal((await handleApiRequest(req, verifier, undefined, files)).status, 503);
  assert.equal(writes, 1);
  assert.equal((await handleApiRequest(request(jwt, "/api/dev/storage-check"), verifier, undefined, files)).status, 405);
});

test("private membership grants owner-equivalent admin and viewer after JWT verification and observes revocation", async () => {
  const privateConfig = {...config, CATALOG_MEMBERS: JSON.stringify([
    {email:"admin@example.test",role:"owner"}, {email:"viewer@example.test",role:"viewer"}
  ])};
  const configured = new AccessIdentityVerifier(privateConfig,keys);
  assert.equal((await configured.verify(request(await token({email:"Admin@Example.Test",sub:"admin"}))))?.role,"owner");
  const viewerJwt = await token({email:"viewer@example.test",sub:"viewer",role:"owner"});
  assert.equal((await configured.verify(request(viewerJwt)))?.role,"viewer");
  assert.equal((await handleApiRequest(request(viewerJwt,"/api/dev/archive","POST"),configured)).status,403);
  assert.equal((await handleApiRequest(request(viewerJwt,"/api/catalog/shapes","POST"),configured)).status,403);
  assert.equal((await handleApiRequest(request(viewerJwt,"/api/attachments/demo","DELETE"),configured)).status,403);
  assert.equal(await configured.verify(request(await token({email:"stranger@example.test"}))),null);
  assert.equal(await configured.verify(request(await token({email:"admin@example.test",aud:["wrong"]}))),null);
  assert.equal(await configured.verify(request(await token({email:"admin@example.test"},(await generateKeyPair("RS256")).privateKey))),null);
  privateConfig.CATALOG_MEMBERS = "[]";
  assert.equal(await configured.verify(request(viewerJwt)),null,"removal revokes subsequent requests despite unexpired JWT");
  assert.equal((await configured.verify(request(await token())))?.role,"owner");
});
test("malformed, duplicate or invalid private memberships fail closed without resolver fallback", async () => {
  const jwt = await token({email:"member@example.test"});
  for (const value of ["broken", "{}", "null", JSON.stringify([{email:"member@example.test",role:"admin"}]),
    JSON.stringify([{email:"member@example.test",role:"viewer"},{email:"MEMBER@example.test",role:"owner"}]),
    JSON.stringify([{email:"member@example.test",role:"owner",extra:true}]),
    JSON.stringify([{email:"member@example.test",role:"viewer"},{email:"bad",role:"owner"}])]) {
    const configured = new AccessIdentityVerifier({...config,CATALOG_MEMBERS:value},keys,{resolve:async()=>"editor"});
    assert.equal(await configured.verify(request(jwt)),null);
    assert.equal((await configured.verify(request(await token())))?.role,"owner");
  }
});
