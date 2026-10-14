# Cookie_Catalog — Context

Updated: 2026-10-14 UTC. This checkpoint supersedes earlier implementation snapshots; decisions retain their stable IDs.

## Identity and purpose

Owner: Jay Brickey. Primary intended user: Jay's wife, who runs a cookie decorating business with purchased and printed cutters and purchased printable originals. Repository: `jbrickey23/Cookie_Catalog`, public, default/release branch `main`. GitHub is canonical for code, migrations and project state; live records, purchased files and backups remain private.

Intended workflow: search Christmas/tree or another theme, browse design photos, select a compatible cutter and size, then retrieve its physical location or printable original. A cutter can support many designs; a design can fit many cutters. Track known flips and tested versus proposed mappings, physical-ready/available-to-print/inspiration-only states, millimeter dimensions and optional sizing guidance. The slicer applies scaling in v1. Automatic new flip suggestions, derived model generation and order/invoicing management are deferred.

## Current development state

- Active branch: `feature/cc-infrastructure-foundation`; draft PR #1. Main remains the earlier bootstrap.
- React/Vite frontend and Worker API. Development URL: https://cookie-catalog-dev.j-brickey.workers.dev.
- Worker and D1: `cookie-catalog-dev`; private R2: `cookie-catalog-dev-private`, bindings DB and FILES. R2 screenshot showed Public Access Disabled and empty storage after the original smoke check.
- Migrations `0001_initial.sql` and `0002_variants_components.sql` applied in development: 15 catalog tables plus d1_migrations.
- Cloudflare Access app `Cookie Catalog Dev`, Zero Trust Free, emailed PIN, regular/preview hostname coverage owner-configured. Server verifies signed Access JWTs and the OWNER_EMAIL secret, failing closed. Owner session returned authenticated=true, role=owner.
- Owner confirmed synthetic database create/link/edit/read at 90 × 100 mm and three-file R2 round-trip/cleanup. Core owner shape create/update/read/search passed live; physical cutter/location/mapping acceptance remains pending. Persistent owner photo upload/persistence/download is live-verified; deletion and other file types remain unconfirmed.
- Owner-only browser backup and disposable file-recovery test implemented. Actual downloads restored locally with integrity, foreign-key, relationship and original-byte checks passed. See Backup_Recovery_Plan for exact evidence.
- Code `40ab108`: CI #97 passed, including 20 Node tests, Python SQLite schema/import validation and TypeScript/Vite frontend/Worker build. Pre-reconciliation head `330ca8a`: CI #105 passed. These results do not establish production readiness.

## Current recovery continuation

2026-10-14: owner confirmed Matched fields highlighting works. CC-TODO-006 now adds a larger TAR archive with a D1 schema/records/migration snapshot, separate original bytes, SHA-256 metadata and a required completion receipt. Browser assembly and direct folder saving use desktop Chrome/Edge; each original is a separate authenticated request, avoiding one long Worker invocation. Limits: 25 MiB/file, 1000 originals, 1 GiB originals total, 10000 rows/table, 16 MiB manifest. These are application ceilings, not demonstrated production throughput. Local tests recovered a 5,250,084-byte STL and all 16 tables/relationships; a separate test covered 26 originals. All 40 Node tests and type-check/frontend/Worker build passed. Corruption/truncation/extra data, missing/orphan/changed files and denied requests fail. Live larger-upload/archive/save/restore acceptance remains pending. Old JSON backup/recovery-test formats and their 4 MiB total/25-object limits are retained for compatibility. No new resources, paid plan, automatic transfer/pruning or production changes.

Next live gate: save a catalog TAR into the existing private OneDrive backup folder and restore-check it; then test a file larger than 4 MiB and repeat archive recovery. Cloud sync/retention, collaborator access, real samples, Cloudflare-side restore and production consistency/release remain open.

## Search matching and metadata

2026-10-13 search refinement: owner confirmed the live test shape create/edit/refresh/search flow passed, then requested an explanation of each search match. Results now include labelled matched fields with a bounded highlighted excerpt; all matching fields are reported. Search is literal within each field rather than concatenating unrelated field values. Existing names/notes plus maker/source link, physical cutter location/origin/width/height/quantity, and mapping names/use/status/instructions are searchable. Metadata is stored in D1 catalog rows and does not rewrite photo/STL/3MF originals. Tag tables exist; tag entry/search UI, custom metadata and embedded-file metadata extraction remain unimplemented. Local 35 Node tests and type-check/frontend/Worker build passed; owner confirmed live highlighting on 2026-10-14. No schema migration, provisioning, paid resource or production change.

## 2026-10-13 continuation

Live evidence, 2026-10-13: owner screenshot shows the Private files section deployed, a 2,946,752-byte JPEG linked to DEMO Evergreen tree and present after refresh. Owner confirmed the downloaded photo opens. This verifies owner upload/persistence/retrieval; live deletion, design-image/STL workflows and negative-edge access remain unconfirmed. The photograph was user-provided; do not assume it is a synthetic or licensed-shareable fixture. No photograph or new backup payload is committed to GitHub.

Catalog continuation, 2026-10-13: owner-only create/full-update/read/literal-search routes and browser controls now cover shapes, designs, flat locations, physical cutters (millimeters/quantity/origin/location) and design/shape links (tested/proposed, standard/flip/combination, instructions/rotation/mirror/width range). Existing schema reused; no migration or provisioning. Generated stable IDs, parameterized queries, bounded JSON/field validation and same-origin mutations; 200-row search pagination. Local 32 Node tests and TypeScript/Vite frontend/Worker build passed. Owner has since confirmed the live shape create/edit/search flow; live physical cutter/location/mapping checks remain open. Record deletion, tags/visual search, full import and collaborator editing remain unimplemented.

## Backup handoff

Owner supplied the extracted personal OneDrive folder:
`Cookie_Catalog/Backups/Cookie_Catalog_Backups_20261012T231810Z`.

The prepared archive contains two byte-identical UTC-named JSON snapshots, a hash/size/migration/restore manifest and instructions. One is a normal development snapshot; the other contains disposable synthetic recovery fixtures and is test evidence. No backup payload was committed to public GitHub. Local placement is owner-reported and the archive was shown under personal OneDrive; completed cloud sync is not yet evidenced. The latest-seven manual retention/cadence proposal is not an activated schedule or pruning policy. Validation commit is recorded; the exact exporting deployment commit was not independently attested.

## Governance and remaining work

CC-DEC-001–011 establish durable GitHub restoration, infrastructure-first component tasks, one repository, feature branches/main releases, relational SQLite, managed simplicity with portability, architecture-by-exception and Cloudflare/slicer direction. Development provisioning was subsequently explicitly authorized; initial architecture-only language is historical. Continue routine reversible engineering autonomously until told done. Material cost/functionality tradeoffs, new provisioning and production require separate authorization. No extra paid resources or production deployment are authorized.

CC-TODO-003 progress, 2026-10-13: owner-only multipart uploads, original downloads with integrity checks, record lists, metadata/link deletion, missing-file detection and paginated orphan audit/manual cleanup are implemented with browser controls. PNG/JPEG/WebP and shape STL/3MF files have lightweight header validation, not full image/model validation. Original limit has increased to 25 MiB/file; larger TAR supports 1 GiB originals/1000 files, while legacy JSON keeps four MiB total. Metadata-first upload makes failures discoverable; failed cleanup retains entries for retry. Orphan cleanup only touches generated file_ keys older than 24 hours and never linked objects. No migration/provisioning required. Local 27 tests, SQLite schema/import and frontend/Worker build passed. Photo deployment/upload/read acceptance now passed; live deletion/design/STL gates remain. Core CC-TODO-002 shape create/update/search passed live; highlighting passed; verify remaining relationships and live CC-TODO-006 archive/larger-upload recovery before real inventory. Keep CC-TODO-002–007 open until their full acceptance criteria pass. Owner followup: confirm OneDrive sync and settle retention. Collaborator roles/wife access, live negative-edge access, account recovery, Cloudflare-side restoration, scalable consistent backups, main protection/release/rollback and real samples remain open.

The live alternate-email denial test was explicitly deferred by the owner. An inaccessible inbox or missing code is inconclusive; do not resume automatically. Current restoration used history assistance, so CC-TODO-001's strict history-independent fresh-chat test remains pending.

## Parked Windows issue

Node v24.21.0 and npm.cmd 11.19.0 work. Plain npm.ps1 is blocked by execution policy. Wrangler download from registry.npmjs.org failed before Cloudflare login; Defender event 1126 identifies node.exe network blocking. Audit mode did not take effect; IsTamperProtected=true and OnboardingState=1 indicate residual Defender for Endpoint onboarding on the formerly managed PC. Previous IT is unavailable. Park remediation; no reset/reinstall is authorized. Use the browser development workflow and do not repeat passed smoke checks.

## Inputs and operating rules

Real cutter samples have not been supplied. Wife's devices, existing tools/file archive, sharing needs and production budget still need discovery. Preserve stable IDs and distinguish selected, provisioned and verified states. Fetch current GitHub files and open development PRs before changes, check applicable repository instructions, reconcile meaningful progress and verify remote writes. Keep secrets and real/purchased assets out of public history. Never label generated fixtures as inventory.
