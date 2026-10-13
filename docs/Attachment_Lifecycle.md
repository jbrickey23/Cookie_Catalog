# CC-TODO-003 — Private attachment lifecycle

Updated: 2026-10-13. Implemented and locally validated with existing D1/R2 schema; live owner acceptance pending.

## Authorization and browser use

Only the verified owner can access the current catalog attachment routes. All catalog records belong to this single-owner development scope; editor/viewer/collaborator access is denied until membership authorization exists. POST/DELETE require exact same-origin Origin and X-Cookie-Catalog-Check: attachments. Reads/downloads are no-store and authenticated; no public R2 URL.

Browser Private files section chooses an existing cutter shape or design. Select a PNG/JPEG/WebP original, or an STL/3MF for shapes; optional source/license notes apply to printable assets. Upload, refresh and download preserve originals. Removal requires explicit browser confirmation and removes all attachment links/printable size recipes. Derived printable relationships block deletion before touching bytes.

Current file limit 4 MiB; multipart body limited to 4 MiB plus 16 KiB overhead even without Content-Length. Type is derived from filename plus lightweight signature/structure, not trusted client MIME. This is not comprehensive model/image validation or malware scanning. 3MF ZIP container validation does not establish package contents; the slicer validates models. SVG/HTML are excluded; originals download as application/octet-stream with attachment disposition and sanitized UTF-8 filename, never inline. No thumbnail generation yet.

Development backup has a separate 4 MiB total originals/25-object cap. Keep test assets small until scalable backup exists. No production durability claim.

## Upload and compensation

Generate file_UUID ID and attachments/file_UUID/original key on server; clients never choose R2 keys. Hash original bytes with SHA-256. In a D1 transactional batch insert metadata plus shape/design relationship and printable_asset for STL/3MF; source/license notes retained there.

Write R2 with SHA-256 verification and content metadata, verify size/existence and confirm D1 entry still exists. Metadata-first avoids untracked objects if an upload is interrupted before storing bytes. Missing originals are visible on the record list; backups fail rather than silently omit them. On upload failure remove the request's object and linked metadata. If compensation fails, retain an identifiable entry for owner retry; never claim success.

D1/R2 are not one transaction. A hard interruption or concurrent removal at the last upload step can still leave an orphan; manual audit below handles generated keys. Mutations must be idle during development exports. Production needs a durable lifecycle/consistency protocol and quotas.

## Retrieval, deletion and orphan cleanup

GET /api/attachment-targets lists up to 200 shapes/designs. GET /api/attachments?kind=shape|design&recordId=... lists up to 200 attachments and checks object existence; no arbitrary object keys exposed. GET /api/attachments/:id verifies stored byte count and SHA-256 before attachment download; missing/corrupt originals return 409 and preserve metadata.

DELETE /api/attachments/:id checks derived relationships first, deletes/confirm-checks the object, then deletes references/recipes/metadata in a D1 batch. Object failure retains metadata for retry; database failure may leave a missing original with metadata retained. Recovery needs a private backup; deleting code does not recover data. Retry removal is safe for already-missing objects.

GET /api/attachment-orphans scans 100 objects per page with cursor. Only generated file_ UUID original keys without D1 metadata are returned. Browser requires explicit cleanup confirmation. DELETE /api/attachment-orphans/:id rechecks metadata and permits deletion only when the R2 object is older than 24 hours. Existing linked objects and legacy/disposable keys are protected. No recurring garbage collection or pruning configured.

## Evidence and acceptance

27 local Node tests passed, including real Miniflare D1/R2 integration: shape photo, design image and STL upload/exact-byte retrieval/link deletion; non-owner/unauthenticated/origin guards; invalid/oversized uploads; missing/corrupt originals; failed object deletion; upload compensation; old/recent/linked orphan handling and pagination; derived-original protection and size-recipe cleanup. SQLite schema/import and TypeScript/Vite frontend/Worker build also passed.

Remaining live gate: after development deployment, owner selects a small synthetic cutter photo/design image/STL, uploads, refreshes/retrieves privately and removes the originals; record actual results. Do not repeat the earlier disposable smoke/recovery checks without a new reason. CC-TODO-003 remains open for that gate and remaining format/quotas/thumbnails/collaborator work.
