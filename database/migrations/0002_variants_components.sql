-- Cookie_Catalog additive sizing and multi-cutter modeling (draft).
-- Apply after 0001_initial.sql. Synthetic test coverage required before production.
CREATE TABLE shape_size_variants (
 id TEXT PRIMARY KEY,
 shape_id TEXT NOT NULL REFERENCES shapes(id),
 label TEXT NOT NULL,
 target_width_mm REAL CHECK(target_width_mm > 0),
 target_height_mm REAL CHECK(target_height_mm > 0),
 notes TEXT,
 UNIQUE(shape_id,label)
);
CREATE INDEX idx_size_variants_shape ON shape_size_variants(shape_id);

-- A design can require multiple cutter shapes; each part is a distinct role.
-- Existing design_shape_links remains for simple compatibility and flips.
CREATE TABLE design_components (
 id TEXT PRIMARY KEY,
 design_id TEXT NOT NULL REFERENCES designs(id),
 shape_id TEXT NOT NULL REFERENCES shapes(id),
 component_order INTEGER NOT NULL DEFAULT 0 CHECK(component_order >= 0),
 role_label TEXT NOT NULL,
 required_count INTEGER NOT NULL DEFAULT 1 CHECK(required_count > 0),
 instructions TEXT,
 UNIQUE(design_id,component_order,role_label)
);
CREATE INDEX idx_design_components_design ON design_components(design_id);

-- Scaling is guidance only. Slicer transforms geometry in v1.
CREATE TABLE printable_size_recipes (
 id TEXT PRIMARY KEY,
 printable_asset_id TEXT NOT NULL REFERENCES printable_assets(id),
 label TEXT NOT NULL,
 target_width_mm REAL NOT NULL CHECK(target_width_mm > 0),
 target_height_mm REAL CHECK(target_height_mm > 0),
 scale_percent REAL CHECK(scale_percent > 0),
 notes TEXT,
 UNIQUE(printable_asset_id,label)
);
