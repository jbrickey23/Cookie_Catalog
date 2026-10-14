import {BACKUP_TABLES} from "./development-backup";
import {buildInformation} from "./build-information";
export async function inspectInfrastructure(database:D1Database,files:R2Bucket) {
  const [tables,migrations,relationships,counts,attachments]=await database.batch<Record<string,unknown>>([
    database.prepare("SELECT name FROM sqlite_schema WHERE type='table' AND substr(name,1,7)!='sqlite_' AND substr(name,1,4)!='_cf_' ORDER BY name"),
    database.prepare("SELECT name FROM d1_migrations ORDER BY id"),
    database.prepare("PRAGMA foreign_key_check"),
    database.prepare("SELECT (SELECT COUNT(*) FROM shapes) AS shapes,(SELECT COUNT(*) FROM designs) AS designs,(SELECT COUNT(*) FROM physical_cutters) AS physicalCutters,(SELECT COUNT(*) FROM design_shape_links) AS mappings"),
    database.prepare("SELECT storage_key,byte_size FROM attachments ORDER BY id LIMIT 5")
  ]);
  if([tables,migrations,relationships,counts,attachments].some(result=>!result.success))throw Error("Database verification query failed");
  const names=tables.results.map(row=>String(row.name)),applied=migrations.results.map(row=>String(row.name));
  const missingTables=BACKUP_TABLES.filter(name=>!names.includes(name));
  const requiredMigrations=["0001_initial.sql","0002_variants_components.sql"];
  const listing=await files.list({limit:100});
  let missingOriginals=0,sizeMismatches=0;
  for(const row of attachments.results){
    if(typeof row.storage_key!=="string"||!/^attachments\/[a-zA-Z0-9_-]{8,128}\/(original|thumbnail)$/.test(row.storage_key))throw Error("Invalid attachment metadata");
    const object=await files.head(row.storage_key);
    if(!object)missingOriginals++;else if(object.size!==row.byte_size)sizeMismatches++;
  }
  const build=buildInformation();
  return {
    checkedAt:new Date().toISOString(),mode:"read-only",environment:"development",
    worker:{reachable:true,build,sourceCommitAvailable:build.commit!==null},
    database:{queryPassed:true,schemaTables:names.length,missingTables,migrations:applied,requiredMigrationsApplied:requiredMigrations.every(name=>applied.includes(name)),foreignKeyViolations:relationships.results.length,recordCounts:counts.results[0]},
    storage:{bindingReadable:true,objectsOnFirstPage:listing.objects.length,listingTruncated:listing.truncated,sampledAttachments:attachments.results.length,missingOriginals,sizeMismatches},
    checksPassed:missingTables.length===0&&requiredMigrations.every(name=>applied.includes(name))&&relationships.results.length===0&&missingOriginals===0&&sizeMismatches===0,
    limits:["Read-only binding checks do not replace create/edit/retrieve or private-file acceptance.","R2 public-access configuration requires dashboard evidence.","Build Node is the deployment build environment, not the owner's Windows PC.","Exact GitHub deployment is confirmed only after comparing the reported commit to the expected branch head."]
  };
}
