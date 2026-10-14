# CC-TODO-002/003/004 — Development verification

Updated 2026-10-14. Current priority; OneNote 008/009, photo extraction 010 and Canva 011 remain deferred.

| Component | Evidence already passed | Earliest remaining evidence |
| --- | --- | --- |
| GitHub | Canonical public repo, active draft PR/branch, source writes/readbacks, CI | Compare actual deployed source SHA with expected feature head |
| Workers/Access | Owner login/session, live UI/routes/downloads; fresh remote browser reaches Access sign-in | Authenticate current browser, execute new read-only report |
| D1 | Migrations 0001/0002, 16 tables, synthetic linked edit/read, live shape UI and archive restoration | Fresh migration/FK report and remaining location/physical cutter/mapping UI |
| R2 | Public Access Disabled screenshot, disposable round-trip/cleanup, live photo upload/download | Fresh binding/sample read, persistent design image/STL/deletion/missing-file gates |
| Owner Windows | Node v24.21.0, npm.cmd 11.19.0 | Local Wrangler registry download still Defender-blocked; parked, not a prerequisite for dashboard/GitHub flow |
| Assistant runtime | Linux Node v24.19.0, local tests/build | Does not verify owner PC |

## Read-only report

Open the authenticated development app and select Verify development infrastructure, then Download verification report. Route GET /api/dev/infrastructure-check is owner-only/no-store and performs no D1/R2 writes. It returns build provenance, schema table count, migration names, FK violation count, record counts, R2 first-page count and up to five linked original existence/size checks.

A passed read-only report does not prove all CRUD/upload/deletion, full bucket integrity or public-access settings. R2 privacy remains a dashboard evidence gate. No keys, filenames, emails, JWTs, owner secret or raw record contents are returned.

Compare reported commit with the exact feature-branch commit intended for deployment. Vite embeds Cloudflare WORKERS_CI_COMMIT_SHA/WORKERS_CI_BRANCH, or GITHUB_SHA and CI branch; absent valid 40-character SHA stays null/unknown. Build Node describes build infrastructure. Official build variables: https://developers.cloudflare.com/workers/ci-cd/builds/configuration/ .

## Concrete next sequence

1. Owner-authenticated report and exact GitHub-to-Worker source match; do not bypass Access.
2. CC-TODO-002 remaining location/physical cutter/design mapping UI create/link/edit/search/retrieve across refresh. Use labelled test data and preserve existing demonstration records.
3. CC-TODO-003 persistent design image/STL retrieval, deliberate original removal and missing-file handling, with a trusted backup. Preserve earlier successful photo/storage checks.
4. Return to original-containing TAR/larger upload recovery under 006, intended collaborator readiness under 005 and representative samples under 007.
5. Defer 008–011 until these foundations are accepted.

Current remote browser is at Access email sign-in, not an authenticated app session. Live verification is blocked on secure owner authentication; no credential or OTP may be requested in chat. Local 43 tests and application build passed, including real Miniflare read-only preservation/missing-migration/missing-file and owner/method guards. Live new report still pending.

## Windows setup

Do not reinstall working Node or disable Defender/execution policy. Use npm.cmd instead of the blocked npm.ps1. tools/verify_windows_setup.ps1 optionally reads versions/policy only; prepared but not run on the owner PC. If script execution is restricted, paste its reviewed contents into an existing PowerShell session rather than changing policy. It neither retries registry access nor changes onboarding/security. Do not count assistant-container versions or build metadata as owner-PC evidence.

## Scope boundaries

Only development authorized. No production release/merge, extra paid resources, subscriptions, security weakening or resumption of deferred alternate-email denial test. Independent history-free fresh-chat restoration remains pending.
