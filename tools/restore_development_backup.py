"""Restore a trusted development download into a NEW local directory, never live Cloudflare."""
import argparse
import base64
import hashlib
import json
from pathlib import Path
import re
import shutil
import sqlite3

TABLES = {
    "shapes", "locations", "physical_cutters", "designs", "design_shape_links", "tags",
    "design_tags", "shape_tags", "attachments", "shape_attachments", "design_attachments",
    "printable_assets", "shape_size_variants", "design_components", "printable_size_recipes", "d1_migrations"
}


REVIEW_TABLES = {"import_review_workspaces", "import_review_versions", "import_review_items", "import_review_runs"}

IMPORT_TABLES = {"catalog_import_batches", "catalog_source_mappings"}

def table_profile(names):
    names = set(names)
    if names not in (TABLES, TABLES | REVIEW_TABLES, TABLES | REVIEW_TABLES | IMPORT_TABLES):
        raise ValueError("Unexpected or incomplete schema")
    return names

def migration_profile(tables):
    return {"0001_initial.sql", "0002_variants_components.sql"} | ({"0003_import_reviews.sql"} if REVIEW_TABLES <= set(tables) else set()) | ({"0004_catalog_imports.sql"} if IMPORT_TABLES <= set(tables) else set())

def identifier(value):
    if not isinstance(value, str) or not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", value):
        raise ValueError("Invalid SQL identifier")
    return '"' + value + '"'

def restore(source, destination):
    source, destination = Path(source), Path(destination)
    if destination.exists():
        raise ValueError("Restore destination must not already exist")
    if source.stat().st_size > 12 * 1024 * 1024:
        raise ValueError("Development backup exceeds size limit")
    envelope = json.loads(source.read_text(encoding="utf-8"))
    if envelope.get("format") != "cookie-catalog-development-backup" or envelope.get("version") != 1:
        raise ValueError("Unsupported backup format")
    raw = envelope["payloadJson"]
    if hashlib.sha256(raw.encode("utf-8")).hexdigest() != envelope["payloadSha256"]:
        raise ValueError("Backup payload checksum mismatch")
    payload = json.loads(raw)
    if payload.get("environment") != "development":
        raise ValueError("Not a development backup")
    tables, schema = payload["database"]["tables"], payload["database"]["schema"]
    selected_tables = table_profile(tables)
    if {item["name"] for item in schema if item["type"] == "table"} != selected_tables:
        raise ValueError("Unexpected or incomplete schema")
    if any(item["type"] not in ("table", "index") or item["tbl_name"] not in selected_tables for item in schema):
        raise ValueError("Unsupported schema object")
    objects = payload["objects"]
    attachments = {item["storage_key"]: item for item in tables["attachments"]}
    if len(attachments) != len(tables["attachments"]):
        raise ValueError("Duplicate attachment key")
    decoded = {}
    total_bytes = 0
    for item in objects:
        key = item["key"]
        match = re.fullmatch(r"attachments/([A-Za-z0-9_-]{8,128})/(original|thumbnail)", key)
        if not match or key in decoded or key not in attachments:
            raise ValueError("Invalid, duplicate or unregistered object key")
        attachment = attachments[key]
        if match[1] != item["attachmentId"] or attachment["id"] != item["attachmentId"]:
            raise ValueError("Attachment identity mismatch")
        data = base64.b64decode(item["base64"], validate=True)
        checksum = hashlib.sha256(data).hexdigest()
        total_bytes += len(data)
        if total_bytes > 4 * 1024 * 1024 or len(objects) > 25:
            raise ValueError("Development attachment limit exceeded")
        if len(data) != item["byteSize"] or checksum != item["sha256"]:
            raise ValueError("Object checksum or size mismatch")
        if attachment["byte_size"] is not None and attachment["byte_size"] != len(data):
            raise ValueError("Attachment metadata size mismatch")
        if attachment["sha256"] is not None and attachment["sha256"].lower() != checksum:
            raise ValueError("Attachment metadata checksum mismatch")
        decoded[key] = data
    if set(decoded) != set(attachments):
        raise ValueError("Backup is missing attachment files")
    destination.mkdir(parents=True)
    connection = None
    try:
        connection = sqlite3.connect(destination / "catalog.sqlite")
        connection.execute("PRAGMA foreign_keys = ON")
        connection.execute("BEGIN")
        connection.execute("PRAGMA defer_foreign_keys = ON")
        for kind in ("table", "index"):
            for item in schema:
                if item["type"] == kind and item["sql"]:
                    if not re.match(r"^CREATE\s+(?:UNIQUE\s+)?" + kind + r"\b", item["sql"], re.I):
                        raise ValueError("Unexpected schema SQL")
                    connection.execute(item["sql"])
        counts = {}
        for table, rows in tables.items():
            if len(rows) > 1000:
                raise ValueError("Development record limit exceeded")
            for row in rows:
                columns = list(row)
                if not columns:
                    raise ValueError("Empty record")
                sql = f"INSERT INTO {identifier(table)} ({','.join(map(identifier, columns))}) VALUES ({','.join('?' for _ in columns)})"
                connection.execute(sql, [row[column] for column in columns])
            counts[table] = connection.execute(f"SELECT COUNT(*) FROM {identifier(table)}").fetchone()[0]
            if counts[table] != len(rows):
                raise ValueError("Restored record count mismatch")
        if connection.execute("PRAGMA foreign_key_check").fetchall():
            raise ValueError("Restored relationships failed validation")
        connection.commit()
        for key, data in decoded.items():
            path = destination / "objects" / key
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
            if hashlib.sha256(path.read_bytes()).hexdigest() != hashlib.sha256(data).hexdigest():
                raise ValueError("Restored object failed validation")
        return {"tables": len(counts), "records": sum(counts.values()), "objects": len(decoded), "foreignKeysValid": True}
    except Exception:
        if connection is not None:
            connection.close()
            connection = None
        shutil.rmtree(destination)
        raise
    finally:
        if connection is not None:
            connection.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("backup")
    parser.add_argument("new_directory")
    args = parser.parse_args()
    try:
        print(json.dumps(restore(args.backup, args.new_directory)))
    except (ValueError, KeyError, TypeError, sqlite3.Error, OSError) as error:
        parser.exit(1, f"Restore failed: {error}\n")
