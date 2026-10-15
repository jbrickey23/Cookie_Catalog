/** Local backup inbox workflow. No network, source deletion or live catalog writes. */
import * as fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {createHash} from 'node:crypto';
import {validateArchive,saveBackup,fileHash,reviewRetention,verifyCloudCopy} from './backup-helper.mjs';
import {archiveStream} from '../app/src/archive-format.ts';
const hash=data=>createHash('sha256').update(data).digest('hex');
const json=(file,limit)=>{if(fs.lstatSync(file).isSymbolicLink()||fs.statSync(file).size>limit)throw Error('Source is linked or too large.');return JSON.parse(fs.readFileSync(file,'utf8'));};
function ordinary(file){const s=fs.lstatSync(file);if(s.isSymbolicLink()||!s.isFile())throw Error('Choose a regular backup file.');return s;}
export function inside(root,relative){
  if(typeof relative!=='string'||!relative||path.isAbsolute(relative)||/^[A-Za-z]:/.test(relative)||relative.includes('\0')||relative.replaceAll('\\','/').split('/').some(p=>!p||p==='..'||p==='.'))throw Error('Backup settings must use folders relative to Cookie_Catalog.');
  let current=root;for(const part of relative.replaceAll('\\','/').split('/')){current=path.join(current,part);if(fs.existsSync(current)&&fs.lstatSync(current).isSymbolicLink())throw Error('Backup folders cannot be links.');}
  return current;
}
export function settingsFor(root){
  const settings=json(path.join(root,'Tools','Backup','settings.json'),8192);
  if(settings.format!=='cookie-catalog-backup-kit-settings'||settings.version!==1||typeof settings.downloadsFallback!=='boolean')throw Error('Unsupported backup settings.');
  const inbox=inside(root,settings.inbox),backups=inside(root,settings.backups);
  const within=path.relative(backups,inbox);if(!within||within.split(path.sep)[0]==='..'||path.isAbsolute(within))throw Error('The inbox must be a separate folder inside Backups.');
  return {...settings,inbox,backups};
}
function sniff(file){
  const stat=fs.lstatSync(file);if(stat.isSymbolicLink())return null;
  if(stat.isDirectory())return fs.existsSync(path.join(file,'metadata','manifest.json'))?'folder':null;
  if(!stat.isFile())return null;
  const fd=fs.openSync(file,'r'),bytes=Buffer.alloc(Math.min(4096,stat.size));try{fs.readSync(fd,bytes,0,bytes.length,0);}finally{fs.closeSync(fd);}
  if(bytes.subarray(257,262).toString()==='ustar')return 'tar';
  if(bytes.toString('utf8').includes('cookie-catalog-development-backup'))return 'json';
  return null;
}
export function chooseInput(root,settings,downloads){
  const inbox=fs.readdirSync(settings.inbox).filter(n=>n.toLowerCase()!=='desktop.ini').map(n=>path.join(settings.inbox,n));
  if(inbox.length){
    // Do not silently fall back to an older file when a new inbox entry is unsupported/partial.
    return inbox.sort((a,b)=>fs.lstatSync(b).mtimeMs-fs.lstatSync(a).mtimeMs||a.localeCompare(b))[0];
  }
  const candidates=[];
  for(const folder of [settings.downloadsFallback?downloads:null,settings.backups].filter(Boolean)){
    if(!fs.existsSync(folder)||!fs.statSync(folder).isDirectory())continue;
    for(const name of fs.readdirSync(folder)){
      const file=path.join(folder,name);
      if(file===settings.inbox||file.endsWith('.receipt.json')||fs.existsSync(file+'.receipt.json'))continue;
      if(sniff(file))candidates.push(file);
    }
  }
  candidates.sort((a,b)=>fs.lstatSync(b).mtimeMs-fs.lstatSync(a).mtimeMs||a.localeCompare(b));
  if(!candidates.length)throw Error('No catalog backup found. Save a new app backup into Backups\\Inbox, or download it normally, then run this again.');
  return candidates[0];
}
function sourceFiles(root){
  const found=[];let entries=0;
  function visit(folder){for(const d of fs.readdirSync(folder,{withFileTypes:true})){
    if(++entries>5000)throw Error('Extracted backup has too many entries.');
    const file=path.join(folder,d.name),s=fs.lstatSync(file);
    if(s.isSymbolicLink())throw Error('Extracted backup cannot contain links.');
    if(s.isDirectory())visit(file);else if(s.isFile())found.push(path.relative(root,file).split(path.sep).join('/'));else throw Error('Unsupported extracted backup entry.');
  }}visit(root);return found.sort();
}
async function convertInput(source,kind,target){
  let manifest,load;
  if(kind==='folder'){
    const manifestPath=path.join(source,'metadata','manifest.json');ordinary(manifestPath);
    if(fs.statSync(manifestPath).size>16*1024**2)throw Error('Extracted manifest is too large.');
    manifest=fs.readFileSync(manifestPath);
    const envelope=JSON.parse(manifest),payload=JSON.parse(envelope.payloadJson),objects=payload.objects;
    if(!Array.isArray(objects))throw Error('Extracted backup has no original descriptors.');
    const complete=json(path.join(source,'metadata','complete.json'),1024);
    if(complete.manifestSha256!==hash(manifest)||complete.objects!==objects.length||complete.originalBytes!==objects.reduce((n,o)=>n+o.byteSize,0))throw Error('Extracted backup completion receipt failed.');
    const expected=['metadata/manifest.json','metadata/complete.json',...objects.map(o=>'objects/'+o.key)].sort();
    if(JSON.stringify(sourceFiles(source))!==JSON.stringify(expected))throw Error('Extracted backup has missing or extra files.');
    load=async object=>{const file=inside(source,'objects/'+object.key);ordinary(file);if(fs.statSync(file).size!==object.byteSize)throw Error('Extracted original size mismatch.');return fs.readFileSync(file);};
  }else if(kind==='json'){
    const envelope=json(source,12*1024**2);
    if(envelope.format!=='cookie-catalog-development-backup'||envelope.version!==1||typeof envelope.payloadJson!=='string'||hash(envelope.payloadJson)!==envelope.payloadSha256||!Number.isFinite(Date.parse(envelope.exportedAt)))throw Error('Invalid JSON catalog backup.');
    const payload=JSON.parse(envelope.payloadJson),data=new Map();let total=0;
    if(!Array.isArray(payload.objects)||payload.objects.length>25)throw Error('JSON backup object limit exceeded.');
    const objects=payload.objects.map(o=>{
      if(typeof o.base64!=='string'||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(o.base64))throw Error('Invalid original encoding.');
      const bytes=Buffer.from(o.base64,'base64');total+=bytes.length;
      if(data.has(o.key)||total>4*1024**2||bytes.length!==o.byteSize||hash(bytes)!==o.sha256)throw Error('JSON original checksum or size failed.');
      data.set(o.key,bytes);const {base64,...descriptor}=o;return descriptor;
    });
    const payloadJson=JSON.stringify({...payload,objects});
    manifest=Buffer.from(JSON.stringify({format:'cookie-catalog-archive',version:1,exportedAt:envelope.exportedAt,payloadJson,payloadSha256:hash(payloadJson)}));
    load=async object=>data.get(object.key);
  }else throw Error('Unsupported backup input.');
  await pipeline(Readable.fromWeb(await archiveStream(manifest,load)),fs.createWriteStream(target,{flags:'wx',mode:0o600}));
}
function existingCopy(backups,validation,kind){
  for(const name of fs.readdirSync(backups).filter(n=>n.endsWith('.tar.receipt.json'))){try{
    const receipt=json(path.join(backups,name),128*1024);
    if(receipt.format!=='cookie-catalog-local-backup-receipt'||receipt.version!==1||receipt.kind!==kind||(kind==='pre-change'&&receipt.protected!==true)||path.basename(receipt.file)!==receipt.file||receipt.validation?.sha256!==validation.sha256)continue;
    const file=path.join(backups,receipt.file);ordinary(file);
    if(fs.statSync(file).size===validation.bytes&&fileHash(file)===validation.sha256)return {savedFile:file,receipt:path.join(backups,name),validation,cloudCopy:'pending',reused:true};
  }catch{/* Changed or malformed existing backups are preserved and never reused. */}}
  return null;
}
export async function runBackupKit({root,mode='normal',input,downloads=path.join(os.homedir(),'Downloads')}){
  if(!['normal','pre-change','review','verify-cloud'].includes(mode))throw Error('Choose normal, pre-change or review.');
  root=fs.realpathSync(root);const settings=settingsFor(root);
  if(mode==='review')return reviewRetention(settings.backups);
  if(mode==='verify-cloud'&&!input)throw Error('Download the saved backup from OneDrive web, then drag that downloaded TAR onto Verify-Cloud-Copy.cmd. No receipt path is needed.');
  const chosen=input||chooseInput(root,settings,downloads);
  if(fs.lstatSync(chosen).isSymbolicLink())throw Error('Choose the original backup, not a link.');
  const source=fs.realpathSync(chosen);
  const kind=sniff(source);if(!kind)throw Error('This is not a complete catalog backup. Use an app TAR, its complete extracted folder, or a small JSON development backup. Source PDFs, tool ZIPs and renamed files are not backups.');
  if(mode==='verify-cloud'){
    if(kind!=='tar')throw Error('Cloud comparison needs the independently downloaded TAR, not extracted or converted data.');
    const validation=validateArchive(source),saved=existingCopy(settings.backups,validation,'pre-change')||existingCopy(settings.backups,validation,'normal');
    if(!saved)throw Error('No unchanged saved backup receipt matches this download.');
    return verifyCloudCopy(saved.receipt,source);
  }
  const temporary=kind==='tar'?null:fs.mkdtempSync(path.join(os.tmpdir(),'cookie-catalog-convert-'));
  try{
    const archive=temporary?path.join(temporary,'converted.tar'):source;
    if(temporary)await convertInput(source,kind,archive);
    const validation=validateArchive(archive);
    const result=existingCopy(settings.backups,validation,mode)||{...saveBackup(archive,settings.backups,mode),reused:false};
    return {...result,input:source,inputFormat:kind};
  }finally{if(temporary)fs.rmSync(temporary,{recursive:true,force:true});}
}
