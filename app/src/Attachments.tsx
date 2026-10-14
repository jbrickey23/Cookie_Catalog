import React, { useEffect, useState } from "react";
type RecordOption = { id: string; name: string };
type Item = { id: string; filename: string; byteSize: number; available: boolean };
type Orphan = { id: string; byteSize: number; uploadedAt: string; removable: boolean };
export function Attachments() {
  const [targets, setTargets] = useState<{ shapes: RecordOption[]; designs: RecordOption[] }>({ shapes: [], designs: [] });
  const [kind, setKind] = useState("shape");
  const [recordId, setRecordId] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [confirmId, setConfirmId] = useState("");
  const [orphans, setOrphans] = useState<Orphan[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  async function scanOrphans(nextPage = false) {
    setBusy(true);
    try {
      const response = await fetch("/api/attachment-orphans" + (nextPage && cursor ? "?cursor=" + encodeURIComponent(cursor) : ""), { cache: "no-store" });
      const body = await response.json() as { error?: string; orphans: Orphan[]; cursor: string | null };
      if (!response.ok) throw new Error(body.error ?? "Could not check unlinked files.");
      setOrphans(previous => nextPage ? [...previous,...body.orphans] : body.orphans); setCursor(body.cursor);
      setStatus(body.cursor ? "Checked one page of files. Continue the check for remaining files." : "Check complete for this page. Unlinked files younger than 24 hours are kept.");
    } catch (error) { setStatus((error as Error).message); }
    finally { setBusy(false); }
  }
  async function removeOrphan(id: string) {
    setBusy(true);
    try {
      const response = await fetch("/api/attachment-orphans/"+id,{ method:"DELETE",headers:{ "X-Cookie-Catalog-Check":"attachments" } });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Cleanup failed.");
      setOrphans(previous => previous.filter(item => item.id !== id)); setConfirmId(""); setStatus("Unlinked original removed.");
    } catch (error) { setStatus((error as Error).message); }
    finally { setBusy(false); }
  }
  async function refresh(selectedKind = kind, selectedId = recordId) {
    if (!selectedId) { setItems([]); return; }
    const response = await fetch("/api/attachments?kind=" + selectedKind + "&recordId=" + encodeURIComponent(selectedId), { cache: "no-store" });
    const body = await response.json() as { error?: string; attachments: Item[] };
    if (!response.ok) throw new Error(body.error ?? "Could not load files.");
    setItems(body.attachments);
  }
  useEffect(() => {
    let cancelled = false;
    fetch("/api/attachment-targets", { cache: "no-store" }).then(async response => {
      const body = await response.json() as { error?: string; shapes: RecordOption[]; designs: RecordOption[] };
      if (!response.ok) throw new Error(body.error ?? "Sign in again to load catalog records.");
      if (!cancelled) setTargets(body);
    }).catch(error => { if (!cancelled) setStatus(error.message); });
    return () => { cancelled = true; };
  }, []);
  async function select(nextKind: string, nextId: string) {
    setKind(nextKind); setRecordId(nextId); setConfirmId(""); setBusy(true); setStatus("");
    try { await refresh(nextKind,nextId); } catch (error) { setItems([]); setStatus((error as Error).message); }
    finally { setBusy(false); }
  }
  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!recordId || !file) return;
    if (file.size > 25 * 1024 * 1024) { setStatus("Choose a file no larger than 25 MiB."); return; }
    setBusy(true); setStatus("Saving your original privately…");
    try {
      const form = new FormData();
      form.set("kind", kind); form.set("recordId", recordId); form.set("file", file); form.set("licenseNotes",notes);
      const response = await fetch("/api/attachments", { method: "POST", headers: { "X-Cookie-Catalog-Check": "attachments" }, body: form });
      const body = await response.json() as { error?: string; filename?: string };
      await refresh();
      if (!response.ok) throw new Error(body.error ?? "Upload failed.");
      setStatus("Saved " + body.filename + ". The original remains private.");
      setFile(null); setNotes(""); formElement.reset();
    } catch (error) { setStatus((error as Error).message); }
    finally { setBusy(false); }
  }
  async function remove(id: string) {
    setBusy(true);
    try {
      const response = await fetch("/api/attachments/" + id, { method: "DELETE", headers: { "X-Cookie-Catalog-Check": "attachments" } });
      const body = await response.json() as { error?: string };
      await refresh();
      if (!response.ok) throw new Error(body.error ?? "Deletion failed.");
      setStatus("Original and catalog attachment links removed."); setConfirmId("");
    } catch (error) { setStatus((error as Error).message); }
    finally { setBusy(false); }
  }
  const records = kind === "shape" ? targets.shapes : targets.designs;
  return <section>
    <h2>Private files</h2>
    <p>Choose a cutter shape or design, then keep its photo or original printable file here.</p>
    <p>Use small test files while development continues.</p>
    <label>Record type <select value={kind} disabled={busy} onChange={event => select(event.target.value,"")}>
      <option value="shape">Cutter shape</option><option value="design">Decorating design</option>
    </select></label>{" "}
    <label>Record <select value={recordId} disabled={busy} onChange={event => select(kind,event.target.value)}>
      <option value="">Choose a record</option>{records.map(record => <option key={record.id} value={record.id}>{record.name}</option>)}
    </select></label>
    <form onSubmit={upload} style={{ marginTop: 16 }}>
      <label>Original file <input type="file" disabled={busy || !recordId} accept={kind === "shape" ? ".png,.jpg,.jpeg,.webp,.stl,.3mf" : ".png,.jpg,.jpeg,.webp"} onChange={event => setFile(event.target.files?.[0] ?? null)} /></label>
      <p>PNG, JPEG and WebP photos; cutter shapes also accept STL and 3MF. Maximum 25 MiB per file.</p>
      {kind === "shape" && <label>Printable file license/source notes (optional)<br /><textarea maxLength={2000} value={notes} disabled={busy} onChange={event => setNotes(event.target.value)} /></label>}
      <p><button disabled={busy || !recordId || !file} type="submit">{busy ? "Working…" : "Save private file"}</button></p>
    </form>
    <p role="status" aria-live="polite">{status}</p>
    {recordId && <button disabled={busy} onClick={async () => { setBusy(true); try { await refresh(); setStatus("File list refreshed."); } catch (error) { setStatus((error as Error).message); } finally { setBusy(false); } }}>Refresh files</button>}
    {recordId && items.length === 0 && <p>No files linked to this record.</p>}
    <ul>{items.map(item => <li key={item.id} style={{ margin: "12px 0" }}>
      {item.filename} ({item.byteSize.toLocaleString()} bytes){" "}
      {item.available ? <a href={"/api/attachments/" + item.id}>Download original</a> : <strong>Original missing — recover from backup or remove this entry.</strong>}{" "}
      <button disabled={busy} onClick={() => setConfirmId(item.id)}>Remove</button>
      {confirmId === item.id && <p>This deletes the original and all its catalog attachment links. Keep a private backup first.{" "}
        <button disabled={busy} onClick={() => remove(item.id)}>Delete original</button>{" "}
        <button disabled={busy} onClick={() => setConfirmId("")}>Cancel</button></p>}
    </li>)}</ul>
    <p>Use Catalog archive below for larger backups: up to 1 GiB of originals and 1,000 files. The older small JSON backup remains limited to 4 MiB total and 25 files.</p>
    <h3>Storage cleanup</h3>
    <p>Check for originals left without catalog metadata after an interrupted operation. Cleanup is manual; files younger than 24 hours are kept.</p>
    <button disabled={busy} onClick={() => scanOrphans()}>Check unlinked files</button>{" "}
    {cursor && <button disabled={busy} onClick={() => scanOrphans(true)}>Check next page</button>}
    <ul>{orphans.map(item => <li key={item.id}>
      Unlinked file {item.id} ({item.byteSize.toLocaleString()} bytes; {new Date(item.uploadedAt).toLocaleString()}){" "}
      {item.removable ? <button disabled={busy} onClick={() => setConfirmId(item.id)}>Remove unlinked file</button> : "Kept for at least 24 hours"}
      {confirmId === item.id && <p>Delete this unlinked original? Keep your private backup first.{" "}
        <button disabled={busy} onClick={() => removeOrphan(item.id)}>Delete unlinked original</button>{" "}
        <button disabled={busy} onClick={() => setConfirmId("")}>Cancel</button></p>}
    </li>)}</ul>
  </section>;
}
