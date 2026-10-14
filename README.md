# Cookie_Catalog

## Current continuation — Main safeguards and devices

Main protection is still NOT applied: readback shows main/development unprotected and no rulesets. The exact single-owner-compatible PR/check policy is prepared in docs/Main_Branch_Safeguards.md. Applying it requires owner GitHub browser sign-in; no credential values belong in project files. The current browser is at sign-in, not an authenticated settings page. No protection settings, repository permissions, deployment settings or application code changed.

Device evidence and a short intended-device checklist are in docs/Device_Acceptance.md. Existing cloud-desktop and earlier owner workflow passes are preserved; actual target-device/browser outcomes remain pending. The next action is secure owner sign-in, then apply/read back the main rule and record actual device outcomes. Preserve the completed rollback/recovery work and all production/resource/security boundaries.

Start here: [User Companion](docs/User_Companion.md) — plain-language catalog, search, files, backups and development-check instructions.

Private catalog for a cookie decorating business: find designs, compatible owned/printable cutters, physical locations, known flips and original files.

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
