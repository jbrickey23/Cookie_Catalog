/** Public repository run metadata only; no credential, browser or catalog data.
 * A completed prior runner is necessary for takeover, never proof that a
 * deployment request or an admitted data write has stopped. */
export async function completedReleaseRun(run:string,workflowSha:string,fetcher:typeof fetch=fetch){
 if(!/^\d+$/.test(run)||!/^[a-f0-9]{40}$/.test(workflowSha))return false;
 try{const response=await fetcher(`https://api.github.com/repos/JBrickey23/Cookie_Catalog/actions/runs/${run}`,{headers:{Accept:'application/vnd.github+json','User-Agent':'Cookie-Catalog-release-recovery'},signal:AbortSignal.timeout(5000)});if(!response.ok)return false;const value=await response.json() as any;
 return String(value.id)===run&&value.status==='completed'&&value.head_sha===workflowSha&&value.head_branch==='main'&&value.path==='.github/workflows/release-production.yml'&&['workflow_dispatch','workflow_run','schedule'].includes(value.event)&&String(value.repository?.id)==='1415951950';
 }catch{return false;}
}
