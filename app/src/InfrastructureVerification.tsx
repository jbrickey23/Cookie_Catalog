import React,{useState} from "react";
interface Report {
  checksPassed:boolean;
  worker:{build:{commit:string|null;branch:string|null;source:string;buildNode:string|null};sourceCommitAvailable:boolean};
  database:{schemaTables:number;requiredMigrationsApplied:boolean;foreignKeyViolations:number};
  storage:{bindingReadable:boolean;sampledAttachments:number;missingOriginals:number;sizeMismatches:number};
}
export function InfrastructureVerification() {
  const [report,setReport]=useState<Report|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
  const [missingBusy,setMissingBusy]=useState(false),[missingMessage,setMissingMessage]=useState("");
  async function checkMissing() {
    setMissingBusy(true);setMissingMessage("Testing one disposable photo. Keep edits and backups idle until completion…");
    try {
      const response=await fetch("/api/dev/missing-file-check",{method:"POST",cache:"no-store",headers:{"X-Cookie-Catalog-Check":"missing-file"}});
      const result=await response.json() as {error?:string;missingDownloadStatus?:number;missingListedUnavailable?:boolean;metadataAndLinkRetained?:boolean;recoveredBytesVerified?:boolean;cleanupVerified?:boolean};
      if(!response.ok||result.missingDownloadStatus!==409||!result.missingListedUnavailable||!result.metadataAndLinkRetained||!result.recoveredBytesVerified||!result.cleanupVerified)throw Error(result.error??"Missing-file check did not complete.");
      setMissingMessage("Passed: missing original detected; metadata and record link retained; trusted bytes restored and verified; temporary photo and record removed.");
    } catch(error){setMissingMessage((error as Error).message);}finally{setMissingBusy(false);}
  }
  async function check() {
    setBusy(true);setReport(null);setMessage("Reading the deployed Worker, database and storage…");
    try{
      const response=await fetch("/api/dev/infrastructure-check",{cache:"no-store"});
      const result=await response.json() as Report&{error?:string};
      if(!response.ok||!result.worker)throw Error(result.error??"Sign in again before verification.");
      setReport(result);setMessage(result.checksPassed?"Binding, migration and sampled-file checks passed. Compare the source commit with GitHub.":"A binding, schema, relationship or sampled-file check needs attention.");
    }catch(error){setMessage((error as Error).message);}finally{setBusy(false);}
  }
  function download() {
    if(!report)return;
    const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:"application/json"})),link=document.createElement("a");
    link.href=url;link.download="Cookie_Catalog_Infrastructure_"+new Date().toISOString().replace(/[:.]/g,"-")+".json";link.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
  }
  return <section>
    <h2>Development verification</h2>
    <p>Read the deployed source version, database migrations and storage bindings. This check does not change catalog records or files.</p>
    <button disabled={busy||missingBusy} onClick={check}>{busy?"Checking…":"Verify development infrastructure"}</button>
    <p role="status" aria-live="polite">{message}</p>
    {report&&<div>
      <p>Source commit: <code>{report.worker.build.commit??"Not available — deployment traceability not yet verified"}</code><br />Branch: {report.worker.build.branch??"unknown"}<br />Build source: {report.worker.build.source}</p>
      <p>D1: {report.database.schemaTables} tables; migrations {report.database.requiredMigrationsApplied?"present":"missing"}; {report.database.foreignKeyViolations} foreign-key violations.</p>
      <p>R2 binding readable: {report.storage.bindingReadable?"yes":"no"}; {report.storage.sampledAttachments} linked originals sampled; {report.storage.missingOriginals} missing; {report.storage.sizeMismatches} size mismatches.</p>
      <p>Build Node: {report.worker.build.buildNode??"unknown"} (deployment build environment).</p>
      <button onClick={download}>Download verification report</button>
    </div>}
    <h3>Missing-file recovery test</h3>
    <p>Creates one disposable photo and record, removes only that photo's stored bytes, checks the missing-file response, restores the trusted bytes, then verifies cleanup. Existing catalog records and originals are preserved. Keep edits and backups idle during this test.</p>
    <button disabled={busy||missingBusy} onClick={checkMissing}>{missingBusy?"Testing recovery…":"Test missing-file recovery"}</button>
    <p role="status" aria-live="polite">{missingMessage}</p>
  </section>;
}
