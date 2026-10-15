# Autonomous engineering batch — October 15, 2026

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
| Q1 | Where is the current OneNote notebook stored? | A personal OneDrive; B work/school Microsoft 365/SharePoint; C unsure | Select the supported extraction route. No account type has been assumed. |
| Q2 | Representative source material | Provide the existing export/sample pages and associated original files when available; preserve the original notebook | Real parsing, page/item counts, relationships, actual gaps and duplicate review. A link/account alone is not a supplied export. |
| Q3 | Which physical measurement should be primary? | A cutting-footprint width/height, retaining maker labels/outside size in notes (recommended); B outside dimensions; C both as separate structured values later | Final measurement/schema convention. Existing numbers remain unverified meanwhile. |
| Q4 | How should physical locations be named? | A keep existing labels first and normalize after audit (recommended); B adopt a new room/cabinet/bin scheme now | Avoid relabeling inventory before seeing the real source. |
| Q5 | First wife-ready demonstration selection | A mixed 6–10 real examples including physical/file-only/design/missing-detail/known-flip cases (recommended); B one familiar theme first | Choose the representative import and demonstration path. |

A compact response can be `Q1 A; Q3 A; Q4 A; Q5 A`, with the source supplied separately when convenient. Q2 is a source dependency, not an approval request. Defaults Q3–Q5 do not block further synthetic engineering.

## Verified results

Local: 68 application tests passed, including real Miniflare D1/R2 authorization and recovery, conditional-write races, paged gap reads, linked choices beyond 200, shared rules, local draft interaction/download roundtrip and conflict-draft retention. Sixteen offline Node helper tests passed. SQLite schema/synthetic import, eight Python recovery tests, three HTML-audit tests, TypeScript and frontend/Worker build passed. No real customer source was used. Test-only React Testing Library/jsdom dependencies are locked and excluded from shipped UI runtime.

Real-browser visual/interaction QA was attempted but Chromium download returned invalid/truncated archives in this runtime. No headless visual pass or actual Edge/iPhone pass is claimed. DOM tests verify local interactions, not browser layout or native download behavior. Source-level responsive CSS/focus treatment is included; actual target-device acceptance remains open.

Remote CI/deployment outcomes are recorded in the follow-up durable checkpoint after publication. Keep application PR #1 draft and production unreleased.

## Remaining engineering and evidence dependencies

1. Obtain a representative source and confirm account/export type. Audit without editing OneNote; reconcile native containers, HTML/resources, source identities and unreferenced files.
2. Exercise the new screens on actual intended devices; second intended admin's own sign-in is still untested. Do not redo earlier completed functional acceptance merely for screenshots.
3. Design persistent provenance/review/history with migrations and exact backup/restore backward/forward fixtures. Current live queue cannot save completion decisions.
4. Implement source-specific extraction and an idempotent, conflict-aware live importer. Unknown fields must not erase known catalog values. Reconcile D1 rows/links and original bytes, with staged approval and a pre-change backup.
5. Complete remaining recovery MIME fidelity/runtime/scale and operational access-recovery work. Native importer/provenance failures and crash-recovery need representative fixtures before release.
6. Revisit search-based selectors over 10,000, richer image previews/full format checks and comprehensive real-browser accessibility testing only when the near-term samples justify them.

These remaining tasks are cataloged in [development guidelines](Development_Guidelines.md) and existing CC-TODO-007/008/009. Photo-assisted extraction 010 and Canva 011 remain deferred. No new task ID is needed for this sub-workflow.
