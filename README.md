# Cookie_Catalog

A private catalog for a cookie decorating business: find designs by theme, identify compatible cutters, and retrieve physical locations or original printable files. Known flips and many-to-many design/cutter mappings are part of the intended workflow.

## Current checkpoint — 2026-10-14

Canonical source: [jbrickey23/Cookie_Catalog](https://github.com/jbrickey23/Cookie_Catalog). The repository is public; operational data, purchased originals, credentials and full backups stay private.

Development is on `feature/cc-infrastructure-foundation`, [draft PR #1](https://github.com/jbrickey23/Cookie_Catalog/pull/1). `main` is the release branch and still contains the earlier bootstrap. Development site: https://cookie-catalog-dev.j-brickey.workers.dev.

Cloudflare Workers, D1 and private R2 are provisioned for development. Owner authentication and synthetic database/storage checks passed. Two actual browser exports restored locally: a database-only snapshot and a recovery test with PNG/STL originals and linked records. Code commit `40ab108` passed CI #97 (20 Node tests, SQLite schema/import checks and application build); pre-reconciliation head `330ca8a` passed CI #105.

The owner placed the timestamped backup folder under personal OneDrive: `Cookie_Catalog/Backups/Cookie_Catalog_Backups_20261012T231810Z`. Cloud sync completion is not yet confirmed. Manual retention of the latest seven normal snapshots remains proposed.

CC-TODO-003 now implements owner-only persistent attachment upload/download and metadata/link deletion, missing-file detection, and manual orphan audit/cleanup. Browser controls select existing shapes/designs; no new migration is needed. Local validation passed: 27 Node tests, SQLite schema/import and frontend/Worker build. Live owner photo upload/persistence/download passed; deletion and design/STL flows remain unconfirmed. Use small synthetic files; current upload limit 25 MiB per file. Catalog archive supports up to 1 GiB originals/1000 files; old JSON backup remains 4 MiB total.

Owner-only catalog creation/editing/search now covers cutter shapes, designs, locations, physical cutters and compatibility mappings. Owner confirmed live shape create/edit/refresh/search. Search now shows matched field labels and highlighted excerpts; latest local 40 tests/build passed; owner confirmed live highlighting.

Next gate: refresh and use Save catalog archive in desktop Chrome/Edge; choose the private OneDrive backup folder, keep mutations idle and verify the saved TAR restores. Live larger-upload/archive acceptance, physical cutter/location/mapping checks and production-scale recovery remain open. Real samples, collaborator access, Cloudflare-side restore, release protection and rollback remain open. No production deployment is authorized.

## Restore project context

Read this README, `Cookie_Catalog_Context.md`, `Cookie_Catalog_TODO.md`, `Cookie_Catalog_Decision_Log.md` and `Cookie_Catalog_New_Chat_Bootstrap_Prompt.md`. Inspect open PRs and read the active development branch when main lags. Read applicable AGENTS.md if present; none was found at this checkpoint. Verify current remote state before changes and verify writes afterward.

See `docs/Backup_Recovery_Plan.md` for recovery evidence and instructions, and `docs/Deployment_Runbook.md` for deployment boundaries.

Source layout: `app/`, `database/`, `docs/`, `samples/`, `tools/` and `tests/`. All current catalog fixtures are synthetic; real inventory has not been supplied.

## Larger recovery checkpoint

2026-10-14: owner confirmed Matched fields highlighting works. CC-TODO-006 now adds a larger TAR archive with a D1 schema/records/migration snapshot, separate original bytes, SHA-256 metadata and a required completion receipt. Browser assembly and direct folder saving use desktop Chrome/Edge; each original is a separate authenticated request, avoiding one long Worker invocation. Limits: 25 MiB/file, 1000 originals, 1 GiB originals total, 10000 rows/table, 16 MiB manifest. These are application ceilings, not demonstrated production throughput. Local tests recovered a 5,250,084-byte STL and all 16 tables/relationships; a separate test covered 26 originals. All 40 Node tests and type-check/frontend/Worker build passed. Corruption/truncation/extra data, missing/orphan/changed files and denied requests fail. Live larger-upload/archive/save/restore acceptance remains pending. Old JSON backup/recovery-test formats and their 4 MiB total/25-object limits are retained for compatibility. No new resources, paid plan, automatic transfer/pruning or production changes.

See docs/Archive_Backup.md and tools/restore_archive_backup.py. Existing JSON downloads still use tools/restore_development_backup.py.
