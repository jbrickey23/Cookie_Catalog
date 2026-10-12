-- Cookie_Catalog initial portable SQLite schema. No production deployment.
PRAGMA foreign_keys = ON;
CREATE TABLE shapes (id TEXT PRIMARY KEY, name TEXT NOT NULL, maker TEXT, source_url TEXT, notes TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE locations (id TEXT PRIMARY KEY, label TEXT NOT NULL UNIQUE, parent_id TEXT REFERENCES locations(id), notes TEXT);
CREATE TABLE physical_cutters (id TEXT PRIMARY KEY, shape_id TEXT NOT NULL REFERENCES shapes(id), location_id TEXT REFERENCES locations(id), width_mm REAL CHECK(width_mm > 0), height_mm REAL CHECK(height_mm > 0), quantity INTEGER NOT NULL DEFAULT 1 CHECK(quantity >= 0), origin TEXT CHECK(origin IN ('purchased','printed','unknown')), notes TEXT);
CREATE INDEX idx_physical_shape ON physical_cutters(shape_id);
CREATE TABLE designs (id TEXT PRIMARY KEY, name TEXT NOT NULL, source_url TEXT, notes TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE design_shape_links (id TEXT PRIMARY KEY, design_id TEXT NOT NULL REFERENCES designs(id), shape_id TEXT NOT NULL REFERENCES shapes(id), status TEXT NOT NULL DEFAULT 'proposed' CHECK(status IN ('proposed','tested')), use_type TEXT NOT NULL DEFAULT 'standard' CHECK(use_type IN ('standard','flip','combination')), instructions TEXT, rotation_degrees REAL, mirrored INTEGER NOT NULL DEFAULT 0 CHECK(mirrored IN (0,1)), min_width_mm REAL, max_width_mm REAL, UNIQUE(design_id,shape_id,use_type), CHECK(min_width_mm IS NULL OR min_width_mm > 0), CHECK(max_width_mm IS NULL OR max_width_mm > 0));
CREATE INDEX idx_links_shape ON design_shape_links(shape_id);
CREATE TABLE tags (id TEXT PRIMARY KEY, label TEXT NOT NULL UNIQUE, category TEXT);
CREATE TABLE design_tags (design_id TEXT NOT NULL REFERENCES designs(id) ON DELETE CASCADE, tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE, PRIMARY KEY(design_id,tag_id));
CREATE TABLE shape_tags (shape_id TEXT NOT NULL REFERENCES shapes(id) ON DELETE CASCADE, tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE, PRIMARY KEY(shape_id,tag_id));
CREATE TABLE attachments (id TEXT PRIMARY KEY, storage_key TEXT NOT NULL UNIQUE, filename TEXT NOT NULL, media_type TEXT, byte_size INTEGER CHECK(byte_size >= 0), sha256 TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE shape_attachments (shape_id TEXT NOT NULL REFERENCES shapes(id) ON DELETE CASCADE, attachment_id TEXT NOT NULL REFERENCES attachments(id), purpose TEXT NOT NULL, PRIMARY KEY(shape_id,attachment_id));
CREATE TABLE design_attachments (design_id TEXT NOT NULL REFERENCES designs(id) ON DELETE CASCADE, attachment_id TEXT NOT NULL REFERENCES attachments(id), purpose TEXT NOT NULL, PRIMARY KEY(design_id,attachment_id));
CREATE TABLE printable_assets (id TEXT PRIMARY KEY, shape_id TEXT NOT NULL REFERENCES shapes(id), attachment_id TEXT NOT NULL REFERENCES attachments(id), format TEXT NOT NULL CHECK(format IN ('stl','3mf','other')), modeled_width_mm REAL CHECK(modeled_width_mm > 0), modeled_height_mm REAL CHECK(modeled_height_mm > 0), license_notes TEXT, original_asset_id TEXT REFERENCES printable_assets(id), notes TEXT);
CREATE INDEX idx_assets_shape ON printable_assets(shape_id);
