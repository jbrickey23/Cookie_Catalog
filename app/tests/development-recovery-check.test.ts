import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { Miniflare, convertV4MiniflareOptions } from "miniflare";
import { createDevelopmentBackup } from "../src/server/development-backup";
import { createDevelopmentRecoveryCheck } from "../src/server/development-recovery-check";
import { handleApiRequest } from "../src/worker";
import type { IdentityVerifier } from "../src/server/access-identity";

async function environment() {
  const runtime = new Miniflare(convertV4MiniflareOptions({ modules: true,
    script: "export default { fetch() { return new Response('test'); } }",
    d1Databases: { DB: "test" }, r2Buckets: ["FILES"] }));
  const database = await runtime.getD1Database("DB") as unknown as D1Database;
  const bucket = await runtime.getR2Bucket("FILES") as unknown as R2Bucket;
  for (const file of ["0001_initial.sql", "0002_variants_components.sql"]) {
    const sql = readFileSync(`../database/migrations/${file}`, "utf-8").replace(/^--.*$/gm, "");
    await database.batch(sql.split(";").map(sql => sql.trim()).filter(Boolean).map(sql => database.prepare(sql)));
  }
  await database.prepare("CREATE TABLE d1_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, applied_at TEXT DEFAULT CURRENT_TIMESTAMP)").run();
  await database.batch([
    database.prepare("INSERT INTO d1_migrations(name) VALUES ('0001_initial.sql')"),
    database.prepare("INSERT INTO d1_migrations(name) VALUES ('0002_variants_components.sql')"),
    database.prepare("INSERT INTO shapes(id,name) VALUES ('shape_preserved','Existing synthetic shape')"),
    database.prepare("INSERT INTO attachments(id,storage_key,filename,byte_size) VALUES ('file_preserved','attachments/file_preserved/original','Existing synthetic file',3)"),
    database.prepare("INSERT INTO shape_attachments(shape_id,attachment_id,purpose) VALUES ('shape_preserved','file_preserved','original')")
  ]);
  await bucket.put("attachments/file_preserved/original", new Uint8Array([1, 2, 3]));
  return { runtime, database, bucket };
}
async function payload(database: D1Database, bucket: R2Bucket) {
  return JSON.parse(JSON.parse(await createDevelopmentBackup(database, bucket)).payloadJson);
}
test("real local D1/R2 recovery package includes temporary files and cleans only its own data", async () => {
  const { runtime, database, bucket } = await environment();
  try {
    const before = await payload(database, bucket);
    const envelope = JSON.parse(await createDevelopmentRecoveryCheck(database, bucket));
    assert.equal(envelope.developmentCheck.cleanupVerified, true);
    assert.equal(envelope.developmentCheck.filesVerified, 2);
    const snapshot = JSON.parse(envelope.payloadJson);
    assert.equal(snapshot.objects.length, 3);
    assert.ok(snapshot.database.tables.locations.some(row => row.id === envelope.developmentCheck.fixtureLocationId));
    assert.equal(snapshot.objects.filter(item => item.attachmentId.startsWith("recovery_")).length, 2);
    const directory = mkdtempSync(join(tmpdir(), "cookie-recovery-"));
    try {
      const backup = join(directory, "backup.json");
      writeFileSync(backup, JSON.stringify(envelope));
      const report = JSON.parse(execFileSync("python3", ["../tools/restore_development_backup.py", backup, join(directory, "restored")], { encoding: "utf-8" }));
      assert.equal(report.objects, 3);
      assert.equal(report.foreignKeysValid, true);
    } finally { rmSync(directory, { recursive: true, force: true }); }
    assert.deepEqual(await payload(database, bucket), before);
  } finally { await runtime.dispose(); }
});
test("failed export still removes its temporary records/files and preserves existing data", async () => {
  const { runtime, database, bucket } = await environment();
  try {
    const before = await payload(database, bucket);
    const failing = new Proxy(bucket, { get(target, property) {
      if (property === "get") return async (key: string) => key.startsWith("attachments/recovery_") ? null : target.get(key);
      const value = Reflect.get(target, property);
      return typeof value === "function" ? value.bind(target) : value;
    } });
    await assert.rejects(createDevelopmentRecoveryCheck(database, failing), /missing/);
    assert.deepEqual(await payload(database, bucket), before);
  } finally { await runtime.dispose(); }
});
test("cleanup failure never returns a successful package", async () => {
  const { runtime, database, bucket } = await environment();
  try {
    const failing = new Proxy(bucket, { get(target, property) {
      if (property === "delete") return async () => { throw new Error("synthetic failure"); };
      const value = Reflect.get(target, property);
      return typeof value === "function" ? value.bind(target) : value;
    } });
    await assert.rejects(createDevelopmentRecoveryCheck(database, failing), /cleanup/);
    assert.equal((await database.prepare("SELECT COUNT(*) AS n FROM shapes WHERE id LIKE 'recovery_%'").first<{ n: number }>())?.n, 0);
    assert.ok(await bucket.head("attachments/file_preserved/original"));
  } finally { await runtime.dispose(); }
});
test("recovery test rejects unauthenticated, non-owner and cross-origin requests before writes", async () => {
  const url = "https://catalog.example.test/api/dev/recovery-check";
  const verifier = (role: "owner" | "editor" | null): IdentityVerifier => ({ verify: async () => role ? { subject: "demo", email: "demo@example.test", role } : null });
  const database = { prepare() { throw new Error("Should not read or write"); } } as unknown as D1Database;
  const bucket = {} as R2Bucket;
  const headers = { Origin: "https://catalog.example.test", "X-Cookie-Catalog-Check": "recovery" };
  assert.equal((await handleApiRequest(new Request(url, { method: "POST", headers }), verifier(null), database, bucket)).status, 401);
  assert.equal((await handleApiRequest(new Request(url, { method: "POST", headers }), verifier("editor"), database, bucket)).status, 403);
  assert.equal((await handleApiRequest(new Request(url), verifier("owner"), database, bucket)).status, 405);
  assert.equal((await handleApiRequest(new Request(url, { method: "POST", headers: { ...headers, Origin: "https://other.example.test" } }), verifier("owner"), database, bucket)).status, 403);
  assert.equal((await handleApiRequest(new Request(url, { method: "POST", headers: { Origin: headers.Origin } }), verifier("owner"), database, bucket)).status, 403);
});
