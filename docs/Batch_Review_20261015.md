# Autonomous engineering batch — October 15, 2026

## October 15 — Full PDF source audit and staging checkpoint

The owner supplied 14 OneNote-exported PDFs after a successful Windows COM export of the requested catalog sections. This resolves the immediate representative-source dependency: 478 PDF pages were grouped into 343 proposed source entries, including 135 continuation pages. These are source-entry counts, not physical-cutter counts. The first pass flags 37 source entries explicitly marked not printed, two not purchased, and 168 mentioning printable files; categories overlap. No printable originals are embedded in the supplied PDFs.

A private searchable review package preserves source text, hashes, PDF page ranges, image references, links and flags. Local extraction preserved 575 unique image streams. Full-source staging passed for 343 unclassified entries with zero file issues; a baseline repeat reports 343 unchanged and none absent. Ten proposed mixed/familiar-theme demo candidates also stage with zero file issues, with all relevant facts still needing verification. No live catalog import or notebook edit occurred. Real source files, entry titles, vendor URLs, images, manifests and private deliverables remain outside this public repository.

See [sanitized PDF findings](PDF_Import_Findings_20261015.md). Next under existing CC-TODO-007/008/009/010: durable source/review and import history, reference-size and ownership/print-status handling with archive/recovery compatibility; reviewed component/duplicate mapping and idempotent preview; then protected pre-change backup and representative development import. Native notebook decoding is optional for continuing from these PDFs, but native page IDs and authorized STL/3MF originals remain unavailable. Preserve pending second-admin/device/recovery gates, completed backup/access evidence, and draft/unreleased status. No new task ID allocated; next unused remains CC-TODO-013.

## October 15 — Owner answers to bulk review

Q1 resolved: notebook is on personal OneDrive. Q3 resolved: longest measured dimension is the reference/catalog size; a 4 by 2 inch item is called a 4 inch cookie. Preserve both width/height when known, orientation and original units/labels; do not substitute diagonal size or infer measurements from unscaled photos. Internal mm storage remains, with human-facing inch/reference sizing planned. Q4 resolved: physical location is Bin #, with optional Slot # reserved for the future; incomplete items may keep unknown location. Preserve identifiers as labels without stripping leading zeros. Q5 resolved: combine a mixed representative set with a familiar theme.

Q2 source request: begin with a PDF export of a familiar section (or approximately 6–10 representative pages) for immediate layout/text/image analysis; also obtain the original personal-OneDrive notebook export ZIP for structure/resource/native-format inspection and future extraction. Separate associated STL/3MF files are useful if available. Preserve the notebook and send existing content as-is; missing details are audit findings, not pre-work. Microsoft notebook/PDF export instructions were verified. Native OneNote containers still require an adapter; no actual source has been received/decoded yet. Existing device/recovery boundaries and draft/unreleased status remain.

Owner authorization: go as far as possible on reversible work, use recommended defaults, follow application development guidelines, verify technical sources and batch open decisions. This advances the demonstration/import milestone without claiming actual notebook access or a completed live import.

## Delivered in this batch

| Deliverable | Current behavior | Important limit |
| --- | --- | --- |
| Live catalog review queue | Paged, authenticated read-only gap checks for physical cutters, printable files, designs and unclassified shapes | Metadata presence is unverified; original availability and photographic content are not inspected |
| Local import-review workspace | Admin/editor opens JSON, classifies/splits page items, enters dimensions/location, assigns file purposes, records review evidence and downloads a reviewed draft | No server upload, live import or automatic persistence; download to keep changes |
| Offline staging | Stable proposed IDs, provenance, copied/checksummed referenced originals, escaped HTML/JSON report, duplicate hints and baseline comparison | No merging/deletion/live writes; raw complete export must be retained separately |
| Local HTML audit | Inventory, hashes, page titles/plain-text previews, local resource references and explicit native/remote/missing-file gaps | Not a native OneNote decoder or authenticated Graph client |
| Concurrent-edit protection | Exact opened revisions plus atomic conditional update; stale edits fail and retain the draft | Refresh old browser tabs after deployment; this is not an immutable audit log |
| Linked-selector fix | Follows pages beyond the first 200 instead of silently omitting records | Visible failure above 10,000 choices; searchable large selectors remain queued |
| Engineering guidance | Source-verified platform choices, meaningful test gates and deferred work catalog | No blanket accessibility/security/device certification |

## Defaults already applied

- Keep physical cutters, printable files and decorating designs separate. Keep a page unclassified until reviewed; allow multiple draft items per source page.
- Unknown details remain unknown and do not block staging. Existing values/images are not automatically verified.
- Use mm with width/height and orientation/method notes. Scale-reference photo and measurement evidence are separate.
- Physical entries request location and a scale photo; printable-only entries do not request physical storage. Exceptions require reasons; provenance cannot be waived.
- Missing/unsafe referenced files are quarantined as issues. Preserve source identities and bytes; possible duplicates require review.
- Initial exchange uses JSON plus escaped offline HTML. No raw HTML execution, external fetch, CSV formula exposure or automatic source scraping.
- Keep the validated live schema and archive format unchanged. Persistent review history and the actual importer require a coordinated schema/recovery change after source analysis.

## Quick response queue

Only the source/account/export input is needed to begin the real notebook audit. The other defaults can remain until representative samples make a choice useful. Do not wake the owner or repeat these individually.

| ID | Input / decision | Options / recommended approach | What it affects |
| --- | --- | --- | --- |
| Q1 | Where is the current OneNote notebook stored? | Resolved: personal OneDrive | Use the personal-OneDrive export route; inspect the actual package before choosing a decoder. |
| Q2 | Representative source material | Provide the existing export/sample pages and associated original files when available; preserve the original notebook | Real parsing, page/item counts, relationships, actual gaps and duplicate review. A link/account alone is not a supplied export. |
| Q3 | Which physical measurement should be primary? | Resolved: longest measured dimension is the reference size (4 by 2 inch = 4 inch cookie); retain both axes where known | Final measurement/schema convention. Existing numbers remain unverified meanwhile. |
| Q4 | How should physical locations be named? | Resolved: Bin #, optional Slot # for future | Avoid relabeling inventory before seeing the real source. |
| Q5 | First wife-ready demonstration selection | Resolved: both — mixed representative cases centered on a familiar theme | Choose the representative import and demonstration path. |

Q1/Q3/Q4/Q5 are answered. Q2 is the remaining source dependency: PDF sample plus original notebook export ZIP; separate associated originals when available. No repeated answers or completed-detail collection are required before the audit.

## Verified results

Local: 68 application tests passed, including real Miniflare D1/R2 authorization and recovery, conditional-write races, paged gap reads, linked choices beyond 200, shared rules, local draft interaction/download roundtrip and conflict-draft retention. Sixteen offline Node helper tests passed. SQLite schema/synthetic import, eight Python recovery tests, three HTML-audit tests, TypeScript and frontend/Worker build passed. No real customer source was used. Test-only React Testing Library/jsdom dependencies are locked and excluded from shipped UI runtime.

Real-browser visual/interaction QA was attempted but Chromium download returned invalid/truncated archives in this runtime. No headless visual pass or actual Edge/iPhone pass is claimed. DOM tests verify local interactions, not browser layout or native download behavior. Source-level responsive CSS/focus treatment is included; actual target-device acceptance remains open.

Both GitHub Actions checks and Cloudflare Workers Builds passed for implementation 182bb9f. The published tree matches the locally tested staged source. Build d74557bd-2972-4d2c-80b4-6be1c2da7b8c produced version 91cc3b16-50bf-4ab7-9816-faa07abdf6b3. See [sanitized evidence](evidence/Batch_20261015.json). New UI live acceptance remains pending. Keep application PR #1 draft and production unreleased.

## Remaining engineering and evidence dependencies

1. Obtain a representative source and confirm account/export type. Audit without editing OneNote; reconcile native containers, HTML/resources, source identities and unreferenced files.
2. Exercise the new screens on actual intended devices; second intended admin's own sign-in is still untested. Do not redo earlier completed functional acceptance merely for screenshots.
3. Design persistent provenance/review/history with migrations and exact backup/restore backward/forward fixtures. Current live queue cannot save completion decisions.
4. Implement source-specific extraction and an idempotent, conflict-aware live importer. Unknown fields must not erase known catalog values. Reconcile D1 rows/links and original bytes, with staged approval and a pre-change backup.
5. Complete remaining recovery MIME fidelity/runtime/scale and operational access-recovery work. Native importer/provenance failures and crash-recovery need representative fixtures before release.
6. Revisit search-based selectors over 10,000, richer image previews/full format checks and comprehensive real-browser accessibility testing only when the near-term samples justify them.

These remaining tasks are cataloged in [development guidelines](Development_Guidelines.md) and existing CC-TODO-007/008/009. Photo-assisted extraction 010 and Canva 011 remain deferred. No new task ID is needed for this sub-workflow.
