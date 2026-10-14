# Cookie_Catalog — Context

## Current checkpoint — 2026-10-14, 19:35 UTC

Controlled missing-original recovery passed live on ec8f864: 200 → missing 409 with metadata/link retained → restored 200 with matching bytes → verified fixture cleanup. Existing catalog counts and the retained 5.4 MB STL stayed unchanged. 49 tests/build, GitHub CI and Workers Builds passed.

Next: CC-TODO-004 development code-rollback/intended-device acceptance; checklist prepared, drill not run. Cloudflare-side full restore, collaborator access and representative samples remain open. Keep OneNote/photo/Canva deferred and the alternate-email test parked. Details: docs/Missing_File_Recovery_Check.md and docs/Development_Rollback_Acceptance.md.

## Latest acceptance — 2026-10-14

Approved deletion of the original two synthetic attachments passed; one STL was re-uploaded under a new identity for recovery and remains private. Live original-containing TAR local restore passed: 16 tables, 14 rows, one 5400084-byte original with matching bytes, valid relationships, SQLite integrity and completion receipt. Implementation 1ea5c0e matched the deployed SHA and passed 45 tests/build plus GitHub CI.

Download small TAR archive now supports complete archives up to 32 MiB when direct folder saving is unavailable. The direct-save 1 GiB originals ceiling and old JSON limits are unchanged. No payload/database/original is in GitHub.

The controlled live missing-original detection/recovery gate subsequently passed using a unique disposable fixture; see current acceptance above. Cloudflare restore, sync/retention, collaborators, release and real-sample gates remain open. Preserve deferred alternate-email testing and future OneNote/photo/Canva work. Full evidence and recovery checksums: docs/Infrastructure_Verification.md.

Updated 2026-10-14 UTC. Current handoff supersedes older implementation snapshots.

## Identity and goal

Jay's wife's cookie decorating business needs theme/design photos, compatible physical/printable cutters, locations, dimensions and known flips. Many designs can reuse a shape; designs may use multiple cutters. GitHub jbrickey23/Cookie_Catalog is public and canonical for source, migrations and durable state; private D1/R2 hold records/originals. Do not label synthetic fixtures as inventory or publish real/purchased content.

V1 scaling happens in the slicer; store original assets, dimensions and optional sizing guidance. Automatic flip suggestions, derived model generation and order/invoicing remain deferred.

## Branch/source ownership

Active application branch feature/cc-infrastructure-foundation, open draft PR #1. Main is release and retains bootstrap application state; current durable notes are synchronized onto main without merging the app. Read the PR branch before engineering. No AGENTS.md found in its complete tree. New OneNote tasks had been added to main's older TODO, incorrectly labelled next; preserve their IDs/criteria but defer them.

## Verified infrastructure

- Development Worker and D1 cookie-catalog-dev; R2 cookie-catalog-dev-private with DB/FILES bindings. R2 screenshot showed Public Access Disabled after original storage check.
- URL https://cookie-catalog-dev.j-brickey.workers.dev. GitHub-connected development builds use app root, npm run build, npx wrangler deploy, feature branch. Owner supplied original deployment log; later live UI/downloads prove subsequent routes deployed, exact deployed commit 2939565e128502c32b2cf3448f0c673f9b68c797 was independently matched to GitHub on 2026-10-14.
- D1 migrations 0001_initial.sql and 0002_variants_components.sql applied/tracked: 15 catalog tables plus d1_migrations. Linked synthetic design/shape/cutter create/edit/read at 90 x 100 mm passed; exports retained relationships.
- Access Cookie Catalog Dev, emailed PIN, team cookie-catalog-jbrickey.cloudflareaccess.com. Signed JWT/audience/owner-secret verifier fails closed. Owner session passed; intended collaborator roles/access/recovery remain open.
- Private photo upload/refresh/download passed. Shape UI create/edit/refresh/search and Matched fields highlighting owner-confirmed. Location/physical cutter/design/mapping UI acceptance and private design-image/STL retrieval now passed with synthetic records; approved synthetic deletion passed; controlled live missing-original acceptance now passed.
- Existing owner-only JSON export/recovery restored 16 tables/17 rows/2 original fixtures with hashes/FKs valid. Live larger TAR dated 2026-10-14 restored 16 tables/7 rows/0 originals; it proves database-only archive recovery, not the subsequent original-containing recovery/deletion evidence recorded below.
- Larger browser TAR code is implemented: 25 MiB/file, 1000 originals/1 GiB total, 10000 rows/table, 16 MiB manifest. Local 5.25 MB and 26-original tests passed. These are ceilings, not live production throughput.
- Prior code d8b67ac passed CI #115; notes head e6a5bb1 passed CI #116/117. New read-only infrastructure report/build provenance locally passed 43 tests and type-check/build; live report and GitHub CI passed for 2939565.

## Earliest unmet prerequisite and action

CC-TODO-002/003/004 remain current priority. Live acceptance 2026-10-14: owner-authenticated browser report at 19:20:11.841Z identified deployed commit 2939565e128502c32b2cf3448f0c673f9b68c797 on feature/cc-infrastructure-foundation, matching GitHub. Workers Builds Node v24.18.0 is separate from owner Windows Node. D1: 16 tables, migrations 0001/0002, zero FK violations; R2: two objects/two linked originals sampled, none missing or size-mismatched. GitHub Actions run 38619770729 passed for that commit. Later documentation-only commits do not invalidate this timestamped deployment evidence; compare a new deployment report when code changes.

Live browser 2026-10-14: created and edited labelled TEST Infrastructure 20261014 location, design, physical cutter and proposed flip mapping, then reloaded/searched/retrieved them. Cutter retained 91 x 101 mm, quantity 3, printed origin and linked test shelf. Mapping retained design/shape, proposed flip, edited instructions, rotation 180, mirror Yes, width 90–95 mm. Search identified the matching notes/instructions. Existing demonstration records were preserved. Test records remain in development; record deletion is unavailable.

Live persistent file acceptance 2026-10-14: synthetic design PNG (1944 bytes, SHA-256 b176ff52e49f3b96495aebeae0a546b5b9fe8ce7ff47d6560438a28d618ced71) and synthetic STL (5400084 bytes, SHA-256 44f1d7d5617d5611da7832a8c3e7fd512d970b3e6f80a61775cbf981a18892f7) uploaded, survived full refresh, and downloaded byte-identically. This passes live >4 MiB upload/retrieval, not original-containing TAR recovery. The original two synthetic attachment identities were subsequently deleted with explicit approval; one STL was re-uploaded solely for the successful live TAR recovery below. Controlled missing-original acceptance remains open; do not remove owner content.

CC-TODO-003 approved deletion and controlled missing-original detection/recovery now passed. Earliest current deployment gate is CC-TODO-004 development rollback/intended-device acceptance. Keep earlier passes; do not repeat the resolved login/provenance prerequisite. Future browser sessions may require secure authentication again; never request secrets in chat. CC-TODO-006 original-containing TAR/larger-file local recovery now passed; isolated Cloudflare restore and operational durability remain open. Continue 005 collaborator readiness and 007 authorized representative samples after foundations. OneNote 008/009, photo extraction 010 and Canva 011 are future work; no connector/account access or bulk import is currently requested.

## Owner local setup and boundaries

Windows Node v24.21.0 and npm.cmd 11.19.0 were verified; plain npm.ps1 is execution-policy blocked. Wrangler package download was blocked by Defender event 1126 for node.exe -> registry.npmjs.org before Cloudflare login. Audit setting did not change; tamper protection/OnboardingState=1 indicate residual enrollment. Previous IT unavailable; remediation parked, no reset/reinstall/security bypass authorized. Node installation is not missing and local Wrangler is not required for the working dashboard/GitHub flow.

Optional tools/verify_windows_setup.ps1 only reads versions/policy and never touches registry/network/security. It is prepared, not executed on the owner's PC. If execution policy blocks script files, paste its reviewed contents into an existing PowerShell session; do not disable policy. The assistant's Linux runtime Node v24.19.0 is separately observed and does not verify Windows.

## Recovery/privacy/governance

Owner OneDrive folder Cookie_Catalog/Backups/Cookie_Catalog_Backups_20261012T231810Z recorded; cloud sync/latest-seven proposed manual retention unconfirmed. Generated test STL is synthetic test-only, not inventory. Never put full archives/DBs/photos/purchased models in this public repo.

Architecture/governance decisions 001–013 preserved; development provisioning was later explicitly authorized. Routine reversible work autonomous. Material tradeoffs, new cost/provisioning and production need separate approval; no new services/paid plan/production authorized. Owner deferred alternate-email denial test: do not restart it; missing codes were inconclusive. No independent history-free fresh-chat test occurred here, so 001 stays open.

## User documentation

The owner requested a user-facing companion on October 14. docs/User_Companion.md now explains the current workflow, terms, matched search, searchable metadata boundaries, file handling, backup choices and development controls in plain language. It is linked from README and should be updated with user-visible behavior. It does not claim future integrations, production readiness or a general restoration UI.
