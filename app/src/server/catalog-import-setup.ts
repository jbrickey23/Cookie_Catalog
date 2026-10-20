import { BACKUP_TABLES, REVIEW_TABLES, IMPORT_TABLES } from './development-backup';
import { readImportInput } from './catalog-import';
// Kept identical to migration 0004 by the integration test.
export const importSetupStatements: readonly string[] = [
    "ALTER TABLE physical_cutters ADD COLUMN reference_size_mm REAL CHECK(reference_size_mm>0 AND reference_size_mm<=10000)",
    "ALTER TABLE physical_cutters ADD COLUMN slot TEXT",
    "CREATE TABLE catalog_import_batches (\n id TEXT PRIMARY KEY,\n workspace_id TEXT NOT NULL,\n revision INTEGER NOT NULL,\n request_sha256 TEXT NOT NULL,\n plan_sha256 TEXT NOT NULL,\n backup_reference TEXT NOT NULL,\n created_by TEXT NOT NULL,\n created_at TEXT NOT NULL,\n safety_check INTEGER NOT NULL CHECK(safety_check=1),\n result_json TEXT NOT NULL CHECK(json_valid(result_json) AND length(CAST(result_json AS BLOB))<=32000),\n FOREIGN KEY(workspace_id,revision) REFERENCES import_review_versions(workspace_id,revision)\n)",
    "CREATE TABLE catalog_source_mappings (\n source_namespace TEXT NOT NULL,\n source_key TEXT NOT NULL,\n kind TEXT NOT NULL CHECK(kind IN ('physical_cutter','design')),\n workspace_id TEXT NOT NULL,\n revision INTEGER NOT NULL,\n item_sha256 TEXT NOT NULL,\n item_json TEXT NOT NULL CHECK(json_valid(item_json) AND length(CAST(item_json AS BLOB))<=32000),\n decision_json TEXT NOT NULL CHECK(json_valid(decision_json) AND length(CAST(decision_json AS BLOB))<=4000),\n batch_id TEXT NOT NULL REFERENCES catalog_import_batches(id),\n shape_id TEXT REFERENCES shapes(id),\n physical_id TEXT REFERENCES physical_cutters(id),\n design_id TEXT REFERENCES designs(id),\n PRIMARY KEY(source_namespace,source_key),\n FOREIGN KEY(workspace_id,revision) REFERENCES import_review_versions(workspace_id,revision),\n CHECK((kind='physical_cutter' AND shape_id IS NOT NULL AND physical_id IS NOT NULL AND design_id IS NULL)\n    OR (kind='design' AND design_id IS NOT NULL AND shape_id IS NULL AND physical_id IS NULL))\n)",
    "CREATE INDEX idx_source_mapping_physical ON catalog_source_mappings(physical_id)",
    "CREATE INDEX idx_source_mapping_design ON catalog_source_mappings(design_id)"
];
async function status(db: D1Database) {
    const result = await db.batch<Record<string, unknown>>([
        db.prepare("SELECT name FROM sqlite_schema WHERE type='table' AND substr(name,1,7)!='sqlite_' AND substr(name,1,4)!='_cf_' ORDER BY name"),
        db.prepare('SELECT name FROM d1_migrations ORDER BY name'),
        db.prepare('PRAGMA table_info(physical_cutters)')
    ]);
    const tables = result[0].results.map(r => String(r.name)), migrations = result[1].results.map(r => String(r.name)), columns = result[2].results.map(r => String(r.name));
    const same = (a: readonly string[], b: readonly string[]) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
    const base = ['0001_initial.sql', '0002_variants_components.sql', '0003_import_reviews.sql'];
    if (same(tables, [...BACKUP_TABLES, ...REVIEW_TABLES]) && same(migrations, base) && !columns.includes('reference_size_mm') && !columns.includes('slot'))
        return { ready: false, tables: 20, migrations: 3 };
    const physical=tables.includes('physical_cutter_attachments');
    if (same(tables, [...BACKUP_TABLES, ...REVIEW_TABLES, ...IMPORT_TABLES,...(physical?['physical_cutter_attachments']:[])]) && same(migrations, [...base, '0004_catalog_imports.sql',...(physical?['0005_physical_photographs.sql']:[])]) && columns.includes('reference_size_mm') && columns.includes('slot'))
        return { ready: true, tables: physical?23:22, migrations: physical?5:4 };
    throw Error('Unexpected schema');
}
export async function handleCatalogImportSetup(request: Request, db: D1Database) {
    const json = (v: unknown, s = 200) => Response.json(v, { status: s, headers: { 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
    try {
        const current = await status(db);
        if (request.method === 'GET' || current.ready)
            return json(current);
        let data;
        try {
            data = await readImportInput(request);
        }
        catch {
            return json({ error: 'Provide a protected pre-change backup reference and confirmation.' }, 400);
        }
        if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).some(k => !['backupReference', 'backupConfirmed'].includes(k)) || data.backupConfirmed !== true || typeof data.backupReference !== 'string' || !data.backupReference.trim() || data.backupReference.length > 500 || /[\x00-\x1f]/.test(data.backupReference))
            return json({ error: 'Provide a protected pre-change backup reference and confirmation.' }, 400);
        try {
            await db.batch([...importSetupStatements.map(s => db.prepare(s)), db.prepare("INSERT INTO d1_migrations(name) VALUES('0004_catalog_imports.sql')")]);
        }
        catch {
            const checked = await status(db);
            if (checked.ready)
                return json(checked);
            throw Error('Setup failed');
        }
        return json({ ...await status(db), activated: true });
    }
    catch {
        return json({ error: 'Import setup could not complete safely. Existing catalog records were preserved. Review the database schema before retrying.' }, 503);
    }
}
