# CC-TODO-002/003/004 — Development verification

## Current acceptance — 2026-10-14, 19:35 UTC

The controlled missing-original live gate now passed on deployed commit ec8f8640799bbdb2f3df4153f8fe4fca582443df. A unique synthetic photo returned 200 initially, 409 after only its R2 bytes were removed, and 200 after trusted bytes were restored. Listing marked it unavailable during loss; attachment metadata, checksum and shape link survived. Its record, metadata/link and object were then removed and cleanup verified. Existing catalog records and originals were preserved.

Post-test authenticated verification: both migrations, 16 tables, zero foreign-key violations; original catalog counts stayed 2 shapes/2 designs/2 physical cutters/2 mappings; one original remained in R2. The retained 5400084-byte test STL downloaded with its unchanged SHA-256 44f1d7d5617d5611da7832a8c3e7fd512d970b3e6f80a61775cbf981a18892f7. The earlier approved two attachment identities remain deleted; no new missing-test fixture remains.

49 Node tests, TypeScript/frontend/Worker build, GitHub Actions 38624720682/38624732060 and Workers Builds passed for ec8f864. Live result, scope and cleanup behavior: docs/Missing_File_Recovery_Check.md; sanitized runtime evidence: docs/evidence/Infrastructure_20261014_missing_recovery.json.

Current next prerequisite is CC-TODO-004 development code-rollback acceptance and intended-device checks. A development-only rollback checklist is prepared in docs/Development_Rollback_Acceptance.md; no rollback or production release has run. CC-TODO-006 isolated Cloudflare restore/operational durability, 005 intended-user access and 007 representative samples remain open. OneNote 008/009, photo extraction 010 and Canva 011 remain deferred. No new resources/cost/security changes; preserve the deferred alternate-email test.

## Latest acceptance — 2026-10-14, 19:27 UTC

User explicitly approved removal of the two TEST_ONLY originals. Both original attachment identities (synthetic design PNG and 5400084-byte STL) were removed through the confirmed UI; success was reported and both record file lists stayed empty after reload. Server deletion confirms R2 object absence before removing metadata; current report at that point sampled zero originals. A direct old-download navigation was blocked by this browser client, so it does not independently prove an HTTP 404. Live detection of an unexpectedly missing R2 object while metadata remains is still untested; Miniflare tests cover the missing/corrupt/failed-delete cases.

One retained synthetic STL was then re-uploaded under a new attachment identity solely for archive recovery. It remains linked to DEMO Evergreen tree in private development storage; the original two approved identities remain deleted. No existing owner content was removed.

The cloud browser denied showSaveFilePicker. Added an explicit Download small TAR archive option capped at 32 MiB of complete TAR bytes; it rejects oversize/broken streams without producing a partial download and does not weaken browser permissions. Direct saving retains its existing 1 GiB originals ceiling and needs compatible desktop Chrome/Edge. Legacy JSON caps are unchanged.

Implementation 1ea5c0eb28f6b57078ddd90bd055627610fbf1fd passed 45 local Node tests/build and GitHub Actions 38623669568/38623677085. Its deployed SHA was matched in the authenticated report at 19:27:12.088Z: 16 tables, both migrations, zero FK violations, one R2 original with no missing/size mismatch. See docs/evidence/Infrastructure_20261014_archive.json.

Live small-TAR download and clean local restore passed: Cookie_Catalog_Recovery_20261014T192755Z.tar, 5413888 archive bytes, SHA-256 7b1b84faa65c55deff0ee29673083e118b9f0371bd5c8513cacaeb2be88b1577. Restored 16 tables, 14 rows, one 5400084-byte original; SQLite integrity/FKs, completion receipt, exact original bytes and shape/printable-asset relationships passed. Original SHA-256 44f1d7d5617d5611da7832a8c3e7fd512d970b3e6f80a61775cbf981a18892f7. Private recovery archive retained separately; no payload/database/original is in GitHub. CC-TODO-006 stays open for independent cloud sync/retention, isolated Cloudflare restore and operational recovery/scale.

The subsequent controlled CC-TODO-003 missing-original live check passed; see current acceptance above. Normal deletion was not substituted for that evidence. Preserve owner-deferred alternate-email testing. Then continue intended-user/release/representative-sample and Cloudflare recovery gates. OneNote 008/009, photo extraction 010 and Canva 011 remain deferred.

Updated 2026-10-14. Current priority; OneNote 008/009, photo extraction 010 and Canva 011 remain deferred.

| Component | Evidence already passed | Earliest remaining evidence |
| --- | --- | --- |
| GitHub | Canonical public repo, active draft PR/branch, source writes/readbacks, CI | Passed: deployed 2939565 matched GitHub; later code deployments need their own report |
| Workers/Access | Owner login/session, live UI/routes/downloads; fresh owner-authenticated report | Passed: owner-authenticated report; broader release/rollback gates remain |
| D1 | Migrations 0001/0002, 16 tables, synthetic linked edit/read, live shape UI and archive restoration | Passed: fresh migrations/FKs and synthetic location/physical cutter/design/mapping UI |
| R2 | Public Access Disabled screenshot, disposable round-trip/cleanup, live photo upload/download | Passed: two originals sampled, PNG/STL byte-identical retrieval; approved deletion and controlled missing-original live recovery passed |
| Owner Windows | Node v24.21.0, npm.cmd 11.19.0 | Local Wrangler registry download still Defender-blocked; parked, not a prerequisite for dashboard/GitHub flow |
| Assistant runtime | Linux Node v24.19.0, local tests/build | Does not verify owner PC |

## Read-only report

Open the authenticated development app and select Verify development infrastructure, then Download verification report. Route GET /api/dev/infrastructure-check is owner-only/no-store and performs no D1/R2 writes. It returns build provenance, schema table count, migration names, FK violation count, record counts, R2 first-page count and up to five linked original existence/size checks.

A passed read-only report does not prove all CRUD/upload/deletion, full bucket integrity or public-access settings. R2 privacy remains a dashboard evidence gate. No keys, filenames, emails, JWTs, owner secret or raw record contents are returned.

Compare reported commit with the exact feature-branch commit intended for deployment. Vite embeds Cloudflare WORKERS_CI_COMMIT_SHA/WORKERS_CI_BRANCH, or GITHUB_SHA and CI branch; absent valid 40-character SHA stays null/unknown. Build Node describes build infrastructure. Official build variables: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/ .

## Concrete next sequence

1. Preserve the passed exact deployment and current read-only report for commit 2939565.
2. Preserve the passed synthetic catalog UI and persistent PNG/STL checks below.
3. Approved synthetic deletion passed. Controlled live missing-original detection/recovery passed; continue CC-TODO-004 development rollback/intended-device acceptance.
4. Original-containing TAR local restore/larger upload passed. Continue isolated Cloudflare restore and operational durability under 006, intended collaborator readiness under 005 and representative samples under 007.
5. Defer 008–011 until these foundations are accepted.

Live acceptance 2026-10-14: owner-authenticated browser report at 19:20:11.841Z identified deployed commit 2939565e128502c32b2cf3448f0c673f9b68c797 on feature/cc-infrastructure-foundation, matching GitHub. Workers Builds Node v24.18.0 is separate from owner Windows Node. D1: 16 tables, migrations 0001/0002, zero FK violations; R2: two objects/two linked originals sampled, none missing or size-mismatched. GitHub Actions run 38619770729 passed for that commit. Later documentation-only commits do not invalidate this timestamped deployment evidence; compare a new deployment report when code changes.

Live browser 2026-10-14: created and edited labelled TEST Infrastructure 20261014 location, design, physical cutter and proposed flip mapping, then reloaded/searched/retrieved them. Cutter retained 91 x 101 mm, quantity 3, printed origin and linked test shelf. Mapping retained design/shape, proposed flip, edited instructions, rotation 180, mirror Yes, width 90–95 mm. Search identified the matching notes/instructions. Existing demonstration records were preserved. Test records remain in development; record deletion is unavailable.

Live persistent file acceptance 2026-10-14: synthetic design PNG (1944 bytes, SHA-256 b176ff52e49f3b96495aebeae0a546b5b9fe8ce7ff47d6560438a28d618ced71) and synthetic STL (5400084 bytes, SHA-256 44f1d7d5617d5611da7832a8c3e7fd512d970b3e6f80a61775cbf981a18892f7) uploaded, survived full refresh, and downloaded byte-identically. This passes live >4 MiB upload/retrieval, not original-containing TAR recovery. The original two synthetic attachment identities were subsequently deleted with approval; one newly uploaded STL remains for successful TAR recovery evidence. Controlled missing-original live acceptance subsequently passed.

Local 43 tests and application build passed, including real Miniflare preservation/missing-migration/missing-file and owner/method guards. Read-only report saved at docs/evidence/Infrastructure_20261014.json. Synthetic metadata/files remain in development; no payload is committed to GitHub.

## Windows setup

Do not reinstall working Node or disable Defender/execution policy. Use npm.cmd instead of the blocked npm.ps1. tools/verify_windows_setup.ps1 optionally reads versions/policy only; prepared but not run on the owner PC. If script execution is restricted, paste its reviewed contents into an existing PowerShell session rather than changing policy. It neither retries registry access nor changes onboarding/security. Do not count assistant-container versions or build metadata as owner-PC evidence.

## Scope boundaries

Only development authorized. No production release/merge, extra paid resources, subscriptions, security weakening or resumption of deferred alternate-email denial test. Independent history-free fresh-chat restoration remains pending.
