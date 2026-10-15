import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {buildBundle,generatedFiles} from '../build-backup-kit.mjs';
import {installKit,defaultRoot} from '../backup-kit-install-core.mjs';
import {runBackupKit,settingsFor} from '../backup-kit.mjs';
import {validateArchive} from '../backup-helper.mjs';
const repo=fileURLToPath(new URL('../../',import.meta.url));
function fixture(){
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'cookie-kit-')),root=path.join(temp,'OneDrive space 雪','Cookie_Catalog'),downloads=path.join(temp,'Downloads');
 fs.mkdirSync(root,{recursive:true});fs.mkdirSync(downloads);
 const result=installKit(buildBundle(),root),archive=path.join(downloads,'any name.backup');
 execFileSync('python3',['-c',"import sys; from pathlib import Path; sys.path.insert(0,sys.argv[1]); from test_cloudflare_restore import fixture; fixture(Path(sys.argv[2]))",path.join(repo,'tests'),archive]);
 return {temp,root,downloads,archive,result,cleanup:()=>fs.rmSync(temp,{recursive:true,force:true})};
}
test('generated installer/checksum are reproducible and self-contained, with no manual extraction',()=>{
 const generated=generatedFiles();for(const [name,content]of Object.entries(generated))assert.equal(fs.readFileSync(path.join(repo,'tools',name),'utf8'),content);
 const release=JSON.parse(generated['backup-kit-release.json']);assert.equal(createHash('sha256').update(generated['backup-kit-installer.mjs']).digest('hex'),release.sha256);
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'cookie-installer-'));try{
  const output=JSON.parse(execFileSync(process.execPath,[path.join(repo,'tools/backup-kit-installer.mjs'),'--root',temp,'--json'],{cwd:os.tmpdir(),encoding:'utf8'}));
  assert.equal(output.root,temp);assert.ok(fs.existsSync(path.join(temp,'Pre-Change-Backup.cmd')));
  assert.equal(spawnSync(process.execPath,[path.join(repo,'tools/backup-kit-installer.mjs'),'--unexpected'],{encoding:'utf8'}).status,1);
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
test('setup/refresh preserve settings, input, existing backups and earlier tool versions',()=>{
 const f=fixture();try{
  const settings=path.join(f.root,'Tools/Backup/settings.json'),custom=JSON.parse(fs.readFileSync(settings));custom.downloadsFallback=false;fs.writeFileSync(settings,JSON.stringify(custom));
  const exact=fs.readFileSync(settings);fs.writeFileSync(path.join(f.root,'Backups','keep.bin'),'preserve backup');fs.writeFileSync(path.join(f.root,'Backups/Inbox','keep.input'),'preserve input');
  const bundle=buildBundle();bundle.assets['backup-kit.mjs']+='\n// synthetic update\n';const updated=installKit(bundle,f.root);
  assert.notEqual(updated.version,f.result.version);assert.deepEqual(fs.readFileSync(settings),exact);
  assert.equal(fs.readFileSync(path.join(f.root,'Backups/keep.bin'),'utf8'),'preserve backup');assert.equal(fs.readFileSync(path.join(f.root,'Backups/Inbox/keep.input'),'utf8'),'preserve input');
  assert.ok(fs.existsSync(path.join(f.root,'Tools/Backup/versions',f.result.version)));assert.equal(installKit(bundle,f.root).version,updated.version);
 }finally{f.cleanup();}
});
test('conflicting files, tampered versions, links and repository installs are preserved',()=>{
 const f=fixture();try{
  const launcher=path.join(f.root,'Backup.cmd');fs.writeFileSync(launcher,'custom user file');const before=fs.readFileSync(path.join(f.root,'Tools/Backup/current.json'));
  assert.throws(()=>installKit(buildBundle(),f.root),/preserved/);assert.equal(fs.readFileSync(launcher,'utf8'),'custom user file');assert.deepEqual(fs.readFileSync(path.join(f.root,'Tools/Backup/current.json')),before);
  fs.mkdirSync(path.join(f.temp,'.git'));assert.throws(()=>installKit(buildBundle(),f.root),/Git repositories/);fs.rmdirSync(path.join(f.temp,'.git'));
  fs.writeFileSync(launcher,buildBundle().managed['Backup.cmd']);
  const asset=path.join(f.root,'Tools/Backup/versions',f.result.version,'backup-helper.mjs');fs.appendFileSync(asset,'tampered');assert.throws(()=>installKit(buildBundle(),f.root),/version changed/);
  const link=path.join(f.temp,'linked-root');fs.symlinkSync(f.root,link);assert.throws(()=>installKit(buildBundle(),link),/links/);
 }finally{f.cleanup();}
});
test('renamed TARs save from inbox, repeat without duplicates and keep source bytes untouched',async()=>{
 const f=fixture();try{
  const source=path.join(f.root,'Backups/Inbox','not a special filename.dat');fs.copyFileSync(f.archive,source);const original=fs.readFileSync(source);
  const saved=await runBackupKit({root:f.root,mode:'pre-change',downloads:f.downloads});assert.equal(saved.input,source);assert.equal(saved.validation.tables,16);assert.equal(saved.reused,false);
  const repeated=await runBackupKit({root:f.root,mode:'pre-change',downloads:f.downloads});assert.equal(repeated.reused,true);assert.equal(repeated.savedFile,saved.savedFile);
  assert.deepEqual(fs.readFileSync(source),original);assert.equal(JSON.parse(fs.readFileSync(saved.receipt)).protected,true);
  const review=await runBackupKit({root:f.root,mode:'review'});assert.ok(review.protectedFiles.includes(path.basename(saved.savedFile)));
 }finally{f.cleanup();}
});
test('empty inbox finds ordinary Downloads or an existing unreceipted Backups export',async()=>{
 const f=fixture();try{
  const first=await runBackupKit({root:f.root,downloads:f.downloads});assert.equal(first.input,f.archive);
  fs.unlinkSync(f.archive);const original=path.join(f.root,'Backups','fresh-export.tar');fs.copyFileSync(first.savedFile,original);
  const saved=await runBackupKit({root:f.root,mode:'pre-change',downloads:f.downloads});assert.equal(saved.input,original);assert.equal(saved.validation.sha256,first.validation.sha256);
 }finally{f.cleanup();}
});
test('unsupported/partial newest inbox input stops instead of silently saving an older archive',async()=>{
 const f=fixture();try{
  const input=path.join(f.root,'Backups/Inbox','source-pdfs.zip');fs.writeFileSync(input,'PK source PDF export');
  await assert.rejects(runBackupKit({root:f.root,downloads:f.downloads}),/not a complete catalog backup/);
  assert.equal(fs.readdirSync(path.join(f.root,'Backups')).filter(n=>n.endsWith('.receipt.json')).length,0);
  fs.unlinkSync(input);fs.symlinkSync(f.archive,input);await assert.rejects(runBackupKit({root:f.root,downloads:f.downloads}),/not a link/);
 }finally{f.cleanup();}
});
test('complete extracted TAR folders are rebuilt and verified; missing/extra/changed files fail',async()=>{
 const f=fixture();try{
  const folder=path.join(f.root,'Backups/Inbox','already extracted');fs.mkdirSync(folder);
  execFileSync('python3',['-c',"import tarfile,sys; tarfile.open(sys.argv[1]).extractall(sys.argv[2],filter='data')",f.archive,folder]);
  const saved=await runBackupKit({root:f.root,mode:'pre-change',downloads:f.downloads});assert.equal(saved.inputFormat,'folder');assert.equal(saved.validation.tables,16);assert.equal(validateArchive(saved.savedFile).objects,1);
  fs.writeFileSync(path.join(folder,'unexpected.txt'),'not registered');await assert.rejects(runBackupKit({root:f.root,downloads:f.downloads}),/extra files/);fs.unlinkSync(path.join(folder,'unexpected.txt'));
  const original=path.join(folder,'objects/attachments/file_test_01/original');fs.writeFileSync(original,'changed');await assert.rejects(runBackupKit({root:f.root,downloads:f.downloads}),/size mismatch|checksum/);
  fs.unlinkSync(path.join(folder,'metadata/complete.json'));await assert.rejects(runBackupKit({root:f.root,downloads:f.downloads}));
 }finally{f.cleanup();}
});
test('small JSON development backups are converted without Python at runtime and keep exact originals',async()=>{
 const f=fixture();try{
  const file=path.join(f.root,'Backups/Inbox','new backup.json');
  execFileSync('python3',['-c',"import sys,tarfile,json,hashlib,base64; a=tarfile.open(sys.argv[1]); e=json.load(a.extractfile('metadata/manifest.json')); p=json.loads(e['payloadJson']); [(o.update(base64=base64.b64encode(a.extractfile('objects/'+o['key']).read()).decode())) for o in p['objects']]; raw=json.dumps(p); json.dump(dict(format='cookie-catalog-development-backup',version=1,exportedAt=e['exportedAt'],payloadJson=raw,payloadSha256=hashlib.sha256(raw.encode()).hexdigest()),open(sys.argv[2],'w'))",f.archive,file]);
  const bytes=fs.readFileSync(file),saved=await runBackupKit({root:f.root,downloads:f.downloads});assert.equal(saved.inputFormat,'json');assert.equal(saved.validation.objects,1);assert.deepEqual(fs.readFileSync(file),bytes);
  const corrupt=JSON.parse(bytes);corrupt.payloadSha256='0'.repeat(64);fs.writeFileSync(file,JSON.stringify(corrupt));await assert.rejects(runBackupKit({root:f.root,downloads:f.downloads}),/Invalid JSON/);
 }finally{f.cleanup();}
});
test('installed runner works from a different working directory and after moving the complete root',()=>{
 const f=fixture();try{
  fs.copyFileSync(f.archive,path.join(f.root,'Backups/Inbox','from app'));
  const moved=path.join(f.temp,'Moved catalog 雪');fs.renameSync(f.root,moved);
  const script=path.join(moved,'Tools/Backup/run.mjs');
  const output=execFileSync(process.execPath,[script,'pre-change'],{cwd:os.tmpdir(),encoding:'utf8'});assert.match(output,/Backup saved and locally verified/);assert.ok(output.includes(path.join(moved,'Backups')));
  const repeated=execFileSync(process.execPath,[script,'pre-change'],{cwd:f.downloads,encoding:'utf8'});assert.match(repeated,/No duplicate created/);
  for(const name of ['Backup.cmd','Pre-Change-Backup.cmd'])assert.match(fs.readFileSync(path.join(moved,name),'utf8'),/%~dp0Tools\\Backup\\run.mjs/);
  const refresh=fs.readFileSync(path.join(moved,'Refresh-Backup-Tools.cmd'),'utf8');assert.doesNotMatch(refresh,/-ExecutionPolicy|EncodedCommand|npm|wrangler/i);assert.match(refresh,/Get-FileHash/);
 }finally{f.cleanup();}
});
test('relative settings and personal OneDrive detection avoid current-directory and user-name assumptions',()=>{
 const f=fixture();try{
  assert.equal(defaultRoot({OneDriveConsumer:path.dirname(f.root)},'/not-this-user'),f.root);
  const settings=path.join(f.root,'Tools/Backup/settings.json'),value=JSON.parse(fs.readFileSync(settings));value.inbox='../outside';fs.writeFileSync(settings,JSON.stringify(value));
  assert.throws(()=>settingsFor(f.root),/relative/);assert.throws(()=>installKit(buildBundle(),f.root),/relative/);
 }finally{f.cleanup();}
});
test('folder launchers follow preserved relative settings, and broken launcher links are not overwritten',()=>{
 const f=fixture();try{
  const settings=path.join(f.root,'Tools/Backup/settings.json'),value=JSON.parse(fs.readFileSync(settings));value.inbox='Backups/New Inbox';fs.writeFileSync(settings,JSON.stringify(value));
  const next=installKit(buildBundle(),f.root);assert.equal(next.inbox,path.join(f.root,'Backups/New Inbox'));
  if(process.platform!=='win32')assert.equal(execFileSync(process.execPath,[path.join(f.root,'Tools/Backup/run.mjs'),'open-inbox'],{cwd:f.downloads,encoding:'utf8'}).trim(),next.inbox);
  const launcher=path.join(f.root,'Open-Backup-Inbox.cmd');fs.unlinkSync(launcher);fs.symlinkSync(path.join(f.temp,'does-not-exist'),launcher);
  assert.throws(()=>installKit(buildBundle(),f.root),/links/);assert.equal(fs.lstatSync(launcher).isSymbolicLink(),true);
 }finally{f.cleanup();}
});
test('cloud-copy drag/drop finds the matching receipt and refuses the saved original or absent input',async()=>{
 const f=fixture();try{
  const saved=await runBackupKit({root:f.root,mode:'pre-change',downloads:f.downloads});
  await assert.rejects(runBackupKit({root:f.root,mode:'verify-cloud',downloads:f.downloads}),/drag that downloaded TAR/);
  await assert.rejects(runBackupKit({root:f.root,mode:'verify-cloud',input:saved.savedFile}),/independently/);
  const supplied=path.join(f.downloads,'independent web download.tar');fs.copyFileSync(saved.savedFile,supplied);
  const result=await runBackupKit({root:f.root,mode:'verify-cloud',input:supplied});assert.equal(result.cloudCopyMatch,true);assert.equal(result.providerApiVerified,false);assert.ok(fs.existsSync(result.receipt));
 }finally{f.cleanup();}
});
