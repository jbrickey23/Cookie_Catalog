# Cookie_Catalog — Context

Updated 2026-10-14 UTC. This current checkpoint supersedes older implementation snapshots; historical decisions remain in Decision Log.

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

Verify intended devices/users and configure appropriate pre-merge/main-release safeguards before any separately approved release. Both branches currently report protected=false; no rulesets exist. CI workflow Schema smoke tests uses job sqlite for schema/import, Node tests, type-check and build. Release/protection changes and device/role acceptance are not proven by CI.

CC-TODO-006 still needs isolated Cloudflare-side data/object restore, independent sync, retention/cadence/ownership and production consistency/scale. CC-TODO-007 needs authorized representative real samples. Keep stable task IDs and future 008–011 deferred. Routine reversible engineering is autonomous; new resources, material cost, production changes and security weakening require separate authorization. No such scope expansion occurred.

## Owner Windows and backup continuity

Owner Windows Node v24.21.0 and npm.cmd 11.19.0 were verified. npm.ps1 execution policy is blocked; Defender event 1126 blocks node.exe access to registry.npmjs.org before Wrangler login. Residual enrollment/tamper protection remediation is parked; no reset/reinstall/security bypass authorized. The cloud and assistant Linux Node versions are different environments; build metadata does not verify Windows. Optional tools/verify_windows_setup.ps1 is read-only and prepared, not executed on the owner's PC.

Owner OneDrive Cookie_Catalog/Backups/Cookie_Catalog_Backups_20261012T231810Z placement is recorded; completed sync and latest-seven manual retention remain unconfirmed/proposed. A fresh pre-rollback TAR was privately retained and restored before this drill. Full backup identifiers/checksums are in rollback/recovery documentation; no archive payload is in GitHub.

## User documentation and fresh-chat restoration

Owner requested a plain-language user companion. docs/User_Companion.md is created, README-linked and checked against current controls/search fields; maintain it with user-visible changes. Technical notes do not replace it.

This session used prior history. Do not close CC-TODO-001's independent fresh-chat test on this evidence. New sessions must fetch current durable files and PR/heads before changes; preserve completed passes, parked security remediation and deferred alternate-email denial testing.
