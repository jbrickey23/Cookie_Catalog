# CC-TODO-006 — Isolated Cloudflare restore preparation

## 2026-10-14, 22:45 UTC — Owner-created isolated targets and fresh archive

Owner screenshots show separate D1 cookie-catalog-recovery-20261014 (UUID 4d182441-b08e-4739-932d-34ca5511b747), overview reporting zero tables/queries, and separate R2 cookie-catalog-recovery-20261014-private, empty (0 B), Standard storage and Public Access Disabled. Owner chose automatic location/Standard. This is screenshot evidence, not authenticated assistant/API inventory; confirm the recovery database has no catalog/migration tables immediately before import. The owner performed creation during the guided recovery workflow. Active development bindings/data were not changed.

Fresh owner-supplied Cookie_Catalog_2026-10-14T22-44-32-792Z.tar validated/prepared locally: SHA-256 93ec5093d5f2c24604b1886775571b2280c73a3d6763596a8c5f1fac0950138d; 16 tables/14 rows, migrations 0001/0002, one 5400084-byte STL with SHA-256 44f1d7d5617d5611da7832a8c3e7fd512d970b3e6f80a61775cbf981a18892f7; integrity/FKs/completion and exact local SQL round-trip passed. Original key attachments/file_77f92535c7654231854cfd600bab0eb8/original. Source commit is not attested by the TAR. Private recovery ZIP handed off separately; no payload, SQL data or originals in GitHub.

Next: guided owner dashboard import into the empty recovery D1, original upload at its exact key into private recovery R2, then independent readback/export/download comparison. Cloud import/upload has not run, and CC-TODO-006 remains open. Cloudflare rejects this assistant browser login with 403; owner dashboard works. No retry of the blocked login, new Worker, paid resource, production change, current-development rebind/overwrite or automatic cleanup. Preserve recovery targets for review.

Status: prepared, not executed. Local original-containing archive restoration and compatible code rollback already passed; preserve those results.

## October 14 continuation — import preparation implemented

`tools/prepare_cloudflare_restore.py` now prepares a trusted TAR entirely offline and compares independent recovery downloads. Eight Python tests cover exact text (quotes, Unicode, newlines and NUL), self-references, changed records with unchanged counts, missing/changed/extra originals, changed SQL, symlinks, missing migrations, oversized statements, corrupt archives and destination preservation. The existing large-original integration now imports generated statements into a separate local Miniflare D1 and compares every row in all 16 tables; all 49 Node tests, SQLite schema/import and TypeScript/frontend/Worker build pass. This is local D1-engine evidence, not a remote Cloudflare restore.

Proposed dedicated targets: D1 `cookie-catalog-recovery-20261014` and private R2 `cookie-catalog-recovery-20261014-private`. These are proposals, not existing/verified resources. Inventory account capacity and obtain the separate new-resource authorization before creation. No Worker or credential needs to be created for the data/object comparison gate. Do not change the running development Worker's bindings. Keep targets for review; do not auto-delete them.

The browser reached Cloudflare sign-in, then the secure sign-in attempt returned API Request Failed: POST /api/v4/login (403). No authenticated inventory is available; stop this browser attempt. Both GitHub Actions runs 38645828796 and 38645836608 passed for tooling commit 15302ec. No Cloudflare plugin was returned by the integration directory search. Existing owner Windows Wrangler remediation remains parked.

### Prepare privately

Run from a trusted source checkout using a private output directory **outside every git checkout**, for example an existing private backup folder. The tool refuses any existing output directory and never runs a subprocess, calls Cloudflare or provisions resources.

```text
python tools/prepare_cloudflare_restore.py prepare PRIVATE_ARCHIVE.tar NEW_PRIVATE_DIRECTORY
```

The package contains validated `catalog.sqlite`, exact original keys/bytes under `objects/`, `manifest.json`, D1-oriented `import.sql`, `statements.json` for local D1 testing, and private `expected.json` with the archive hash/time, full rows/schema, per-table counts, object descriptors and SQL hash. Source commit is explicitly unknown because this archive format does not attest it; retain an authenticated infrastructure report alongside the archive when deployed provenance is needed. Never commit these outputs.

Generated SQL creates all tables before inserts, defers foreign keys, uses one INSERT per row and refuses statements over 100000 bytes. It contains no BEGIN/COMMIT, DROP, clearing or replacement commands. It expects a separate empty database with no catalog or migration tables. A local full round-trip must match before preparation succeeds. It fails rather than silently splitting an oversized record. Known migrations 0001/0002 are required. Existing migration names/timestamps/IDs are imported rather than migrations reapplied.

### Cloud execution after target verification

Use an authenticated environment with verified account identity, resource IDs, free-tier capacity and empty recovery targets. Prepare a standalone private Wrangler configuration containing only the confirmed recovery D1 name/UUID and account, outside the running app configuration. Check that both the target UUID and bucket differ from active development. Resource creation/import is not performed by this tool.

Cloudflare's documented SQL import shape is:

```text
wrangler d1 execute CONFIRMED_RECOVERY_DATABASE --remote --config PRIVATE_RECOVERY_CONFIG --file NEW_PRIVATE_DIRECTORY/import.sql
```

For each descriptor in private `expected.json`, upload the matching `objects/<key>` using `wrangler r2 object put CONFIRMED_RECOVERY_BUCKET/<key> --remote --file PRIVATE_OBJECT_PATH --content-type CONTENT_TYPE`. Use the descriptor content type, or `application/octet-stream` when absent. Pass arguments directly, without constructing a shell command from catalog metadata. Verify bucket public development URL and custom-domain access are disabled; preserve separate evidence of content types and privacy.

If any import/upload fails, record partial state and stop; never clear/retry automatically or redirect to development. Inspect before deciding whether a new isolated target is needed.

Re-export the recovery D1 with `wrangler d1 export CONFIRMED_RECOVERY_DATABASE --remote --config PRIVATE_RECOVERY_CONFIG --output PRIVATE_RECOVERY_EXPORT.sql`. Restore this trusted export into a NEW local SQLite file (using a SQLite client with foreign keys enabled and a deferred transaction around statements). Download every recovery R2 object into a separate private tree retaining its exact key; establish the complete paginated remote listing independently, so a download of only expected keys cannot hide extra remote objects. Record cloud identity/source provenance before comparing:

```text
python tools/prepare_cloudflare_restore.py verify NEW_PRIVATE_DIRECTORY INDEPENDENT_RECOVERY.sqlite INDEPENDENT_DOWNLOADED_OBJECTS
```

Comparison checks every catalog row, migration row, schema object SQL, relationship/integrity result and each original's byte size/SHA-256; it rejects extra/missing downloaded keys and symlinks. Schema formatting changes in a provider export may cause a conservative failure and require review, never automatic weakening of the comparator. R2 content-type/private-access settings and complete remote listing remain separate cloud checks. Reusing the package's own local database/objects proves only local comparison, never remote recovery. `cloudProvenanceVerified` and `privateAccessVerified` deliberately remain false in the comparator result. Do not close CC-TODO-006 from a local result alone.

Official references checked October 14, 2026: [D1 SQL import/export](https://developers.cloudflare.com/d1/best-practices/import-export-data/), [D1 limits](https://developers.cloudflare.com/d1/platform/limits/), [Wrangler R2 object commands](https://developers.cloudflare.com/workers/wrangler/commands/r2/). No provider-native rollback, application runtime recovery, scale/consistency guarantee, automatic backup sync or retention policy is implemented by this step.

## Purpose

Prove that a trusted catalog archive can reconstruct D1 records and R2 originals in separate Cloudflare recovery targets. The existing cookie-catalog-dev database and cookie-catalog-dev-private bucket must not be imported into, rebound, cleared or overwritten during this drill.

## Earliest unmet prerequisite

Confirm dedicated recovery D1/R2 target identities, permitted free-tier capacity and authorization before provisioning or importing. No separate recovery targets have been verified. Current remote-dashboard login returns 403; owner dashboard access is available. No resource creation, import or restore has been performed by this preparation.

## Prepared execution sequence

1. Select a trusted, private original-containing archive and record its timestamp/hash. Restore locally into a new directory using the existing validated tool. Reuse prior validation when using the same unchanged archive; use a fresh export if the goal is current-state recovery.
2. Inventory existing Cloudflare resources read-only; identify separate empty recovery targets or prepare explicit proposed target names. Verify account, bindings and cost/capacity before provisioning. Do not reuse the active development targets.
3. Prepare a D1-compatible import from the validated schema and rows; confirm ordering, migration bookkeeping, D1 SQL compatibility and foreign-key behavior before cloud execution. The local catalog.sqlite file is not itself a demonstrated cloud import mechanism. Review generated SQL privately; no payload goes to public GitHub.
4. Prepare uploads retaining each manifest object key, bytes, content type and checksum. The current tools restore to local disk; a remote importer still needs preparation and review. Do not treat local restore as evidence that remote upload exists.
5. Import only into confirmed recovery targets. Verify all table counts, both migration entries, key relationships, foreign keys and every original's size and SHA-256 against the selected archive. Verify private bucket configuration. Record failures without modifying the original archive or active development.
6. If end-to-end application reads are required, prepare an isolated owner-protected recovery runtime after resource and access review; do not rebind the current development Worker. Direct data/object comparison alone is a narrower gate and must be described as such.
7. Keep recovery targets for review until an explicit retention/cleanup decision. Do not automatically delete targets or data, transfer backups or enable pruning.

## Evidence required to pass

Record archive hash/time, source commit, recovery target identities, import method, complete expected/actual table counts, migration/foreign-key results, every original's hash/size match and private access outcome. Distinguish provider/data checks from application/browser checks. Full payloads, SQL with catalog data, originals and secrets remain private.

Independent cloud-copy sync, retention/cadence/ownership, production-scale consistency and provider-native recovery remain separate open criteria even after a sample isolated restore passes.
