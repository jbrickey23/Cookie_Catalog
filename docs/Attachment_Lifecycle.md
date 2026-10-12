# CC-TODO-003 — Private attachment lifecycle

Status: initial implementation contracts, not yet deployed or integration tested.

## Ownership and access
- R2 bucket is private; never enable public bucket URL or commit credentials.
- API authenticates users and authorizes catalog record access before calling attachment store.
- Never accept arbitrary R2 keys from clients; generate keys from server-created attachment IDs.
- Store object key, filename, media type, byte count, checksum, source/license notes in D1.
- Purchased artwork and original STL/3MF are not checked into public GitHub.
- Serve authorized downloads through the Worker with safe Content-Disposition and content type.

## Upload sequence (to implement)
1. Validate user and upload intent; allowlisted file type, maximum size and quota.
2. Create attachment ID and server-derived key.
3. Upload private object and verify length/checksum.
4. Insert D1 attachment metadata and owner relationship.
5. On metadata failure, delete unreferenced object or record cleanup for retry.

## Deletion and recovery (to implement)
- Remove catalog references before deleting object, with explicit confirmation for original assets.
- Queue garbage collection for unreferenced objects; tolerate retries.
- Detect missing R2 objects against D1 manifest.
- Backup and restore original bytes and metadata together; verify checksums.
- Preserve originals; thumbnails are replaceable derived artifacts.

## Acceptance blockers
- Choose and verify identity/authorization before private access testing.
- Confirm actual Worker/R2 API compatibility, max upload sizes and upload strategy.
- Test private upload, authorized retrieval, denied retrieval, missing object, and cleanup.
- No Cloudflare resources have been provisioned.
