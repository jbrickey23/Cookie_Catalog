/** A trusted runner's narrow machine client. Requests are never implicitly
 * retried. Reconciliation reads durable sequence and reuses exact command bytes. */
export function machineClient({origin,clientId,clientSecret,oidc,fetcher=fetch}){
 if(!/^https:\/\/[^/]+$/.test(origin)||!clientId||!clientSecret||typeof oidc!=='function')throw Error('Machine configuration incomplete');
 async function call(path,body){const response=await fetcher(origin+'/api/release-automation/'+path,{method:body?'POST':'GET',headers:{'CF-Access-Client-Id':clientId,'CF-Access-Client-Secret':clientSecret,'X-Release-OIDC':await oidc(),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('Machine release request failed: '+response.status);return response.json();}
 return {status:()=>call('status'),control:body=>call('control',body)};
}
export async function githubOidc(audience,fetcher=fetch,environment=process.env){
 const endpoint=new URL(environment.ACTIONS_ID_TOKEN_REQUEST_URL);if(endpoint.protocol!=='https:')throw Error('OIDC transport required');endpoint.searchParams.set('audience',audience);
 const response=await fetcher(endpoint,{headers:{Authorization:'Bearer '+environment.ACTIONS_ID_TOKEN_REQUEST_TOKEN},signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('GitHub OIDC unavailable');const body=await response.json();if(typeof body.value!=='string')throw Error('GitHub OIDC missing');return body.value;
}
