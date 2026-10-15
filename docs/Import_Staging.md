# Offline catalog audit and staging

## Saved review workflow

The existing manifest now optionally retains catalog ownership, printStatus, quantity, referenceSizeMm, originalSizeLabel and slot. Quantity stays omitted until known. Reference size is separate from width/height. Existing manifests remain valid; old strict validators reject unknown new fields rather than dropping them. Updated offline preparation retains these assertions. The development workspace supports explicit private save/reopen and versioned preview history after migration 0003; local Download is still available. See [saved review guide](Saved_Import_Reviews.md) for limits, activation and the remaining actual-import boundary.

Implemented as preparation for CC-TODO-008/009. No live import or OneNote modification is performed. The October 15 private PDF audit exercised real-source staging for 343 proposed entries and ten demo candidates, with zero file issues and an unchanged repeat baseline. See [PDF findings](PDF_Import_Findings_20261015.md). No live import ran; native notebook decoding remains unavailable.

## Inputs and boundaries

`tools/stage-catalog.mjs` runs with Node 24+ (the owner's existing Node meets this). It requires the repository's shared app/src modules but no npm packages, Wrangler or Python. Keep the tool and source tree together. Destination parent must exist; output must be a new private directory outside git and outside the source folder. Existing output is preserved.

Manifest format is `cookie-catalog-staging`, version 1. See [synthetic manifest](../samples/staging_manifest.synthetic.json). A stable sourceNamespace and sourceKey identify each proposed item. Preserve external page IDs when available; file-path IDs from an HTML export remain stable only while those paths remain stable. Splitting a page creates separate persistent draft source keys; reuse the reviewed manifest on reruns.

The manifest separates kind/name/source, known facts, relative file references and per-field review decisions. Unknown numeric values are omitted. Paths must stay within the supplied source folder; symlinks, traversal and mismatched declared hashes are not trusted. A file's declared purpose is supplied by the reviewer, not inferred from its pixels or extension. Review evidence is declarative and subject to human checking.

## Run preparation

From the repository root, an example Windows command for the synthetic fixture is:

```powershell
node .\tools\stage-catalog.mjs .\samples\staging_manifest.synthetic.json .\samples "$env:USERPROFILE\Downloads\Cookie_Catalog_Synthetic_Review"
```

Use a new output name for each run. For real data, substitute the private reviewed manifest and original source folder. Do not commit them. To compare against a previous preparation:

```powershell
node .\tools\stage-catalog.mjs 'C:\private\reviewed-manifest.json' 'C:\private\source-export' 'C:\private\review-next' 'C:\private\review-previous\review.json'
```

Output:

- input-manifest.json: byte-identical input snapshot.
- originals/: referenced files copied under their SHA-256, verified after copying; original paths/names remain in review.json.
- review.json: stable proposed IDs, provenance, facts, checks, issues, duplicate candidates and prior-report comparison.
- review.html: escaped, script-free, offline-readable checklist; no source HTML execution, external fetch or links to executable imported content.

Keep the entire original export separately. Unreferenced files and unsupported native containers appear in the audit inventory but are not automatically copied into this staging package. The staging package is not a complete OneNote backup.

Potential duplicates are based on normalized titles and shared non-page file hashes. These are review hints; common artwork or similar names do not prove identical physical cutters. No merging or deletion occurs. An item absent from the next input is reported, never deleted. A baseline report is a comparison aid, not proof of a prior live import.

Limits: 16 MiB input/report, 10,000 items, 100 file references/item, 100 MiB per offline source file and 1 GiB unique copied sources. Current live upload remains 25 MiB/file; larger offline assets are flagged. Invalid manifests fail before output; missing/unsafe file references become item issues. Correct complete claims need facts/files and field-appropriate evidence. Keep smaller stable batches if limits are exceeded.

## Audit already-local HTML pages

`tools/audit-onenote-html.py` uses Python standard-library HTMLParser. It is a local inventory adapter, not a native .one/.onepkg decoder or a Graph downloader. There is no need to install Python on the owner's PC for the Node staging/review workflow; the assistant can run this adapter when a source export is provided.

```text
python tools/audit-onenote-html.py PRIVATE_HTML_SOURCE NEW_PRIVATE_AUDIT --namespace STABLE_NOTEBOOK_KEY
```

It inventories names/sizes/hashes, captures page titles and bounded plain-text previews, collects local img/object references and emits manifest.json plus inventory.json. Images/files begin with purpose unknown and pages with kind unclassified. External/inline/missing/out-of-folder resources are flagged without fetching. Native OneNote containers are inventoried as unsupported; they are not silently parsed as HTML. Non-UTF-8 or >2 MiB HTML pages remain listed with a warning. All originals remain untouched.

Input folder is limited to 20,000 entries and 1 GiB; links/special files are refused. Preserve inventory warnings and unreferenced files during reconciliation. Source identities, URLs and previews are private data; output is refused inside git.

## Local browser review

Open the development app as admin/editor, expand Import preparation workspace and choose the prepared manifest. Work stays in that tab; downloading creates a new reviewed manifest, not a live import. Reopen that file to continue later, then run Node staging against the separate original source folder. Do not upload the original notebook or file payloads through this draft screen. Viewers do not receive this editing workspace.

The browser can record evidence references but cannot establish local original-file integrity from a manifest alone. Run the offline tool to validate/copy referenced bytes. Neither this tool nor the UI can verify whether a ruler in an image actually establishes the claimed dimensions; human review remains necessary.

## Live import contract to implement after source audit

- Preserve source identity and original bytes; keep reviewed catalog edits separate from raw extracted claims.
- Use stable source-to-entity mapping plus a plan hash and explicit approved plan. Unique identities prevent duplicate reruns; source hash changes are reviewed.
- Classify new/unchanged/changed/conflict rather than blindly overwriting. Compare existing live values with the last imported values so manual edits are not erased. Unknown incoming fields do not overwrite known values.
- Plan source pages, split items, catalog entities, relationships and file counts separately. Multiple designs/cutters on one page are not collapsed into one item.
- Treat D1/R2 as separate services. Design resumable file/metadata states and compensation; do not claim a transaction spans both.
- Add persistent provenance and review history only with a versioned migration, exact backup/restore compatibility tests, failure fixtures and recovery plan. Current exact 16-table archive validation remains unchanged.
- Before live import: a validated private pre-change backup, owner-reviewed representative plan and explicit bulk-import authorization. After import: compare records/links/original hashes and review unresolved items. No live import runner is enabled now.

See [development guidelines](Development_Guidelines.md) for verified source references and [completion workflow](Catalog_Completion_Workflow.md) for checklist semantics.
