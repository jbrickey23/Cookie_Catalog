"""Real SQLite execution for the TypeScript exporter integration test; synthetic data only."""
import hashlib
import json
from pathlib import Path
import sqlite3
import sys

root = Path(__file__).resolve().parents[1]
connection = sqlite3.connect(":memory:")
connection.row_factory = sqlite3.Row
for path in sorted((root / "database/migrations").glob("*.sql")):
    connection.executescript(path.read_text())
connection.execute("CREATE TABLE d1_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)")
for i, name in enumerate(("0001_initial.sql", "0002_variants_components.sql"), 1):
    connection.execute("INSERT INTO d1_migrations (id,name) VALUES (?,?)", (i, name))
connection.execute("INSERT INTO shapes (id,name) VALUES ('shape_backup_tree','DEMO Evergreen tree')")
connection.execute("INSERT INTO locations (id,label) VALUES ('location_backup','DEMO Bin')")
connection.execute("INSERT INTO designs (id,name) VALUES ('design_backup_tree','DEMO Holiday tree')")
connection.execute("INSERT INTO physical_cutters (id,shape_id,location_id,width_mm,height_mm) VALUES ('cutter_backup','shape_backup_tree','location_backup',90,100)")
connection.execute("INSERT INTO design_shape_links (id,design_id,shape_id,status) VALUES ('link_backup','design_backup_tree','shape_backup_tree','tested')")
for identifier, data, media in (("photo_backup", b"synthetic photo bytes", "image/png"), ("model_backup", b"solid demo\nendsolid demo\n", "model/stl")):
    connection.execute("INSERT INTO attachments (id,storage_key,filename,media_type,byte_size,sha256) VALUES (?,?,?,?,?,?)", (identifier, f"attachments/{identifier}/original", identifier, media, len(data), hashlib.sha256(data).hexdigest()))
    connection.execute("INSERT INTO shape_attachments (shape_id,attachment_id,purpose) VALUES ('shape_backup_tree',?,'original')", (identifier,))
connection.execute("INSERT INTO printable_assets (id,shape_id,attachment_id,format) VALUES ('asset_backup','shape_backup_tree','model_backup','stl')")
connection.commit()
print(json.dumps([{"success": True, "results": [dict(row) for row in connection.execute(sql)]} for sql in json.loads(sys.stdin.read())]))
