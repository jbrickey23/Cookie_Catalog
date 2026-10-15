"""Restore a trusted Cookie Catalog TAR archive into a NEW local directory."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import shutil
import sqlite3
import tarfile
from restore_development_backup import table_profile, identifier

def restore(source, destination):
    source, destination = Path(source), Path(destination)
    if destination.exists():
        raise ValueError("Restore destination must not already exist")
    size = source.stat().st_size
    if size > 1024**3 + 18*1024**2 or size % 512 or size < 2048:
        raise ValueError("Archive size is invalid or exceeds development limits")
    with source.open("rb") as stream:
        stream.seek(-1024, 2)
        if stream.read() != bytes(1024):
            raise ValueError("Archive is incomplete")
    connection = None
    created = False
    try:
        with tarfile.open(source, "r|") as archive:
            members = iter(archive)
            first = next(members, None)
            if first is None or not first.isfile() or first.name != "metadata/manifest.json" or first.size > 16*1024**2:
                raise ValueError("Archive manifest is missing or invalid")
            raw = archive.extractfile(first).read()
            envelope = json.loads(raw)
            if envelope.get("format") != "cookie-catalog-archive" or envelope.get("version") != 1:
                raise ValueError("Unsupported archive format")
            payload_raw = envelope["payloadJson"]
            if hashlib.sha256(payload_raw.encode()).hexdigest() != envelope["payloadSha256"]:
                raise ValueError("Manifest payload checksum mismatch")
            payload = json.loads(payload_raw)
            if payload.get("environment") != "development":
                raise ValueError("Not a development archive")
            tables, schema = payload["database"]["tables"], payload["database"]["schema"]
            selected_tables = table_profile(tables)
            if {item["name"] for item in schema if item["type"] == "table"} != selected_tables:
                raise ValueError("Unexpected or incomplete schema")
            if any(item["type"] not in ("table", "index") or item["tbl_name"] not in selected_tables for item in schema):
                raise ValueError("Unsupported schema object")
            objects = payload["objects"]
            attachments = {row["storage_key"]: row for row in tables["attachments"]}
            if len(attachments) != len(tables["attachments"]) or len(objects) > 1000:
                raise ValueError("Duplicate attachments or too many originals")
            seen = set()
            for item in objects:
                key = item["key"]
                match = re.fullmatch(r"attachments/([A-Za-z0-9_-]{8,128})/original", key)
                if not match or key in seen or key not in attachments:
                    raise ValueError("Invalid, duplicate or unregistered object")
                row = attachments[key]
                if match[1] != item["attachmentId"] or row["id"] != item["attachmentId"]:
                    raise ValueError("Attachment identity mismatch")
                if not isinstance(item["byteSize"], int) or not 0 <= item["byteSize"] <= 25*1024**2:
                    raise ValueError("Original exceeds file limit")
                if row["byte_size"] != item["byteSize"] or row["sha256"].lower() != item["sha256"] or not re.fullmatch(r"[a-f0-9]{64}", item["sha256"]):
                    raise ValueError("Attachment checksum/size metadata mismatch")
                seen.add(key)
            if seen != set(attachments):
                raise ValueError("Missing original descriptors")
            if sum(item["byteSize"] for item in objects) > 1024**3:
                raise ValueError("Originals exceed 1 GiB")
            destination.mkdir(parents=True)
            created = True
            connection = sqlite3.connect(destination / "catalog.sqlite")
            connection.execute("PRAGMA foreign_keys=ON")
            connection.execute("BEGIN")
            connection.execute("PRAGMA defer_foreign_keys=ON")
            for kind in ("table", "index"):
                for item in schema:
                    if item["type"] == kind and item["sql"]:
                        if not re.match(r"^CREATE\s+(?:UNIQUE\s+)?" + kind + r"\b", item["sql"], re.I):
                            raise ValueError("Unexpected schema SQL")
                        connection.execute(item["sql"])
            counts = {}
            for table, rows in tables.items():
                if len(rows) > 10000:
                    raise ValueError("Record limit exceeded")
                for row in rows:
                    columns = list(row)
                    if not columns:
                        raise ValueError("Empty record")
                    sql = f"INSERT INTO {identifier(table)} ({','.join(map(identifier, columns))}) VALUES ({','.join('?' for _ in columns)})"
                    connection.execute(sql, [row[column] for column in columns])
                counts[table] = connection.execute(f"SELECT COUNT(*) FROM {identifier(table)}").fetchone()[0]
                if counts[table] != len(rows):
                    raise ValueError("Record count mismatch")
            if connection.execute("PRAGMA foreign_key_check").fetchall() or connection.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
                raise ValueError("Restored database integrity failed")
            consumed = 512 + ((len(raw)+511)//512)*512
            total = 0
            for item in objects:
                member = next(members, None)
                if member is None or not member.isfile() or member.name != "objects/"+item["key"] or member.size != item["byteSize"]:
                    raise ValueError("Missing, reordered or invalid original member")
                path = destination / "objects" / item["key"]
                path.parent.mkdir(parents=True, exist_ok=True)
                digest = hashlib.sha256()
                copied = 0
                with archive.extractfile(member) as original, path.open("xb") as output:
                    while True:
                        chunk = original.read(1024**2)
                        if not chunk:
                            break
                        output.write(chunk)
                        digest.update(chunk)
                        copied += len(chunk)
                if copied != item["byteSize"] or digest.hexdigest() != item["sha256"]:
                    raise ValueError("Original checksum or size mismatch")
                total += copied
                consumed += 512 + ((copied+511)//512)*512
            complete = next(members, None)
            if complete is None or not complete.isfile() or complete.name != "metadata/complete.json" or complete.size > 1024:
                raise ValueError("Archive completion receipt missing")
            receipt = json.loads(archive.extractfile(complete).read())
            if receipt != {"manifestSha256": hashlib.sha256(raw).hexdigest(), "objects": len(objects), "originalBytes": total}:
                raise ValueError("Archive completion receipt mismatch")
            consumed += 512 + ((complete.size+511)//512)*512 + 1024
            if next(members, None) is not None or consumed != size:
                raise ValueError("Unexpected archive members or trailing data")
            connection.commit()
            (destination / "manifest.json").write_bytes(raw)
            return {"tables":len(counts),"records":sum(counts.values()),"objects":len(objects),"originalBytes":total,"foreignKeysValid":True,"complete":True}
    except Exception:
        if connection:
            connection.close()
            connection = None
        if created:
            shutil.rmtree(destination)
        raise
    finally:
        if connection:
            connection.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive")
    parser.add_argument("new_directory")
    args = parser.parse_args()
    try:
        print(json.dumps(restore(args.archive, args.new_directory)))
    except (ValueError, KeyError, TypeError, sqlite3.Error, OSError, tarfile.TarError, json.JSONDecodeError) as error:
        parser.exit(1, f"Restore failed: {error}\n")
