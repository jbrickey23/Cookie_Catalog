"""Inventory an already-local HTML page export without executing HTML or fetching URLs.

This is not a native .one/.onepkg decoder or a Microsoft Graph client.
"""
import argparse
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
from urllib.parse import unquote, urlsplit

LIMIT = 2 * 1024 * 1024


class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title = []
        self.text = []
        self.resources = []
        self.in_title = False
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ("script", "style"):
            self.skip += 1
        if tag == "title":
            self.in_title = True
        if tag == "img":
            for name in ("data-fullres-src", "src"):
                if attrs.get(name):
                    self.resources.append(attrs[name])
        if tag == "object" and attrs.get("data"):
            self.resources.append(attrs["data"])

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        if tag in ("script", "style") and self.skip:
            self.skip -= 1

    def handle_data(self, data):
        if self.in_title:
            self.title.append(data)
        if not self.skip and data.strip():
            self.text.append(data.strip())


def digest(path):
    result = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            result.update(block)
    return result.hexdigest()


def audit(root, output, namespace):
    root = Path(root).resolve(strict=True)
    output = Path(output)
    if not root.is_dir() or not namespace.strip() or len(namespace) > 200:
        raise ValueError("Choose a source folder and a stable namespace")
    resolved = output.resolve()
    if resolved == root or root in resolved.parents:
        raise ValueError("Keep audit output outside the source folder")
    for parent in (resolved, *resolved.parents):
        if (parent / ".git").exists():
            raise ValueError("Private audit output must be outside git")
    if output.exists() or output.is_symlink():
        raise ValueError("Output already exists; older files are preserved")
    paths = sorted(root.rglob("*"))
    if len(paths) > 20000 or any(p.is_symlink() for p in paths):
        raise ValueError("Source has links or exceeds the 20000-entry inventory limit")
    files = [p for p in paths if p.is_file()]
    if any(not p.is_dir() and not p.is_file() for p in paths):
        raise ValueError("Source contains special files")
    total = sum(p.stat().st_size for p in files)
    if total > 1024**3:
        raise ValueError("Source exceeds the 1 GiB audit limit")
    pages = [p for p in files if p.suffix.lower() in (".html", ".htm")]
    inventory = [{"path": p.relative_to(root).as_posix(), "bytes": p.stat().st_size,
                  "sha256": digest(p), "type": "html_page" if p in pages else "native_onenote_unsupported" if p.suffix.lower() in (".one", ".onepkg", ".onetoc2") else "resource_or_other"} for p in files]
    indexed = {entry["path"]: entry for entry in inventory}
    items, warnings, referenced, summaries = [], [], set(), []
    for page in pages:
        relative = page.relative_to(root).as_posix()
        if page.stat().st_size > LIMIT:
            warnings.append({"page": relative, "issue": "HTML exceeds 2 MiB; preserved in inventory but not parsed"})
            continue
        parser = Page()
        try:
            parser.feed(page.read_text(encoding="utf-8-sig", errors="strict"))
        except (UnicodeError, ValueError):
            warnings.append({"page": relative, "issue": "HTML is not supported UTF-8; preserved in inventory"})
            continue
        descriptors = [{"path": relative, "purpose": "source_page", "sha256": indexed[relative]["sha256"]}]
        referenced.add(relative)
        seen = {relative}
        for resource in parser.resources:
            split = urlsplit(resource)
            if split.scheme or split.netloc or not split.path or "\\" in split.path:
                warnings.append({"page": relative, "issue": "External, inline or unsupported resource reference requires separate collection"})
                continue
            candidate = (page.parent / unquote(split.path)).resolve()
            if not candidate.is_relative_to(root) or not candidate.is_file():
                warnings.append({"page": relative, "issue": "Missing or out-of-folder local resource"})
                continue
            name = candidate.relative_to(root).as_posix()
            if name not in indexed:
                raise ValueError("Resource changed during audit")
            referenced.add(name)
            if name not in seen:
                descriptors.append({"path": name, "purpose": "unknown", "sha256": indexed[name]["sha256"]})
                seen.add(name)
        title = " ".join(" ".join(parser.title).split()) or page.stem
        preview = " ".join(parser.text)
        summaries.append({"sourceKey": relative, "title": title[:4000], "textPreview": preview[:8000], "previewTruncated": len(preview) > 8000, "resourceReferences": len(parser.resources), "collectedFiles": len(descriptors), "rawPageSha256": indexed[relative]["sha256"]})
        items.append({"sourceKey": relative, "kind": "unclassified", "name": title[:200],
                      "source": {"pageId": relative, "pageTitle": title[:4000], "sectionPath": page.parent.relative_to(root).as_posix()},
                      "facts": {}, "files": descriptors, "reviews": {}})
    # Detect changing exports instead of silently mixing source versions.
    if any(p.stat().st_size != indexed[p.relative_to(root).as_posix()]["bytes"] or digest(p) != indexed[p.relative_to(root).as_posix()]["sha256"] for p in files):
        raise ValueError("Source changed during audit; retry against a stable export")
    manifest = {"format": "cookie-catalog-staging", "version": 1, "sourceNamespace": namespace, "items": items}
    report = {"format": "cookie-catalog-html-inventory", "version": 1, "mode": "offline-read-only", "networkRequests": 0,
              "summary": {"files": len(files), "bytes": total, "htmlPages": len(pages), "stagedPages": len(items), "nativeFilesNeedingExtraction": sum(entry["type"] == "native_onenote_unsupported" for entry in inventory), "warnings": len(warnings)},
              "files": inventory, "pages": summaries, "unreferencedFiles": [p for p in indexed if p not in referenced], "warnings": warnings,
              "limits": ["Native OneNote containers are inventoried, not decoded", "Images are collected with purpose unknown; no ownership, measurement or scale is inferred", "No remote resource was fetched", "No source was edited and no catalog import ran"]}
    output.mkdir(mode=0o700)
    try:
        (output / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        (output / "inventory.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    except Exception:
        # Delete only files this new invocation created, never the source or older output.
        import shutil
        shutil.rmtree(output)
        raise
    return report["summary"]


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source_folder")
    parser.add_argument("new_private_output")
    parser.add_argument("--namespace", required=True)
    args = parser.parse_args()
    try:
        print(json.dumps(audit(args.source_folder, args.new_private_output, args.namespace)))
    except (OSError, ValueError) as error:
        parser.exit(1, f"OneNote HTML audit failed: {error}\n")
