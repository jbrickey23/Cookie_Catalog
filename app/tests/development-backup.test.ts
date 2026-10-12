import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { createDevelopmentBackup, sha256 } from "../src/server/development-backup";
import { handleApiRequest } from "../src/worker";
import type { IdentityVerifier } from "../src/server/access-identity";

function database(mode = "ok") {
  return {
    prepare: (sql: string) => ({ sql }),
    async batch(statements: { sql: string }[]) {
      const result = JSON.parse(execFileSync("python3", ["../tests/backup_fixture.py"], {
        input: JSON.stringify(statements.map(item => item.sql)), encoding: "utf-8"
      }));
      if (mode === "unknown-schema") result[0].results.push({ type: "table", name: "new_table", tbl_name: "new_table", sql: "CREATE TABLE new_table(id TEXT)" });
      if (mode === "too-many-rows") result[1].results = Array.from({ length: 1001 }, () => ({ id: "shape" }));
      if (mode === "foreign-key") result.at(-1).results.push({ table: "physical_cutters", rowid: 1 });
      if (mode === "query-failure") throw new Error("private database error");
      return result;
    }
  } as unknown as D1Database;
}
function bucket(mode = "ok") {
  const encoder = new TextEncoder();
  const objects = new Map([
    ["attachments/photo_backup/original", encoder.encode("synthetic photo bytes")],
    ["attachments/model_backup/original", encoder.encode("solid demo\nendsolid demo\n")]
  ]);
  return {
    async list() {
      return { truncated: false, objects: [...objects.keys(), ...(mode === "orphan" ? ["unregistered.stl"] : [])].map(key => ({ key })) };
    },
    async get(key: string) {
      if (mode === "missing") return null;
      const bytes = objects.get(key)!;
      const data = mode === "corrupt" ? Uint8Array.from(bytes, b => b ^ 1) : bytes;
      return { size: data.length, httpMetadata: { contentType: "application/octet-stream" }, arrayBuffer: async () => data.slice().buffer };
    }
  } as unknown as R2Bucket;
}
test("actual schema, linked records and two files export and restore into a new SQLite database", async () => {
  const directory = mkdtempSync(join(tmpdir(), "cookie-backup-"));
  try {
    const document = await createDevelopmentBackup(database(), bucket());
    const backupPath = join(directory, "backup.json");
    writeFileSync(backupPath, document);
    const restored = join(directory, "restored");
    const report = JSON.parse(execFileSync("python3", ["../tools/restore_development_backup.py", backupPath, restored], { encoding: "utf-8" }));
    assert.equal(report.tables, 16);
    assert.equal(report.objects, 2);
    assert.equal(report.foreignKeysValid, true);
    assert.equal(readFileSync(join(restored, "objects/attachments/model_backup/original"), "utf-8"), "solid demo\nendsolid demo\n");
    const row = JSON.parse(execFileSync("python3", ["-c", "import sqlite3,json,sys; c=sqlite3.connect(sys.argv[1]); print(json.dumps(c.execute('SELECT d.name,s.name,p.width_mm,p.height_mm FROM designs d JOIN design_shape_links l ON l.design_id=d.id JOIN shapes s ON s.id=l.shape_id JOIN physical_cutters p ON p.shape_id=s.id').fetchone()))", join(restored, "catalog.sqlite")], { encoding: "utf-8" }));
    assert.deepEqual(row, ["DEMO Holiday tree", "DEMO Evergreen tree", 90, 100]);
    assert.throws(() => execFileSync("python3", ["../tools/restore_development_backup.py", backupPath, restored], { stdio: "pipe" }));
    const envelope = JSON.parse(document);
    envelope.payloadJson += " ";
    writeFileSync(backupPath, JSON.stringify(envelope));
    assert.throws(() => execFileSync("python3", ["../tools/restore_development_backup.py", backupPath, join(directory, "corrupt")], { stdio: "pipe" }));
    const payload = JSON.parse(JSON.parse(document).payloadJson);
    payload.objects.pop();
    envelope.payloadJson = JSON.stringify(payload);
    envelope.payloadSha256 = await sha256(new TextEncoder().encode(envelope.payloadJson));
    writeFileSync(backupPath, JSON.stringify(envelope));
    assert.throws(() => execFileSync("python3", ["../tools/restore_development_backup.py", backupPath, join(directory, "missing")], { stdio: "pipe" }));
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
test("export fails on missing/corrupt/orphan files, schema changes, record limits and broken relationships", async () => {
  for (const mode of ["missing", "corrupt", "orphan"]) await assert.rejects(createDevelopmentBackup(database(), bucket(mode)));
  for (const mode of ["unknown-schema", "too-many-rows", "foreign-key", "query-failure"]) await assert.rejects(createDevelopmentBackup(database(mode), bucket()));
});
test("backup endpoint enforces owner, method and origin before reading resources", async () => {
  let reads = 0;
  const db = { prepare: () => { reads++; throw new Error("private"); } } as unknown as D1Database;
  const url = "https://catalog.example.test/api/dev/backup";
  const verifier = (role: "owner" | "editor" | "viewer" | null): IdentityVerifier => ({ verify: async () => role ? { subject: "demo", email: "demo@example.test", role } : null });
  const headers = { Origin: "https://catalog.example.test", "X-Cookie-Catalog-Check": "backup" };
  for (const [role, status] of [[null, 401], ["editor", 403], ["viewer", 403]] as const) {
    assert.equal((await handleApiRequest(new Request(url, { method: "POST", headers }), verifier(role), db, bucket())).status, status);
  }
  assert.equal((await handleApiRequest(new Request(url), verifier("owner"), db, bucket())).status, 405);
  assert.equal((await handleApiRequest(new Request(url, { method: "POST", headers: { ...headers, Origin: "https://other.example.test" } }), verifier("owner"), db, bucket())).status, 403);
  assert.equal((await handleApiRequest(new Request(url, { method: "POST" }), verifier("owner"), db, bucket())).status, 403);
  assert.equal(reads, 0);
  const response = await handleApiRequest(new Request(url, { method: "POST", headers }), verifier("owner"), database(), bucket());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.ok(response.headers.get("content-disposition")?.startsWith("attachment;"));
  const failure = await handleApiRequest(new Request(url, { method: "POST", headers }), verifier("owner"), database("query-failure"), bucket());
  assert.equal(failure.status, 503);
  assert.ok(!(await failure.text()).includes("private database error"));
});
