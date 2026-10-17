"""Synthetic local-HTML audit tests; no notebook/network access."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("audit", Path(__file__).resolve().parents[1] / "tools/audit-onenote-html.py")
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


class AuditTests(unittest.TestCase):
    def test_local_html_resources_and_native_files_are_preserved_without_inference(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "source 雪"
            root.mkdir()
            (root / "photo name.png").write_bytes(b"synthetic image")
            (root / "page.html").write_text('<html><head><title>DEMO &amp; Tree</title></head><body><script>bad()</script><p>3 inch cutter</p><img src="photo%20name.png"><img src="https://example.test/external.png"><object data="missing.stl"></object></body></html>', encoding="utf-8")
            (root / "notebook.one").write_bytes(b"synthetic native container")
            before = {p.name: p.read_bytes() for p in root.iterdir()}
            output = Path(temporary) / "audit"
            result = audit.audit(root, output, "demo")
            self.assertEqual(result["htmlPages"], 1)
            manifest = json.loads((output / "manifest.json").read_text())
            item = manifest["items"][0]
            self.assertEqual(item["kind"], "unclassified")
            self.assertEqual(item["facts"], {})
            self.assertEqual(item["name"], "DEMO & Tree")
            self.assertEqual(item["files"][1]["purpose"], "unknown")
            inventory = json.loads((output / "inventory.json").read_text())
            self.assertEqual(inventory["networkRequests"], 0)
            self.assertIn("3 inch cutter", inventory["pages"][0]["textPreview"])
            self.assertNotIn("bad()", inventory["pages"][0]["textPreview"])
            self.assertEqual(len(inventory["warnings"]), 2)
            self.assertIn("notebook.one", inventory["unreferencedFiles"])
            self.assertEqual(before, {p.name: p.read_bytes() for p in root.iterdir()})
            with self.assertRaises(ValueError):
                audit.audit(root, output, "demo")

    def test_escaping_references_are_not_collected_and_links_or_git_output_are_rejected(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "source"
            root.mkdir()
            (Path(temporary) / "private.png").write_bytes(b"outside")
            (root / "page.htm").write_text('<title>DEMO</title><img src="../private.png">', encoding="utf-8")
            output = Path(temporary) / "report"
            audit.audit(root, output, "demo")
            item = json.loads((output / "manifest.json").read_text())["items"][0]
            self.assertEqual(len(item["files"]), 1)
            (root / "link.png").symlink_to(Path(temporary) / "private.png")
            with self.assertRaises(ValueError):
                audit.audit(root, Path(temporary) / "second", "demo")
            (root / "link.png").unlink()
            (Path(temporary) / ".git").mkdir()
            with self.assertRaises(ValueError):
                audit.audit(root, Path(temporary) / "third", "demo")
            with self.assertRaises(ValueError):
                audit.audit(root, root / "nested", "demo")

    def test_utf8_and_large_pages_are_reported_not_silently_dropped(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary) / "source"
            root.mkdir()
            (root / "bad.html").write_bytes(b"\xff")
            (root / "large.html").write_bytes(b"x" * (audit.LIMIT + 1))
            output = Path(temporary) / "audit"
            result = audit.audit(root, output, "demo")
            self.assertEqual(result["stagedPages"], 0)
            self.assertEqual(result["warnings"], 2)
            self.assertEqual(result["files"], 2)


if __name__ == "__main__":
    unittest.main()
