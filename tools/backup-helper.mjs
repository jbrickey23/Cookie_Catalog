/** Private local backup workflow. Node 24+, no downloads, credentials or network. */
import * as fs from 'node:fs';
import path from 'node:path';
import {createHash, randomUUID} from 'node:crypto';
import {DatabaseSync, constants} from 'node:sqlite';
import {createInterface} from 'node:readline/promises';
import {pathToFileURL} from 'node:url';

const LEGACY_TABLES = ['shapes','locations','physical_cutters','designs','design_shape_links','tags','design_tags','shape_tags','attachments','shape_attachments','design_attachments','printable_assets','shape_size_variants','design_components','printable_size_recipes','d1_migrations'];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const identifier = value => {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) throw Error('Invalid SQL identifier.');
  return '"'+value+'"';
};
function regularFile(file) {
  const stat=fs.lstatSync(file);
  if(!stat.isFile() || stat.isSymbolicLink()) throw Error('Select a regular file, not a link or folder.');
  return stat;
}
function readAt(fd,offset,length) {
  const bytes=Buffer.alloc(length);
  if(fs.readSync(fd,bytes,0,length,offset)!==length) throw Error('Incomplete archive.');
  return bytes;
}
function hashRange(fd,offset,length) {
  const digest=createHash('sha256'),buffer=Buffer.alloc(1024*1024);
  while(length) {
    const size=Math.min(length,buffer.length),read=fs.readSync(fd,buffer,0,size,offset);
    if(read!==size) throw Error('File changed or is incomplete.');
    digest.update(buffer.subarray(0,read)); offset+=read; length-=read;
  }
  return digest.digest('hex');
}
export function fileHash(file) {
  const stat=regularFile(file),fd=fs.openSync(file,'r');
  try{return hashRange(fd,0,stat.size);}finally{fs.closeSync(fd);}
}
/** Validate only a trusted catalog export. Does not extract or execute model files. */
export function validateArchive(file) {
  const [major,minor]=process.versions.node.split('.').map(Number);
  if(major<24||(major===24&&minor<10))throw Error('Node 24.10 or newer is required.');
  const stat=regularFile(file);
  if(stat.size<2048 || stat.size%512 || stat.size>1024**3+18*1024**2) throw Error('Invalid archive size.');
  const fd=fs.openSync(file,'r'); let db; let offset=0;
  function member(expectedName,maxSize,expectedSize) {
    const header=readAt(fd,offset,512); offset+=512;
    const text=(start,size)=>header.subarray(start,start+size).toString('utf8').replace(/\0.*$/s,'');
    const name=text(0,100),prefix=text(345,155),full=prefix?prefix+'/'+name:name;
    const octal=text(124,12).trim(),checksum=text(148,8).trim();
    let sum=0; for(let i=0;i<512;i++)sum+=i>=148&&i<156?32:header[i];
    if(!/^[0-7]+$/.test(octal)||!/^[0-7]+$/.test(checksum)||parseInt(checksum,8)!==sum
        ||text(257,6)!=='ustar'||![0,48].includes(header[156])||full!==expectedName) throw Error('Unexpected or invalid TAR member.');
    const size=parseInt(octal,8);
    if(size>maxSize || (expectedSize!==undefined&&size!==expectedSize) || offset+size>stat.size) throw Error('Invalid TAR member size.');
    const start=offset; offset+=Math.ceil(size/512)*512;
    return {start,size};
  }
  try {
    const first=member('metadata/manifest.json',16*1024**2);
    const raw=readAt(fd,first.start,first.size),envelope=JSON.parse(raw);
    if(envelope.format!=='cookie-catalog-archive'||envelope.version!==1||typeof envelope.payloadJson!=='string'
        ||hash(Buffer.from(envelope.payloadJson))!==envelope.payloadSha256||!Number.isFinite(Date.parse(envelope.exportedAt))) throw Error('Invalid archive manifest.');
    const payload=JSON.parse(envelope.payloadJson),{tables,schema}=payload.database??{};
    const reviewTables=['import_review_workspaces','import_review_versions','import_review_items','import_review_runs'];
    const importTables=["catalog_import_batches","catalog_source_mappings"];
    const TABLES=[LEGACY_TABLES,[...LEGACY_TABLES,...reviewTables],[...LEGACY_TABLES,...reviewTables,...importTables]].find(profile=>tables&&same(Object.keys(tables).sort(),[...profile].sort()));
    if(payload.environment!=='development'||!TABLES||!tables||!same(Object.keys(tables).sort(),[...TABLES].sort())||!Array.isArray(schema)
        ||!same(schema.filter(s=>s.type==='table').map(s=>s.name).sort(),[...TABLES].sort())
        ||schema.some(s=>!['table','index'].includes(s.type)||!TABLES.includes(s.tbl_name))) throw Error('Unexpected database schema.');
    const objects=payload.objects;
    if(!Array.isArray(objects)||objects.length>1000||!Array.isArray(tables.attachments)) throw Error('Invalid originals list.');
    const attachments=new Map(tables.attachments.map(row=>[row.storage_key,row]));
    if(attachments.size!==tables.attachments.length||attachments.size!==objects.length) throw Error('Original registrations differ.');
    const seen=new Set(); let originalBytes=0;
    for(const object of objects) {
      const row=attachments.get(object.key);
      if(!/^[A-Za-z0-9_-]{8,128}$/.test(object.attachmentId)||object.key!=='attachments/'+object.attachmentId+'/original'
          ||seen.has(object.key)||!row||row.id!==object.attachmentId||!Number.isSafeInteger(object.byteSize)
          ||object.byteSize<0||object.byteSize>25*1024**2||row.byte_size!==object.byteSize||!/^([a-f0-9]{64})$/.test(object.sha256)
          ||typeof row.sha256!=='string'||row.sha256.toLowerCase()!==object.sha256) throw Error('Invalid original descriptor.');
      seen.add(object.key); originalBytes+=object.byteSize;
    }
    if(originalBytes>1024**3)throw Error('Original byte limit exceeded.');
    db=new DatabaseSync(':memory:');
    db.exec('PRAGMA foreign_keys=ON; BEGIN; PRAGMA defer_foreign_keys=ON;');
    // Schema SQL is untrusted input even in a trusted export: confine it to memory.
    const forbidden=new Set(Object.entries(constants).filter(([name])=>/^SQLITE_(ATTACH|DETACH|ALTER_|DROP_|CREATE_TEMP_|CREATE_TRIGGER|CREATE_VIEW|CREATE_VTABLE|PRAGMA|TRANSACTION|FUNCTION)/.test(name)).map(([,value])=>value));
    // These two pure built-ins enforce the bounded JSON review constraints.
    // File access, extensions, arbitrary functions and all other denied actions stay denied.
    db.setAuthorizer((action,arg1,arg2)=>action===constants.SQLITE_FUNCTION&&['json_valid','length'].includes(String(arg2).toLowerCase())
      ?constants.SQLITE_OK:forbidden.has(action)?constants.SQLITE_DENY:constants.SQLITE_OK);
    for(const kind of ['table','index'])for(const item of schema)if(item.type===kind&&item.sql) {
      if(typeof item.sql!=='string'||!(new RegExp('^CREATE\\s+(?:UNIQUE\\s+)?'+kind+'\\b','i')).test(item.sql)) throw Error('Unsupported schema SQL.');
      db.exec(item.sql);
    }
    db.setAuthorizer(null);
    const counts={};
    for(const table of TABLES) {
      const rows=tables[table];
      if(!Array.isArray(rows)||rows.length>10000)throw Error('Record limit exceeded.');
      for(const row of rows) {
        if(!row||Array.isArray(row)||typeof row!=='object'||!Object.keys(row).length)throw Error('Invalid record.');
        const columns=Object.keys(row),values=Object.values(row);
        if(values.some(v=>v!==null&&typeof v!=='string'&&(typeof v!=='number'||!Number.isFinite(v))))throw Error('Invalid record value.');
        db.prepare('INSERT INTO '+identifier(table)+' ('+columns.map(identifier).join(',')+') VALUES ('+columns.map(()=>'?').join(',')+')').run(...values);
      }
      counts[table]=db.prepare('SELECT COUNT(*) AS n FROM '+identifier(table)).get().n;
      if(counts[table]!==rows.length)throw Error('Record count mismatch.');
    }
    const actualTables=db.prepare("SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map(r=>r.name).sort();
    if(!same(actualTables,[...TABLES].sort())||db.prepare('PRAGMA foreign_key_check').all().length
        ||Object.values(db.prepare('PRAGMA integrity_check').get())[0]!=='ok')throw Error('Database integrity or relationships failed.');
    const migrations=db.prepare('SELECT name FROM d1_migrations ORDER BY name').all().map(r=>r.name);
    if(!same(migrations,['0001_initial.sql','0002_variants_components.sql',...(TABLES.includes("import_review_runs")?['0003_import_reviews.sql']:[]),...(TABLES.includes('catalog_source_mappings')?['0004_catalog_imports.sql']:[])]))throw Error('Known migrations missing or unexpected.');
    db.exec('COMMIT');
    for(const object of objects) {
      const part=member('objects/'+object.key,25*1024**2,object.byteSize);
      if(hashRange(fd,part.start,part.size)!==object.sha256)throw Error('Original checksum mismatch.');
    }
    const final=member('metadata/complete.json',1024),receipt=JSON.parse(readAt(fd,final.start,final.size));
    if(receipt.manifestSha256!==hash(raw)||receipt.objects!==objects.length||receipt.originalBytes!==originalBytes
        ||Object.keys(receipt).length!==3||offset+1024!==stat.size||readAt(fd,offset,1024).some(b=>b!==0))throw Error('Archive completion receipt or footer failed.');
    const sha256=hashRange(fd,0,stat.size),after=fs.fstatSync(fd);
    if(after.size!==stat.size||after.mtimeMs!==stat.mtimeMs)throw Error('Archive changed during validation.');
    return {bytes:stat.size,sha256,exportedAt:envelope.exportedAt,tables:TABLES.length,records:Object.values(counts).reduce((a,b)=>a+b,0),counts,objects:objects.length,originalBytes,integrity:'ok',foreignKeysValid:true,complete:true};
  } finally {db?.close();fs.closeSync(fd);}
}
function privateDirectory(folder) {
  const resolved=fs.realpathSync(folder);
  if(!fs.statSync(resolved).isDirectory())throw Error('Backup destination must be an existing private folder.');
  for(let parent=resolved;;parent=path.dirname(parent)) {
    if(fs.existsSync(path.join(parent,'.git')))throw Error('Backup destination must be outside git checkouts.');
    if(path.dirname(parent)===parent)break;
  }
  return resolved;
}
function jsonWrite(file,value) {fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600});}
export function saveBackup(archive,destination,kind='normal') {
  if(!['normal','pre-change'].includes(kind))throw Error('Choose normal or pre-change.');
  const folder=privateDirectory(destination),validation=validateArchive(archive);
  const stamp=new Date(validation.exportedAt).toISOString().replace(/[:.]/g,'-');
  const name='Cookie_Catalog_'+stamp+'_'+kind+'_'+randomUUID().slice(0,8)+'.tar';
  const target=path.join(folder,name),receiptPath=target+'.receipt.json'; let copied=false;
  try {
    fs.copyFileSync(archive,target,fs.constants.COPYFILE_EXCL);copied=true;
    const copiedValidation=validateArchive(target);
    if(copiedValidation.sha256!==validation.sha256)throw Error('Copied archive checksum differs.');
    const receipt={format:'cookie-catalog-local-backup-receipt',version:1,file:name,kind,protected:kind==='pre-change',savedAt:new Date().toISOString(),validation,cloudCopy:'pending'};
    jsonWrite(receiptPath,receipt);
    return {savedFile:target,receipt:receiptPath,validation,cloudCopy:'pending',retention:reviewRetention(folder)};
  } catch(error) {
    // Only remove this invocation's incomplete destination; never any older backup.
    if(copied&&!fs.existsSync(receiptPath))fs.unlinkSync(target);
    throw error;
  }
}
function readReceipt(file) {
  regularFile(file); const r=JSON.parse(fs.readFileSync(file,'utf8'));
  if(r.format!=='cookie-catalog-local-backup-receipt'||r.version!==1||path.basename(r.file)!==r.file
      ||!['normal','pre-change'].includes(r.kind)||!Number.isFinite(Date.parse(r.savedAt))||!r.validation?.complete
      ||!/^[a-f0-9]{64}$/.test(r.validation.sha256))throw Error('Invalid backup receipt.');
  return r;
}
export function verifyCloudCopy(receiptFile,download) {
  const receipt=readReceipt(receiptFile),local=path.join(path.dirname(receiptFile),receipt.file);
  if(fs.realpathSync(download)===fs.realpathSync(local))throw Error('Choose the independently downloaded cloud copy, not the saved backup.');
  const check=validateArchive(download);
  if(check.sha256!==receipt.validation.sha256||check.bytes!==receipt.validation.bytes||fileHash(local)!==check.sha256)throw Error('Cloud/local/receipt checksums differ.');
  // Append an immutable receipt. This proves byte identity, not a direct provider API audit.
  const result={format:'cookie-catalog-cloud-copy-receipt',version:1,file:receipt.file,sha256:check.sha256,bytes:check.bytes,
    verifiedAt:new Date().toISOString(),evidence:'owner-supplied independent cloud download',providerApiVerified:false};
  const verification=receiptFile+'.cloud-'+randomUUID().slice(0,8)+'.json';jsonWrite(verification,result);
  return {cloudCopyMatch:true,receipt:verification,providerApiVerified:false};
}
export function reviewRetention(destination) {
  const folder=privateDirectory(destination),names=fs.readdirSync(folder),normal=[],protectedFiles=[],unverified=[];
  for(const name of names.filter(n=>n.endsWith('.tar.receipt.json'))) {
    try {
      const r=readReceipt(path.join(folder,name)),file=path.join(folder,r.file);
      if(fileHash(file)!==r.validation.sha256)throw Error('Saved backup changed.');
      const cloud=names.filter(n=>n.startsWith(name+'.cloud-')&&n.endsWith('.json')).some(n=>{
        try {const c=JSON.parse(fs.readFileSync(path.join(folder,n),'utf8'));return c.format==='cookie-catalog-cloud-copy-receipt'&&c.file===r.file&&c.sha256===r.validation.sha256&&c.bytes===r.validation.bytes;}catch{return false;}
      });
      if(r.kind==='pre-change'||r.protected)protectedFiles.push(r.file);
      else normal.push({file:r.file,savedAt:r.savedAt,cloud});
      if(!cloud)unverified.push(r.file);
    }catch{unverified.push(name);}
  }
  const registered=new Set(names.filter(n=>n.endsWith('.tar.receipt.json')).map(n=>n.slice(0,-'.receipt.json'.length)));
  unverified.push(...names.filter(n=>n.endsWith('.tar')&&!registered.has(n)));
  normal.sort((a,b)=>b.savedAt.localeCompare(a.savedAt)||a.file.localeCompare(b.file));
  return {mode:'review-only',deletesNothing:true,keepLatest:7,protectedFiles,unverified,
    keepNormal:normal.slice(0,7).map(r=>r.file),candidatesForManualReview:normal.slice(7).filter(r=>r.cloud).map(r=>r.file)};
}
async function interactive() {
  const readline=createInterface({input:process.stdin,output:process.stdout});
  const ask=async text=>(await readline.question(text)).trim().replace(/^"(.*)"$/,'$1');
  try {
    console.log('Cookie Catalog backup helper. No credentials, downloads or deletions.\n1 Save a trusted TAR backup\n2 Verify a OneDrive web-downloaded copy\n3 Review retention (no deletion)');
    const choice=await ask('Choose 1, 2 or 3: ');
    if(choice==='1') {
      console.log('In the catalog site, keep edits idle and select Download small TAR archive. For archives over 32 MiB, use Save catalog archive in desktop Chrome/Edge.');
      const archive=await ask('Full path to the trusted downloaded TAR: ');
      const suggested=(process.env.OneDriveConsumer||process.env.OneDrive)?path.join(process.env.OneDriveConsumer||process.env.OneDrive,'Cookie_Catalog','Backups'):'';
      const folder=await ask('Existing private backup folder'+(suggested?' [Enter for '+suggested+']':'')+': ')||suggested;
      const kind=(await ask('Pre-change backup before import/bulk edits? [y/N]: ')).toLowerCase()==='y'?'pre-change':'normal';
      const result=saveBackup(archive,folder,kind);console.log(JSON.stringify(result,null,2));
      console.log('Local copy verified. Cloud sync is pending. Open OneDrive web, download this saved TAR independently, then run option 2. Nothing has been deleted.');
    }else if(choice==='2')console.log(JSON.stringify(verifyCloudCopy(await ask('Full path to the saved .tar.receipt.json: '),await ask('Full path to the independent OneDrive web download: ')),null,2));
    else if(choice==='3')console.log(JSON.stringify(reviewRetention(await ask('Existing private backup folder: ')),null,2));
    else throw Error('Choose 1, 2 or 3.');
  } finally {readline.close();}
}
export async function main(args=process.argv.slice(2)) {
  const [major,minor]=process.versions.node.split('.').map(Number);
  if(major<24||(major===24&&minor<10))throw Error('Node 24.10 or newer is required. No installation will be attempted.');
  const [action,...params]=args;
  if(!action)return interactive();
  if(action==='validate'&&params.length===1)return validateArchive(params[0]);
  if(action==='save'&&params.length>=2&&params.length<=3)return saveBackup(...params);
  if(action==='verify-cloud'&&params.length===2)return verifyCloudCopy(...params);
  if(action==='review'&&params.length===1)return reviewRetention(params[0]);
  throw Error('Usage: node backup-helper.mjs [validate TAR | save TAR EXISTING_PRIVATE_FOLDER [normal|pre-change] | verify-cloud RECEIPT DOWNLOADED_TAR | review PRIVATE_FOLDER]');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  main().then(result=>{if(result)console.log(JSON.stringify(result,null,2));}).catch(error=>{console.error('Backup helper failed: '+error.message);process.exitCode=1;});
}
