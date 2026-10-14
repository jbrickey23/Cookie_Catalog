import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Attachments } from "./Attachments";
import { Catalog } from "./Catalog";
import { ArchiveBackup } from "./ArchiveBackup";
import { InfrastructureVerification } from "./InfrastructureVerification";

function App() {
  const [catalogVersion,setCatalogVersion] = useState(0);
  const [result, setResult] = useState<string>("");
  const [storageResult, setStorageResult] = useState<string>("");
  const [storageBusy, setStorageBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [backupBusy, setBackupBusy] = useState(false);
  const [backupResult, setBackupResult] = useState("");
  async function downloadBackup(recoveryCheck = false) {
    setBackupBusy(true);
    setBackupResult(recoveryCheck ? "Creating temporary recovery examples, backing them up and removing them…" : "Preparing your development backup…");
    try {
      const response = await fetch(recoveryCheck ? "/api/dev/recovery-check" : "/api/dev/backup", {
        method: "POST", cache: "no-store", headers: { "X-Cookie-Catalog-Check": recoveryCheck ? "recovery" : "backup" }
      });
      if (!response.ok) {
        const body = await response.json() as { error?: string };
        setBackupResult(body.error ?? "The backup could not complete.");
        return;
      }
      if (!response.headers.get("content-disposition")?.startsWith("attachment;")) {
        setBackupResult("Sign in again before downloading your backup.");
        return;
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = /filename="([^"]+)"/.exec(response.headers.get("content-disposition") ?? "")?.[1] ?? "cookie-catalog-dev-backup.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setBackupResult(recoveryCheck
        ? "Recovery test download started. Temporary records and files were removed and cleanup verified. The saved package still needs a restore check."
        : "Backup download started. Keep this file in a private folder.");
    } catch {
      setBackupResult("The backup could not complete. Sign in again and retry.");
    } finally {
      setBackupBusy(false);
    }
  }
  async function checkDatabase() {
    setBusy(true);
    setResult("Checking the development database…");
    try {
      const response = await fetch("/api/dev/database-check", { cache: "no-store" });
      const body = await response.json() as {
        databaseConnected?: boolean; fixtureMatches?: boolean; error?: string;
        record?: { design: string; shape: string; width_mm: number; height_mm: number };
      };
      if (!response.ok || !body.record) {
        setResult(body.error ?? "The check could not complete. Sign in again and retry.");
      } else if (!body.fixtureMatches) {
        setResult("Database connected, but the demonstration record differs from the expected test values.");
      } else {
        const r = body.record;
        setResult(`Passed: ${r.design} → ${r.shape}, ${r.width_mm} × ${r.height_mm} mm.`);
      }
    } catch {
      setResult("The check could not complete. Sign in again and retry.");
    } finally {
      setBusy(false);
    }
  }
  async function checkStorage() {
    setStorageBusy(true);
    setStorageResult("Checking private storage…");
    try {
      const response = await fetch("/api/dev/storage-check", {
        method: "POST", cache: "no-store", headers: { "X-Cookie-Catalog-Check": "storage" }
      });
      const body = await response.json() as { storageConnected?: boolean; filesVerified?: number; cleanupVerified?: boolean; error?: string };
      setStorageResult(response.ok && body.storageConnected && body.filesVerified === 3 && body.cleanupVerified
        ? "Passed: cutter photo, design image and sample STL saved, read back, verified and removed."
        : body.error ?? "The storage check could not complete.");
    } catch {
      setStorageResult("The storage check could not complete. Sign in again and retry.");
    } finally {
      setStorageBusy(false);
    }
  }
  return <main style={{ fontFamily: "system-ui", maxWidth: 780, margin: "4rem auto", padding: "0 1rem" }}>
    <h1>Cookie Catalog</h1>
    <InfrastructureVerification />
    <hr />
    <Catalog onSaved={() => setCatalogVersion(version => version + 1)} />
    <hr />
    <Attachments key={catalogVersion} />
    <hr />
    <ArchiveBackup />
    <hr />
    <p>Development infrastructure checks use invented demonstration records.</p>
    <button onClick={checkDatabase} disabled={busy || backupBusy || storageBusy} style={{ padding: "0.7rem 1rem", cursor: busy ? "wait" : "pointer" }}>
      {busy ? "Checking…" : "Check development database"}
    </button>
    <p role="status" aria-live="polite">{result}</p>
    <button onClick={checkStorage} disabled={storageBusy || busy || backupBusy} style={{ padding: "0.7rem 1rem", cursor: storageBusy ? "wait" : "pointer" }}>
      {storageBusy ? "Checking…" : "Check private file storage"}
    </button>
    <p>Uses three tiny invented files and removes them after verification.</p>
    <p role="status" aria-live="polite">{storageResult}</p>
    <hr />
    <h2>Small JSON development backup</h2>
    <p>Download the current demonstration catalog and its registered files. Keep the download private.</p>
    <button onClick={() => downloadBackup()} disabled={backupBusy || storageBusy || busy} style={{ padding: "0.7rem 1rem" }}>
      {backupBusy ? "Preparing…" : "Download development backup"}
    </button>
    <p role="status" aria-live="polite">{backupResult}</p>
    <h3>File recovery test</h3>
    <p>Creates an invented cutter, design, location, tiny photo and sample STL. Downloads their backup, then removes the temporary examples before returning the file.</p>
    <button onClick={() => downloadBackup(true)} disabled={backupBusy || storageBusy || busy} style={{ padding: "0.7rem 1rem" }}>
      {backupBusy ? "Preparing…" : "Download file recovery test"}
    </button>
    <p>Collaborator access and production release remain under development.</p>
  </main>;
}
createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
