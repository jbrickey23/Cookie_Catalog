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
