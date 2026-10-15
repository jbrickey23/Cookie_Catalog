/** Install only managed tools/launchers. Preserve settings, input and saved backups. */
import * as fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createHash,randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const digest=value=>createHash('sha256').update(value).digest('hex');
export function defaultRoot(env=process.env,home=os.homedir()){
  const candidates=[env.OneDriveConsumer,env.OneDrive,path.join(home,'OneDrive')].filter(Boolean).map(p=>path.join(p,'Cookie_Catalog'));
  const found=candidates.find(p=>fs.existsSync(path.join(p,'Backups')));
  if(!found)throw Error('Could not locate the existing OneDrive Cookie_Catalog folder. Supply --root with its existing folder.');
  return found;
}
function noLinks(file){for(let current=path.resolve(file);;current=path.dirname(current)){
  let stat;try{stat=fs.lstatSync(current);}catch(error){if(error.code!=='ENOENT')throw error;}
  if(stat?.isSymbolicLink())throw Error('Install folders cannot be links.');
  if(fs.existsSync(path.join(current,'.git')))throw Error('Install the private backup kit outside Git repositories.');
  if(path.dirname(current)===current)break;
}}
function atomic(file,data){const temp=file+'.new-'+randomUUID();try{fs.writeFileSync(temp,data,{flag:'wx',mode:0o600});fs.renameSync(temp,file);}finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}}
export function installKit(bundle,requestedRoot){
  const [major,minor]=process.versions.node.split('.').map(Number);if(major<24||major===24&&minor<10)throw Error('Use the existing Node 24.10+ installation. No Node installation or settings change was attempted.');
  const root=path.resolve(requestedRoot||defaultRoot());noLinks(root);
  if(!fs.existsSync(root)||!fs.statSync(root).isDirectory())throw Error('The existing Cookie_Catalog folder was not found.');
  if(!bundle||bundle.format!=='cookie-catalog-backup-kit'||bundle.version!==1||!bundle.assets||!bundle.managed)throw Error('Unsupported tool bundle.');
  const names=Object.keys(bundle.assets).sort();if(Object.values(bundle.assets).some(v=>typeof v!=='string'))throw Error('Invalid tool asset.');if(JSON.stringify(names)!==JSON.stringify(['archive-format.mts','backup-helper.mjs','backup-kit.mjs']))throw Error('Unexpected tool asset set.');
  const version=digest(JSON.stringify(bundle.assets)),toolRoot=path.join(root,'Tools','Backup');noLinks(toolRoot);
  const ledgerFile=path.join(toolRoot,'managed.json');noLinks(ledgerFile);noLinks(path.join(toolRoot,'current.json'));let previous={};
  if(!fs.existsSync(ledgerFile)&&fs.existsSync(path.join(toolRoot,'current.json')))throw Error('Existing tool state belongs to another install; preserved.');
  if(fs.existsSync(ledgerFile)){if(fs.statSync(ledgerFile).size>16384)throw Error('Invalid install ledger.');previous=JSON.parse(fs.readFileSync(ledgerFile,'utf8'));}
  const allowed=new Set(['Backup.cmd','Pre-Change-Backup.cmd','Review-Backups.cmd','Verify-Cloud-Copy.cmd','Open-Backup-Inbox.cmd','Open-Saved-Backups.cmd','Refresh-Backup-Tools.cmd','Tools/Backup/run.mjs','Tools/Backup/README.txt']);
  if(Object.keys(bundle.managed).some(p=>!allowed.has(p))||Object.keys(bundle.managed).length!==allowed.size)throw Error('Unexpected launcher set.');
  // Preflight every replace before writing any active file. Never overwrite unrelated files.
  for(const [relative,content] of Object.entries(bundle.managed)){
    if(typeof content!=='string')throw Error('Invalid launcher content.');
    const target=path.join(root,...relative.split('/'));noLinks(target);
    if(fs.existsSync(target)&&(!fs.lstatSync(target).isFile()||![digest(content),previous[relative]].includes(digest(fs.readFileSync(target)))))throw Error('A launcher was edited or belongs to another tool; preserved: '+relative);
  }
  const settings=path.join(toolRoot,'settings.json');noLinks(settings);
  if(fs.existsSync(settings)&&(!fs.statSync(settings).isFile()||fs.statSync(settings).size>8192))throw Error('Existing settings cannot be read safely.');
  const config=fs.existsSync(settings)?JSON.parse(fs.readFileSync(settings,'utf8')):{format:'cookie-catalog-backup-kit-settings',version:1,inbox:'Backups/Inbox',backups:'Backups',downloadsFallback:true};
  if(config.format!=='cookie-catalog-backup-kit-settings'||config.version!==1||typeof config.downloadsFallback!=='boolean')throw Error('Existing settings are unsupported; preserved.');
  const safe=relative=>{if(typeof relative!=='string'||!relative||path.isAbsolute(relative)||/^[A-Za-z]:/.test(relative)||relative.replaceAll('\\','/').split('/').some(p=>!p||p==='..'||p==='.'))throw Error('Settings must use relative backup folders.');const target=path.join(root,...relative.replaceAll('\\','/').split('/'));noLinks(target);return target;};
  const backups=safe(config.backups),inbox=safe(config.inbox);const within=path.relative(backups,inbox);if(!within||within.split(path.sep)[0]==='..'||path.isAbsolute(within))throw Error('Keep the inbox inside Backups.');
  const release=path.join(toolRoot,'versions',version);noLinks(release);
  if(fs.existsSync(release))for(const [name,content] of Object.entries(bundle.assets)){
    const target=path.join(release,name);noLinks(target);if(!fs.existsSync(target)||digest(fs.readFileSync(target))!==digest(content))throw Error('An installed tool version changed; no active tools were replaced.');
  }
  fs.mkdirSync(path.join(toolRoot,'versions'),{recursive:true});fs.mkdirSync(backups,{recursive:true});fs.mkdirSync(inbox,{recursive:true});
  if(!fs.existsSync(release)){
    const stage=path.join(toolRoot,'versions','.install-'+randomUUID());fs.mkdirSync(stage);
    try{for(const [name,content]of Object.entries(bundle.assets))fs.writeFileSync(path.join(stage,name),content,{flag:'wx',mode:0o600});fs.renameSync(stage,release);}finally{if(fs.existsSync(stage))fs.rmSync(stage,{recursive:true,force:true});}
  }
  if(!fs.existsSync(settings))fs.writeFileSync(settings,JSON.stringify(config,null,2)+'\n',{flag:'wx',mode:0o600});
  const ledger={};for(const [relative,content]of Object.entries(bundle.managed)){const target=path.join(root,...relative.split('/'));fs.mkdirSync(path.dirname(target),{recursive:true});atomic(target,content);ledger[relative]=digest(content);}
  atomic(ledgerFile,JSON.stringify(ledger,null,2)+'\n');
  atomic(path.join(toolRoot,'current.json'),JSON.stringify({version,files:Object.fromEntries(Object.entries(bundle.assets).map(([name,content])=>[name,digest(content)]))},null,2)+'\n');
  return {installed:true,root,version,inbox,backups};
}
