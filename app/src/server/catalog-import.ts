import {assertFreshBackup,completeBackup} from './managed-backups';
import {recordedLocation} from '../source-location';
import { sourceReference, suggestion } from '../quick-classification';
import { openReview } from './import-reviews';
import { sha256 } from './development-backup';
import type { StagingItem } from '../staging.mjs';
const json = (value: unknown, status = 200) => Response.json(value, { status, headers: { 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
const digest = (value: unknown) => sha256(new TextEncoder().encode(JSON.stringify(value)));
export type ImportChoice = {
    sourceKey: string;
    action: 'create' | 'link';
    targetId?: string;
    shapeId?: string;
    distinctReason?: string;
};
type Row = Record<string, any>;
class InputError extends Error {
}
// Both planning and the transaction guard use exactly these ordered database snapshots.
const selections = {
    shapes: 'SELECT id,name,maker,source_url,notes,created_at FROM shapes ORDER BY id LIMIT 5001',
    physical_cutters: 'SELECT id,shape_id,location_id,width_mm,height_mm,quantity,origin,notes,reference_size_mm,slot FROM physical_cutters ORDER BY id LIMIT 5001',
    designs: 'SELECT id,name,source_url,notes,created_at FROM designs ORDER BY id LIMIT 5001',
    locations: 'SELECT id,label,parent_id,notes FROM locations ORDER BY id LIMIT 5001'
};
const columns = { shapes: ['id', 'name', 'maker', 'source_url', 'notes', 'created_at'], physical_cutters: ['id', 'shape_id', 'location_id', 'width_mm', 'height_mm', 'quantity', 'origin', 'notes', 'reference_size_mm', 'slot'], designs: ['id', 'name', 'source_url', 'notes', 'created_at'], locations: ['id', 'label', 'parent_id', 'notes'] };
function snapshotSql(table: keyof typeof selections) { return `SELECT json_group_array(json_object(${columns[table].map(c => `'${c}',${c}`).join(',')})) AS snapshot FROM (${selections[table]})`; }
export async function readImportInput(request: Request) {
    if (!request.headers.get('content-type')?.startsWith('application/json'))
        throw new InputError('JSON request required.');
    const reader = request.body?.getReader();
    if (!reader)
        throw new InputError('Choose entries before planning an import.');
    let text = '', bytes = 0;
    const decoder = new TextDecoder('utf-8', { fatal: true });
    try {
        for (;;) {
            const part = await reader.read();
            if (part.done)
                break;
            bytes += part.value.length;
            if (bytes > 128 * 1024) {
                await reader.cancel();
                throw new InputError('Import selection exceeds 128 KiB.');
            }
            text += decoder.decode(part.value, { stream: true });
        }
        text += decoder.decode();
        return JSON.parse(text);
    }
    catch (e) {
        if (e instanceof InputError)
            throw e;
        throw new InputError('Invalid import selection.');
    }
    finally {
        reader.releaseLock();
    }
}
function choices(value: unknown): ImportChoice[] {
    if (!Array.isArray(value) || value.length > 50)
        throw new InputError('Select at most 50 entries per import.');
    const seen = new Set();
    return value.map(c => {
        if (!c || typeof c !== 'object' || Array.isArray(c) || Object.keys(c).some(k => !['sourceKey', 'action', 'targetId', 'shapeId', 'distinctReason'].includes(k)) || typeof c.sourceKey !== 'string' || seen.has(c.sourceKey) || !['create', 'link'].includes(c.action) || c.action === 'link' && (typeof c.targetId !== 'string' || !/^[-a-zA-Z0-9_]{1,128}$/.test(c.targetId)) || c.shapeId !== undefined && (c.action !== 'create' || typeof c.shapeId !== 'string' || !/^[-a-zA-Z0-9_]{1,128}$/.test(c.shapeId)) || c.action === 'create' && c.targetId !== undefined || c.distinctReason !== undefined && (typeof c.distinctReason !== 'string' || c.distinctReason.length > 500 || /[\x00-\x1f]/.test(c.distinctReason)))
            throw new InputError('Choose create or link with a valid target for each selected entry.');
        seen.add(c.sourceKey);
        return { sourceKey: c.sourceKey, action: c.action, ...(c.action === 'link' ? { targetId: c.targetId } : {}), ...(c.shapeId ? { shapeId: c.shapeId } : {}), ...(c.distinctReason?.trim() ? { distinctReason: c.distinctReason.trim() } : {}) };
    }).sort((a, b) => a.sourceKey.localeCompare(b.sourceKey));
}
const fold = (s: string) => s.trim().replace(/[A-Z]/g, c => c.toLowerCase());
function notes(item: StagingItem) { return [`Imported source: ${item.source.pageTitle || item.source.pageId}`, item.catalog?.referenceSizeMm ? `Reference size (longest edge): ${item.catalog.referenceSizeMm} mm` : null, item.catalog?.originalSizeLabel ? `Original size label: ${item.catalog.originalSizeLabel}` : null, item.catalog?.slot ? `Slot: ${item.catalog.slot}` : null, 'Source values remain subject to the catalog review queue.'].filter(Boolean).join('\n').slice(0, 4000); }
async function plan(db: D1Database, id: string, selected: ImportChoice[], ownershipConfirmed = false) {
    const saved = await openReview(db, id, null);
    if (!saved)
        return null;
    if (selected.some(c => !saved.manifest.items.some(i => i.sourceKey === c.sourceKey)))
        throw new InputError("A selected source entry is absent from this saved version.");
    const results = await db.batch(Object.keys(selections).map(t => db.prepare(snapshotSql(t as keyof typeof selections))));
    const snapshots = results.map(r => String((r.results[0] as Row).snapshot));
    const [shapes, physical, designs, locations] = snapshots.map(s => JSON.parse(s) as Row[]);
    if ([shapes, physical, designs, locations].some(rows => rows.length > 5000))
        throw new InputError('Import planning supports up to 5000 records per inventory type. Use smaller inventory partitions before continuing.');
    const mappingSql = 'SELECT source_namespace,source_key,kind,item_sha256,shape_id,physical_id,design_id FROM catalog_source_mappings WHERE source_namespace=? ORDER BY source_key LIMIT 10001';
    const mappings = (await db.prepare(mappingSql).bind(saved.manifest.sourceNamespace).all<Row>()).results;
    if (mappings.length > 10000)
        throw new InputError('This source namespace exceeds the import mapping limit.');
    const rows = [];
    for (const choice of selected) {
        const item = saved.manifest.items.find(i => i.sourceKey === choice.sourceKey);
        if (!item)
            throw new InputError('A selected source entry is absent from this saved version.');
        const itemHash = await digest(item), prior = mappings.find(m => m.source_key === item.sourceKey);
        const sourceShapes = shapes.filter(s => { const ref = sourceReference(s.notes); return ref?.sourceNamespace === saved.manifest.sourceNamespace && ref.sourceKey === item.sourceKey; });
        const sourceShape = sourceShapes.length === 1 ? sourceShapes[0] : null;
        const sameName = shapes.filter(s => fold(s.name) === fold(item.name) || item.source.url && s.source_url === item.source.url);
        const candidates: Row[] = item.kind === 'design' ? designs.filter(d => fold(d.name) === fold(item.name) || item.source.url && d.source_url === item.source.url) : physical.filter(c => choice.shapeId ? c.shape_id === choice.shapeId : c.shape_id === sourceShape?.id || sameName.some(s => s.id === c.shape_id)).map(c => ({ ...c, name: shapes.find(s => s.id === c.shape_id)?.name }));
        const reasons: string[] = [];
        if (prior) {
            const exists = prior.kind === 'design' ? designs.some(d => d.id === prior.design_id) : physical.some(p => p.id === prior.physical_id && p.shape_id === prior.shape_id);
            const target = prior.design_id ?? prior.physical_id;
            const mismatched = choice.action === 'link' && choice.targetId !== target;
            rows.push({ sourceKey: item.sourceKey, name: item.name, kind: item.kind, status: exists && !mismatched ? 'already_linked' : 'blocked', reasons: !exists ? ['The mapped inventory record changed or is missing; reconcile it manually.'] : mismatched ? ['This source entry is already mapped to a different record.'] : prior.item_sha256 !== itemHash ? ['Review metadata changed after import. Existing inventory is retained; this entry is skipped. Reconcile any inventory edits separately.'] : [], targetId: target, candidates });
            continue;
        }
        if (sourceShapes.length > 1) reasons.push('Several source-reference shapes share this identity. Reconcile them before importing.');
        if (sourceShape && choice.shapeId && choice.shapeId !== sourceShape.id) reasons.push('Use the existing source-reference shape to preserve its photos and identity.');
        if (!['physical_cutter', 'design'].includes(item.kind))
            reasons.push(item.kind === 'printable_asset' ? 'Printable files require a separate verified-original upload and attachment mapping. Keep this entry for that workflow.' : 'Classify and split this entry before importing it.');
        if (item.kind === 'physical_cutter') {
            if(sourceShape){
                const ref=sourceReference(sourceShape.notes)!;
                const check=suggestion(item,{sourceKey:item.sourceKey,shapeId:sourceShape.id,imageId:null,reviewState:ref.reviewState??'',evidence:sourceShape.notes??'',imported:false,ambiguous:false});
                if(check.physicalBlocked)reasons.push('Source evidence says not printed or not purchased. Correct ownership and print status in the detailed review before importing physical stock.');
                if(item.catalog?.sourceClassification&&check.ambiguous)reasons.push('This source set, size variant or duplicate needs individual review before quick import.');
            }
            if (item.catalog?.ownership === 'not_owned')
                reasons.push('This cutter is marked not owned.');
            if (item.catalog?.printStatus === 'not_printed')
                reasons.push('This cutter is marked not printed.');
            if (choice.action === 'create' && item.catalog?.ownership !== 'owned' && !ownershipConfirmed)
                reasons.push('Confirm ownership before creating a physical cutter.');
            if (choice.action === 'create' && item.catalog?.quantity !== undefined && (!Number.isSafeInteger(item.catalog.quantity) || item.catalog.quantity < 1 || item.catalog.quantity > 10000))
                reasons.push('Use a quantity from 1 to 10000. An omitted quantity defaults to one individual cutter.');
        }
        const table = item.kind === 'design' ? designs : physical, target = choice.action === 'link' ? table.find(r => r.id === choice.targetId) : null;
        if (choice.action === 'link' && !target)
            reasons.push('The chosen existing record does not exist for this item type.');
        const reference = item.catalog?.referenceSizeMm;
        const differentKnownSizes = item.kind === 'physical_cutter' && !!reference && candidates.length > 0 && sameName.every(s => !s.source_url || !item.source.url || s.source_url === item.source.url) && candidates.every(c => c.reference_size_mm !== null && Math.abs(c.reference_size_mm - reference) > 0.000001);
        if (choice.action === 'create' && !differentKnownSizes && (candidates.length || item.kind !== 'design' && sameName.some(s => s.id !== sourceShape?.id) && !choice.shapeId) && !choice.distinctReason)
            reasons.push('A matching name or source link already exists. Link it, or explain why this is a separate item.');
        const duplicates = selected.filter(c => c.action === 'create' && c.sourceKey !== choice.sourceKey).map(c => saved.manifest.items.find(i => i.sourceKey === c.sourceKey)!).filter(i => i.kind === item.kind && (fold(i.name) === fold(item.name) || item.source.url && i.source.url === item.source.url) && !(i.kind === 'physical_cutter' && i.catalog?.referenceSizeMm && reference && Math.abs(i.catalog.referenceSizeMm - reference) > 0.000001));
        if (choice.action === 'create' && duplicates.length && !choice.distinctReason)
            reasons.push('Another selected entry has the same name or source link. Split/reconcile it or explain why these are separate items.');
        if (choice.shapeId && (item.kind !== 'physical_cutter' || !shapes.some(s => s.id === choice.shapeId)))
            reasons.push('Choose an existing shape for this physical cutter.');
        if (differentKnownSizes && sameName.length > 1 && !choice.shapeId)
            reasons.push('Several shapes match this name. Choose which shape this size belongs to.');
        const otherSizes = selected.filter(c => c.action === 'create' && c.sourceKey !== choice.sourceKey && !c.distinctReason && !c.shapeId).map(c => saved.manifest.items.find(i => i.sourceKey === c.sourceKey)!).filter(i => i.kind === 'physical_cutter' && fold(i.name) === fold(item.name) && (!i.source.url || !item.source.url || i.source.url === item.source.url) && reference && i.catalog?.referenceSizeMm && Math.abs(i.catalog.referenceSizeMm - reference) > 0.000001);
        const groupedShapeId = otherSizes.length && !choice.distinctReason ? 'shape_import_' + await digest([saved.manifest.sourceNamespace, 'shape-name', fold(item.name)]) : null;
        const key = await digest([saved.manifest.sourceNamespace, item.sourceKey]);
        const shapeId = item.kind === 'physical_cutter' ? (target?.shape_id ?? sourceShape?.id ?? choice.shapeId ?? (differentKnownSizes && sameName.length === 1 ? sameName[0].id : groupedShapeId ?? 'shape_import_' + key)) : null;
        const targetId = target?.id ?? (item.kind === 'design' ? 'design_import_' : 'cutter_import_') + key;
        const locationLabel = recordedLocation(item);
        if (locationLabel && locationLabel.length > 200)
            reasons.push('The recorded location label exceeds 200 characters.');
        const locationId = locationLabel ? (locations.find(l => l.label === locationLabel)?.id ?? 'location_import_' + await digest(locationLabel)) : null;
        rows.push({ sourceKey: item.sourceKey, name: item.name, kind: item.kind, status: reasons.length ? 'blocked' : 'ready', reasons, targetId, candidates,
            choice, itemHash, item, shapeId, locationLabel, locationId });
    }
    const fingerprint = await digest({ workspace: id, revision: saved.head.current_revision, manifest: saved.head.manifest_sha256, selected, ownershipConfirmed, snapshots, mappings });
    return { saved, rows, snapshots, mappings, fingerprint };
}
export async function handleCatalogImport(request: Request, db: D1Database, subject: string, id: string, apply: boolean, files?:R2Bucket): Promise<Response> {
    try {
        const data = await readImportInput(request);
        if (!data || typeof data !== 'object' || Array.isArray(data) || Object.keys(data).some(k => !['choices', 'planSha256', 'backupReference', 'backupConfirmed', 'ownershipConfirmed'].includes(k)))
            throw new InputError('Unsupported import request.');
        const selected = choices(data.choices);
        if (data.ownershipConfirmed !== undefined && typeof data.ownershipConfirmed !== 'boolean')
            throw new InputError('Confirm ownership using the selection checkbox.');
        const planSha256 = data.planSha256, backupReference = data.backupReference;
        if (apply && (data.backupConfirmed !== true || !/^[a-f0-9]{64}$/.test(planSha256 ?? '') || typeof backupReference !== 'string' || !backupReference.trim() || backupReference.length > 500 || /[\x00-\x1f]/.test(backupReference)))
            throw new InputError('Prepare a fresh plan and supply your verified protected pre-change backup reference.');
        const requestHash = await digest({ id, selected, backupReference: backupReference ?? null, ownershipConfirmed: data.ownershipConfirmed === true });
        const batchId = 'import_' + (apply ? await digest([id, planSha256]) : '');
        if (apply) {
            const prior = await db.prepare('SELECT request_sha256,result_json FROM catalog_import_batches WHERE id=?').bind(batchId).first<Row>();
            if (prior)
                return prior.request_sha256 === requestHash ? json({ ...JSON.parse(prior.result_json), replayed: true }) : json({ error: 'This import plan was already used with different selections or backup evidence.' }, 409);
        }
        const planned = await plan(db, id, selected, data.ownershipConfirmed === true);
        if (!planned)
            return json({ error: 'Saved review not found.' }, 404);
        if (request.headers.get('If-Match') !== `"review-${planned.saved.head.current_revision}"`)
            return json({ error: 'The saved review changed. Reopen it and prepare another plan.' }, 412);
        const publicRows = planned.rows.map(({ sourceKey, name, kind, status, reasons, targetId, shapeId, item, candidates }) => ({ sourceKey, name, kind, status, reasons, targetId, shapeId, referenceSizeMm: item?.catalog?.referenceSizeMm ?? null, candidates: candidates.map(c => ({ id: c.id, name: c.name })) }));
        if (!apply)
            return json({ planSha256: planned.fingerprint, rows: publicRows, selected: selected.length, ready: publicRows.filter(r => r.status === 'ready').length, blocked: publicRows.filter(r => r.status === 'blocked').length, alreadyLinked: publicRows.filter(r => r.status === 'already_linked').length, liveWrites: false });
        if (planned.fingerprint !== planSha256)
            return json({ error: 'The review or inventory changed since planning. Prepare another plan before importing.' }, 412);
        if (!selected.length || planned.rows.some(r => r.status === 'blocked'))
            return json({ error: 'Resolve blocked selections or leave them for later. Nothing was imported.' }, 409);
        const ready = planned.rows.filter(r => r.status === 'ready');
        if (!ready.length)
            return json({ imported: 0, alreadyLinked: planned.rows.length, replayed: true });
        if(/^backup_[a-f0-9]{32}$/.test(backupReference)){
            if(!files)throw new InputError('Managed backup storage unavailable.');
            const savedBackup=await completeBackup(files,backupReference);
            if(savedBackup.job.kind!=='pre-change'||savedBackup.job.protectionReleasedAt)throw new InputError('Use a protected pre-change snapshot whose protection has not been released.');
            const covered=await db.prepare('SELECT count(*) AS n FROM catalog_import_batches WHERE workspace_id=? AND revision=? AND backup_reference=? AND created_by=?').bind(id,planned.saved.head.current_revision,backupReference,subject).first<{n:number}>();
            if(!covered?.n)await assertFreshBackup(db,files,backupReference);
        }
        const now = new Date().toISOString(), result = { batchId, imported: ready.length, created: ready.filter(r => r.choice!.action === 'create').length, linked: ready.filter(r => r.choice!.action === 'link').length, alreadyLinked: planned.rows.length - ready.length };
        const payload = JSON.stringify(ready.map(r => ({ sourceKey: r.sourceKey, kind: r.kind, action: r.choice!.action, itemHash: r.itemHash, itemJson: JSON.stringify(r.item), decisionJson: JSON.stringify({ ...r.choice, ownershipConfirmed: data.ownershipConfirmed === true, quantityDefaulted: r.kind === 'physical_cutter' && r.choice!.action === 'create' && r.item!.catalog?.quantity === undefined }), shapeId: r.shapeId, targetId: r.targetId, name: r.item!.name.trim(), url: /^https?:/.test(r.item!.source.url ?? '') ? r.item!.source.url : null, notes: notes(r.item!) + (r.kind === 'physical_cutter' && r.choice!.action === 'create' && r.item!.catalog?.quantity === undefined ? '\nQuantity defaulted to one individual cutter at import.' : ''), locationId: r.locationId, locationLabel: r.locationLabel ?? null, referenceSize: r.item!.catalog?.referenceSizeMm ?? null, slot: r.item!.catalog?.slot ?? null, width: r.item!.facts?.widthMm ?? null, height: r.item!.facts?.heightMm ?? null, quantity: r.item!.catalog?.quantity ?? 1, origin: r.item!.catalog?.printStatus === 'printed' ? 'printed' : 'unknown' })));
        if (new TextEncoder().encode(payload).length > 1024 * 1024)
            throw new InputError('Selected source evidence exceeds 1 MiB. Import fewer entries in this batch.');
        // A CHECK fails if any relevant inventory snapshot changed between planning and this transaction.
        const guard = Object.keys(selections).map(t => `(${snapshotSql(t as keyof typeof selections)})=?`).join(' AND ');
        const mappingGuard = `(SELECT json_group_array(json_object('source_namespace',source_namespace,'source_key',source_key,'kind',kind,'item_sha256',item_sha256,'shape_id',shape_id,'physical_id',physical_id,'design_id',design_id)) FROM (SELECT source_namespace,source_key,kind,item_sha256,shape_id,physical_id,design_id FROM catalog_source_mappings WHERE source_namespace=? ORDER BY source_key LIMIT 10001))=?`;
        const headGuard = 'EXISTS(SELECT 1 FROM import_review_workspaces w JOIN import_review_versions v ON v.workspace_id=w.id AND v.revision=w.current_revision WHERE w.id=? AND w.current_revision=? AND v.manifest_sha256=?)';
        const namespace = planned.saved.manifest.sourceNamespace, revision = planned.saved.head.current_revision;
        const select = (table: string, fields: string, values: string, where: string) => db.prepare(`INSERT INTO ${table}(${fields}) SELECT ${values} FROM json_each(?) j WHERE ${where}`).bind(payload);
        await db.batch([
            db.prepare(`INSERT INTO catalog_import_batches(id,workspace_id,revision,request_sha256,plan_sha256,backup_reference,created_by,created_at,safety_check,result_json) VALUES (?,?,?,?,?,?,?,?,CASE WHEN ${headGuard} AND ${guard} AND ${mappingGuard} THEN 1 ELSE 0 END,?)`).bind(batchId, id, revision, requestHash, planSha256, backupReference.trim(), subject, now, id, revision, planned.saved.head.manifest_sha256, ...planned.snapshots, namespace, JSON.stringify(planned.mappings), JSON.stringify(result)),
            select('locations', 'id,label', "DISTINCT json_extract(j.value,'$.locationId'),json_extract(j.value,'$.locationLabel')", "json_extract(j.value,'$.action')='create' AND json_extract(j.value,'$.kind')='physical_cutter' AND json_extract(j.value,'$.locationId') IS NOT NULL AND NOT EXISTS(SELECT 1 FROM locations WHERE id=json_extract(j.value,'$.locationId'))"),
            select('shapes', 'id,name,source_url,notes', "json_extract(j.value,'$.shapeId'),MIN(json_extract(j.value,'$.name')),MIN(json_extract(j.value,'$.url')),'Imported shape; source evidence is retained on its physical cutters and import mappings.'", "json_extract(j.value,'$.action')='create' AND json_extract(j.value,'$.kind')='physical_cutter' AND NOT EXISTS(SELECT 1 FROM shapes WHERE id=json_extract(j.value,'$.shapeId')) GROUP BY json_extract(j.value,'$.shapeId')"),
            select('physical_cutters', 'id,shape_id,location_id,width_mm,height_mm,quantity,origin,notes,reference_size_mm,slot', "json_extract(j.value,'$.targetId'),json_extract(j.value,'$.shapeId'),json_extract(j.value,'$.locationId'),json_extract(j.value,'$.width'),json_extract(j.value,'$.height'),json_extract(j.value,'$.quantity'),json_extract(j.value,'$.origin'),json_extract(j.value,'$.notes'),json_extract(j.value,'$.referenceSize'),json_extract(j.value,'$.slot')", "json_extract(j.value,'$.action')='create' AND json_extract(j.value,'$.kind')='physical_cutter'"),
            select('designs', 'id,name,source_url,notes', "json_extract(j.value,'$.targetId'),json_extract(j.value,'$.name'),json_extract(j.value,'$.url'),json_extract(j.value,'$.notes')", "json_extract(j.value,'$.action')='create' AND json_extract(j.value,'$.kind')='design'"),
            db.prepare(`INSERT INTO catalog_source_mappings(source_namespace,source_key,kind,workspace_id,revision,item_sha256,item_json,decision_json,batch_id,shape_id,physical_id,design_id) SELECT ?,json_extract(value,'$.sourceKey'),json_extract(value,'$.kind'),?,?,json_extract(value,'$.itemHash'),json_extract(value,'$.itemJson'),json_extract(value,'$.decisionJson'),?,json_extract(value,'$.shapeId'),CASE WHEN json_extract(value,'$.kind')='physical_cutter' THEN json_extract(value,'$.targetId') END,CASE WHEN json_extract(value,'$.kind')='design' THEN json_extract(value,'$.targetId') END FROM json_each(?)`).bind(namespace, id, revision, batchId, payload)
        ]);
        return json(result, 201);
    }
    catch (error) {
        if (error instanceof InputError)
            return json({ error: error.message }, 400);
        if (/no such (table|column)/i.test(String(error)))
            return json({ error: 'Catalog importing is not activated. Apply the import-storage migration before planning an import.' }, 503);
        // Concurrent identical requests can commit before this request's atomic insert.
        return json({ error: 'Import could not complete. No partial transaction was kept. Reopen the review and prepare another plan; a retry of a completed plan will not duplicate entries.' }, 409);
    }
}
