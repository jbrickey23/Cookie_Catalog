import { ARCHIVE_FILE_LIMIT } from "./archive-backup";
const MAX_FILE = ARCHIVE_FILE_LIMIT;
const MAX_REQUEST = MAX_FILE + 16384;
const ID = /^[a-zA-Z0-9_-]{1,128}$/;
interface Attachment { id: string; storage_key: string; filename: string; media_type: string; byte_size: number; sha256: string }
function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json", "cache-control": "no-store", "x-content-type-options": "nosniff" } });
}
function imageWindow(row:Attachment){
 if(!["image/png","image/jpeg","image/webp"].includes(row.media_type))return json({error:"Only supported images can be viewed."},415);
 const escaped=row.filename.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
 const url="/api/attachments/"+encodeURIComponent(row.id);
 return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escaped} — image viewer</title><style>html,body{margin:0;width:100%;height:100%;background:#f4f4ee}img{display:block;width:100vw;height:100vh;object-fit:contain}a{position:fixed;right:12px;bottom:12px;padding:9px 12px;background:#fff;color:#253b34;border:1px solid #9cac9e;border-radius:7px;font:14px system-ui}</style></head><body><img src="${url}?view=image" alt="${escaped}"><a href="${url}">Download original</a></body></html>`,{headers:{"content-type":"text/html; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff","referrer-policy":"no-referrer","content-security-policy":"default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"}});
}
function target(kind: string | null) {
  return kind === "shape" ? { table: "shapes", links: "shape_attachments", column: "shape_id" }
    : kind === "design" ? { table: "designs", links: "design_attachments", column: "design_id" } : null;
}
async function boundedBody(request: Request): Promise<Uint8Array> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Empty upload");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      size += part.value.length;
      if (size > MAX_REQUEST) { await reader.cancel(); throw new Error("Upload too large"); }
      chunks.push(part.value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return bytes;
}
function media(filename: string, bytes: Uint8Array): string | null {
  const extension = filename.split(".").pop()?.toLowerCase();
  if (extension === "png" && [137,80,78,71,13,10,26,10].every((n,i) => bytes[i] === n)) return "image/png";
  if (["jpg","jpeg"].includes(extension ?? "") && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "image/jpeg";
  if (extension === "webp" && new TextDecoder().decode(bytes.slice(0,4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8,12)) === "WEBP") return "image/webp";
  if (extension === "stl") {
    const ascii = new TextDecoder().decode(bytes);
    const binary = bytes.length >= 84 && 84 + 50 * new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(80, true) === bytes.length;
    if (binary || (/^\s*solid\b/.test(ascii) && /endsolid\b/.test(ascii))) return "model/stl";
  }
  // 3MF is a ZIP container; full model validation is the slicer's responsibility.
  if (extension === "3mf" && bytes[0] === 80 && bytes[1] === 75 && bytes[2] === 3 && bytes[3] === 4) return "model/3mf";
  return null;
}
async function remove(database: D1Database, bucket: R2Bucket, row: Attachment) {
  // Keep metadata if object deletion fails; the owner can retry the same operation.
  await bucket.delete(row.storage_key);
  if (await bucket.head(row.storage_key)) throw new Error("Object deletion not confirmed");
  await database.batch([
    database.prepare("DELETE FROM shape_attachments WHERE attachment_id = ?").bind(row.id),
    database.prepare("DELETE FROM design_attachments WHERE attachment_id = ?").bind(row.id),
    database.prepare("DELETE FROM printable_size_recipes WHERE printable_asset_id IN (SELECT id FROM printable_assets WHERE attachment_id=?)").bind(row.id),
    // Derived assets referencing an original must be handled explicitly first.
    database.prepare("DELETE FROM printable_assets WHERE attachment_id = ?").bind(row.id),
    database.prepare("DELETE FROM attachments WHERE id = ?").bind(row.id)
  ]);
}
export async function handleAttachments(request: Request, database: D1Database, bucket: R2Bucket): Promise<Response> {
  const url = new URL(request.url);
  try {
    if (url.pathname === "/api/attachment-orphans") {
      if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
      const listing = await bucket.list({ prefix: "attachments/file_", limit: 100, cursor: url.searchParams.get("cursor") ?? undefined });
      const orphans = [];
      for (const object of listing.objects) {
        const match = /^attachments\/(file_[a-f0-9]{32})\/original$/.exec(object.key);
        if (match && !await database.prepare("SELECT id FROM attachments WHERE storage_key=?").bind(object.key).first())
          orphans.push({ id: match[1], byteSize: object.size, uploadedAt: object.uploaded.toISOString(), removable: Date.now() - object.uploaded.getTime() > 86400000 });
      }
      return json({ orphans, cursor: listing.truncated ? listing.cursor : null });
    }
    const orphan = /^\/api\/attachment-orphans\/(file_[a-f0-9]{32})$/.exec(url.pathname);
    if (orphan) {
      if (request.method !== "DELETE") return json({ error: "Method not allowed" }, 405);
      const key = "attachments/" + orphan[1] + "/original";
      if (await database.prepare("SELECT id FROM attachments WHERE storage_key=?").bind(key).first()) return json({ error: "File has catalog metadata; use normal attachment removal." }, 409);
      const object = await bucket.head(key);
      if (!object) return json({ deleted: true });
      if (Date.now() - object.uploaded.getTime() <= 86400000) return json({ error: "Unlinked files must be at least 24 hours old before orphan cleanup." }, 409);
      await bucket.delete(key);
      if (await bucket.head(key)) throw new Error("Orphan deletion not confirmed");
      return json({ deleted: true });
    }
    if (url.pathname === "/api/attachment-targets") {
      if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
      const [shapes, designs] = await Promise.all([
        database.prepare("SELECT id,name FROM shapes ORDER BY name,id LIMIT 200").all(),
        database.prepare("SELECT id,name FROM designs ORDER BY name,id LIMIT 200").all()
      ]);
      return json({ shapes: shapes.results, designs: designs.results, limit: 200 });
    }
    const match = /^\/api\/attachments\/([a-zA-Z0-9_-]{1,128})$/.exec(url.pathname);
    if (match) {
      if (!["GET", "DELETE"].includes(request.method)) return json({ error: "Method not allowed" }, 405);
      const row = await database.prepare("SELECT * FROM attachments WHERE id = ?").bind(match[1]).first<Attachment>();
      if (!row) return json({ error: "Attachment not found" }, 404);
      if (!/^attachments\/[a-zA-Z0-9_-]{8,128}\/original$/.test(row.storage_key)) return json({ error: "Unsupported stored key" }, 409);
      if (request.method === "DELETE") {
        const derived = await database.prepare("SELECT id FROM printable_assets WHERE original_asset_id IN (SELECT id FROM printable_assets WHERE attachment_id = ?) LIMIT 1").bind(row.id).first();
        if (derived) return json({ error: "Remove derived asset relationships before deleting this original." }, 409);
        await remove(database, bucket, row);
        return json({ deleted: true });
      }
      if(url.searchParams.get("view")==="window")return imageWindow(row);
      const object = await bucket.get(row.storage_key);
      if (!object) return json({ error: "Original file is missing. Metadata is retained for recovery." }, 409);
      if (object.size > MAX_FILE) return json({ error: "Original exceeds the current 25 MiB download limit." }, 413);
      const bytes = await object.arrayBuffer();
      const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
      const hash = Array.from(digest, n => n.toString(16).padStart(2,"0")).join("");
      if (bytes.byteLength !== row.byte_size || hash !== row.sha256) return json({ error: "Original file failed integrity verification." }, 409);
      const inline=url.searchParams.get("view")==="image";
      const detected=media(row.filename,new Uint8Array(bytes));
      if(inline && (!detected?.startsWith("image/") || detected!==row.media_type)) return json({error:"Only supported verified images can be displayed."},415);
      return new Response(bytes, { headers: {
        "content-type": inline ? detected! : "application/octet-stream", "cache-control": "no-store", "x-content-type-options": "nosniff",
        "content-disposition": (inline ? "inline" : "attachment")+"; filename*=UTF-8''" + encodeURIComponent(row.filename).replace(/'/g, "%27")
      } });
    }
    if (url.pathname !== "/api/attachments") return json({ error: "Not found" }, 404);
    if (request.method === "GET") {
      const t = target(url.searchParams.get("kind"));
      const id = url.searchParams.get("recordId") ?? "";
      if (!t || !ID.test(id)) return json({ error: "Choose a valid catalog record." }, 400);
      const rows = await database.prepare(`SELECT a.* FROM attachments a JOIN ${t.links} l ON l.attachment_id=a.id WHERE l.${t.column}=? ORDER BY a.created_at,a.id LIMIT 200`).bind(id).all<Attachment>();
      const items = await Promise.all(rows.results.map(async row => ({
        id: row.id, filename: row.filename, mediaType: row.media_type, byteSize: row.byte_size, sha256: row.sha256,
        available: (await bucket.head(row.storage_key)) !== null
      })));
      return json({ attachments: items, limit: 200 });
    }
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
    if (!request.headers.get("content-type")?.startsWith("multipart/form-data;")) return json({ error: "Multipart upload required" }, 415);
    const declared = Number(request.headers.get("content-length"));
    if (declared > MAX_REQUEST) return json({ error: "Maximum file size is 25 MiB." }, 413);
    let form: FormData;
    try {
      const body = await boundedBody(request);
      form = await new Response(body.buffer as ArrayBuffer, { headers: { "content-type": request.headers.get("content-type")! } }).formData();
    } catch { return json({ error: "Invalid upload or request exceeds the 25 MiB file limit." }, 413); }
    const kind = form.get("kind");
    const id = form.get("recordId");
    const t = target(typeof kind === "string" ? kind : null);
    const file = form.get("file");
    if (!t || typeof id !== "string" || !ID.test(id) || typeof file === "string" || !file) return json({ error: "Choose a record and file." }, 400);
    if (file.size === 0 || file.size > MAX_FILE) return json({ error: "File must contain bytes and be at most 25 MiB." }, 413);
    const filename = file.name.normalize("NFC").replace(/[\\/\x00-\x1f\x7f]/g, "_").slice(0,160);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const type = media(filename, bytes);
    if (!type || (kind === "design" && !type.startsWith("image/"))) return json({ error: "Use PNG, JPEG or WebP images; cutter records also accept STL and 3MF originals." }, 415);
    if (!await database.prepare(`SELECT id FROM ${t.table} WHERE id=?`).bind(id).first()) return json({ error: "Catalog record not found." }, 404);
    const attachmentId = "file_" + crypto.randomUUID().replace(/-/g, "");
    const key = "attachments/" + attachmentId + "/original";
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), n => n.toString(16).padStart(2,"0")).join("");
    const statements = [
      database.prepare("INSERT INTO attachments(id,storage_key,filename,media_type,byte_size,sha256) VALUES (?,?,?,?,?,?)").bind(attachmentId,key,filename,type,bytes.length,hash),
      database.prepare(`INSERT INTO ${t.links}(${t.column},attachment_id,purpose) VALUES (?,?,?)`).bind(id,attachmentId,type.startsWith("image/") ? "photo" : "original")
    ];
    if (kind === "shape" && type.startsWith("model/")) statements.push(database.prepare("INSERT INTO printable_assets(id,shape_id,attachment_id,format,license_notes) VALUES (?,?,?,?,?)").bind("asset_"+crypto.randomUUID().replace(/-/g,""),id,attachmentId,type === "model/stl" ? "stl" : "3mf",String(form.get("licenseNotes") ?? "").slice(0,2000)));
    // Metadata first ensures interrupted uploads are discoverable as missing originals,
    // rather than untracked R2 objects. The DB batch is all-or-nothing.
    await database.batch(statements);
    try {
      await bucket.put(key, bytes, { httpMetadata: { contentType: type }, sha256: hash });
      const stored = await bucket.head(key);
      if (!stored || stored.size !== bytes.length) throw new Error("Upload verification failed");
      if (!await database.prepare("SELECT id FROM attachments WHERE id=?").bind(attachmentId).first())
        throw new Error("Attachment was removed during upload");
    } catch {
      try { await remove(database,bucket,{ id: attachmentId, storage_key: key } as Attachment); }
      catch { return json({ error: "Upload failed; metadata was retained for cleanup. Refresh the record and remove the failed attachment.", attachmentId }, 503); }
      return json({ error: "Upload failed and temporary metadata was removed." }, 503);
    }
    return json({ id: attachmentId, filename, byteSize: bytes.length }, 201);
  } catch { return json({ error: "Attachment operation failed. Metadata is retained when cleanup cannot complete; refresh and retry." }, 503); }
}
