# CC-TODO-006 — Larger development archive

## Current checkpoint — 2026-10-14, 19:35 UTC

Controlled missing-original recovery passed live on ec8f864: 200 → missing 409 with metadata/link retained → restored 200 with matching bytes → verified fixture cleanup. Existing catalog counts and the retained 5.4 MB STL stayed unchanged. 49 tests/build, GitHub CI and Workers Builds passed.

Next: CC-TODO-004 development code-rollback/intended-device acceptance; checklist prepared, drill not run. Cloudflare-side full restore, collaborator access and representative samples remain open. Keep OneNote/photo/Canva deferred and the alternate-email test parked. Details: docs/Missing_File_Recovery_Check.md and docs/Development_Rollback_Acceptance.md.

## Latest acceptance — 2026-10-14

Approved deletion of the original two synthetic attachments passed; one STL was re-uploaded under a new identity for recovery and remains private. Live original-containing TAR local restore passed: 16 tables, 14 rows, one 5400084-byte original with matching bytes, valid relationships, SQLite integrity and completion receipt. Implementation 1ea5c0e matched the deployed SHA and passed 45 tests/build plus GitHub CI.

Download small TAR archive now supports complete archives up to 32 MiB when direct folder saving is unavailable. The direct-save 1 GiB originals ceiling and old JSON limits are unchanged. No payload/database/original is in GitHub.

The controlled live missing-original detection/recovery gate subsequently passed using a unique disposable fixture; see current acceptance above. Cloudflare restore, sync/retention, collaborators, release and real-sample gates remain open. Preserve deferred alternate-email testing and future OneNote/photo/Canva work. Full evidence and recovery checksums: docs/Infrastructure_Verification.md.

Updated 2026-10-14. Local integration/restore passed; live database-only TAR saving/restoration passed; original-file local recovery now passed. No extra resources or paid plan.

## Browser workflow and limits

In desktop Chrome/Edge, use Save catalog archive and choose a timestamped TAR in the owner's private OneDrive backup folder. Keep catalog edits, uploads and deletions idle until completion. File picker requires HTTPS and user gesture. If direct folder saving is unavailable or denied, choose Download small TAR archive. It buffers at most 32 MiB of complete TAR data and refuses larger/broken streams before initiating a download. The larger direct-save path does not buffer a 1 GiB archive as one Blob.

Application ceilings: 25 MiB/original, 1000 originals, 1 GiB original bytes total, 10000 rows/table and 16 MiB manifest. These are ceilings, not a tested production capacity. A 5400084-byte original-containing archive has now been downloaded live and restored locally; a separate 26-original collection is locally tested. Provider CPU/D1 response limits and intended devices still need live performance checks. Upload/download original validation is still bounded and buffered per file, not arbitrary multipart model upload.

Successful saving does not prove OneDrive sync or a usable restore. If saving fails/cancels, do not trust an empty/partial output. No automatic transfer, retention, pruning or new subscription.

## Protocol and consistency

Owner-only same-origin POST /api/dev/archive (X-Cookie-Catalog-Check: archive) captures whitelisted schema/indexes, D1 rows/migrations and foreign-key checks in a transactional batch, and audits registered R2 originals through paginated listings. Unknown schema, orphan/missing files and incomplete size/SHA metadata fail. Disposable dev-checks/ objects are excluded.

The manifest envelope uses format cookie-catalog-archive, version 1, exportedAt, payloadJson and payloadSha256. Payload includes development environment, database schema/tables and original descriptors: attachmentId, server-generated key, byteSize, SHA-256, media type and captured R2 ETag. Originals are separate TAR members, not base64 JSON.

Browser requests each original separately using POST /api/dev/archive-file with the same owner/origin guard. Server derives the key from D1 identity and checks current metadata/size and captured ETag; it streams bytes without assembling the whole archive or hashing the whole collection in one Worker request. Browser checks each original's length/SHA before writing its TAR member. This distributes requests to respect Free Worker limits: see https://developers.cloudflare.com/workers/platform/limits/ and https://developers.cloudflare.com/changelog/post/2026-02-11-subrequests-limit/.

The shared assembler uses bounded per-original memory/backpressure and writes metadata/manifest.json, objects/attachments/:id/original entries, metadata/complete.json and TAR terminators. A completion receipt binds the manifest hash, object count and total original bytes. Interrupted, changed or corrupt downloads never produce a valid completed archive. SHA detects corruption, not authentic provenance.

D1/R2 have no common transaction. Snapshot data and captured original descriptors are checked, but simultaneous mutations can invalidate an export and require retry. No global mutation lock, immutable provider-side checkpoint or scheduled backup is claimed. Production consistency and resume/cancellation across many requests remain future work.

## Trusted local recovery

Use the same current repository tools directory, which contains both restore scripts:

```text
python tools/restore_archive_backup.py <trusted-catalog.tar> <new-output-directory>
```

Destination must not exist. The tool streams originals in 1 MiB chunks; it never extracts arbitrary archive paths. It validates manifest hash/format/schema, strict registered original keys/identity/size/checksum, exact member order, completion receipt and TAR length/terminators. Links and unexpected/unregistered/extra members are rejected. Recreates catalog.sqlite, objects/attachments/... and manifest.json; checks row counts, foreign keys and SQLite integrity. On failure removes only its newly created output.

Schema SQL is executed: restore only trusted application-generated archives. Legacy JSON still uses tools/restore_development_backup.py with original caps; do not feed a TAR to that script.

## Evidence and remaining gates

40 Node tests and TypeScript/Vite frontend/Worker build passed. Real Miniflare D1/R2 tests upload/retrieve/restore a 5.25 MB STL through actual manifest/file endpoints and shared browser assembler; recreate 16 tables/relationships and exact original bytes; cover 26 originals, mutation/ETag, orphan/missing storage, auth/origin/method, corruption, truncation and extra archive data. Existing JSON/recovery tests remain passing.

Owner confirmed Matched fields highlighting separately. Live TAR database recovery verified 2026-10-14: uploaded Cookie_Catalog_2026-10-14T15-47-38-889Z.tar restored 16 tables/7 rows/0 originals. Manifest/completion checks, SQLite integrity and foreign keys passed; migrations 0001/0002 and the existing design/shape/cutter relationship survived. Zero attachment rows/objects means this proves the live database archive path only; it does not prove current TAR original-file recovery or intentional deletion. The subsequent live original-containing TAR passed; see latest acceptance above. No payload or database is committed to public Git. Do not commit those payloads to public GitHub. CC-TODO-006 remains open for cloud sync/retention, Cloudflare-side restore, production consistency/performance, automation and recovery objectives.
