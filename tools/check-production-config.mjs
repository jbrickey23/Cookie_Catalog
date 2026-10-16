/** Read-only configuration gate. Does not provision, deploy, authenticate or inspect remote resources. */
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
export function checkProductionConfig(config,development){
 const fail=message=>{throw Error(message);};
 if(config.name!=='cookie-catalog-prod'||config.name===development.name)fail('Choose the separate approved production Worker.');
 if(config.vars?.CATALOG_ENVIRONMENT!=='production')fail('Production environment must be explicit.');
 const db=config.d1_databases?.find(item=>item.binding==='DB'),files=config.r2_buckets?.find(item=>item.binding==='FILES');
 if(config.d1_databases?.length!==1||db?.database_name!=='cookie-catalog-prod'||!/^([a-f0-9]{8}-){1}[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(db?.database_id??'')||/^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(db.database_id)||development.d1_databases.some(item=>item.database_id===db.database_id))fail('Provide a verified separate production D1 ID; development and placeholder IDs are forbidden.');
 if(config.r2_buckets?.length!==1||files?.bucket_name!=='cookie-catalog-prod-private'||development.r2_buckets.some(item=>item.bucket_name===files.bucket_name))fail('Choose the separate production private bucket.');
 if(!/^[a-f0-9]{64}$/i.test(config.vars?.ACCESS_AUD??'')||/^0+$/.test(config.vars.ACCESS_AUD)||config.vars.ACCESS_AUD===development.vars.ACCESS_AUD)fail('Provide the separate production Access audience.');
 if(config.vars.ACCESS_TEAM_DOMAIN!==development.vars.ACCESS_TEAM_DOMAIN||config.preview_urls!==false||!config.secrets?.required?.includes('OWNER_EMAIL'))fail('Keep the approved Access team, required owner secret and disabled preview URLs.');
 return {configurationPassed:true,remoteResourcesVerified:false,privateAccessVerified:false,productionDeployed:false,worker:config.name,database:db.database_name,bucket:files.bucket_name};
}
const read=path=>JSON.parse(readFileSync(path,'utf8').replace(/^\s*\/\/.*$/gm,''));
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{if(process.argv.length!==3)throw Error('Usage: node tools/check-production-config.mjs app/wrangler.production.jsonc');console.log(JSON.stringify(checkProductionConfig(read(process.argv[2]),read(new URL('../app/wrangler.jsonc',import.meta.url))),null,2));}
 catch(error){console.error(error.message);process.exitCode=1;}
}
