# Cookie_Catalog

A private catalog for a cookie decorating business: find designs by theme, identify compatible cutters, and retrieve physical locations or original printable files. Known flips and many-to-many design/cutter mappings are part of the intended workflow.

## Current checkpoint — 2026-10-13

Canonical source: [jbrickey23/Cookie_Catalog](https://github.com/jbrickey23/Cookie_Catalog). The repository is public; operational data, purchased originals, credentials and full backups stay private.

Development is on `feature/cc-infrastructure-foundation`, [draft PR #1](https://github.com/jbrickey23/Cookie_Catalog/pull/1). `main` is the release branch and still contains the earlier bootstrap. Development site: https://cookie-catalog-dev.j-brickey.workers.dev.

Cloudflare Workers, D1 and private R2 are provisioned for development. Owner authentication and synthetic database/storage checks passed. Two actual browser exports restored locally: a database-only snapshot and a recovery test with PNG/STL originals and linked records. Code commit `40ab108` passed CI #97 (20 Node tests, SQLite schema/import checks and application build); pre-reconciliation head `330ca8a` passed CI #105.

The owner placed the timestamped backup folder under personal OneDrive: `Cookie_Catalog/Backups/Cookie_Catalog_Backups_20261012T231810Z`. Cloud sync completion is not yet confirmed. Manual retention of the latest seven normal snapshots remains proposed.

CC-TODO-003 now implements owner-only persistent attachment upload/download and metadata/link deletion, missing-file detection, and manual orphan audit/cleanup. Browser controls select existing shapes/designs; no new migration is needed. Local validation passed: 27 Node tests, SQLite schema/import and frontend/Worker build. Live deployment and owner upload/download/delete acceptance are still pending. Use small synthetic files; maximum 4 MiB per file, while the current backup tool allows only 4 MiB of originals total.

Next gate: verify this new attachment flow on the development site, then continue CC-TODO-002 general catalog record operations. Real samples, collaborator access, Cloudflare-side restore, release protection and rollback remain open. No production deployment is authorized.

## Restore project context

Read this README, `Cookie_Catalog_Context.md`, `Cookie_Catalog_TODO.md`, `Cookie_Catalog_Decision_Log.md` and `Cookie_Catalog_New_Chat_Bootstrap_Prompt.md`. Inspect open PRs and read the active development branch when main lags. Read applicable AGENTS.md if present; none was found at this checkpoint. Verify current remote state before changes and verify writes afterward.

See `docs/Backup_Recovery_Plan.md` for recovery evidence and instructions, and `docs/Deployment_Runbook.md` for deployment boundaries.

Source layout: `app/`, `database/`, `docs/`, `samples/`, `tools/` and `tests/`. All current catalog fixtures are synthetic; real inventory has not been supplied.
