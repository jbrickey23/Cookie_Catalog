# Cookie_Catalog

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
