import {execFileSync} from 'node:child_process';import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';import {resolve,join} from 'node:path';import {tmpdir} from 'node:os';import {artifactDigest} from './release-artifact.mjs';
/** Credentialed upload runs trusted Wrangler ONLY, with no candidate config,
 * build hooks, package scripts, .env discovery or executable plugin loading.
 * Caller stages artifact as worker/index.js + worker/assets + client and freezes
 * both hashes in the reviewed recovery plan before this function is called. */
export function uploadVersion({artifact,expectedHash,trustedConfig,expectedConfigHash,wranglerCli,token,account,execute=execFileSync}){
 if(artifactDigest(artifact)!==expectedHash||artifactDigest(trustedConfig)!==expectedConfigHash)throw Error('Artifact or trusted configuration changed');
 const base=JSON.parse(readFileSync(join(trustedConfig,'production.json'),'utf8'));
 if(base.name!=='cookie-catalog-prod'||base.vars?.CATALOG_ENVIRONMENT!=='production'||base.assets?.binding!=='ASSETS'||base.d1_databases?.[0]?.database_name!=='cookie-catalog-prod'||base.r2_buckets?.[0]?.bucket_name!=='cookie-catalog-prod-private')throw Error('Existing production bindings required');
 const directory=mkdtempSync(join(tmpdir(),'cc-version-upload-'));
 try{
  const config={name:base.name,main:resolve(artifact,'worker/index.js'),assets:{...base.assets,directory:resolve(artifact,'client')},compatibility_date:base.compatibility_date,compatibility_flags:base.compatibility_flags??[],d1_databases:base.d1_databases.map(({binding,database_name,database_id})=>({binding,database_name,database_id})),r2_buckets:base.r2_buckets.map(({binding,bucket_name})=>({binding,bucket_name})),vars:base.vars,version_metadata:{binding:'CF_VERSION_METADATA'},no_bundle:true,find_additional_modules:true,rules:[{type:'ESModule',globs:['**/*.js'],fallthrough:true}]};
  const configPath=join(directory,'wrangler.json'),output=join(directory,'output.jsonl');writeFileSync(configPath,JSON.stringify(config));
  // A minimal environment excludes NODE_OPTIONS, candidate npm hooks and inherited
  // provider overrides. Toolchain path/config are supplied by the pinned engine.
  execute(process.execPath,[resolve(wranglerCli),'versions','upload','--config',configPath,'--no-bundle','--keep-vars','--strict'],{cwd:directory,env:{PATH:process.env.PATH,XDG_CONFIG_HOME:directory,CLOUDFLARE_API_TOKEN:token,CLOUDFLARE_ACCOUNT_ID:account,WRANGLER_OUTPUT_FILE_PATH:output,WRANGLER_SEND_METRICS:'false',CI:'true'},stdio:['ignore','pipe','pipe'],timeout:120000});
  const records=readFileSync(output,'utf8').trim().split('\n').map(line=>JSON.parse(line));const uploaded=records.filter(row=>row.type==='version-upload'&&row.worker_name==='cookie-catalog-prod');
  if(uploaded.length!==1||!/^[a-f0-9-]{36}$/.test(uploaded[0].version_id))throw Error('Ambiguous native version upload');return uploaded[0].version_id;
 }finally{rmSync(directory,{recursive:true,force:true});}
}
