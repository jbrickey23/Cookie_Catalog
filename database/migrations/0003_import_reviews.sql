-- Source review snapshots only. This migration does not create catalog inventory.
-- Items are separate bounded rows so offline D1 recovery SQL remains portable.
CREATE TABLE import_review_workspaces (
 id TEXT PRIMARY KEY,
 title TEXT NOT NULL,
 source_namespace TEXT NOT NULL,
 current_revision INTEGER NOT NULL CHECK(current_revision > 0),
 save_token TEXT NOT NULL,
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL
);
CREATE TABLE import_review_versions (
 workspace_id TEXT NOT NULL REFERENCES import_review_workspaces(id),
 revision INTEGER NOT NULL CHECK(revision > 0),
 manifest_sha256 TEXT NOT NULL,
 item_count INTEGER NOT NULL CHECK(item_count >= 0 AND item_count <= 1000),
 saved_by TEXT NOT NULL,
 saved_at TEXT NOT NULL,
 PRIMARY KEY(workspace_id,revision)
);
CREATE TABLE import_review_items (
 workspace_id TEXT NOT NULL,
 revision INTEGER NOT NULL,
 source_key TEXT NOT NULL,
 position INTEGER NOT NULL CHECK(position >= 0),
 item_json TEXT NOT NULL CHECK(json_valid(item_json) AND length(CAST(item_json AS BLOB)) <= 32000),
 PRIMARY KEY(workspace_id,revision,source_key),
 UNIQUE(workspace_id,revision,position),
 FOREIGN KEY(workspace_id,revision) REFERENCES import_review_versions(workspace_id,revision)
);
CREATE TABLE import_review_runs (
 id TEXT PRIMARY KEY,
 workspace_id TEXT NOT NULL,
 revision INTEGER NOT NULL,
 manifest_sha256 TEXT NOT NULL,
 mode TEXT NOT NULL CHECK(mode = 'preview'),
 result_json TEXT NOT NULL CHECK(json_valid(result_json) AND length(CAST(result_json AS BLOB)) <= 32000),
 created_by TEXT NOT NULL,
 created_at TEXT NOT NULL,
 FOREIGN KEY(workspace_id,revision) REFERENCES import_review_versions(workspace_id,revision)
);
CREATE INDEX idx_review_runs_workspace ON import_review_runs(workspace_id,created_at);
