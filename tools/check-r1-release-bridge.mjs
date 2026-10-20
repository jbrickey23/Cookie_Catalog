import {prepareBridge} from './prepare-r1-release-bridge.mjs';import {build} from '../app/node_modules/esbuild/lib/main.js';import {rmSync} from 'node:fs';import {resolve} from 'node:path';
const target=prepareBridge();try{
 await build({entryPoints:[target+'/app/src/bridge-worker.ts'],bundle:true,resolveExtensions:['.ts','.tsx','.js','.json'],platform:'browser',format:'esm',target:'es2022',outfile:target+'/worker.js',nodePaths:[resolve('app/node_modules')],define:{__CC_BUILD_INFORMATION__:JSON.stringify({commit:'a'.repeat(40),version:'0.1.0-bridge-rehearsal',source:'unknown',branch:null,buildNode:null,builtAt:null})}});
 console.log('Exact accepted R1 source + bridge overlay compiled; no deployment or platform quiescence claim.');
}finally{rmSync(target,{recursive:true,force:true});}
