# CC-TODO-004 — Deployment and rollback runbook

## Preview-build correction — 2026-10-14, 21:51 UTC

Diagnosed from the owner's pasted Cloudflare log for build 0b5aa3fa-6963-479b-ad5f-ec496f4caf54 (docs/cc-browser-backlog-20261014, 0816b899): preview trigger ran npx wrangler preview from repository root with no build command; it failed because no previews block was present. The owner's settings screenshots confirmed preview builds enabled, root /, no build command, and preview command npx wrangler preview. This is separate from the successful feature deployment at 6069211, Worker version 1ae89578-b6f4-4c01-9839-d8a568a4df25.

Owner reported completing the instruction to disable Builds for Preview branches and check persistence after refresh. Treat the setting as owner-confirmed, not an independent API readback. Normal deployment remains feature/cc-infrastructure-foundation, root app, npm run build, npx wrangler deploy; the production-settings screenshot showed Disable builds off. Here Cloudflare's Production label means this development Worker's active deployment, not approval for business production. No previews block, credentials, access changes, paid resources or app release were added. Historical failed checks remain historical; the next documentation PR can verify no new Workers preview check is triggered.

Next: CC-TODO-006 isolated Cloudflare restore preparation (docs/Isolated_Cloudflare_Restore.md), then execution only with confirmed separate recovery targets. Preserve existing development DB/R2 and all completed local restore/rollback evidence. Browser acceptance remains queued; OneNote/photo/Canva and the alternate-email test remain deferred. Dashboard automation is currently blocked by a Cloudflare login 403 in the remote browser; owner dashboard access works.


## Current continuation — Main protection active

Main-branch protection was created and read back on 2026-10-14 after owner sign-in. The exact main rule requires a pull request, sqlite from GitHub Actions, an up-to-date branch and resolved conversations, and applies to administrators. Mandatory approvals are disabled for the current single-owner workflow; force pushes/deletions are disabled. The branch API reports main protected=true and development protected=false. Detailed protection API access is unavailable to the integration (403); persisted checkbox/source selections were verified in the signed-in GitHub UI.

Main updates now use documentation-only pull requests and required checks. Application PR #1 remains draft/unmerged. A validation workflow covers the notes-only main state and preserves schema/import + Node tests/type-check/build whenever app source is present; incomplete source layout fails. Intended-device outcomes remain pending in docs/Device_Acceptance.md. No application release, new access, resource, cost or deployment setting changed.

## Current checkpoint — 2026-10-14, 20:15 UTC

The development code rollback and roll-forward drill passed. Exact deployed sources: baseline 489ed640 → compatible previous app redeployment 26c2425e → restored current app 0a613893. Signed-in owner reads, same-value synthetic-location saves, exact-byte original downloads and restored phase archives passed. All phases retained identical schema, all 14 rows across 16 tables, and the one 5400084-byte STL; integrity/FKs passed. CI and Workers Builds passed. No migration, data restore, resource/security change or production release occurred.

Next CC-TODO-004 prerequisites: intended-device acceptance and main-release safeguards. Read-only GitHub inspection found main and development branches unprotected with no rulesets; no settings were changed. CC-TODO-006 isolated Cloudflare restore/cloud sync/retention, 005 intended-user roles and 007 real samples stay open. Preserve deferred alternate-email testing and Windows remediation. OneNote/photo/Canva remain future work. See docs/Development_Rollback_Acceptance.md and docs/evidence/Development_Rollback_20261014.json.

## Earlier checkpoint — 2026-10-14, 19:35 UTC

Controlled missing-original recovery passed live on ec8f864: 200 → missing 409 with metadata/link retained → restored 200 with matching bytes → verified fixture cleanup. Existing catalog counts and the retained 5.4 MB STL stayed unchanged. 49 tests/build, GitHub CI and Workers Builds passed.

Development code rollback/roll-forward subsequently passed; intended-device and main-release safeguards remain. Cloudflare-side full restore, collaborator access and representative samples remain open. Keep OneNote/photo/Canva deferred and the alternate-email test parked. Details: docs/Missing_File_Recovery_Check.md and docs/Development_Rollback_Acceptance.md.

## Latest acceptance — 2026-10-14

Approved deletion of the original two synthetic attachments passed; one STL was re-uploaded under a new identity for recovery and remains private. Live original-containing TAR local restore passed: 16 tables, 14 rows, one 5400084-byte original with matching bytes, valid relationships, SQLite integrity and completion receipt. Implementation 1ea5c0e matched the deployed SHA and passed 45 tests/build plus GitHub CI.

Download small TAR archive now supports complete archives up to 32 MiB when direct folder saving is unavailable. The direct-save 1 GiB originals ceiling and old JSON limits are unchanged. No payload/database/original is in GitHub.

The controlled live missing-original detection/recovery gate subsequently passed using a unique disposable fixture; see current acceptance above. Cloudflare restore, sync/retention, collaborators, release and real-sample gates remain open. Preserve deferred alternate-email testing and future OneNote/photo/Canva work. Full evidence and recovery checksums: docs/Infrastructure_Verification.md.

Updated: 2026-10-14 UTC. Development compatible-code rollback/roll-forward passed; production and provider-native rollback acceptance remain pending.

## Latest development recovery update

2026-10-14: owner confirmed Matched fields highlighting works. CC-TODO-006 now adds a larger TAR archive with a D1 schema/records/migration snapshot, separate original bytes, SHA-256 metadata and a required completion receipt. Browser assembly and direct folder saving use desktop Chrome/Edge; each original is a separate authenticated request, avoiding one long Worker invocation. Limits: 25 MiB/file, 1000 originals, 1 GiB originals total, 10000 rows/table, 16 MiB manifest. These are application ceilings, not demonstrated production throughput. Local tests recovered a 5,250,084-byte STL and all 16 tables/relationships; a separate test covered 26 originals. All 40 Node tests and type-check/frontend/Worker build passed. Corruption/truncation/extra data, missing/orphan/changed files and denied requests fail. Live larger upload/retrieval and original-containing TAR local restore now passed; direct folder saving is denied in this cloud browser, which uses the bounded 32 MiB download instead. Old JSON backup/recovery-test formats and their 4 MiB total/25-object limits are retained for compatibility. No new resources, paid plan, automatic transfer/pruning or production changes.

Archive manifest/file routes reuse existing signed owner identity, DB/FILES bindings and schema. No migration or secret change. Live new routes/file-picker saving remain unverified. Keep separate production approval gates.

## Current development configuration

Canonical source jbrickey23/Cookie_Catalog; active feature/cc-infrastructure-foundation, draft PR #1. Main remains the earlier bootstrap/release branch.

- URL: https://cookie-catalog-dev.j-brickey.workers.dev
- Worker/D1: cookie-catalog-dev; private R2: cookie-catalog-dev-private.
- Root app; build npm run build; deploy npx wrangler deploy.
- Wrangler bindings DB and FILES; D1 migrations 0001_initial.sql and 0002_variants_components.sql applied/tracked.
- Access app Cookie Catalog Dev; team cookie-catalog-jbrickey.cloudflareaccess.com; audience configured in app/wrangler.jsonc. Owner configured regular and preview coverage.
- OWNER_EMAIL must remain a Worker Secret; required-secret validation blocks deployment when absent. Server verifies signed Access JWTs and fails closed.

Owner build log proved development deployment of 8122a92 at 2026-10-12T20:38:58Z. Later actual downloads prove newer backup/recovery routes were live, but earlier exporting commits were not attested, but deployed 2939565 and 1ea5c0e were independently matched to GitHub on 2026-10-14. Old failed retries cloned main; use current feature-branch builds. Build-project label/preview behavior still needs review.

Owner session and synthetic database/storage checks passed. Actual browser packages restored locally, including original PNG/STL bytes. Core catalog create/update/read/search implemented locally 2026-10-13; live gate pending. Owner-only persistent attachment routes and browser controls were implemented 2026-10-13, reusing existing schema/bindings. No migration or resource provisioning required. Local 27 Node tests, SQLite schema/import and type-check/build passed; owner screenshot and download confirmation prove photo upload/read deployment; synthetic design/STL retrieval, approved deletion and original-containing TAR local restore subsequently passed; see latest evidence above.

## Automated validation

Code 40ab108 passed CI #97: 20 Node tests, Python SQLite schema/import, TypeScript type-check and Vite frontend/Worker build. Pre-reconciliation head 330ca8a passed CI #105. CI cannot establish live deployment, intended-user access, production recovery or rollback by itself.

## Release boundaries and remaining gates

Development provisioning was explicitly authorized. No production deployment or extra paid resources are authorized. Production requires separate Worker, D1, private R2, Access audience and credentials; deploy reviewed main commits only after approval and verified gates.

Remaining: intended devices/browsers, wife/collaborator roles and recovery, persistent authorized file paths, live negative-edge authorization, pre-merge checks/appropriate branch protection, main-release integration, known-good release/deployment mapping and rollback drill. Owner deferred alternate-email denial testing; do not resume automatically.

Keep secrets, tokens, JWTs, operational backup payloads and purchased assets out of public Git/client code. Public configuration IDs are not secrets. Avoid competing hosting-managed source; GitHub is canonical.

## Verified development rollback route

The compatible GitHub redeployment drill completed backward and forward on 2026-10-14 with exact-source attestation, owner reads/same-value writes and original retrieval. Three restored phase archives had identical schema, all 14 rows and one 5400084-byte original. CI/Workers Builds passed. No D1/R2 data rollback occurred. Exact commits, hashes and reusable procedure: docs/Development_Rollback_Acceptance.md.

Provider-native and production rollback remain untested; the application is not merged/released to production. Current next gates are intended-device use and main-release safeguards. Both branches are currently unprotected and no rulesets were returned; settings were not changed.

## Local setup limitation

Owner Windows Node v24.21.0 and npm.cmd 11.19.0 work, but Defender blocks registry.npmjs.org before Wrangler login. Plain npm.ps1 is execution-policy blocked. Park residual management remediation; no PC reset/reinstall authorized. Current development browser/dashboard workflow does not require resolving this first.
