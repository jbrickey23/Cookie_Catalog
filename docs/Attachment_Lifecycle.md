# CC-TODO-003 — Private attachment lifecycle

Updated: 2026-10-13. Implemented and locally validated with existing D1/R2 schema; live owner photo upload/read verified; deletion/other formats pending.

## Authorization and browser use

Only the verified owner can access the current catalog attachment routes. All catalog records belong to this single-owner development scope; editor/viewer/collaborator access is denied until membership authorization exists. POST/DELETE require exact same-origin Origin and X-Cookie-Catalog-Check: attachments. Reads/downloads are no-store and authenticated; no public R2 URL.

Browser Private files section chooses an existing cutter shape or design. Select a PNG/JPEG/WebP original, or an STL/3MF for shapes; optional source/license notes apply to printable assets. Upload, refresh and download preserve originals. Removal requires explicit browser confirmation and removes all attachment links/printable size recipes. Derived printable relationships block deletion before touching bytes.

Current file limit 25 MiB; multipart body limited to 25 MiB plus 16 KiB overhead even without Content-Length. Type is derived from filename plus lightweight signature/structure, not trusted client MIME. This is not comprehensive model/image validation or malware scanning. 3MF ZIP container validation does not establish package contents; the slicer validates models. SVG/HTML are excluded; originals download as application/octet-stream with attachment disposition and sanitized UTF-8 filename, never inline. No thumbnail generation yet.

Larger TAR archive supports 1 GiB originals total/1000 files, with 25 MiB/original. Legacy JSON keeps a separate 4 MiB total/25-object cap. Local larger recovery passed; live larger-upload/save/restore and production performance remain unverified. No production durability claim.

## Upload and compensation

Generate file_UUID ID and attachments/file_UUID/original key on server; clients never choose R2 keys. Hash original bytes with SHA-256. In a D1 transactional batch insert metadata plus shape/design relationship and printable_asset for STL/3MF; source/license notes retained there.

Write R2 with SHA-256 verification and content metadata, verify size/existence and confirm D1 entry still exists. Metadata-first avoids untracked objects if an upload is interrupted before storing bytes. Missing originals are visible on the record list; backups fail rather than silently omit them. On upload failure remove the request's object and linked metadata. If compensation fails, retain an identifiable entry for owner retry; never claim success.

D1/R2 are not one transaction. A hard interruption or concurrent removal at the last upload step can still leave an orphan; manual audit below handles generated keys. Mutations must be idle during development exports. Production needs a durable lifecycle/consistency protocol and quotas.

## Retrieval, deletion and orphan cleanup

GET /api/attachment-targets lists up to 200 shapes/designs. GET /api/attachments?kind=shape|design&recordId=... lists up to 200 attachments and checks object existence; no arbitrary object keys exposed. GET /api/attachments/:id verifies stored byte count and SHA-256 before attachment download; missing/corrupt originals return 409 and preserve metadata.

DELETE /api/attachments/:id checks derived relationships first, deletes/confirm-checks the object, then deletes references/recipes/metadata in a D1 batch. Object failure retains metadata for retry; database failure may leave a missing original with metadata retained. Recovery needs a private backup; deleting code does not recover data. Retry removal is safe for already-missing objects.

GET /api/attachment-orphans scans 100 objects per page with cursor. Only generated file_ UUID original keys without D1 metadata are returned. Browser requires explicit cleanup confirmation. DELETE /api/attachment-orphans/:id rechecks metadata and permits deletion only when the R2 object is older than 24 hours. Existing linked objects and legacy/disposable keys are protected. No recurring garbage collection or pruning configured.

## Larger attachment continuation

2026-10-14: owner confirmed Matched fields highlighting works. CC-TODO-006 now adds a larger TAR archive with a D1 schema/records/migration snapshot, separate original bytes, SHA-256 metadata and a required completion receipt. Browser assembly and direct folder saving use desktop Chrome/Edge; each original is a separate authenticated request, avoiding one long Worker invocation. Limits: 25 MiB/file, 1000 originals, 1 GiB originals total, 10000 rows/table, 16 MiB manifest. These are application ceilings, not demonstrated production throughput. Local tests recovered a 5,250,084-byte STL and all 16 tables/relationships; a separate test covered 26 originals. All 40 Node tests and type-check/frontend/Worker build passed. Corruption/truncation/extra data, missing/orphan/changed files and denied requests fail. Live larger-upload/archive/save/restore acceptance remains pending. Old JSON backup/recovery-test formats and their 4 MiB total/25-object limits are retained for compatibility. No new resources, paid plan, automatic transfer/pruning or production changes.

## Evidence and acceptance

Latest 40 local Node tests passed, including real Miniflare D1/R2 integration: shape photo, design image and STL upload/exact-byte retrieval/link deletion; non-owner/unauthenticated/origin guards; invalid/oversized uploads; missing/corrupt originals; failed object deletion; upload compensation; old/recent/linked orphan handling and pagination; derived-original protection and size-recipe cleanup. SQLite schema/import and TypeScript/Vite frontend/Worker build also passed.

Live evidence, 2026-10-13: owner screenshot shows the Private files section deployed, a 2,946,752-byte JPEG linked to DEMO Evergreen tree and present after refresh. Owner confirmed the downloaded photo opens. This verifies owner upload/persistence/retrieval; live deletion, design-image/STL workflows and negative-edge access remain unconfirmed. The photograph was user-provided; do not assume it is a synthetic or licensed-shareable fixture. No photograph or new backup payload is committed to GitHub.

Remaining live gate: design image/STL upload/retrieval and original deletion/refresh, plus denied-access behavior. Record actual results. Do not repeat the earlier disposable smoke/recovery checks without a new reason. CC-TODO-003 remains open for that gate and remaining format/quotas/thumbnails/collaborator work.
