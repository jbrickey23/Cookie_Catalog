# Cookie_Catalog

Private catalog for a cookie decorating business: find designs, compatible owned/printable cutters, physical locations and original files, including known flips.

## Current checkpoint — 2026-10-14

GitHub jbrickey23/Cookie_Catalog is authoritative. Repository is public: operational records, originals, full backups and credentials stay private.

Application development: feature/cc-infrastructure-foundation, draft PR #1. Main is the release branch; only its durable notes are being reconciled, without merging the application or deploying production. Inspect the active PR for code and newest validation.

Development site: https://cookie-catalog-dev.j-brickey.workers.dev. Owner-authorized Worker/D1 cookie-catalog-dev, private R2 cookie-catalog-dev-private and Access are provisioned. Migrations 0001/0002 applied; owner session, synthetic linked D1 records, R2 smoke, live photo upload/download, shape create/edit/search and highlighting passed. Actual JSON recovery restored linked PNG/STL fixtures. Actual TAR restored 16 tables/7 rows/0 originals; live original-containing TAR remains pending; larger upload/retrieval now passed.

## Immediate sequence

Resume CC-TODO-002/003/004 infrastructure acceptance. Exact GitHub-to-Worker deployment and fresh D1/R2 checks passed on 2026-10-14 for commit 2939565; 43 local tests/build and its GitHub CI passed.

Location, physical cutter, design and proposed flip mapping create/edit/refresh/search/retrieve passed using labelled synthetic records. Design PNG and 5400084-byte STL uploaded, survived refresh and downloaded byte-identically. Prior owner shape/photo passes are preserved.

Next unmet gate: CC-TODO-003 live deliberate deletion/missing-file handling using only synthetic originals with retained copies. Then CC-TODO-006 original-containing TAR restore and remaining access/release/sample readiness. Components stay open for broader acceptance. See docs/Infrastructure_Verification.md.

OneNote audit/import (008/009), photo metadata extraction (010) and Canva (011) are deferred future work. Next unused task ID: 012.

## Local setup

Owner Windows Node v24.21.0 and npm.cmd 11.19.0 already passed. Plain npm.ps1 is policy-blocked; Defender blocked registry.npmjs.org before Wrangler login. Remediation remains parked. Use existing browser deployment; no reinstall, security disabling, new provisioning, paid resource or production authorization.

## Restore project state

Read README, Context, TODO, Decision Log, New Chat Bootstrap Prompt and applicable AGENTS.md, then inspect open PRs/branch heads. No AGENTS.md found in the active tree. This session used visible history; independent fresh-chat acceptance remains open.

See docs/Infrastructure_Verification.md, docs/Deployment_Runbook.md and recovery plans. OneDrive backup placement is recorded; completed sync/manual retention still need confirmation. Continue reversible engineering autonomously, verify remote writes, and preserve task IDs/evidence.
