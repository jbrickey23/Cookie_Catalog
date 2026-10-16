/** Only callers that can safely repeat an operation opt into bounded retries. */
export async function requestJson<T=any>(url:string,init:RequestInit,retrySafe=false):Promise<T>{
 for(let attempt=0;;attempt++){
  let transient=false;
  try{
   let response:Response;
   try{response=await fetch(url,init);}catch{transient=true;throw Error('The service could not be reached. Saved progress and drafts are retained.');}
   transient=response.status>=500||[408,429].includes(response.status);
   if(!response.headers.get('content-type')?.includes('application/json')){transient=true;const page=(await response.text()).slice(0,16384),code=/\b(?:Error(?: code)?[\s:<\/a-z>]*|error code: ?)(1\d{3})\b/i.exec(page)?.[1];throw Error(`The service returned an unexpected response (HTTP ${response.status}${code?`, provider error ${code}`:''}). Saved progress is retained; refresh your session if this continues.`);}
   const result=await response.json() as any;if(!response.ok)throw Error(result.error??'The operation could not complete. Saved progress and drafts are retained.');return result as T;
  }catch(error){if(!retrySafe||!transient||attempt>=3)throw error;await new Promise(resolve=>setTimeout(resolve,250*2**attempt));}
 }
}
