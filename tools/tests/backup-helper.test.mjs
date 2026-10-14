import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {validateArchive,saveBackup,verifyCloudCopy,reviewRetention,fileHash} from '../backup-helper.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
function fixture() {
  const dir=fs.mkdtempSync(path.join(tmpdir(),'cookie-helper-'));
  const archive=path.join(dir,'trusted synthetic 雪.tar'),destination=path.join(dir,'OneDrive backups 雪');
  fs.mkdirSync(destination);
  execFileSync('python3',['-c',"import sys; from pathlib import Path; sys.path.insert(0,sys.argv[1]); from test_cloudflare_restore import fixture; fixture(Path(sys.argv[2]))",path.join(root,'tests'),archive]);
  return {dir,archive,destination,cleanup:()=>fs.rmSync(dir,{recursive:true,force:true})};
}
test('validates linked archive and copies to Unicode/space paths with an honest receipt',()=>{
  const f=fixture();try{
    const report=validateArchive(f.archive);assert.equal(report.tables,16);assert.equal(report.objects,1);assert.equal(report.integrity,'ok');
    const saved=saveBackup(f.archive,f.destination);
    assert.equal(fileHash(saved.savedFile),fileHash(f.archive));assert.equal(saved.cloudCopy,'pending');
    assert.equal(JSON.parse(fs.readFileSync(saved.receipt)).validation.sha256,report.sha256);
    assert.deepEqual(saved.retention.candidatesForManualReview,[]);
    const duplicate=saveBackup(f.archive,f.destination);
    assert.notEqual(saved.savedFile,duplicate.savedFile);assert.ok(fs.existsSync(saved.savedFile));
  }finally{f.cleanup();}
});
test('truncation, trailing data and changed original bytes fail without creating backups',()=>{
  const f=fixture();try{
    const raw=fs.readFileSync(f.archive);
    const changed=Buffer.from(raw); const marker=changed.indexOf(Buffer.from('synthetic original'));assert.ok(marker>0);changed[marker]^=1;
    for(const value of [raw.subarray(0,raw.length-512),Buffer.concat([raw,Buffer.alloc(512)]),changed]) {
      const bad=path.join(f.dir,'bad.tar');fs.writeFileSync(bad,value);
      assert.throws(()=>saveBackup(bad,f.destination));assert.deepEqual(fs.readdirSync(f.destination),[]);
    }
  }finally{f.cleanup();}
});
test('rejects missing/unavailable folders, git destinations and links while preserving existing data',()=>{
  const f=fixture();try{
    assert.throws(()=>saveBackup(f.archive,path.join(f.dir,'absent')));
    fs.writeFileSync(path.join(f.destination,'keep.txt'),'preserve');fs.mkdirSync(path.join(f.destination,'.git'));
    assert.throws(()=>saveBackup(f.archive,f.destination),/git checkouts/);
    assert.equal(fs.readFileSync(path.join(f.destination,'keep.txt'),'utf8'),'preserve');
    const link=path.join(f.dir,'link.tar');fs.symlinkSync(f.archive,link);assert.throws(()=>validateArchive(link),/regular file/);
  }finally{f.cleanup();}
});
test('independent cloud copy verifies bytes and cannot be substituted with the saved local backup',()=>{
  const f=fixture();try{
    const saved=saveBackup(f.archive,f.destination);
    assert.throws(()=>verifyCloudCopy(saved.receipt,saved.savedFile),/independently/);
    const download=path.join(f.dir,'cloud-return.tar');fs.copyFileSync(saved.savedFile,download);
    const verified=verifyCloudCopy(saved.receipt,download);assert.equal(verified.cloudCopyMatch,true);assert.equal(verified.providerApiVerified,false);
    const bad=fs.readFileSync(download);bad[1024]^=1;fs.writeFileSync(download,bad);
    assert.throws(()=>verifyCloudCopy(saved.receipt,download));
    assert.equal(fileHash(saved.savedFile),saved.validation.sha256);
  }finally{f.cleanup();}
});
test('retention review protects pre-change, unverified and latest seven backups and never deletes',()=>{
  const f=fixture();try{
    const saved=[];
    for(let i=0;i<10;i++) {
      const r=saveBackup(f.archive,f.destination);saved.push(r);
      const data=JSON.parse(fs.readFileSync(r.receipt));data.savedAt=new Date(Date.UTC(2026,9,14,0,i)).toISOString();fs.writeFileSync(r.receipt,JSON.stringify(data));
      if(i!==0)verifyCloudCopy(r.receipt,f.archive);
    }
    const protectedBackup=saveBackup(f.archive,f.destination,'pre-change');
    const before=fs.readdirSync(f.destination).sort(),report=reviewRetention(f.destination);
    assert.equal(report.keepNormal.length,7);assert.equal(report.candidatesForManualReview.length,2);
    assert.ok(report.unverified.includes(path.basename(saved[0].savedFile)));
    assert.ok(report.protectedFiles.includes(path.basename(protectedBackup.savedFile)));
    assert.ok(!report.candidatesForManualReview.includes(path.basename(protectedBackup.savedFile)));
    assert.deepEqual(fs.readdirSync(f.destination).sort(),before);
  }finally{f.cleanup();}
});
test('changed local backup is flagged and excluded from retention candidates',()=>{
  const f=fixture();try{
    const r=saveBackup(f.archive,f.destination);fs.appendFileSync(r.savedFile,'bad');
    const report=reviewRetention(f.destination);assert.equal(report.candidatesForManualReview.length,0);assert.ok(report.unverified.includes(path.basename(r.receipt)));
  }finally{f.cleanup();}
});
test('missing migration bookkeeping is rejected before any private copy is created',()=>{
  const f=fixture();try{
    execFileSync('python3',['-c',"import sys; from pathlib import Path; sys.path.insert(0,sys.argv[1]); from test_cloudflare_restore import fixture; fixture(Path(sys.argv[2]),missing_migration=True)",path.join(root,'tests'),f.archive]);
    assert.throws(()=>saveBackup(f.archive,f.destination),/migrations/);
    assert.deepEqual(fs.readdirSync(f.destination),[]);
  }finally{f.cleanup();}
});
test('unreceipted TARs remain untouched and are reported as unverified',()=>{
  const f=fixture();try{
    fs.copyFileSync(f.archive,path.join(f.destination,'older-unverified.tar'));
    const report=reviewRetention(f.destination);
    assert.deepEqual(report.unverified,['older-unverified.tar']);assert.deepEqual(report.candidatesForManualReview,[]);
    assert.equal(fs.readdirSync(f.destination).length,1);
  }finally{f.cleanup();}
});
