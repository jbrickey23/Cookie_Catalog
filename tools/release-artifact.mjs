import {createHash} from 'node:crypto';import {readdirSync,readFileSync,lstatSync} from 'node:fs';import {join} from 'node:path';
/** Content digest includes sorted relative filenames + exact bytes. Symlinks and
 * special files cannot smuggle candidate scripts or host paths into deploy. */
export function artifactDigest(directory){
 const hash=createHash('sha256');let count=0;
 function walk(relative=''){for(const name of readdirSync(join(directory,relative)).sort()){
  const path=join(relative,name),stat=lstatSync(join(directory,path));if(stat.isSymbolicLink()||!stat.isFile()&&!stat.isDirectory())throw Error('Unsupported artifact entry');
  if(stat.isDirectory())walk(path);else{const content=readFileSync(join(directory,path));hash.update(JSON.stringify([path.replaceAll('\\','/'),content.length])+'\n');hash.update(content);count++;}
 }}walk();if(!count)throw Error('Empty artifact');return hash.digest('hex');
}
