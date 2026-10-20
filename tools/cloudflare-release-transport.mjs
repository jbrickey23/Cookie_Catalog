/** Native Cloudflare deployment API transport. No npm/build hooks or data APIs.
 * Version upload must be separately staged by trusted Wrangler with reviewed
 * config and prebuilt assets; this module cannot manufacture artifact provenance. */
export function cloudflareDeploymentTransport({account,worker,token,fetcher=fetch}){
 if(!/^[a-f0-9]{32}$/.test(account)||worker!=='cookie-catalog-prod'||!token)throw Error('Explicit existing production target required');
 const root=`https://api.cloudflare.com/client/v4/accounts/${account}/workers/scripts/${worker}`;
 let unknown=false;
 async function call(path,method='GET',body){
  try{const response=await fetcher(root+path,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(30000)});const result=await response.json();if(!response.ok||result.success!==true)throw Error('Cloudflare operation rejected');return result.result;}
  catch(error){if(method!=='GET')unknown=true;throw error;}
 }
 const deploy=async(version)=>{if(unknown)throw Error('Unresolved deployment request');if(!/^[a-f0-9-]{36}$/.test(version))throw Error('Exact version UUID required');return call('/deployments','POST',{strategy:'percentage',versions:[{version_id:version,percentage:100}]});};
 return {deploy,rollback:deploy,deploymentSettled:async()=>!unknown,deployment:async()=>{const value=await call('/deployments');const latest=value.deployments?.[0];if(!latest)throw Error('No deployment evidence');return {settled:!unknown,versions:latest.versions};}};
}
