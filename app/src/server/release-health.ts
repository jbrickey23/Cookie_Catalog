/** Machine-only, read-only binding checks. No catalog rows or originals exported;
 * this is not independent backup/recovery evidence. */
export async function releaseHealth(db:D1Database,files:R2Bucket){
 try{
  const [tables,foreign]=await db.batch([db.prepare("SELECT name FROM sqlite_schema WHERE type='table' AND name IN ('shapes','designs','physical_cutters','attachments')"),db.prepare('PRAGMA foreign_key_check')]);
  if(!tables.success||tables.results.length!==4||!foreign.success||foreign.results.length)return false;
  await files.list({prefix:'catalog-release/control/',limit:1});return true;
 }catch{return false;}
}
