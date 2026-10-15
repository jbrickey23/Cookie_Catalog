/** Offline import preparation: no network, SQL, credentials, or live writes. Node 24+. */
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {readiness} from '../app/src/readiness.ts';
import {validateManifest,text} from '../app/src/staging.mjs';
export {validateManifest} from '../app/src/staging.mjs';
const sha=value=>createHash('sha256').update(value).digest('hex');
function regular(file){if(!fs.lstatSync(file).isFile()||fs.lstatSync(file).isSymbolicLink())throw Error('Use regular files, not links.');}
function privateOutput(destination){
  const parent=fs.realpathSync(path.dirname(path.resolve(destination))),target=path.join(parent,path.basename(destination));
  for(let p=parent;;p=path.dirname(p)){if(fs.existsSync(path.join(p,'.git')))throw Error('Private output must be outside git checkouts.');if(path.dirname(p)===p)break;}
  if(fs.existsSync(target))throw Error('Output directory already exists; older output is preserved.');
  return target;
}
function fileInside(root,relative){
  if(!text(relative,2000)||!relative||relative.includes('\\')||path.isAbsolute(relative)||/^[A-Za-z]:/.test(relative)||relative.split('/').some(p=>p==='..'||!p))throw Error('Asset path must be a relative path inside the source folder.');
  let current=root;
  for(const segment of relative.split('/')){current=path.join(current,segment);if(fs.lstatSync(current).isSymbolicLink())throw Error('Source links are not allowed.');}
  regular(current);
  const real=fs.realpathSync(current);if(!real.startsWith(root+path.sep))throw Error('Asset escapes the source folder.');
  return real;
}
function digest(file){
  regular(file);const fd=fs.openSync(file,'r'),before=fs.fstatSync(fd),hash=createHash('sha256'),buffer=Buffer.alloc(1024*1024);
  try{let n;while((n=fs.readSync(fd,buffer,0,buffer.length,null)))hash.update(buffer.subarray(0,n));const after=fs.fstatSync(fd);if(before.size!==after.size||before.mtimeMs!==after.mtimeMs)throw Error('Source changed while reading.');return {sha256:hash.digest('hex'),bytes:before.size};}finally{fs.closeSync(fd);}
}
function parseJson(file){regular(file);if(fs.statSync(file).size>16*1024**2)throw Error('Manifest exceeds 16 MiB.');return JSON.parse(fs.readFileSync(file,'utf8'));}
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderReport(report){
  const rows=report.items.map(i=>`<tr><td>${escape(i.name)}<br><small>${escape(i.id)}</small></td><td>${escape(i.kind)}<br>${escape(i.change)}</td><td>${i.checks.map(c=>`<p><strong>${escape(c.label)}: ${escape(c.state)}</strong><br>${escape(c.action)}${c.note?'<br>'+escape(c.note):''}</p>`).join('')}</td><td>${i.issues.map(escape).join('<br>')||'None'}${i.duplicateCandidates.length?'<p>Possible duplicate(s): '+i.duplicateCandidates.map(escape).join(', ')+'</p>':''}</td></tr>`).join('');
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><title>Private catalog review</title><style>body{font:16px system-ui;max-width:1200px;margin:2rem auto;padding:1rem}table{border-collapse:collapse;width:100%}td,th{border:1px solid #aaa;padding:.7rem;text-align:left;vertical-align:top}small{overflow-wrap:anywhere}p{margin:.6rem 0}@media(max-width:700px){table,thead,tbody,tr,th,td{display:block}thead{display:none}}</style><h1>Private catalog review</h1><p>Offline preparation only. No catalog records were imported, edited, merged or deleted.</p><p>${report.items.length} items; ${report.summary.openChecks} details to review; ${report.summary.blockedItems} items have file issues; ${report.summary.duplicateItems} possible duplicate items.</p><p>Unknown details do not prevent staging. Complete means supported by the supplied review evidence, not independently verified by this program. A file/HTML title is not a cutter classification or physical measurement.</p><table><thead><tr><th>Item</th><th>Type / change</th><th>Collection and verification queue</th><th>Issues and duplicates</th></tr></thead><tbody>${rows}</tbody></table><h2>Removed from this input</h2><p>${report.absentFromInput.map(escape).join(', ')||'None'}. No deletion is proposed.</p></html>`;
}
export function stageCatalog(manifestFile,sourceFolder,output,baselineFile){
  const destination=privateOutput(output),root=fs.realpathSync(sourceFolder);
  if(!fs.statSync(root).isDirectory())throw Error('Source folder must exist.');
  if(destination===root||destination.startsWith(root+path.sep))throw Error('Keep preparation output outside the source folder.');
  regular(manifestFile);if(fs.statSync(manifestFile).size>16*1024**2)throw Error('Manifest exceeds 16 MiB.');
  const manifestBytes=fs.readFileSync(manifestFile);
  const manifest=validateManifest(JSON.parse(manifestBytes.toString('utf8')));
  const baseline=baselineFile?parseJson(baselineFile):null;
  if(baseline&&(baseline.format!=='cookie-catalog-staging-report'||baseline.version!==1||baseline.sourceNamespace!==manifest.sourceNamespace||!Array.isArray(baseline.items)||baseline.items.some(i=>!i||typeof i.id!=='string'||typeof i.fingerprint!=='string')||new Set(baseline.items.map(i=>i.id)).size!==baseline.items.length))throw Error('Baseline must be a prior report from the same namespace.');
  const previous=new Map((baseline?.items??[]).map(i=>[i.id,i.fingerprint]));
  const copies=new Map();let totalBytes=0;
  const items=manifest.items.map(raw=>{
    const id='stage_'+sha(manifest.sourceNamespace+'\0'+raw.sourceKey).slice(0,32),issues=[],files=[];
    for(const entry of raw.files??[]){
      try{
        const source=fileInside(root,entry.path);
        if(fs.statSync(source).size>100*1024**2)throw Error('Single source file exceeds the 100 MiB offline preparation limit.');
        const info=digest(source);
        if(entry.sha256&&entry.sha256!==info.sha256)throw Error('Declared file checksum differs.');
        const stored='originals/'+info.sha256;
        if(!copies.has(stored)){totalBytes+=info.bytes;if(totalBytes>1024**3)throw Error('Offline source set exceeds 1 GiB.');copies.set(stored,source);}
        files.push({...entry,...info,stored});
        if(info.bytes>25*1024**2&&entry.purpose!=='source_page')issues.push('File exceeds the current live 25 MiB upload limit: '+entry.path);
      }catch(error){if(error.message==='Offline source set exceeds 1 GiB.')throw error;issues.push(entry.path+': '+error.message);}
    }
    const facts={...raw.facts,source:raw.facts?.source||[raw.source.pageId,raw.source.sectionPath].filter(Boolean).join(' / '),
      photo:files.some(f=>['cutter_photo','design_photo','scale_photo'].includes(f.purpose)),scalePhoto:files.some(f=>f.purpose==='scale_photo'),original:files.some(f=>f.purpose==='printable_original')};
    const item={id,kind:raw.kind,name:raw.name,facts,reviews:raw.reviews};
    for(const [field,review]of Object.entries(raw.reviews??{})){
      if(review.state==='complete'&&readiness(item).checks.find(c=>c.field===field)?.state!=='complete')issues.push('Unsupported complete claim for '+field+'; provide the value/file and correct evidence method.');
    }
    const result=readiness(item);
    const fingerprint=sha(JSON.stringify({raw,files:files.map(f=>({path:f.path,sha256:f.sha256,bytes:f.bytes}))}));
    return {...item,sourceKey:raw.sourceKey,source:raw.source,files,...result,issues,fingerprint,change:previous.has(id)?previous.get(id)===fingerprint?'unchanged':'changed':'new',duplicateCandidates:[]};
  });
  const names=new Map(),hashes=new Map();
  for(const item of items){
    const name=item.name.normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();if(!names.has(name))names.set(name,[]);names.get(name).push(item.id);
    for(const f of item.files.filter(f=>f.purpose!=='source_page')){if(!hashes.has(f.sha256))hashes.set(f.sha256,new Set());hashes.get(f.sha256).add(item.id);}
  }
  for(const item of items){const ids=new Set(names.get(item.name.normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim()));for(const f of item.files.filter(f=>f.purpose!=='source_page'))for(const id of hashes.get(f.sha256))ids.add(id);ids.delete(item.id);item.duplicateCandidates=[...ids].sort();}
  const report={format:'cookie-catalog-staging-report',version:1,sourceNamespace:manifest.sourceNamespace,manifestSha256:sha(manifestBytes),mode:'offline-review-only',liveWrites:false,createdAt:new Date().toISOString(),
    summary:{items:items.length,openChecks:items.reduce((n,i)=>n+i.openCount,0),blockedItems:items.filter(i=>i.issues.length).length,duplicateItems:items.filter(i=>i.duplicateCandidates.length).length,uniqueSourceFiles:copies.size,sourceBytes:totalBytes},items,absentFromInput:[...previous.keys()].filter(id=>!items.some(i=>i.id===id))};
  const reportJson=JSON.stringify(report,null,2)+'\n';
  if(Buffer.byteLength(reportJson)>16*1024**2)throw Error('Review report exceeds 16 MiB; split the input into stable smaller batches.');
  fs.mkdirSync(destination,{mode:0o700});
  try{
    fs.mkdirSync(path.join(destination,'originals'),{mode:0o700});
    for(const [stored,source]of copies){const target=path.join(destination,stored);fs.copyFileSync(source,target,fs.constants.COPYFILE_EXCL);if(digest(target).sha256!==path.basename(stored))throw Error('Copied source checksum mismatch.');}
    fs.copyFileSync(manifestFile,path.join(destination,'input-manifest.json'),fs.constants.COPYFILE_EXCL);
    if(digest(path.join(destination,'input-manifest.json')).sha256!==report.manifestSha256)throw Error('Manifest changed while preparing.');
    fs.writeFileSync(path.join(destination,'review.json'),reportJson,{flag:'wx',mode:0o600});
    fs.writeFileSync(path.join(destination,'review.html'),renderReport(report),{flag:'wx',mode:0o600});
    return {mode:report.mode,liveWrites:false,output:destination,summary:report.summary};
  }catch(error){fs.rmSync(destination,{recursive:true,force:true});throw error;}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  try{const [manifest,source,output,baseline,...extra]=process.argv.slice(2);if(!output||extra.length)throw Error('Usage: node tools/stage-catalog.mjs MANIFEST SOURCE_FOLDER NEW_PRIVATE_OUTPUT [PRIOR_REVIEW_JSON]');console.log(JSON.stringify(stageCatalog(manifest,source,output,baseline),null,2));}
  catch(error){console.error('Catalog preparation failed: '+error.message);process.exitCode=1;}
}
