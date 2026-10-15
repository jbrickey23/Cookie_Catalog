"""Offline recovery preparation and comparison failure tests; synthetic data only."""
import hashlib
import json
from pathlib import Path
import shutil
import sqlite3
import sys
import tarfile
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
from prepare_cloudflare_restore import prepare, verify, snapshot


def fixture(path, missing_migration=False, large=False):
    with sqlite3.connect(":memory:") as db:
        for migration in [ROOT / "database/migrations" / name for name in ("0001_initial.sql", "0002_variants_components.sql")]:
            db.executescript(migration.read_text())
        db.execute("CREATE TABLE d1_migrations(id INTEGER PRIMARY KEY, name TEXT, applied_at TEXT)")
        for index, name in enumerate(("0001_initial.sql", "0002_variants_components.sql")):
            if not missing_migration or index == 0:
                db.execute("INSERT INTO d1_migrations VALUES (?,?,?)", (index+1, name, "2026-10-14"))
        db.execute("INSERT INTO shapes(id,name,notes) VALUES ('shape_test',?,?)",
                   ("O'Brien; DROP TABLE shapes; --\n雪\x00tail", "x"*100001 if large else None))
        db.execute("INSERT INTO locations(id,label) VALUES ('z_parent','parent')")
        db.execute("INSERT INTO locations(id,label,parent_id) VALUES ('a_child','child','z_parent')")
        data = b"synthetic original\x00\xff"
        checksum = hashlib.sha256(data).hexdigest()
        key = "attachments/file_test_01/original"
        db.execute("INSERT INTO attachments(id,storage_key,filename,media_type,byte_size,sha256) VALUES ('file_test_01',?,'test.bin','application/octet-stream',?,?)", (key,len(data),checksum))
        db.execute("INSERT INTO shape_attachments VALUES ('shape_test','file_test_01','original')")
        db.commit()
        database = snapshot(db)
    item = {"attachmentId":"file_test_01", "key":key, "byteSize":len(data), "sha256":checksum, "contentType":"application/octet-stream"}
    payload = json.dumps({"environment":"development","database":database,"objects":[item]})
    raw = json.dumps({"format":"cookie-catalog-archive","version":1,"exportedAt":"2026-10-14T00:00:00Z","payloadJson":payload,"payloadSha256":hashlib.sha256(payload.encode()).hexdigest()}).encode()
    receipt = json.dumps({"manifestSha256":hashlib.sha256(raw).hexdigest(),"objects":1,"originalBytes":len(data)}).encode()
    with path.open("wb") as stream:
        for name, content in (("metadata/manifest.json",raw),("objects/"+key,data),("metadata/complete.json",receipt)):
            info = tarfile.TarInfo(name); info.size = len(content)
            stream.write(info.tobuf(format=tarfile.USTAR_FORMAT)); stream.write(content)
            stream.write(bytes((-len(content)) % 512))
        stream.write(bytes(1024))


class PreparationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.archive = self.root / "synthetic.tar"
        self.package = self.root / "prepared"
        fixture(self.archive)

    def tearDown(self):
        self.temp.cleanup()

    def compare(self):
        return verify(self.package, self.package / "catalog.sqlite", self.package / "objects")

    def test_complete_exact_roundtrip_with_sql_text_and_forward_self_reference(self):
        result = prepare(self.archive, self.package)
        self.assertFalse(result["cloudExecuted"])
        self.assertTrue(self.compare()["dataComparisonPassed"])
        self.assertFalse(self.compare()["cloudProvenanceVerified"])
        sql = (self.package / "import.sql").read_text()
        self.assertNotIn("BEGIN TRANSACTION;", sql)
        self.assertIn("CAST(X'", sql)
        with sqlite3.connect(":memory:") as db:
            db.execute("PRAGMA foreign_keys=ON")
            db.executescript("BEGIN;" + sql + "COMMIT;")
            self.assertEqual(db.execute("SELECT name FROM shapes").fetchone()[0], "O'Brien; DROP TABLE shapes; --\n雪\x00tail")

    def test_existing_destination_and_git_checkout_are_preserved(self):
        self.package.mkdir(); sentinel = self.package / "keep"; sentinel.write_text("keep")
        with self.assertRaises(ValueError): prepare(self.archive,self.package)
        self.assertEqual(sentinel.read_text(),"keep")
        checkout = self.root / "checkout"; checkout.mkdir(); (checkout / ".git").write_text("gitdir: elsewhere")
        with self.assertRaisesRegex(ValueError,"git checkout"): prepare(self.archive,checkout / "private")
        self.assertFalse((checkout / "private").exists())

    def test_missing_migration_and_oversized_sql_clean_new_output(self):
        for options in ({"missing_migration":True},{"large":True}):
            fixture(self.archive,**options)
            with self.assertRaises(ValueError): prepare(self.archive,self.package)
            self.assertFalse(self.package.exists())

    def test_changed_record_same_count_is_rejected(self):
        prepare(self.archive,self.package)
        with sqlite3.connect(self.package / "catalog.sqlite") as db:
            db.execute("UPDATE shapes SET notes='changed'")
        with self.assertRaisesRegex(ValueError,"records differ"): self.compare()

    def test_missing_changed_and_extra_originals_rejected(self):
        prepare(self.archive,self.package)
        original = self.package / "objects/attachments/file_test_01/original"
        data = original.read_bytes()
        original.write_bytes(bytes(len(data)))
        with self.assertRaisesRegex(ValueError,"bytes differ"): self.compare()
        original.unlink()
        with self.assertRaisesRegex(ValueError,"keys differ"): self.compare()
        original.write_bytes(data)
        (self.package / "objects/extra").write_bytes(b"extra")
        with self.assertRaisesRegex(ValueError,"keys differ"): self.compare()

    def test_changed_sql_and_symlinks_rejected(self):
        prepare(self.archive,self.package)
        sql = self.package / "import.sql"; original = sql.read_bytes(); sql.write_bytes(b"changed")
        with self.assertRaisesRegex(ValueError,"SQL changed"): self.compare()
        sql.write_bytes(original)
        (self.package / "objects/link").symlink_to(self.archive)
        with self.assertRaisesRegex(ValueError,"Symlinks"): self.compare()

    def test_corrupt_archive_leaves_no_package(self):
        self.archive.write_bytes(b"bad archive")
        with self.assertRaises(ValueError): prepare(self.archive,self.package)
        self.assertFalse(self.package.exists())

    def test_missing_comparison_database_is_not_created(self):
        prepare(self.archive,self.package)
        absent = self.root / "absent.sqlite"
        with self.assertRaises(ValueError): verify(self.package,absent,self.package / "objects")
        self.assertFalse(absent.exists())


if __name__ == "__main__":
    unittest.main()
