import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';
import { handleApiRequest } from '../src/worker';
import { createArchiveBackup } from '../src/server/archive-backup';
import { createDevelopmentBackup } from '../src/server/development-backup';
import type { IdentityVerifier } from '../src/server/access-identity';
import type { StagingManifest } from '../src/staging.mjs';
const origin = 'https://catalog.example.test', id = 'review_' + 'b'.repeat(32);
const owner: IdentityVerifier = { verify: async () => ({ subject: 'test-owner', email: 'owner@example.test', role: 'owner' }) };
function request(suffix: string, value: unknown = {}, revision = '"review-1"') { return new Request(origin + '/api/import-reviews/' + id + '/' + suffix, { method: 'POST', headers: { Origin: origin, 'content-type': 'application/json', 'X-Cookie-Catalog-Check': 'import-review', 'If-Match': revision }, body: JSON.stringify(value) }); }
function manifest(): StagingManifest { return { format: 'cookie-catalog-staging', version: 1, sourceNamespace: 'test-import', items: [{ sourceKey: 'physical', kind: 'physical_cutter', name: "TEST Tree 雪 O'Brien", source: { pageId: 'test-page' }, facts: { location: 'Unverified bin' }, catalog: { referenceSizeMm: 101.6, slot: 'A' } }, { sourceKey: 'design', kind: 'design', name: 'TEST design', source: { pageId: 'test-design' } }, { sourceKey: 'file', kind: 'printable_asset', name: 'TEST file', source: { pageId: 'test-file' } }, { sourceKey: 'not-owned', kind: 'physical_cutter', name: 'TEST unowned', source: { pageId: 'test-unowned' }, catalog: { ownership: 'not_owned' } }] }; }
async function environment(imports = true, m = manifest()) {
    const runtime = new Miniflare(convertV4MiniflareOptions({ modules: true, script: "export default {fetch(){return new Response('test')}}", d1Databases: { DB: 'imports' }, r2Buckets: ['FILES'] }));
    const db = await runtime.getD1Database('DB') as unknown as D1Database, bucket = await runtime.getR2Bucket('FILES') as unknown as R2Bucket;
    const migrations = ['0001_initial.sql', '0002_variants_components.sql', '0003_import_reviews.sql', ...(imports ? ['0004_catalog_imports.sql'] : [])];
    for (const name of migrations) {
        const sql = readFileSync('../database/migrations/' + name, 'utf8').replace(/^--.*$/gm, '');
        await db.batch(sql.split(';').map(s => s.trim()).filter(Boolean).map(s => db.prepare(s)));
    }
    await db.prepare('CREATE TABLE d1_migrations(id INTEGER PRIMARY KEY,name TEXT,applied_at TEXT)').run();
    await db.batch(migrations.map((n, i) => db.prepare('INSERT INTO d1_migrations VALUES(?,?,?)').bind(i + 1, n, 'TEST')));
    const response = await handleApiRequest(new Request(origin + '/api/import-reviews', { method: 'POST', headers: { Origin: origin, 'content-type': 'application/json', 'X-Cookie-Catalog-Check': 'import-review' }, body: JSON.stringify({ id, title: 'TEST import', manifest: m }) }), owner, db);
    assert.equal(response.status, 201, await response.text());
    return { runtime, db, bucket };
}
const selected = [{ sourceKey: 'physical', action: 'create' }, { sourceKey: 'design', action: 'create' }];
async function prepare(db: D1Database, choices = selected, extra = { ownershipConfirmed: true }) { const r = await handleApiRequest(request('catalog-plan', { choices, ...extra }), owner, db); assert.equal(r.status, 200, await r.clone().text()); return r.json() as Promise<any>; }
async function apply(db: D1Database, p: any, choices = selected, extra: Record<string, unknown> = {}) { return handleApiRequest(request('apply', { choices, ownershipConfirmed: true, planSha256: p.planSha256, backupReference: 'TEST protected pre-change receipt', backupConfirmed: true, ...extra }), owner, db); }
const count = async (db: D1Database, t: string) => Number((await db.prepare('SELECT COUNT(*) AS n FROM ' + t).first<any>())!.n);
test('explicit selection imports owned individual cutter with default quantity one, design, durable source audit and safe retry', async () => {
    const { runtime, db } = await environment();
    try {
        const p = await prepare(db);
        assert.equal(p.ready, 2);
        assert.equal(await count(db, 'shapes'), 0);
        const result = await apply(db, p);
        assert.equal(result.status, 201, await result.clone().text());
        assert.equal((await result.json() as any).created, 2);
        const cutter = await db.prepare('SELECT * FROM physical_cutters').first<any>();
        assert.equal(cutter.quantity, 1);
        assert.equal(cutter.width_mm, null);
        assert.equal(cutter.height_mm, null);
        assert.equal(cutter.location_id, null);
        assert.equal(cutter.origin, 'unknown');
        assert.match(cutter.notes, /Quantity defaulted to one/);
        assert.match(cutter.notes, /101.6 mm/);
        assert.equal(await count(db, 'designs'), 1);
        assert.equal(await count(db, 'locations'), 0);
        const mapping = await db.prepare("SELECT item_json FROM catalog_source_mappings WHERE source_key='physical'").first<any>();
        assert.deepEqual(JSON.parse(mapping.item_json), manifest().items[0]);
        const replay = await apply(db, p);
        assert.equal(replay.status, 200);
        assert.equal((await replay.json() as any).replayed, true);
        assert.equal(await count(db, 'physical_cutters'), 1);
        assert.equal((await apply(db, p, selected, { backupReference: 'different evidence' })).status, 409);
        const next = await prepare(db);
        assert.equal(next.alreadyLinked, 2);
        assert.equal(next.ready, 0);
        const queue = await (await handleApiRequest(new Request(origin + '/api/readiness?kind=physical_cutter'), owner, db)).json() as any;
        assert.equal(queue.items.length, 1);
        assert(queue.items[0].openCount > 0);
        assert.deepEqual((await db.prepare('PRAGMA foreign_key_check').all()).results, []);
    }
    finally {
        await runtime.dispose();
    }
});
test('unknown ownership requires explicit confirmation; not-owned/not-printed, invalid quantity and printable references remain blocked', async () => {
    const m = manifest();
    m.items.push({ ...m.items[0], sourceKey: 'not-printed', catalog: { ownership: 'owned', printStatus: 'not_printed' } });
    m.items.push({ ...m.items[0], sourceKey: 'zero', catalog: { ownership: 'owned', quantity: 0 } });
    const { runtime, db } = await environment(true, m);
    try {
        const p = await prepare(db, [selected[0]], { ownershipConfirmed: false });
        assert.equal(p.blocked, 1);
        for (const key of ['not-owned', 'not-printed', 'zero', 'file']) {
            const choices = [{ sourceKey: key, action: 'create' }], p = await prepare(db, choices);
            assert.equal(p.blocked, 1);
            assert.equal((await apply(db, p, choices)).status, 409);
        }
        const p2 = await prepare(db);
        assert.equal((await apply(db, p2, selected, { backupConfirmed: false })).status, 400);
        assert.equal(await count(db, 'shapes'), 0);
    }
    finally {
        await runtime.dispose();
    }
});
test('duplicate names require explicit distinct reason; linking preserves existing quantities and source identity across reviews', async () => {
    const { runtime, db } = await environment();
    try {
        await db.prepare('INSERT INTO shapes(id,name) VALUES(?,?)').bind('existing-shape', manifest().items[0].name).run();
        await db.prepare("INSERT INTO physical_cutters(id,shape_id,quantity,origin) VALUES('existing-cutter','existing-shape',3,'purchased')").run();
        const p = await prepare(db, [selected[0]]);
        assert.equal(p.blocked, 1);
        assert.equal(p.rows[0].candidates[0].id, 'existing-cutter');
        const link = [{ sourceKey: 'physical', action: 'link', targetId: 'existing-cutter' }], linked = await prepare(db, link);
        assert.equal(linked.ready, 1);
        assert.equal((await apply(db, linked, link)).status, 201);
        assert.equal(await count(db, 'shapes'), 1);
        assert.equal((await db.prepare("SELECT quantity FROM physical_cutters WHERE id='existing-cutter'").first<any>())?.quantity, 3);
        const targetChange = [{ sourceKey: 'physical', action: 'link', targetId: 'different' }];
        assert.equal((await prepare(db, targetChange)).blocked, 1);
        const changed = manifest();
        changed.items[0].name = 'TEST updated source';
        const save = new Request(origin + '/api/import-reviews/' + id, { method: 'PUT', headers: { Origin: origin, 'content-type': 'application/json', 'X-Cookie-Catalog-Check': 'import-review', 'If-Match': '"review-1"' }, body: JSON.stringify({ title: 'TEST changed', manifest: changed }) });
        assert.equal((await handleApiRequest(save, owner, db)).status, 200);
        const stale = await apply(db, p, [selected[0]]);
        assert.equal(stale.status, 412);
        const current = await handleApiRequest(request('catalog-plan', { choices: [selected[0]], ownershipConfirmed: true }, '"review-2"'), owner, db);
        const currentPlan=await current.json() as any;
        assert.equal(currentPlan.blocked,0);assert.equal(currentPlan.alreadyLinked,1);
        assert.equal((await db.prepare("SELECT quantity FROM physical_cutters WHERE id='existing-cutter'").first<any>())?.quantity,3);
    }
    finally {
        await runtime.dispose();
    }
});
test('verified locations are reused; repeated source rows cannot duplicate inventory in concurrent apply requests', async () => {
    const m = manifest();
    m.items[0].reviews = { location: { state: 'complete', evidence: { method: 'visual_review', reference: 'TEST bin checked' } } };
    m.items[0].catalog = { ownership: 'owned', quantity: 2 };
    m.items[0].facts = { location: 'TEST Bin 1', widthMm: 50, heightMm: 75 };
    const { runtime, db } = await environment(true, m);
    try {
        const p = await prepare(db, [selected[0]]);
        const responses = await Promise.all([apply(db, p, [selected[0]]), apply(db, p, [selected[0]])]);
        assert(responses.some(r => r.status === 201));
        assert(responses.every(r => [200, 201, 409].includes(r.status)));
        assert.equal(await count(db, 'physical_cutters'), 1);
        assert.equal(await count(db, 'locations'), 1);
        assert.equal(await count(db, 'catalog_import_batches'), 1);
        assert.equal((await apply(db, p, [selected[0]])).status, 200);
    }
    finally {
        await runtime.dispose();
    }
});
test('inventory changes invalidate plans; an injected mid-transaction failure rolls back shapes, audit and cutters', async () => {
    const { runtime, db } = await environment();
    try {
        const p = await prepare(db);
        await db.prepare("INSERT INTO designs(id,name) VALUES('other','TEST other')").run();
        assert.equal((await apply(db, p)).status, 412);
        assert.equal(await count(db, 'shapes'), 0);
        const current = await prepare(db);
        await db.prepare("CREATE TRIGGER test_abort BEFORE INSERT ON physical_cutters BEGIN SELECT RAISE(ABORT,'TEST failure'); END").run();
        assert.equal((await apply(db, current)).status, 409);
        assert.equal(await count(db, 'shapes'), 0);
        assert.equal(await count(db, 'catalog_import_batches'), 0);
        assert.equal(await count(db, 'catalog_source_mappings'), 0);
    }
    finally {
        await runtime.dispose();
    }
});
test('a race between the final read and transaction is guarded inside the transaction', async () => {
    const { runtime, db } = await environment();
    try {
        const p = await prepare(db);
        const wrapped = { prepare: db.prepare.bind(db), batch: async (statements: D1PreparedStatement[]) => { if (statements.length === 6)
                await db.prepare("INSERT INTO designs(id,name) VALUES('racer','TEST concurrent')").run(); return db.batch(statements); } } as unknown as D1Database;
        assert.equal((await apply(wrapped, p)).status, 409);
        assert.equal(await count(db, 'shapes'), 0);
        assert.equal(await count(db, 'catalog_import_batches'), 0);
    }
    finally {
        await runtime.dispose();
    }
});
test('apply is owner-only and same-origin, selection is bounded, and missing migration is explicit', async () => {
    const { runtime, db } = await environment(false);
    try {
        const missing = await handleApiRequest(request('catalog-plan', { choices: selected, ownershipConfirmed: true }), owner, db);
        assert.equal(missing.status, 503);
        assert.match(await missing.text(), /not activated/);
        const editor: IdentityVerifier = { verify: async () => ({ subject: 'editor', email: 'editor@example.test', role: 'editor' }) };
        assert.equal((await handleApiRequest(request('apply'), editor, db)).status, 403);
        const viewer: IdentityVerifier = { verify: async () => ({ subject: 'viewer', email: 'viewer@example.test', role: 'viewer' }) };
        assert.equal((await handleApiRequest(request('catalog-plan'), viewer, db)).status, 403);
        assert.equal((await handleApiRequest(new Request(origin + '/api/import-reviews/' + id + '/apply', { method: 'POST', headers: { Origin: 'https://other.test', 'X-Cookie-Catalog-Check': 'import-review' } }), owner, db)).status, 403);
        assert.equal((await handleApiRequest(request('catalog-plan', { choices: Array.from({ length: 51 }, (_, i) => ({ sourceKey: String(i), action: 'create' })) }), owner, db)).status, 400);
    }
    finally {
        await runtime.dispose();
    }
});
test('22-table import audit and mappings survive TAR/helper validation and both Python recovery paths', async () => {
    const m=manifest();m.items[0].catalog={...m.items[0].catalog,sourceClassification:'both'};
    const { runtime, db, bucket } = await environment(true,m), dir = mkdtempSync(join(tmpdir(), 'cookie-import-recovery-'));
    try {
        const p = await prepare(db);
        assert.equal((await apply(db, p)).status, 201);
        const archive = join(dir, 'import.tar');
        writeFileSync(archive, Buffer.from(await new Response(await createArchiveBackup(db, bucket)).arrayBuffer()));
        const validated = JSON.parse(execFileSync(process.execPath, ['../tools/backup-helper.mjs', 'validate', archive], { encoding: 'utf8' }));
        assert.equal(validated.tables, 22);
        assert.equal(validated.counts.catalog_source_mappings, 2);
        execFileSync('python', ['../tools/restore_archive_backup.py', archive, join(dir, 'tar-restored')]);
        const backup = join(dir, 'import.json');
        writeFileSync(backup, await createDevelopmentBackup(db, bucket));
        execFileSync('python', ['../tools/restore_development_backup.py', backup, join(dir, 'json-restored')]);
        execFileSync('python', ['../tools/prepare_cloudflare_restore.py', 'prepare', archive, join(dir, 'd1-ready')]);
        const statements = JSON.parse(readFileSync(join(dir, 'd1-ready', 'statements.json'), 'utf8'));
        assert(statements.every((s: string) => Buffer.byteLength(s) <= 100000));
        const recovery = new Miniflare(convertV4MiniflareOptions({ modules: true, script: "export default {fetch(){return new Response('test')}}", d1Databases: { DB: 'recovered-import' } }));
        try {
            const restored = await recovery.getD1Database('DB') as unknown as D1Database;
            await restored.batch(statements.map((s: string) => restored.prepare(s)));
            assert.equal(await count(restored, 'catalog_source_mappings'), 2);
            const mapping=await restored.prepare("SELECT item_json FROM catalog_source_mappings WHERE source_key='physical'").first<any>();
            assert.equal(JSON.parse(mapping.item_json).catalog.sourceClassification,'both');
            const recoveredPlan = await prepare(restored);
            assert.equal(recoveredPlan.alreadyLinked, 2);
            assert.equal((await apply(restored, p)).status, 200);
        }
        finally {
            await recovery.dispose();
        }
    }
    finally {
        await runtime.dispose();
        rmSync(dir, { recursive: true, force: true });
    }
});
test('same shape in 3 inch and 3.25 inch sizes uses two cutter records of quantity one, not two identical cutters', async () => {
    const m = manifest();
    m.items = [{ ...m.items[0], facts: {}, catalog: { referenceSizeMm: 76.2 } }, { ...m.items[0], sourceKey: 'other-size', facts: {}, catalog: { referenceSizeMm: 82.55 } }];
    const { runtime, db } = await environment(true, m);
    try {
        const choices = [{ sourceKey: 'physical', action: 'create' }, { sourceKey: 'other-size', action: 'create' }];
        const p = await prepare(db, choices);
        assert.equal(p.ready, 2);
        assert.equal((await apply(db, p, choices)).status, 201);
        const rows = (await db.prepare('SELECT shape_id,reference_size_mm,quantity,width_mm,height_mm FROM physical_cutters ORDER BY reference_size_mm').all<any>()).results;
        assert.equal(rows.length, 2);
        assert.equal(rows[0].shape_id, rows[1].shape_id);
        assert.deepEqual(rows.map(r => r.reference_size_mm), [76.2, 82.55]);
        assert.deepEqual(rows.map(r => r.quantity), [1, 1]);
        assert.equal(await count(db, 'shapes'), 1);
        assert(rows.every(r => r.width_mm === null && r.height_mm === null));
        const source = m.items[0];
        const next = { ...m, items: [{ ...source, sourceKey: 'third-size', catalog: { referenceSizeMm: 88.9 } }] };
        const update = new Request(origin + '/api/import-reviews/' + id, { method: 'PUT', headers: { Origin: origin, 'content-type': 'application/json', 'X-Cookie-Catalog-Check': 'import-review', 'If-Match': '"review-1"' }, body: JSON.stringify({ title: 'TEST next size', manifest: next }) });
        assert.equal((await handleApiRequest(update, owner, db)).status, 200);
        const p2 = await (await handleApiRequest(request('catalog-plan', { choices: [{ sourceKey: 'third-size', action: 'create' }], ownershipConfirmed: true }, '"review-2"'), owner, db)).json() as any;
        assert.equal(p2.ready, 1);
        const response = await handleApiRequest(request('apply', { choices: [{ sourceKey: 'third-size', action: 'create' }], ownershipConfirmed: true, planSha256: p2.planSha256, backupReference: 'TEST backup', backupConfirmed: true }, '"review-2"'), owner, db);
        assert.equal(response.status, 201, await response.clone().text());
        assert.equal(await count(db, 'shapes'), 1);
        assert.equal(await count(db, 'physical_cutters'), 3);
    }
    finally {
        await runtime.dispose();
    }
});
test('in-app activation is atomic, owner-only, repeatable and uses the exact migration while preserving existing inventory', async () => {
    const { importSetupStatements } = await import('../src/server/catalog-import-setup');
    const migration = readFileSync('../database/migrations/0004_catalog_imports.sql', 'utf8').replace(/^--.*$/gm, '').split(';').map(s => s.trim()).filter(Boolean);
    assert.deepEqual([...importSetupStatements], migration);
    const { runtime, db } = await environment(false);
    try {
        await db.prepare("INSERT INTO shapes(id,name) VALUES('keep','TEST retained')").run();
        const url = origin + '/api/import-reviews/import-setup';
        const get = () => handleApiRequest(new Request(url), owner, db);
        assert.equal((await (await get()).json() as any).ready, false);
        const post = (data: unknown, verifier = owner) => handleApiRequest(new Request(url, { method: 'POST', headers: { Origin: origin, 'content-type': 'application/json', 'X-Cookie-Catalog-Check': 'import-review' }, body: JSON.stringify(data) }), verifier, db);
        assert.equal((await post({ backupReference: 'TEST backup', backupConfirmed: false })).status, 400);
        const editor: IdentityVerifier = { verify: async () => ({ subject: 'editor', email: 'editor@example.test', role: 'editor' }) };
        assert.equal((await post({ backupReference: 'TEST backup', backupConfirmed: true }, editor)).status, 403);
        const response = await post({ backupReference: 'TEST verified protected backup', backupConfirmed: true });
        assert.equal(response.status, 200, await response.clone().text());
        assert.equal((await response.json() as any).ready, true);
        assert.equal((await post({ backupReference: 'TEST backup', backupConfirmed: true })).status, 200);
        assert.equal((await (await get()).json() as any).tables, 22);
        assert.equal(await count(db, 'shapes'), 1);
        assert.equal(await count(db, 'd1_migrations'), 4);
        const cutoff = await db.prepare("SELECT * FROM shapes WHERE id='keep'").first<any>();
        assert.equal(cutoff.name, 'TEST retained');
        assert.deepEqual((await db.prepare('PRAGMA foreign_key_check').all()).results, []);
        const p = await prepare(db);
        assert.equal(p.ready, 2);
    }
    finally {
        await runtime.dispose();
    }
});
test('catalog editing retains separate reference size, axes and Slot with revision protection after activation', async () => {
    const { runtime, db } = await environment();
    try {
        const p = await prepare(db);
        assert.equal((await apply(db, p)).status, 201);
        const list = await (await handleApiRequest(new Request(origin + '/api/catalog/physical_cutters'), owner, db)).json() as any;
        assert(list.fields.includes('reference_size_mm'));
        const cutter = list.records[0];
        assert.equal(cutter.reference_size_mm, 101.6);
        assert.equal(cutter.slot, 'A');
        const endpoint = origin + '/api/catalog/physical_cutters/' + cutter.id;
        const opened = await (await handleApiRequest(new Request(endpoint), owner, db)).json() as any;
        const body = Object.fromEntries(list.fields.map((key: string) => [key, opened.record[key] ?? null]));
        body.reference_size_mm = 82.55;
        body.width_mm = 50;
        body.slot = 'B';
        const save = () => handleApiRequest(new Request(endpoint, { method: 'PUT', headers: { Origin: origin, 'content-type': 'application/json', 'X-Cookie-Catalog-Check': 'catalog', 'If-Match': opened.revision }, body: JSON.stringify(body) }), owner, db);
        assert.equal((await save()).status, 200);
        assert.equal((await save()).status, 412);
        const row = await db.prepare('SELECT * FROM physical_cutters WHERE id=?').bind(cutter.id).first<any>();
        assert.equal(row.reference_size_mm, 82.55);
        assert.equal(row.width_mm, 50);
        assert.equal(row.height_mm, null);
        assert.equal(row.slot, 'B');
        assert.equal(row.quantity, 1);
    }
    finally {
        await runtime.dispose();
    }
});

test('quick verification reuses source shape/photos, skips corrected imported reviews, and preserves revision and owner guards', async()=>{
 const m=manifest();m.items[0].catalog={ownership:'owned',sourceClassification:'both'};
 const {runtime,db}=await environment(true,m);
 try{
  const notes=JSON.stringify({format:'cookie-catalog-source-reference',sourceNamespace:m.sourceNamespace,sourceKey:'physical',reviewState:'print_review',reason:'Source mentions STL; ownership needs confirmation.'});
  await db.prepare("INSERT INTO shapes(id,name,notes) VALUES('source-shape',?,?)").bind(m.items[0].name,notes).run();
  await db.prepare("INSERT INTO attachments(id,storage_key,filename,media_type) VALUES('photo','private/photo','TEST photo.png','image/png')").run();
  await db.prepare("INSERT INTO shape_attachments VALUES('source-shape','photo','cutter_photo')").run();
  // Photo identity is checked without replacing any existing shape or attachment links.
  const before=await db.prepare("SELECT * FROM shapes WHERE id='source-shape'").first<any>();
  const get=(rev='"review-1"',verifier=owner)=>handleApiRequest(new Request(origin+'/api/import-reviews/'+id+'/quick-check',{headers:{'If-Match':rev}}),verifier,db);
  const context=await (await get()).json() as any;
  assert.equal(context.items[0].shapeId,'source-shape');assert.equal(context.items[0].imported,false);assert.equal(context.items[0].imageId,'photo');assert.match(context.items[0].evidence,/STL/);
  assert.equal((await get('"review-0"')).status,412);
  const viewer:IdentityVerifier={verify:async()=>({subject:'viewer',email:'viewer@example.test',role:'viewer'})};
  assert.equal((await get('"review-1"',viewer)).status,403);
  const choices=[{sourceKey:'physical',action:'create'}];
  const p=await prepare(db,choices);assert.equal(p.ready,1);assert.equal(p.rows[0].shapeId,'source-shape');
  assert.equal((await apply(db,p,choices)).status,201);
  assert.deepEqual(await db.prepare("SELECT * FROM shapes WHERE id='source-shape'").first(),before);
  assert.equal(await count(db,'shapes'),1);
  const physical=await db.prepare('SELECT * FROM physical_cutters').first<any>();assert.equal(physical.shape_id,'source-shape');assert.equal(physical.quantity,1);
  m.items[0].catalog={...m.items[0].catalog,originalSizeLabel:'corrected source label'};
  const saved=await handleApiRequest(new Request(origin+'/api/import-reviews/'+id,{method:'PUT',headers:{Origin:origin,'content-type':'application/json','X-Cookie-Catalog-Check':'import-review','If-Match':'"review-1"'},body:JSON.stringify({id,title:'TEST corrected review',manifest:m})}),owner,db);
  assert.equal(saved.status,200);
  const next=await (await handleApiRequest(request('catalog-plan',{choices,ownershipConfirmed:true},'"review-2"'),owner,db)).json() as any;
  assert.equal(next.alreadyLinked,1);assert.equal(next.blocked,0);assert.match(next.rows[0].reasons[0],/metadata changed/i);
  assert.deepEqual(await db.prepare('SELECT * FROM physical_cutters').first(),physical);
  const fresh=await (await get('"review-2"')).json() as any;assert.equal(fresh.items[0].imported,true);
  assert.equal(await count(db,'attachments'),1);assert.equal(await count(db,'shape_attachments'),1);
  const edited=await db.prepare("SELECT attachment_id FROM shape_attachments WHERE shape_id='source-shape'").first<any>();assert.equal(edited.attachment_id,'photo');
 }finally{await runtime.dispose();}
});

test('duplicate source-reference identities block promotion instead of creating another shape',async()=>{
 const {runtime,db}=await environment();
 try{
  const notes=JSON.stringify({format:'cookie-catalog-source-reference',sourceNamespace:'test-import',sourceKey:'physical'});
  await db.prepare("INSERT INTO shapes(id,name,notes) VALUES('ref1','TEST a',?),('ref2','TEST b',?)").bind(notes,notes).run();
  const p=await prepare(db,[{sourceKey:'physical',action:'create'}]);assert.equal(p.blocked,1);assert.match(p.rows[0].reasons.join(' '),/source-reference shapes/);
  assert.equal(await count(db,'physical_cutters'),0);
 }finally{await runtime.dispose();}
});

test('not-printed evidence in a source reference blocks physical import even if a client bypasses the checklist',async()=>{
 const m=manifest();m.items[0].catalog={ownership:'owned',sourceClassification:'both'};
 const {runtime,db}=await environment(true,m);
 try{
  const notes=JSON.stringify({format:'cookie-catalog-source-reference',sourceNamespace:m.sourceNamespace,sourceKey:'physical',reviewState:'not_printed',reason:'Printable STL, not printed'});
  await db.prepare("INSERT INTO shapes(id,name,notes) VALUES('reference','TEST reference',?)").bind(notes).run();
  const choices=[{sourceKey:'physical',action:'create'}];const p=await prepare(db,choices);assert.equal(p.blocked,1);assert.match(p.rows[0].reasons.join(' '),/Source evidence says not printed/);
  assert.equal((await apply(db,p,choices)).status,409);assert.equal(await count(db,'physical_cutters'),0);
  m.items[0].catalog={...m.items[0].catalog,printStatus:'printed'};
  const update=new Request(origin+'/api/import-reviews/'+id,{method:'PUT',headers:{Origin:origin,'content-type':'application/json','X-Cookie-Catalog-Check':'import-review','If-Match':'"review-1"'},body:JSON.stringify({id,title:'TEST corrected status',manifest:m})});
  assert.equal((await handleApiRequest(update,owner,db)).status,200);
  const fixed=await (await handleApiRequest(request('catalog-plan',{choices,ownershipConfirmed:true},'"review-2"'),owner,db)).json() as any;assert.equal(fixed.ready,1);
 }finally{await runtime.dispose();}
});
