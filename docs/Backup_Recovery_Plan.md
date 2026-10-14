# CC-TODO-006 — Backup and recovery

## 2026-10-14, 23:25 UTC — Approved manual backup policy and scripting follow-up

Owner approved the proposed policy: Jay is responsible for complete private TAR backups in OneDrive Cookie_Catalog/Backups after meaningful catalog changes and before imports or bulk edits/deletions. Retain the latest seven normal backups plus a protected pre-change backup until the changed state is verified and recoverability established. This is the current manual operating policy; no scheduled export, automatic transfer or automatic deletion/pruning has been enabled. Earlier statements that the policy is merely proposed are historical.

Owner requested a TODO to script the workflow, accepting PowerShell even when it only automates the manual parts. CC-TODO-012 is created as an open follow-up under CC-TODO-006. It is not implemented or running and does not replace the remaining access/device/sample sequence. Preserve validated restore/cloud-copy passes, R2 MIME limitation and all parked/deferred boundaries.

## 2026-10-14, 23:21 UTC — Owner-mediated independent cloud-copy checksum passed

Following instructions to copy the fresh TAR into private OneDrive Cookie_Catalog/Backups, locate it in OneDrive web and download it, the owner supplied Cookie_Catalog_2026-10-14T22-44-32-792Z(1).tar. It is 5413888 bytes with SHA-256 93ec5093d5f2c24604b1886775571b2280c73a3d6763596a8c5f1fac0950138d, byte-identical to the original validated TAR. This passes the owner-mediated cloud-copy return/checksum check; OneDrive path/account/sync were not independently inspected by the assistant. No need to repeat unchanged-archive restore tests. Preserve the previous isolated D1 records/schema and R2 original-byte passes, with documented MIME limitation.

Next CC-TODO-006 decision: backup cadence, retention and responsibility. Proposed manual policy: Jay saves a complete TAR after meaningful catalog changes and before imports or bulk edits/deletions; keep the latest seven normal snapshots and retain a pre-change snapshot until the changed state is checked and recoverability established. No automatic deletion, scheduled export, provider transfer or pruning is enabled. The proposal still needs owner acceptance; do not count it as an approved/operational schedule. Then continue intended-user access and queued device checks before real sample import/release. CC-TODO-006 remains open for operational policy, R2 HTTP metadata fidelity and scale/consistency. Retain recovery resources; no active-development or production changes.

## Fresh pre-rollback checkpoint — 2026-10-14

Cookie_Catalog_Before_Rollback_20261014T201056Z.tar was downloaded, privately retained and restored before code changes. It contains 16 tables/14 rows/one 5400084-byte STL; archive size 5413888 and SHA-256 5c4b42140e6306805f9e739ac467d6c3e545b0448f055fd6cd2578a43787febd. Previous/current deployment phase archives restored with identical complete schema, rows and original bytes. See docs/Development_Rollback_Acceptance.md. This proves preservation through compatible code redeployment; isolated Cloudflare data/object restore and verified off-device sync/retention still remain open.

## Earlier checkpoint — 2026-10-14, 19:35 UTC

Controlled missing-original recovery passed live on ec8f864: 200 → missing 409 with metadata/link retained → restored 200 with matching bytes → verified fixture cleanup. Existing catalog counts and the retained 5.4 MB STL stayed unchanged. 49 tests/build, GitHub CI and Workers Builds passed.

Next: CC-TODO-004 development code-rollback/intended-device acceptance; checklist prepared, drill not run. Cloudflare-side full restore, collaborator access and representative samples remain open. Keep OneNote/photo/Canva deferred and the alternate-email test parked. Details: docs/Missing_File_Recovery_Check.md and docs/Development_Rollback_Acceptance.md.

## Latest acceptance — 2026-10-14

Approved deletion of the original two synthetic attachments passed; one STL was re-uploaded under a new identity for recovery and remains private. Live original-containing TAR local restore passed: 16 tables, 14 rows, one 5400084-byte original with matching bytes, valid relationships, SQLite integrity and completion receipt. Implementation 1ea5c0e matched the deployed SHA and passed 45 tests/build plus GitHub CI.

Download small TAR archive now supports complete archives up to 32 MiB when direct folder saving is unavailable. The direct-save 1 GiB originals ceiling and old JSON limits are unchanged. No payload/database/original is in GitHub.

The controlled live missing-original detection/recovery gate subsequently passed using a unique disposable fixture; see current acceptance above. Cloudflare restore, sync/retention, collaborators, release and real-sample gates remain open. Preserve deferred alternate-email testing and future OneNote/photo/Canva work. Full evidence and recovery checksums: docs/Infrastructure_Verification.md.

Updated: 2026-10-14 UTC. Development sample export/local recovery verified; operational durability and production recovery remain incomplete.

## Actual live TAR recovery — 2026-10-14

Live TAR database recovery verified 2026-10-14: uploaded Cookie_Catalog_2026-10-14T15-47-38-889Z.tar restored 16 tables/7 rows/0 originals. Manifest/completion checks, SQLite integrity and foreign keys passed; migrations 0001/0002 and the existing design/shape/cutter relationship survived. Zero attachment rows/objects means this proves the live database archive path only; it does not prove current TAR original-file recovery or intentional deletion. That followup subsequently passed with a 5400084-byte original-containing TAR; see latest acceptance above. No payload or database is committed to public Git.

Archive size: 10,752 bytes. Full archive SHA-256: 5e034293f86fed14c8f413041e7428fa5b741c7fd671661bec78f6899eaacec7. Manifest export timestamp: 2026-10-14T15:48:08.665Z (file-picker filename timestamp is earlier). Table counts: 2 shapes, 1 physical cutter, 1 design, 1 design/shape link, 2 migration rows; other tables empty. Original byte count zero. Completion receipt and strict member/length validation passed. Exact exporting deployment commit is not independently attested by this payload; validation used the d8b67ac tool implementation.

## Current larger archive flow

2026-10-14: owner confirmed Matched fields highlighting works. CC-TODO-006 now adds a larger TAR archive with a D1 schema/records/migration snapshot, separate original bytes, SHA-256 metadata and a required completion receipt. Browser assembly and direct folder saving use desktop Chrome/Edge; each original is a separate authenticated request, avoiding one long Worker invocation. Limits: 25 MiB/file, 1000 originals, 1 GiB originals total, 10000 rows/table, 16 MiB manifest. These are application ceilings, not demonstrated production throughput. Local tests recovered a 5,250,084-byte STL and all 16 tables/relationships; a separate test covered 26 originals. All 40 Node tests and type-check/frontend/Worker build passed. Corruption/truncation/extra data, missing/orphan/changed files and denied requests fail. Live database-only TAR save/restore passed; original-containing TAR local restore and larger upload/retrieval now passed. Old JSON backup/recovery-test formats and their 4 MiB total/25-object limits are retained for compatibility. No new resources, paid plan, automatic transfer/pruning or production changes.

Use Save catalog archive for larger collections. See docs/Archive_Backup.md for protocol and trusted TAR restore. Legacy JSON flow below remains supported with its original limits. Live database-only TAR verification passed; original-containing TAR local restore/larger-upload verification now passed.

## Storage and traceability

GitHub is canonical for code, migrations and recovery instructions. This repository is public; full backup payloads, real photos and purchased originals stay private.

Owner supplied the extracted personal OneDrive folder:
`Cookie_Catalog/Backups/Cookie_Catalog_Backups_20261012T231810Z`.

The archive contains Backups/20261012T225346644Z.json, Backups/20261012T230657659Z-recovery-test.json, manifest.json and README.md. Both JSON files are byte-identical to the actual downloads. The manifest records UTC export times, sizes, hashes, migrations, restored counts and validation branch/commit 40ab108. It explicitly does not attest the exact exporting deployment commit.

Local placement is owner-reported; the archive was shown in personal OneDrive. Cloud sync completion is not confirmed. Confirm an independent cloud copy before treating this as off-device durability. Latest-seven normal snapshots after meaningful changes/before imports is a proposal only; no recurring transfer, pruning, new subscription or production deployment was activated. The recovery-test package contains temporary synthetic fixtures and is separate test evidence, not the current live catalog state.

## Actual downloaded evidence

| Package | Bytes | Local restore | Exported at |
| --- | ---: | --- | --- |
| cookie-catalog-dev-2026-10-12T22-53-46-644Z.json | 7,834 | 16 tables, 6 rows, 0 objects | 2026-10-12T22:53:46.644Z |
| cookie-catalog-dev-recovery-2026-10-12T23-06-58-377Z.json | 11,830 | 16 tables, 17 rows, 2 objects | 2026-10-12T23:06:57.659Z |

SHA-256 of full original packages:

- Normal: `724b645b1a4582ea4bc08499376a0fc072efc018c081a47194421390618d0149`
- Recovery test: `7824069a2faa5db5193818607d5662bcc6f113791a66505bb245f65486da3794`

Both restored SQLite integrity/foreign keys and migrations 0001/0002. Normal snapshot retained the synthetic design/shape/cutter/link at 90 × 100 mm; zero files matched the empty bucket. Recovery snapshot retained design/cutter/location and attachment associations, a readable 1 × 1 PNG (68 bytes) and ASCII STL (111 bytes), with original hashes:

- PNG: `e6807d65d442417605321d31741f0b50abfc2f1f4fb819a40df62f873803c5e4`
- STL: `ffbc8ebbe3d181026a1e97f5422795de981870b52492f667cdd95095bb8dccbf`

Recovery envelope reported filesVerified=2 and cleanupVerified=true. Server code only returns after request-scoped D1/R2 cleanup verification. This is server-reported cleanup evidence, not an additional later bucket inspection. All inspected content was synthetic; no payloads were committed to GitHub.

## Attachment continuation — 2026-10-13

Persistent owner attachment uploads are implemented with existing schema and generated keys, so registered originals are included by this exporter. Live owner photo upload/read has passed; user-upload export/restore acceptance is not yet recorded. Per-file upload limit is now 25 MiB, but this bounded backup still allows 4 MiB originals total and 25 objects: do not assume any accepted catalog upload guarantees a complete backup will fit. Export only while mutations are idle; pending/missing uploads deliberately cause export failure rather than an incomplete successful package. Retain a private backup before removing originals. Local regression validation now passes 27 Node tests plus schema/import/type-check/build.

## Browser export

At https://cookie-catalog-dev.j-brickey.workers.dev, the authenticated owner can select:

- Download development backup: same-origin POST /api/dev/backup with X-Cookie-Catalog-Check: backup.
- Download file recovery test: same-origin POST /api/dev/recovery-check with X-Cookie-Catalog-Check: recovery. Creates unique disposable linked rows plus PNG/STL originals, exports them and removes only that request's fixtures; cleanup failure produces an error rather than a successful download.

Server validates signed Access JWT and owner role. Responses are no-store attachments. Envelope format cookie-catalog-development-backup, version 1, contains exportedAt, payloadJson and payloadSha256. The package captures schema/indexes, rows, migration metadata and registered original R2 objects with hashes/sizes/types. D1 snapshot uses a transactional batch; R2 has no shared transaction. Export while development is idle.

Limits: 1000 rows/table, 25 objects, 4 MiB original bytes total and 12 MiB package. Unknown schema/views/triggers, unsupported values/unsafe integers, missing/corrupt registered files and orphans fail; disposable dev-checks/ objects are excluded. This bounded sample tool does not constitute scalable production backup or native D1 SQL export. SHA-256 detects corruption, not authenticity.

## Trusted local restoration

Use the current feature-branch tool and a new, nonexistent output directory:

```text
python tools/restore_development_backup.py <trusted-backup.json> <new-output-directory>
```

The tool verifies payload/object hashes, sizes, metadata, schema/table counts and foreign keys, then creates catalog.sqlite and objects/attachments/... with original bytes. It refuses existing output and cleans up only its newly created directory on failure. Schema SQL is executed; use only trusted application-generated backups.

Restore checks should include both migration entries, expected record counts/relationships, SQLite integrity and foreign keys, and every object's bytes/hash. Preserve the source package until checks pass. Code rollback and data restoration are separate operations.

## Validation and remaining work

Code 40ab108 passed CI #97: 20 Node tests, SQLite schema/import checks and frontend/Worker build. Actual Miniflare D1/R2 tests exercised existing-data preservation, export failure cleanup, cleanup failure and negative authorization; actual downloaded packages were restored independently afterward.

Remaining: confirm OneDrive cloud sync; agree manual cadence/retention/ownership; restore into separate Cloudflare D1/R2 without touching existing development; design scalable export/import and cross-service consistency; define production recovery objectives, encryption/access and recovery drill. Real asset volumes are unknown. CC-TODO-006 stays open; do not repeat the completed sample recovery test without a new reason.
