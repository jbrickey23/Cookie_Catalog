import React, { useState } from "react";
import { createRoot } from "react-dom/client";

function App() {
  const [result, setResult] = useState<string>("");
  const [busy, setBusy] = useState(false);
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
  return <main style={{ fontFamily: "system-ui", maxWidth: 780, margin: "4rem auto", padding: "0 1rem" }}>
    <h1>Cookie Catalog</h1>
    <p>Development infrastructure checks use invented demonstration records.</p>
    <button onClick={checkDatabase} disabled={busy} style={{ padding: "0.7rem 1rem", cursor: busy ? "wait" : "pointer" }}>
      {busy ? "Checking…" : "Check development database"}
    </button>
    <p role="status" aria-live="polite">{result}</p>
    <p>Catalog entry and file uploads will be enabled after the remaining infrastructure checks.</p>
  </main>;
}
createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
