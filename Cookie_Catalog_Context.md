# Cookie_Catalog — Context

## 2026-10-14 — Isolated recovery import tooling prepared

CC-TODO-006 now has offline TAR-to-D1 SQL preparation and exact recovery comparison in tools/prepare_cloudflare_restore.py. Generated private output is refused inside git checkouts; existing destinations are preserved. Eight Python tests plus the expanded large-original local D1 integration pass; full 49 Node tests, schema/import and type-check/frontend/Worker build passed. Generated SQL imports into a separate local Miniflare D1 with all 16 tables/complete records retained. No remote restore is claimed, no private archive was used in this session, and no Cloudflare resources/settings were changed.

Next prerequisite: authenticated read-only Cloudflare inventory, then confirmed empty separate recovery targets and free-tier capacity/new-resource authorization. Proposed names: D1 cookie-catalog-recovery-20261014 and private R2 cookie-catalog-recovery-20261014-private. These do not exist as verified targets. The current remote browser reaches Cloudflare sign-in; the earlier 403 is historical, not a current sign-in result. The plugin directory returned no Cloudflare integration. Preserve active cookie-catalog-dev and cookie-catalog-dev-private; no rebind, overwrite, paid resources, production release or automatic cleanup. See docs/Isolated_Cloudflare_Restore.md for the concrete preparation/import/download/comparison procedure and limits. Cloud execution, privacy/provenance, independent sync, retention and scale remain open. Device acceptance, roles, samples and deferred OneNote/photo/Canva sequencing are unchanged.

## Preview-build correction — 2026-10-14, 21:51 UTC

Diagnosed from the owner's pasted Cloudflare log for build 0b5aa3fa-6963-479b-ad5f-ec496f4caf54 (docs/cc-browser-backlog-20261014, 0816b899): preview trigger ran npx wrangler preview from repository root with no build command; it failed because no previews block was present. The owner's settings screenshots confirmed preview builds enabled, root /, no build command, and preview command npx wrangler preview. This is separate from the successful feature deployment at 6069211, Worker version 1ae89578-b6f4-4c01-9839-d8a568a4df25.

Owner reported completing the instruction to disable Builds for Preview branches and check persistence after refresh. Treat the setting as owner-confirmed, not an independent API readback. Normal deployment remains feature/cc-infrastructure-foundation, root app, npm run build, npx wrangler deploy; the production-settings screenshot showed Disable builds off. Here Cloudflare's Production label means this development Worker's active deployment, not approval for business production. No previews block, credentials, access changes, paid resources or app release were added. Historical failed checks remain historical; the next documentation PR can verify no new Workers preview check is triggered.

Next: CC-TODO-006 isolated Cloudflare restore preparation (docs/Isolated_Cloudflare_Restore.md), then execution only with confirmed separate recovery targets. Preserve existing development DB/R2 and all completed local restore/rollback evidence. Browser acceptance remains queued; OneNote/photo/Canva and the alternate-email test remain deferred. Dashboard automation is currently blocked by a Cloudflare login 403 in the remote browser; owner dashboard access works.


## Owner sequencing clarification — 2026-10-14

Keep building the base application infrastructure under CC-TODO-002/003/004. Preserve the completed D1/R2, deployment, rollback and main-protection passes. Next actionable infrastructure follow-up: inspect the failed Cloudflare Workers Builds check on documentation-only PR #2 and review build/preview branch selection; diagnose before changing deployment settings. Continue the existing infrastructure/recovery/access/sample sequence below. No browser compatibility implementation is started by recording these requirements.

Browser/device backlog within CC-TODO-004: support Chrome and Microsoft Edge on Windows, plus Safari on iPhone. Interpret the owner's “Edge/Explorer” as modern Edge; legacy Internet Explorer support is not added. Before release, verify sign-in, record/search/form usability, private file upload/download, responsive layout and the appropriate backup path on those targets. Desktop direct-folder saving and the bounded TAR fallback have different capabilities; keep limitations explicit. Actual Edge/iPhone outcomes remain pending. This acceptance work follows the current base-infrastructure prerequisites; it does not replace them or introduce a new task ID.

## Current continuation — Main protection active

Main-branch protection was created and read back on 2026-10-14 after owner sign-in. The exact main rule requires a pull request, sqlite from GitHub Actions, an up-to-date branch and resolved conversations, and applies to administrators. Mandatory approvals are disabled for the current single-owner workflow; force pushes/deletions are disabled. The branch API reports main protected=true and development protected=false. Detailed protection API access is unavailable to the integration (403); persisted checkbox/source selections were verified in the signed-in GitHub UI.

Main updates now use documentation-only pull requests and required checks. Application PR #1 remains draft/unmerged. A validation workflow covers the notes-only main state and preserves schema/import + Node tests/type-check/build whenever app source is present; incomplete source layout fails. Intended-device outcomes remain pending in docs/Device_Acceptance.md. No application release, new access, resource, cost or deployment setting changed.

## Current checkpoint — 2026-10-14, 20:15 UTC

The development code rollback and roll-forward drill passed. Exact deployed sources: baseline 489ed640 → compatible previous app redeployment 26c2425e → restored current app 0a613893. Signed-in owner reads, same-value synthetic-location saves, exact-byte original downloads and restored phase archives passed. All phases retained identical schema, all 14 rows across 16 tables, and the one 5400084-byte STL; integrity/FKs passed. CI and Workers Builds passed. No migration, data restore, resource/security change or production release occurred.

Next CC-TODO-004 prerequisites: intended-device acceptance and main-release safeguards. Read-only GitHub inspection found main and development branches unprotected with no rulesets; no settings were changed. CC-TODO-006 isolated Cloudflare restore/cloud sync/retention, 005 intended-user roles and 007 real samples stay open. Preserve deferred alternate-email testing and Windows remediation. OneNote/photo/Canva remain future work. See docs/Development_Rollback_Acceptance.md and docs/evidence/Development_Rollback_20261014.json.

## Goal and source ownership

Jay's wife's cookie decorating business needs theme/design photos, compatible physical/printable cutters, locations, dimensions and known flips. Many designs can reuse a shape; designs may use multiple cutters. V1 scaling happens in the slicer. Automatic flip suggestions, derived model generation, OneNote migration, photo metadata extraction, Canva and invoicing are future work.

JBrickey23/Cookie_Catalog is public and canonical for application source, migrations, instructions and durable state. D1/R2 hold private records/originals. No payloads, purchased assets, owner photos or credentials belong in GitHub. Source application branch is feature/cc-infrastructure-foundation, open draft PR #1. Main's notes/user companion are current; its app is still bootstrap and has not been merged/released. No AGENTS.md found in the inspected tree; check again in a new session.

## Passed evidence to preserve

- Development Worker/D1 cookie-catalog-dev; R2 cookie-catalog-dev-private with DB/FILES bindings. Public Access Disabled was dashboard-evidenced; authenticated current R2 listing/reads passed.
- Access Cookie Catalog Dev with emailed PIN; signed JWT/audience and OWNER_EMAIL secret verification fails closed. Owner path passed. Intended collaborator membership/roles/recovery and the owner-deferred alternate-email test remain separate.
- Both migrations 0001_initial.sql/0002_variants_components.sql applied. 15 catalog tables plus d1_migrations. Synthetic relationships, real browser create/edit/search/refresh for shape/design/location/physical cutter/proposed flip mapping passed; matched fields explain metadata hits.
- Owner photo upload/refresh/download passed earlier. Synthetic design PNG and 5400084-byte STL upload/refresh/download passed with exact bytes. Two original synthetic attachment identities were deleted with explicit approval; one STL was re-uploaded for archive evidence and remains linked to DEMO Evergreen tree. Do not delete it or owner content without applicable authorization.
- ec8f864 implemented the unique disposable missing-original diagnostic. Live initial 200, object loss/409, unavailable listing with metadata/link retained, exact-byte recovery/200 and cleanup passed. Fixture left no residual data/object. Current 49 tests/build and CI passed, including concurrency, preservation and failure-cleanup guards.
- Legacy JSON fixture recovery preserved PNG/STL and relationships. Earlier live database-only TAR restored 16 tables/7 rows/0 originals; later original-containing TAR restored 16 tables/14 rows/one 5400084-byte STL. Schema, integrity/FK, completion and original-byte checks passed.
- Direct folder save is denied in this cloud browser. Explicit bounded TAR download supports at most 32 MiB of full TAR data; oversized/broken streams fail before download. Larger direct-save path retains 1 GiB originals/1000 files, 25 MiB/file, 10000 rows/table and 16 MiB manifest ceilings; old JSON remains 4 MiB originals/25 objects. These are application limits, not demonstrated production capacity.
- Latest actual three-phase code rollback preserved every table row/schema and original, plus authenticated same-value test-record writes. It used normal GitHub commits and Workers Builds, not provider-native rollback. No D1/R2 data rollback ran.

## Current next action and operational boundaries

Main protection is active as recorded above. Review the Cloudflare docs-only build failure and build/preview branch selection next, preserving base-infrastructure priority. Chrome/Edge on Windows and Safari on iPhone are queued acceptance targets before a separately approved release; do not start compatibility implementation ahead of the infrastructure sequence. CI workflow Schema smoke tests uses job sqlite for schema/import, Node tests, type-check and build. Release/protection changes and device/role acceptance are not proven by CI.

CC-TODO-006 still needs isolated Cloudflare-side data/object restore, independent sync, retention/cadence/ownership and production consistency/scale. CC-TODO-007 needs authorized representative real samples. Keep stable task IDs and future 008–011 deferred. Routine reversible engineering is autonomous; new resources, material cost, production changes and security weakening require separate authorization. No such scope expansion occurred.

## Owner Windows and backup continuity

Owner Windows Node v24.21.0 and npm.cmd 11.19.0 were verified. npm.ps1 execution policy is blocked; Defender event 1126 blocks node.exe access to registry.npmjs.org before Wrangler login. Residual enrollment/tamper protection remediation is parked; no reset/reinstall/security bypass authorized. The cloud and assistant Linux Node versions are different environments; build metadata does not verify Windows. Optional tools/verify_windows_setup.ps1 is read-only and prepared, not executed on the owner's PC.

Owner OneDrive Cookie_Catalog/Backups/Cookie_Catalog_Backups_20261012T231810Z placement is recorded; completed sync and latest-seven manual retention remain unconfirmed/proposed. A fresh pre-rollback TAR was privately retained and restored before this drill. Full backup identifiers/checksums are in rollback/recovery documentation; no archive payload is in GitHub.

## User documentation and fresh-chat restoration

Owner requested a plain-language user companion. docs/User_Companion.md is created, README-linked and checked against current controls/search fields; maintain it with user-visible changes. Technical notes do not replace it.

This session used prior history. Do not close CC-TODO-001's independent fresh-chat test on this evidence. New sessions must fetch current durable files and PR/heads before changes; preserve completed passes, parked security remediation and deferred alternate-email denial testing.
