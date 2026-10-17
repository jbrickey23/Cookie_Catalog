import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {checkProductionConfig} from '../check-production-config.mjs';
const read=name=>JSON.parse(readFileSync(new URL('../../app/'+name,import.meta.url),'utf8').replace(/^\s*\/\/.*$/gm,''));
const dev=read('wrangler.jsonc'),template=read('wrangler.production.example.jsonc');
const candidate=()=>{const config=structuredClone(template);config.d1_databases[0].database_id='12345678-1234-1234-1234-123456789abc';config.vars.ACCESS_AUD='a'.repeat(64);return config;};
test('production configuration rejects incomplete template and development resources',()=>{
 assert.throws(()=>checkProductionConfig(template,dev),/D1 ID/);
 for(const mutate of [c=>c.name=dev.name,c=>c.d1_databases[0].database_id=dev.d1_databases[0].database_id,c=>c.r2_buckets[0].bucket_name=dev.r2_buckets[0].bucket_name,c=>c.vars.ACCESS_AUD=dev.vars.ACCESS_AUD,c=>c.vars.CATALOG_ENVIRONMENT='development',c=>c.preview_urls=true]){const c=candidate();mutate(c);assert.throws(()=>checkProductionConfig(c,dev));}
});
test('configuration pass is explicitly distinct from actual provisioning and private access evidence',()=>{
 const result=checkProductionConfig(candidate(),dev);assert.equal(result.configurationPassed,true);assert.equal(result.remoteResourcesVerified,false);assert.equal(result.privateAccessVerified,false);assert.equal(result.productionDeployed,false);
});
