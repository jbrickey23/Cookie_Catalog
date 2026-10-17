import { BackupError, createDevelopmentBackup, sha256 } from "./development-backup";

/** Creates only unique invented records/files, exports them, then verifies their removal. */
export async function createDevelopmentRecoveryCheck(database: D1Database, bucket: R2Bucket): Promise<string> {
  const suffix = crypto.randomUUID();
  const shape = `recovery_shape_${suffix}`, design = `recovery_design_${suffix}`;
  const location = `recovery_location_${suffix}`, cutter = `recovery_cutter_${suffix}`;
  const link = `recovery_link_${suffix}`, asset = `recovery_asset_${suffix}`;
  const files = [
    { id: `recovery_photo_${suffix}`, name: "DEMO-recovery-photo.png", media: "image/png",
      bytes: Uint8Array.from(atob("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a8S8AAAAASUVORK5CYII="), c => c.charCodeAt(0)) },
    { id: `recovery_model_${suffix}`, name: "DEMO-recovery-model.stl", media: "model/stl",
      bytes: new TextEncoder().encode("solid demo\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 0 1 0\nendloop\nendfacet\nendsolid demo\n") }
  ];
  const keys = files.map(file => `attachments/${file.id}/original`);
  let document: string | undefined;
  try {
    const attachments = [];
    for (const [index, file] of files.entries()) {
      const object = await bucket.put(keys[index], file.bytes, { httpMetadata: { contentType: file.media },
        customMetadata: { purpose: "cookie-catalog-disposable-recovery-check" }, storageClass: "Standard" });
      if (!object) throw new BackupError("Recovery test file creation failed.");
      attachments.push(database.prepare("INSERT INTO attachments (id,storage_key,filename,media_type,byte_size,sha256) VALUES (?,?,?,?,?,?)")
        .bind(file.id, keys[index], file.name, file.media, file.bytes.length, await sha256(file.bytes)));
    }
    const inserted = await database.batch([
      database.prepare("INSERT INTO shapes (id,name,notes) VALUES (?,?,?)").bind(shape, "DEMO recovery tree", "Disposable synthetic recovery test"),
      database.prepare("INSERT INTO designs (id,name,notes) VALUES (?,?,?)").bind(design, "DEMO recovery design", "Disposable synthetic recovery test"),
      database.prepare("INSERT INTO locations (id,label) VALUES (?,?)").bind(location, `DEMO recovery bin ${suffix}`),
      database.prepare("INSERT INTO physical_cutters (id,shape_id,location_id,width_mm,height_mm,origin) VALUES (?,?,?,90,100,'unknown')").bind(cutter, shape, location),
      database.prepare("INSERT INTO design_shape_links (id,design_id,shape_id,status) VALUES (?,?,?,'tested')").bind(link, design, shape),
      ...attachments,
      ...files.map(file => database.prepare("INSERT INTO shape_attachments (shape_id,attachment_id,purpose) VALUES (?,?,'original')").bind(shape, file.id)),
      database.prepare("INSERT INTO design_attachments (design_id,attachment_id,purpose) VALUES (?,?,'preview')").bind(design, files[0].id),
      database.prepare("INSERT INTO printable_assets (id,shape_id,attachment_id,format) VALUES (?,?,?,'stl')").bind(asset, shape, files[1].id)
    ]);
    if (inserted.some(result => !result.success)) throw new BackupError("Recovery test records could not be created.");
    document = await createDevelopmentBackup(database, bucket);
  } finally {
    let databaseClean = false, filesClean = false;
    try {
      const deleted = await database.batch([
        database.prepare("DELETE FROM printable_assets WHERE id = ?").bind(asset),
        database.prepare("DELETE FROM shape_attachments WHERE shape_id = ? AND attachment_id IN (?,?)").bind(shape, ...files.map(file => file.id)),
        database.prepare("DELETE FROM design_attachments WHERE design_id = ? AND attachment_id = ?").bind(design, files[0].id),
        database.prepare("DELETE FROM design_shape_links WHERE id = ?").bind(link),
        database.prepare("DELETE FROM physical_cutters WHERE id = ?").bind(cutter),
        database.prepare("DELETE FROM designs WHERE id = ?").bind(design),
        database.prepare("DELETE FROM shapes WHERE id = ?").bind(shape),
        database.prepare("DELETE FROM locations WHERE id = ?").bind(location),
        database.prepare("DELETE FROM attachments WHERE id IN (?,?)").bind(...files.map(file => file.id))
      ]);
      const remaining = await database.prepare(`SELECT
        (SELECT COUNT(*) FROM shapes WHERE id = ?) + (SELECT COUNT(*) FROM designs WHERE id = ?) +
        (SELECT COUNT(*) FROM locations WHERE id = ?) + (SELECT COUNT(*) FROM physical_cutters WHERE id = ?) +
        (SELECT COUNT(*) FROM design_shape_links WHERE id = ?) + (SELECT COUNT(*) FROM printable_assets WHERE id = ?) +
        (SELECT COUNT(*) FROM attachments WHERE id IN (?,?)) + (SELECT COUNT(*) FROM shape_attachments WHERE shape_id = ?) +
        (SELECT COUNT(*) FROM design_attachments WHERE design_id = ?) AS remaining`)
        .bind(shape, design, location, cutter, link, asset, ...files.map(file => file.id), shape, design).first<{ remaining: number }>();
      databaseClean = deleted.every(result => result.success) && remaining?.remaining === 0;
    } catch { /* Continue object cleanup even if database cleanup fails. */ }
    try {
      await bucket.delete(keys);
      filesClean = (await Promise.all(keys.map(key => bucket.head(key)))).every(object => object === null);
    } catch { /* Both independent cleanup results are checked below. */ }
    if (!databaseClean || !filesClean) throw new BackupError("Recovery test cleanup could not be verified. Stop testing and request cleanup review.");
  }
  if (!document) throw new BackupError("Recovery package was not created.");
  const envelope = JSON.parse(document);
  envelope.developmentCheck = { type: "disposable-file-recovery", fixtureShapeId: shape, fixtureDesignId: design,
    fixtureLocationId: location, filesVerified: 2, cleanupVerified: true };
  return JSON.stringify(envelope);
}
