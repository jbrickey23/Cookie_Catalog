export async function hasSourceMappings(db:D1Database):Promise<boolean> {
  return !!await db.prepare("SELECT name FROM sqlite_schema WHERE type='table' AND name='catalog_source_mappings'").first();
}
export function sourceEvidenceSql(available:boolean,alias='c'):string {
  return available?`(SELECT json_group_array(json(m.item_json)) FROM catalog_source_mappings m WHERE m.physical_id=${alias}.id)` : "'[]'";
}
export function sourceSectionSql(available:boolean,alias='c'):string {
  return available?`(SELECT group_concat(replace(replace(replace(COALESCE(NULLIF(trim(json_extract(m.item_json,'$.facts.location')),''),json_extract(m.item_json,'$.source.sectionPath')),'#',''),'-',' '),'  ',' '),' / ') FROM catalog_source_mappings m WHERE m.physical_id=${alias}.id)`:'NULL';
}
