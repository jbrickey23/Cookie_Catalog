# Cookie_Catalog

## Reconciled handoff — October 14, 2026 Pacific (October 15 UTC)

This is the authoritative current checkpoint. Earlier dated sections are historical evidence; their pending/proposed statements do not override this checkpoint.

- Active application source remains `feature/cc-infrastructure-foundation`, draft PR #1. App code `fed6dc1` passed 56 local application tests, TypeScript/frontend/Worker build, both GitHub Actions checks and Cloudflare Workers Builds. Subsequent commits record acceptance. Main is not an application release; production remains unreleased.
- **CC-TODO-012 complete:** direct Node Windows save, 16 tables/14 rows/one original, local receipt, non-destructive retention review and independently web-downloaded cloud copy matched. Backup helper remains manual. Approved policy: Jay backs up after meaningful changes and before import/bulk edits/deletion; latest seven normal plus protected pre-change copies until changes/recoverability are verified.
- **CC-TODO-005 progressed:** admin and owner are identical, represented by `owner`; two intended owner-equivalent accounts and one viewer were configured privately through optional `CATALOG_MEMBERS` Secret plus the existing Access allow policy. Owner reports settings saved/deployed. Existing owner live Admin / Owner session and separate private-browser viewer read-only/search/details/original download passed. Viewer controls/permissions are tested; no live unauthorized-identity denial is claimed.
- Membership is currently private Worker deployment configuration, not D1. No schema migration or membership editor was added. JWT validation precedes membership checks; server denies viewer mutations/maintenance/export. Bootstrap `OWNER_EMAIL` remains a separate recovery path. Recover Access/secrets separately; catalog TAR excludes them. Real account emails, payloads and secrets remain outside public GitHub.
- **Next:** verify the second intended admin's own sign-in, then remaining intended-device checks (Windows Chrome/Edge and iPhone Safari; exact browser/version of today's owner/viewer observations was not captured). Do not repeat completed behavior just for screenshots. Then representative authorized real samples/import readiness under 007 and remaining recovery/release work.
- **Still open:** history-independent fresh-chat test (001); broader real-sample field/schema/file acceptance (002/003/007); exact intended-device coverage, production separation/release/rollback (004); second admin login and operational access recovery (005); recovery R2 Content-Type fidelity, recovery app runtime, operational scale/consistency and broader recovery readiness (006). Sample isolated D1/schema/record and R2 key/byte restore, independent OneDrive copy and approved manual backup policy already passed.
- Keep the alternate-email denial test and Defender/Wrangler remediation parked. Preserve isolated recovery resources and existing data. OneNote 008/009, photo extraction 010 and Canva 011 remain deferred. No paid resources, production release, automatic transfer/scheduling/pruning or security weakening. Next unused task ID: CC-TODO-013.

## Current continuation — Main protection active

Main-branch protection was created and read back on 2026-10-14 after owner sign-in. The exact main rule requires a pull request, sqlite from GitHub Actions, an up-to-date branch and resolved conversations, and applies to administrators. Mandatory approvals are disabled for the current single-owner workflow; force pushes/deletions are disabled. The branch API reports main protected=true and development protected=false. Detailed protection API access is unavailable to the integration (403); persisted checkbox/source selections were verified in the signed-in GitHub UI.

Main updates now use documentation-only pull requests and required checks. Application PR #1 remains draft/unmerged. A validation workflow covers the notes-only main state and preserves schema/import + Node tests/type-check/build whenever app source is present; incomplete source layout fails. Intended-device outcomes remain pending in docs/Device_Acceptance.md. No application release, new access, resource, cost or deployment setting changed.

## Current checkpoint — 2026-10-14, 20:15 UTC

The development code rollback and roll-forward drill passed. Exact deployed sources: baseline 489ed640 → compatible previous app redeployment 26c2425e → restored current app 0a613893. Signed-in owner reads, same-value synthetic-location saves, exact-byte original downloads and restored phase archives passed. All phases retained identical schema, all 14 rows across 16 tables, and the one 5400084-byte STL; integrity/FKs passed. CI and Workers Builds passed. No migration, data restore, resource/security change or production release occurred.

Next CC-TODO-004 prerequisites: intended-device acceptance and main-release safeguards. Read-only GitHub inspection found main and development branches unprotected with no rulesets; no settings were changed. CC-TODO-006 isolated Cloudflare restore/cloud sync/retention, 005 intended-user roles and 007 real samples stay open. Preserve deferred alternate-email testing and Windows remediation. OneNote/photo/Canva remain future work. See docs/Development_Rollback_Acceptance.md and docs/evidence/Development_Rollback_20261014.json.

## Source and current development

GitHub JBrickey23/Cookie_Catalog is authoritative and public. Operational records, originals, full backups and credentials remain private. Application code is on feature/cc-infrastructure-foundation, draft PR #1. Main holds current durable notes and the user companion; the application has not been merged or released to production.

Development site: https://cookie-catalog-dev.j-brickey.workers.dev/ . Existing Worker/D1 cookie-catalog-dev, private R2 cookie-catalog-dev-private and Access are provisioned. Migrations 0001/0002, owner authentication, catalog shape/design/location/physical-cutter/mapping workflows, matched-field search, private PNG/STL retrieval, approved synthetic deletion and isolated missing-original recovery passed. Live TAR/local recovery passed with original bytes and relationships. The earlier code had 45 Node tests; current code has 49; relevant CI also validates SQLite/schema/import and application build.

No component closes from a single smoke check. Broader release, roles, device, representative-sample and operational-recovery gates remain in TODO. OneNote 008/009, photo metadata 010 and Canva 011 are deferred; next unused task ID is 012.

## Local setup and continuity

Owner Windows Node v24.21.0/npm.cmd 11.19.0 already verified. Use npm.cmd; npm.ps1 is policy-blocked. Defender blocks local Wrangler package download; remediation remains parked and does not block the working GitHub deployment path. Cloud build Node is a separate environment.

Read Context, TODO, Decision Log, New Chat Bootstrap Prompt and applicable AGENTS.md, then inspect current branches/PRs. No AGENTS.md was found in the latest inspected tree. Independent history-free fresh-chat restoration remains open.

[Deployment runbook](docs/Deployment_Runbook.md) · [Rollback acceptance](docs/Development_Rollback_Acceptance.md) · [Infrastructure evidence](docs/Infrastructure_Verification.md) · [Backup recovery](docs/Backup_Recovery_Plan.md)
