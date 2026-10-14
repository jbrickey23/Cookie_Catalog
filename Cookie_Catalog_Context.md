# Cookie_Catalog — Context

Updated 2026-10-14 UTC. Current handoff supersedes older implementation snapshots.

## Identity and goal

Jay's wife's cookie decorating business needs theme/design photos, compatible physical/printable cutters, locations, dimensions and known flips. Many designs can reuse a shape; designs may use multiple cutters. GitHub jbrickey23/Cookie_Catalog is public and canonical for source, migrations and durable state; private D1/R2 hold records/originals. Do not label synthetic fixtures as inventory or publish real/purchased content.

V1 scaling happens in the slicer; store original assets, dimensions and optional sizing guidance. Automatic flip suggestions, derived model generation and order/invoicing remain deferred.

## Branch/source ownership

Active application branch feature/cc-infrastructure-foundation, open draft PR #1. Main is release and retains bootstrap application state; current durable notes are synchronized onto main without merging the app. Read the PR branch before engineering. No AGENTS.md found in its complete tree. New OneNote tasks had been added to main's older TODO, incorrectly labelled next; preserve their IDs/criteria but defer them.

## Verified infrastructure

- Development Worker and D1 cookie-catalog-dev; R2 cookie-catalog-dev-private with DB/FILES bindings. R2 screenshot showed Public Access Disabled after original storage check.
- URL https://cookie-catalog-dev.j-brickey.workers.dev. GitHub-connected development builds use app root, npm run build, npx wrangler deploy, feature branch. Owner supplied original deployment log; later live UI/downloads prove subsequent routes deployed, but exact current source SHA was not independently attested.
- D1 migrations 0001_initial.sql and 0002_variants_components.sql applied/tracked: 15 catalog tables plus d1_migrations. Linked synthetic design/shape/cutter create/edit/read at 90 x 100 mm passed; exports retained relationships.
- Access Cookie Catalog Dev, emailed PIN, team cookie-catalog-jbrickey.cloudflareaccess.com. Signed JWT/audience/owner-secret verifier fails closed. Owner session passed; intended collaborator roles/access/recovery remain open.
- Private photo upload/refresh/download passed. Shape UI create/edit/refresh/search and Matched fields highlighting owner-confirmed. General location/physical cutter/mapping UI acceptance, design-image/STL private retrieval and live deletion remain unconfirmed.
- Existing owner-only JSON export/recovery restored 16 tables/17 rows/2 original fixtures with hashes/FKs valid. Live larger TAR dated 2026-10-14 restored 16 tables/7 rows/0 originals; it proves database-only archive recovery, not current original-file recovery or intentional deletion.
- Larger browser TAR code is implemented: 25 MiB/file, 1000 originals/1 GiB total, 10000 rows/table, 16 MiB manifest. Local 5.25 MB and 26-original tests passed. These are ceilings, not live production throughput.
- Prior code d8b67ac passed CI #115; notes head e6a5bb1 passed CI #116/117. New read-only infrastructure report/build provenance locally passed 43 tests and type-check/build; live result pending.

## Earliest unmet prerequisite and action

CC-TODO-002/003/004 are current priority. First close deployment traceability/current-runtime verification: owner-authenticated report must identify the actual deployed commit and query real D1 migrations/FKs plus R2 listing/sampled originals. The check is read-only, owner-only, no-store; contains counts/build metadata, no raw keys/filenames/account/token data. Build commit comes from WORKERS_CI_COMMIT_SHA (Workers Builds) or GITHUB_SHA (CI); absent provenance stays explicitly unknown. Build Node is not the owner's Windows Node.

On 2026-10-14 this agent's remote browser reached Cloudflare Access email sign-in, not an authenticated application session. That edge observation does not independently verify Worker execution/bindings. Secure owner sign-in is needed for this browser's remaining live checks. Do not bypass Access, request secrets in chat, or claim report success from CI alone.

Then complete the remaining cutter/design/location UI and persistent file gates, preserving earlier passes. CC-TODO-006 original-containing TAR/larger-file recovery is a later recorded gate, not the immediate sequencing driver. Continue 005 collaborator readiness and 007 authorized representative samples after foundations. OneNote 008/009, photo extraction 010 and Canva 011 are future work; no connector/account access or bulk import is currently requested.

## Owner local setup and boundaries

Windows Node v24.21.0 and npm.cmd 11.19.0 were verified; plain npm.ps1 is execution-policy blocked. Wrangler package download was blocked by Defender event 1126 for node.exe -> registry.npmjs.org before Cloudflare login. Audit setting did not change; tamper protection/OnboardingState=1 indicate residual enrollment. Previous IT unavailable; remediation parked, no reset/reinstall/security bypass authorized. Node installation is not missing and local Wrangler is not required for the working dashboard/GitHub flow.

Optional tools/verify_windows_setup.ps1 only reads versions/policy and never touches registry/network/security. It is prepared, not executed on the owner's PC. If execution policy blocks script files, paste its reviewed contents into an existing PowerShell session; do not disable policy. The assistant's Linux runtime Node v24.19.0 is separately observed and does not verify Windows.

## Recovery/privacy/governance

Owner OneDrive folder Cookie_Catalog/Backups/Cookie_Catalog_Backups_20261012T231810Z recorded; cloud sync/latest-seven proposed manual retention unconfirmed. Generated test STL is synthetic test-only, not inventory. Never put full archives/DBs/photos/purchased models in this public repo.

Architecture/governance decisions 001–012 preserved; development provisioning was later explicitly authorized. Routine reversible work autonomous. Material tradeoffs, new cost/provisioning and production need separate approval; no new services/paid plan/production authorized. Owner deferred alternate-email denial test: do not restart it; missing codes were inconclusive. No independent history-free fresh-chat test occurred here, so 001 stays open.
