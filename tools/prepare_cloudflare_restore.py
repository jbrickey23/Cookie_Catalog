"""Prepare a trusted TAR for isolated Cloudflare recovery; never contacts Cloudflare.

All generated files contain PRIVATE catalog data. Use a new directory outside git.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import shutil
import sqlite3
import tarfile
from restore_archive_backup import restore
from restore_development_backup import table_profile, migration_profile, identifier


def digest(path):
    result = hashlib.sha256()
    with Path(path).open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024**2), b""):
            result.update(chunk)
    return result.hexdigest()


def literal(value):
    if value is None:
        return "NULL"
    if isinstance(value, str):
        # SQLite quote() truncates at NUL; encode such text explicitly.
        if "\x00" in value:
            return "CAST(X'" + value.encode().hex() + "' AS TEXT)"
        return "'" + value.replace("'", "''") + "'"
    if isinstance(value, int):
        return str(value)
    if isinstance(value, float) and math.isfinite(value):
        return repr(value)
    raise ValueError("Unsupported SQL value")


def snapshot(connection):
    connection.row_factory = sqlite3.Row
    actual = {row[0] for row in connection.execute("SELECT name FROM sqlite_schema WHERE type='table'")}
    # D1 internal tables are not catalog tables. Other user tables fail comparison.
    tables = table_profile({name for name in actual if not name.startswith(("sqlite_", "_cf_"))})
    if connection.execute("PRAGMA integrity_check").fetchone()[0] != "ok" or connection.execute("PRAGMA foreign_key_check").fetchall():
        raise ValueError("Database integrity/relationships failed")
    rows = {}
    for table in sorted(tables):
        rows[table] = sorted([dict(row) for row in connection.execute(f"SELECT * FROM {identifier(table)}")],
                             key=lambda row: json.dumps(row, sort_keys=True, ensure_ascii=False))
    schema = [dict(row) for row in connection.execute(
        "SELECT type,name,tbl_name,sql FROM sqlite_schema WHERE sql IS NOT NULL AND type IN ('table','index') ORDER BY type,name")
        if row["tbl_name"] in tables]
    return {"tables": rows, "schema": schema}


def refuse_repository_output(destination):
    # Resolve symlinks first so an external-looking path cannot land in a checkout.
    for parent in (destination.resolve(), *destination.resolve().parents):
        if (parent / ".git").exists():
            raise ValueError("Private restore output must be outside every git checkout")


def prepare(archive, destination):
    archive, destination = Path(archive), Path(destination)
    refuse_repository_output(destination)
    if destination.exists():
        raise ValueError("Preparation directory must not already exist")
    created = False
    try:
        before = digest(archive)
        report = restore(archive, destination)
        created = True
        (destination / "objects").mkdir(exist_ok=True)
        if digest(archive) != before:
            raise ValueError("Archive changed during preparation")
        with sqlite3.connect(destination / "catalog.sqlite") as connection:
            expected = snapshot(connection)
        envelope = json.loads((destination / "manifest.json").read_text(encoding="utf-8"))
        payload = json.loads(envelope["payloadJson"])
        migrations = {row["name"] for row in expected["tables"]["d1_migrations"]}
        if migrations != migration_profile(expected["tables"]):
            raise ValueError("Known migration entries must match the schema profile")
        statements = ["PRAGMA defer_foreign_keys=ON;"]
        for kind in ("table", "index"):
            statements += [item["sql"].rstrip("; ") + ";" for item in expected["schema"] if item["type"] == kind]
        for table, rows in expected["tables"].items():
            for row in rows:
                statements.append(f"INSERT INTO {identifier(table)} ({','.join(map(identifier,row))}) VALUES ({','.join(literal(value) for value in row.values())});")
        # Cloudflare's documented per-statement limit is 100 KB. Fail before upload.
        if any(len(statement.encode()) > 100000 for statement in statements):
            raise ValueError("SQL statement exceeds the conservative 100000-byte D1 limit")
        statements.append("PRAGMA defer_foreign_keys=OFF;")
        sql = "\n".join(statements) + "\n"
        # Exercise the exact generated SQL inside one local transaction, like D1 import.
        with sqlite3.connect(":memory:") as connection:
            connection.execute("PRAGMA foreign_keys=ON")
            connection.executescript("BEGIN;\n" + sql + "COMMIT;")
            if snapshot(connection) != expected:
                raise ValueError("Generated SQL failed exact local round-trip")
        (destination / "import.sql").write_text(sql, encoding="utf-8")
        (destination / "statements.json").write_text(json.dumps(statements), encoding="utf-8")
        evidence = {"format": "cookie-catalog-cloudflare-preparation", "version": 1,
                    "archiveSha256": before, "sourceEnvironment": payload["environment"], "exportedAt": envelope["exportedAt"],
                    "sourceCommit": None, "sourceCommitNote": "Archive does not attest deployed source; record separately.",
                    "importSha256": digest(destination / "import.sql"),
                    "database": expected, "objects": payload["objects"],
                    "counts": {name: len(rows) for name, rows in expected["tables"].items()},
                    "localRestore": report, "cloudExecuted": False}
        (destination / "expected.json").write_text(json.dumps(evidence, indent=2, ensure_ascii=False), encoding="utf-8")
        return {"prepared": True, "cloudExecuted": False, "archiveSha256": before,
                "tables": len(expected["tables"]), "records": report["records"], "objects": report["objects"]}
    except Exception:
        if created:
            shutil.rmtree(destination)
        raise


def verify(package, database, objects):
    """Compare an independently re-exported SQLite DB and downloaded object tree.

    Does not trust counts alone. Caller must establish cloud target/provenance,
    complete remote listing and private bucket settings independently.
    """
    package, database, objects = Path(package), Path(database), Path(objects)
    expected = json.loads((package / "expected.json").read_text(encoding="utf-8"))
    if expected.get("format") != "cookie-catalog-cloudflare-preparation" or expected.get("version") != 1:
        raise ValueError("Unsupported preparation package")
    if digest(package / "import.sql") != expected["importSha256"]:
        raise ValueError("Prepared SQL changed")
    if database.is_symlink() or not database.is_file():
        raise ValueError("Comparison database must exist")
    with sqlite3.connect(database.resolve().as_uri() + "?mode=ro", uri=True) as connection:
        actual = snapshot(connection)
    if actual != expected["database"]:
        raise ValueError("Recovered schema or complete records differ")
    if not objects.is_dir() or objects.is_symlink():
        raise ValueError("Downloaded object root must exist")
    paths = list(objects.rglob("*"))
    if any(path.is_symlink() for path in paths):
        raise ValueError("Symlinks are forbidden in downloaded originals")
    files = {path.relative_to(objects).as_posix() for path in paths if path.is_file()}
    if files != {item["key"] for item in expected["objects"]}:
        raise ValueError("Downloaded object keys differ")
    for item in expected["objects"]:
        path = objects / item["key"]
        if path.stat().st_size != item["byteSize"] or digest(path) != item["sha256"]:
            raise ValueError("Recovered original bytes differ")
    return {"dataComparisonPassed": True, "counts": expected["counts"],
            "objects": len(files), "archiveSha256": expected["archiveSha256"],
            "cloudProvenanceVerified": False, "privateAccessVerified": False}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="action", required=True)
    prep = sub.add_parser("prepare")
    prep.add_argument("archive")
    prep.add_argument("new_directory")
    check = sub.add_parser("verify")
    check.add_argument("package")
    check.add_argument("database")
    check.add_argument("downloaded_objects")
    args = parser.parse_args()
    try:
        result = prepare(args.archive, args.new_directory) if args.action == "prepare" else verify(args.package, args.database, args.downloaded_objects)
        print(json.dumps(result))
    except (ValueError, KeyError, TypeError, sqlite3.Error, OSError, tarfile.TarError) as error:
        parser.exit(1, f"Cloudflare preparation/comparison failed: {error}\n")
