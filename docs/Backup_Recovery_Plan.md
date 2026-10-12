# CC-TODO-006 — Backup, export and recovery

Status: design only; no backup service, credentials, external storage or scheduled tasks created.

## Recovery scope
A complete catalog backup contains:
1. SQLite-compatible D1 export including all tables, relationships and migration metadata.
2. R2 original object bytes, namespaced by opaque keys, with SHA-256 and byte counts.
3. A versioned JSON manifest linking database snapshot, object list, export time and schema version.
4. Restore instructions and integrity verification results.

Code rollback via GitHub is separate from restoring catalog records or R2 files. Cloudflare D1 time-travel alone does not protect deleted/missing R2 objects.

## Operational design
- Export to a separately controlled, private backup destination; never public GitHub.
- Keep database snapshot and object manifest from a coordinated backup window. Suspend writes or use a reconciliation/delta process to avoid mismatched exports.
- Use retention appropriate to the owner's recovery needs and budget; decide at provisioning.
- Never log secrets, signed URLs, or purchased asset contents.
- Test clean-environment restoration of database and objects before declaring backups functional.
- Record exact export commands, required permissions and restore order after validating against actual Cloudflare tools.

## Acceptance tests
- Insert synthetic cutter, design, link, location, photo and STL metadata.
- Export database and object bytes; restore into empty isolated resources.
- Verify referential integrity, record counts, every object checksum, and authorized retrieval.
- Simulate missing object, missing database record and partial export; fail with actionable errors.
- Demonstrate independent source-code rollback and data recovery.

## Open provisioning decisions
Backup destination, cadence, retention, account permissions, and any paid services must be approved before activation.
