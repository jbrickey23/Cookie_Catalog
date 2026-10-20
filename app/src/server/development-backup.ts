/** Bounded, owner-only development recovery package. No live writes or public object URLs. */
export const BACKUP_TABLES = [
  "shapes", "locations", "physical_cutters", "designs", "design_shape_links", "tags",
  "design_tags", "shape_tags", "attachments", "shape_attachments", "design_attachments",
  "printable_assets", "shape_size_variants", "design_components", "printable_size_recipes", "d1_migrations"
] as const;
export const REVIEW_TABLES = ["import_review_workspaces","import_review_versions","import_review_items","import_review_runs"] as const;
export const IMPORT_TABLES = ["catalog_import_batches","catalog_source_mappings"] as const;
function snapshotTables(schema:SchemaRow[]):readonly string[]{
  const names=schema.filter(row=>row.type==="table").map(row=>row.name).sort();
  for(const profile of [BACKUP_TABLES,[...BACKUP_TABLES,...REVIEW_TABLES],[...BACKUP_TABLES,...REVIEW_TABLES,...IMPORT_TABLES],[...BACKUP_TABLES,...REVIEW_TABLES,...IMPORT_TABLES,"physical_cutter_attachments"]]){
    if(JSON.stringify(names)===JSON.stringify([...profile].sort()))return profile;
  }
  throw new BackupError("Database schema has changed. Update the recovery tool before exporting.");
}
const MAX_ROWS = 1000;
const MAX_OBJECTS = 25;
const MAX_OBJECT_BYTES = 4 * 1024 * 1024;
const MAX_DOWNLOAD_BYTES = 12 * 1024 * 1024;
type Row = Record<string, unknown>;
interface SchemaRow { type: string; name: string; tbl_name: string; sql: string | null }
export class BackupError extends Error {}
export async function sha256(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
}
function base64(bytes: Uint8Array): string {
  let binary = "";
  for (let start = 0; start < bytes.length; start += 8192) {
    binary += String.fromCharCode(...bytes.subarray(start, start + 8192));
  }
  return btoa(binary);
}
function checkedRows(result: D1Result<unknown> | undefined): Row[] {
  if (!result?.success || !Array.isArray(result.results)) throw new BackupError("Database snapshot failed.");
  return result.results as Row[];
}
export async function createDatabaseSnapshot(database: D1Database, maxRows = MAX_ROWS) {
  const schemaSql="SELECT type, name, tbl_name, sql FROM sqlite_schema WHERE substr(name,1,7) != 'sqlite_' AND substr(name,1,4) != '_cf_' ORDER BY type, name";
  const probe=await database.batch([database.prepare(schemaSql)]);
  const selectedTables=snapshotTables(checkedRows(probe[0]) as unknown as SchemaRow[]);
  // Probe chooses a known profile. Revalidate schema inside the transactional snapshot.
  const results = await database.batch([
    database.prepare(schemaSql),
    ...selectedTables.map(table => database.prepare(`SELECT * FROM "${table}" LIMIT ${maxRows + 1}`)),
    database.prepare("PRAGMA foreign_key_check")
  ]);
  if (results.length !== selectedTables.length + 2) throw new BackupError("Database snapshot incomplete.");
  const schema = checkedRows(results[0]) as unknown as SchemaRow[];
  if(JSON.stringify(snapshotTables(schema))!==JSON.stringify(selectedTables))throw new BackupError("Database schema changed during snapshot.");
  const known = new Set<string>(selectedTables);
  if (schema.some(item => !known.has(item.tbl_name) || !["table", "index"].includes(item.type)
      || (item.sql?.toUpperCase().includes("CREATE VIRTUAL TABLE")))) {
    throw new BackupError("Database schema has changed. Update the recovery tool before exporting.");
  }
  if (schema.filter(item => item.type === "table").length !== selectedTables.length) {
    throw new BackupError("Database schema incomplete.");
  }
  const tables: Record<string, Row[]> = {};
  for (let i = 0; i < selectedTables.length; i++) {
    const rows = checkedRows(results[i + 1]);
    if (rows.length > maxRows) throw new BackupError("Database snapshot exceeds the record limit. Use an operator export.");
    for (const row of rows) for (const value of Object.values(row)) {
      if (value !== null && typeof value !== "string" && typeof value !== "number") {
        throw new BackupError("Unsupported database value.");
      }
      if (typeof value === "number" && (!Number.isFinite(value) || (Number.isInteger(value) && !Number.isSafeInteger(value)))) {
        throw new BackupError("Database number cannot be exported safely.");
      }
    }
    tables[selectedTables[i]] = rows;
  }
  const expectedMigrations=["0001_initial.sql","0002_variants_components.sql",...(selectedTables.includes("import_review_runs")?["0003_import_reviews.sql"]:[]),...(selectedTables.includes("catalog_source_mappings")?["0004_catalog_imports.sql"]:[]),...(selectedTables.includes("physical_cutter_attachments")?["0005_physical_photographs.sql"]:[])];
  if(JSON.stringify(tables.d1_migrations.map(row=>row.name).sort())!==JSON.stringify(expectedMigrations))throw new BackupError("Database migration records do not match the supported schema.");
  if (checkedRows(results.at(-1)).length) throw new BackupError("Database relationships failed validation.");
  return { schema, tables };
}
export async function createDevelopmentBackup(database: D1Database, files: R2Bucket): Promise<string> {
  const { schema, tables } = await createDatabaseSnapshot(database);
  const attachments = tables.attachments;
  if (attachments.length > MAX_OBJECTS) throw new BackupError("Development backup has too many files. Use an operator export.");
  const keys = new Set<string>();
  for (const item of attachments) {
    if (typeof item.id !== "string" || !/^[a-zA-Z0-9_-]{8,128}$/.test(item.id)
        || typeof item.storage_key !== "string"
        || !new RegExp(`^attachments/${item.id}/(original|thumbnail)$`).test(item.storage_key)) {
      throw new BackupError("Attachment metadata is invalid.");
    }
    keys.add(item.storage_key);
  }
  // Refuse to silently omit unregistered persistent objects. Smoke-test files are disposable.
  let cursor: string | undefined;
  let pages = 0;
  do {
    const page = await files.list({ limit: 100, cursor });
    if (++pages > 10) throw new BackupError("Development storage too large. Use an operator export.");
    if (page.objects.some(item => !item.key.startsWith("dev-checks/") && !item.key.startsWith("catalog-backups/") && !keys.has(item.key))) {
      throw new BackupError("Storage contains unregistered files. Reconcile them before exporting.");
    }
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
  const objects = [];
  let totalBytes = 0;
  for (const item of attachments) {
    const key = item.storage_key as string;
    const object = await files.get(key);
    if (!object) throw new BackupError("An attachment file is missing.");
    totalBytes += object.size;
    if (totalBytes > MAX_OBJECT_BYTES) throw new BackupError("Development files too large. Use an operator export.");
    const bytes = new Uint8Array(await object.arrayBuffer());
    const checksum = await sha256(bytes);
    if (bytes.length !== object.size || (item.byte_size !== null && item.byte_size !== bytes.length)
        || (item.sha256 !== null && String(item.sha256).toLowerCase() !== checksum)) {
      throw new BackupError("An attachment failed size or checksum validation.");
    }
    objects.push({ attachmentId: item.id, key, byteSize: bytes.length, sha256: checksum,
      contentType: object.httpMetadata?.contentType ?? null, base64: base64(bytes) });
  }
  const payloadJson = JSON.stringify({ environment: "development", database: { schema, tables }, objects });
  if (new TextEncoder().encode(payloadJson).length > MAX_DOWNLOAD_BYTES / 2) {
    throw new BackupError("Development backup too large. Use an operator export.");
  }
  const document = JSON.stringify({ format: "cookie-catalog-development-backup", version: 1,
    exportedAt: new Date().toISOString(), payloadJson,
    payloadSha256: await sha256(new TextEncoder().encode(payloadJson)) });
  if (new TextEncoder().encode(document).length > MAX_DOWNLOAD_BYTES) throw new BackupError("Development backup too large.");
  return document;
}
