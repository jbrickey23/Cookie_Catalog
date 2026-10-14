# CC-TODO-004 — Deployment and rollback runbook

Updated: 2026-10-14 UTC. Development deployed; production and rollback acceptance pending.

## Latest development recovery update

2026-10-14: owner confirmed Matched fields highlighting works. CC-TODO-006 now adds a larger TAR archive with a D1 schema/records/migration snapshot, separate original bytes, SHA-256 metadata and a required completion receipt. Browser assembly and direct folder saving use desktop Chrome/Edge; each original is a separate authenticated request, avoiding one long Worker invocation. Limits: 25 MiB/file, 1000 originals, 1 GiB originals total, 10000 rows/table, 16 MiB manifest. These are application ceilings, not demonstrated production throughput. Local tests recovered a 5,250,084-byte STL and all 16 tables/relationships; a separate test covered 26 originals. All 40 Node tests and type-check/frontend/Worker build passed. Corruption/truncation/extra data, missing/orphan/changed files and denied requests fail. Live larger-upload/archive/save/restore acceptance remains pending. Old JSON backup/recovery-test formats and their 4 MiB total/25-object limits are retained for compatibility. No new resources, paid plan, automatic transfer/pruning or production changes.

Archive manifest/file routes reuse existing signed owner identity, DB/FILES bindings and schema. No migration or secret change. Live new routes/file-picker saving remain unverified. Keep separate production approval gates.

## Current development configuration

Canonical source jbrickey23/Cookie_Catalog; active feature/cc-infrastructure-foundation, draft PR #1. Main remains the earlier bootstrap/release branch.

- URL: https://cookie-catalog-dev.j-brickey.workers.dev
- Worker/D1: cookie-catalog-dev; private R2: cookie-catalog-dev-private.
- Root app; build npm run build; deploy npx wrangler deploy.
- Wrangler bindings DB and FILES; D1 migrations 0001_initial.sql and 0002_variants_components.sql applied/tracked.
- Access app Cookie Catalog Dev; team cookie-catalog-jbrickey.cloudflareaccess.com; audience configured in app/wrangler.jsonc. Owner configured regular and preview coverage.
- OWNER_EMAIL must remain a Worker Secret; required-secret validation blocks deployment when absent. Server verifies signed Access JWTs and fails closed.

Owner build log proved development deployment of 8122a92 at 2026-10-12T20:38:58Z. Later actual downloads prove newer backup/recovery routes were live, but the exact exporting deployment commit was not independently recorded. Old failed retries cloned main; use current feature-branch builds. Build-project label/preview behavior still needs review.

Owner session and synthetic database/storage checks passed. Actual browser packages restored locally, including original PNG/STL bytes. Core catalog create/update/read/search implemented locally 2026-10-13; live gate pending. Owner-only persistent attachment routes and browser controls were implemented 2026-10-13, reusing existing schema/bindings. No migration or resource provisioning required. Local 27 Node tests, SQLite schema/import and type-check/build passed; owner screenshot and download confirmation prove photo upload/read deployment; deletion/design/STL remain unconfirmed.

## Automated validation

Code 40ab108 passed CI #97: 20 Node tests, Python SQLite schema/import, TypeScript type-check and Vite frontend/Worker build. Pre-reconciliation head 330ca8a passed CI #105. CI cannot establish live deployment, intended-user access, production recovery or rollback by itself.

## Release boundaries and remaining gates

Development provisioning was explicitly authorized. No production deployment or extra paid resources are authorized. Production requires separate Worker, D1, private R2, Access audience and credentials; deploy reviewed main commits only after approval and verified gates.

Remaining: intended devices/browsers, wife/collaborator roles and recovery, persistent authorized file paths, live negative-edge authorization, pre-merge checks/appropriate branch protection, main-release integration, known-good release/deployment mapping and rollback drill. Owner deferred alternate-email denial testing; do not resume automatically.

Keep secrets, tokens, JWTs, operational backup payloads and purchased assets out of public Git/client code. Public configuration IDs are not secrets. Avoid competing hosting-managed source; GitHub is canonical.

## Rollback procedure to validate

1. Record a known-good reviewed main commit and corresponding Worker deployment.
2. Revert code through the provider deployment rollback mechanism or redeploy that verified commit.
3. Handle schema/data separately: prefer additive migrations; use verified data recovery when needed.
4. Restore R2 originals with manifest/checksum verification, independent of code rollback.
5. Verify authenticated reads/writes and file authorization afterward.

No production known-good release or completed rollback drill is recorded. Cloudflare-side full D1/R2 restore remains open under CC-TODO-006.

## Local setup limitation

Owner Windows Node v24.21.0 and npm.cmd 11.19.0 work, but Defender blocks registry.npmjs.org before Wrangler login. Plain npm.ps1 is execution-policy blocked. Park residual management remediation; no PC reset/reinstall authorized. Current development browser/dashboard workflow does not require resolving this first.
