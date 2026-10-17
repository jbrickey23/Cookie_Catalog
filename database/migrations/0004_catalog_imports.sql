-- Additive import audit and source identity. Existing inventory is preserved.
ALTER TABLE physical_cutters ADD COLUMN reference_size_mm REAL CHECK(reference_size_mm>0 AND reference_size_mm<=10000);
ALTER TABLE physical_cutters ADD COLUMN slot TEXT;
CREATE TABLE catalog_import_batches (
 id TEXT PRIMARY KEY,
 workspace_id TEXT NOT NULL,
 revision INTEGER NOT NULL,
 request_sha256 TEXT NOT NULL,
 plan_sha256 TEXT NOT NULL,
 backup_reference TEXT NOT NULL,
 created_by TEXT NOT NULL,
 created_at TEXT NOT NULL,
 safety_check INTEGER NOT NULL CHECK(safety_check=1),
 result_json TEXT NOT NULL CHECK(json_valid(result_json) AND length(CAST(result_json AS BLOB))<=32000),
 FOREIGN KEY(workspace_id,revision) REFERENCES import_review_versions(workspace_id,revision)
);
CREATE TABLE catalog_source_mappings (
 source_namespace TEXT NOT NULL,
 source_key TEXT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('physical_cutter','design')),
 workspace_id TEXT NOT NULL,
 revision INTEGER NOT NULL,
 item_sha256 TEXT NOT NULL,
 item_json TEXT NOT NULL CHECK(json_valid(item_json) AND length(CAST(item_json AS BLOB))<=32000),
 decision_json TEXT NOT NULL CHECK(json_valid(decision_json) AND length(CAST(decision_json AS BLOB))<=4000),
 batch_id TEXT NOT NULL REFERENCES catalog_import_batches(id),
 shape_id TEXT REFERENCES shapes(id),
 physical_id TEXT REFERENCES physical_cutters(id),
 design_id TEXT REFERENCES designs(id),
 PRIMARY KEY(source_namespace,source_key),
 FOREIGN KEY(workspace_id,revision) REFERENCES import_review_versions(workspace_id,revision),
 CHECK((kind='physical_cutter' AND shape_id IS NOT NULL AND physical_id IS NOT NULL AND design_id IS NULL)
    OR (kind='design' AND design_id IS NOT NULL AND shape_id IS NULL AND physical_id IS NULL))
);
CREATE INDEX idx_source_mapping_physical ON catalog_source_mappings(physical_id);
CREATE INDEX idx_source_mapping_design ON catalog_source_mappings(design_id);
