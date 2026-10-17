/** Stable installed entry point. Resolves all managed paths from this file. */
import * as fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const toolRoot=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(toolRoot,'../..');
try{
  const current=JSON.parse(fs.readFileSync(path.join(toolRoot,'current.json'),'utf8'));
  if(!/^[a-f0-9]{64}$/.test(current.version)||!current.files||typeof current.files!=='object')throw Error('Invalid installed tool version. Run Refresh Backup Tools.');
  const directory=path.join(toolRoot,'versions',current.version);
  for(const [name,checksum] of Object.entries(current.files)){
    if(!['backup-helper.mjs','backup-kit.mjs','archive-format.mts'].includes(name)||!/^[a-f0-9]{64}$/.test(checksum))throw Error('Invalid installed tool file.');
    const file=path.join(directory,name);if(fs.lstatSync(file).isSymbolicLink()||createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==checksum)throw Error('Installed tools changed. Refresh the tools before backing up.');
  }
  if(Object.keys(current.files).length!==3)throw Error('Installed tool files are incomplete.');
  const {runBackupKit,settingsFor}=await import(pathToFileURL(path.join(directory,'backup-kit.mjs')).href);
  const [mode='normal',input]=process.argv.slice(2);
  if(['open-inbox','open-backups'].includes(mode)){
    const settings=settingsFor(root),folder=mode==='open-inbox'?settings.inbox:settings.backups;
    if(process.platform==='win32'){const opened=spawnSync('explorer.exe',[folder],{stdio:'ignore'});if(opened.error)throw opened.error;}
    console.log(folder);
  }else{
  const result=await runBackupKit({root,mode,input:input||undefined});
  if(mode==='review')console.log(JSON.stringify(result,null,2));
  else if(mode==='verify-cloud')console.log('The supplied cloud download matches the saved backup.\nReceipt: '+result.receipt+'\nThis checks bytes; OneDrive provenance is supplied by you, not a provider API.');
  else console.log(`${result.reused?'Already saved; existing copy verified. No duplicate created.':'Backup saved and locally verified.'}\nExported: ${result.validation.exportedAt}\nTables: ${result.validation.tables}; originals: ${result.validation.objects}\n${mode==='pre-change'?'Protected pre-change copy':'Normal backup'}: ${result.savedFile}\nReceipt: ${result.receipt}\nOneDrive cloud-copy verification remains separate. Sources and older backups were preserved.`);
  }
}catch(error){console.error('Cookie Catalog backup: '+error.message);process.exitCode=1;}
