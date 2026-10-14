# CC-TODO-002/003/004 — Development verification

Updated 2026-10-14. Current priority; OneNote 008/009, photo extraction 010 and Canva 011 remain deferred.

| Component | Evidence already passed | Earliest remaining evidence |
| --- | --- | --- |
| GitHub | Canonical public repo, active draft PR/branch, source writes/readbacks, CI | Passed: deployed 2939565 matched GitHub; later code deployments need their own report |
| Workers/Access | Owner login/session, live UI/routes/downloads; fresh owner-authenticated report | Passed: owner-authenticated report; broader release/rollback gates remain |
| D1 | Migrations 0001/0002, 16 tables, synthetic linked edit/read, live shape UI and archive restoration | Passed: fresh migrations/FKs and synthetic location/physical cutter/design/mapping UI |
| R2 | Public Access Disabled screenshot, disposable round-trip/cleanup, live photo upload/download | Passed: two originals sampled, PNG/STL byte-identical retrieval; deletion/missing-file gate remains |
| Owner Windows | Node v24.21.0, npm.cmd 11.19.0 | Local Wrangler registry download still Defender-blocked; parked, not a prerequisite for dashboard/GitHub flow |
| Assistant runtime | Linux Node v24.19.0, local tests/build | Does not verify owner PC |

## Read-only report

Open the authenticated development app and select Verify development infrastructure, then Download verification report. Route GET /api/dev/infrastructure-check is owner-only/no-store and performs no D1/R2 writes. It returns build provenance, schema table count, migration names, FK violation count, record counts, R2 first-page count and up to five linked original existence/size checks.

A passed read-only report does not prove all CRUD/upload/deletion, full bucket integrity or public-access settings. R2 privacy remains a dashboard evidence gate. No keys, filenames, emails, JWTs, owner secret or raw record contents are returned.

Compare reported commit with the exact feature-branch commit intended for deployment. Vite embeds Cloudflare WORKERS_CI_COMMIT_SHA/WORKERS_CI_BRANCH, or GITHUB_SHA and CI branch; absent valid 40-character SHA stays null/unknown. Build Node describes build infrastructure. Official build variables: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/ .

## Concrete next sequence

1. Preserve the passed exact deployment and current read-only report for commit 2939565.
2. Preserve the passed synthetic catalog UI and persistent PNG/STL checks below.
3. Next: CC-TODO-003 deliberate deletion and missing-file handling using synthetic originals with retained copies; leave owner content intact.
4. Return to original-containing TAR/larger upload recovery under 006, intended collaborator readiness under 005 and representative samples under 007.
5. Defer 008–011 until these foundations are accepted.

Live acceptance 2026-10-14: owner-authenticated browser report at 19:20:11.841Z identified deployed commit 2939565e128502c32b2cf3448f0c673f9b68c797 on feature/cc-infrastructure-foundation, matching GitHub. Workers Builds Node v24.18.0 is separate from owner Windows Node. D1: 16 tables, migrations 0001/0002, zero FK violations; R2: two objects/two linked originals sampled, none missing or size-mismatched. GitHub Actions run 38619770729 passed for that commit. Later documentation-only commits do not invalidate this timestamped deployment evidence; compare a new deployment report when code changes.

Live browser 2026-10-14: created and edited labelled TEST Infrastructure 20261014 location, design, physical cutter and proposed flip mapping, then reloaded/searched/retrieved them. Cutter retained 91 x 101 mm, quantity 3, printed origin and linked test shelf. Mapping retained design/shape, proposed flip, edited instructions, rotation 180, mirror Yes, width 90–95 mm. Search identified the matching notes/instructions. Existing demonstration records were preserved. Test records remain in development; record deletion is unavailable.

Live persistent file acceptance 2026-10-14: synthetic design PNG (1944 bytes, SHA-256 b176ff52e49f3b96495aebeae0a546b5b9fe8ce7ff47d6560438a28d618ced71) and synthetic STL (5400084 bytes, SHA-256 44f1d7d5617d5611da7832a8c3e7fd512d970b3e6f80a61775cbf981a18892f7) uploaded, survived full refresh, and downloaded byte-identically. This passes live >4 MiB upload/retrieval, not original-containing TAR recovery. Both synthetic originals remain linked in private R2. Deletion/missing-file live checks remain open; do not remove existing owner content.

Local 43 tests and application build passed, including real Miniflare preservation/missing-migration/missing-file and owner/method guards. Read-only report saved at docs/evidence/Infrastructure_20261014.json. Synthetic metadata/files remain in development; no payload is committed to GitHub.

## Windows setup

Do not reinstall working Node or disable Defender/execution policy. Use npm.cmd instead of the blocked npm.ps1. tools/verify_windows_setup.ps1 optionally reads versions/policy only; prepared but not run on the owner PC. If script execution is restricted, paste its reviewed contents into an existing PowerShell session rather than changing policy. It neither retries registry access nor changes onboarding/security. Do not count assistant-container versions or build metadata as owner-PC evidence.

## Scope boundaries

Only development authorized. No production release/merge, extra paid resources, subscriptions, security weakening or resumption of deferred alternate-email denial test. Independent history-free fresh-chat restoration remains pending.
