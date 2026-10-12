# CC-TODO-006 — Backup and recovery

Updated: 2026-10-12 UTC. Development sample export/local recovery verified; operational durability and production recovery remain incomplete.

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
