# CC-TODO-006 — Backup, export and recovery

Status: actual live database and two-file packages restored locally; independent backup location/policy and Cloudflare-side restoration remain pending.

## Verified live attachment recovery

Live file recovery verified on 2026-10-12: owner supplied cookie-catalog-dev-recovery-2026-10-12T23-06-58-377Z.json (11,830 bytes; SHA-256 7824069a2faa5db5193818607d5662bcc6f113791a66505bb245f65486da3794). Payload and both original-file checksums passed. A new disposable local restore recovered 16 tables, 17 rows and 2 objects: a readable 1 × 1 PNG (68 bytes) and ASCII STL (111 bytes). Confirmed the synthetic design/cutter/location link at 90 × 100 mm, two shape attachments, one design image and one printable STL association. SQLite integrity and foreign keys passed. The download reports cleanupVerified=true; server code only returns after request-scoped D1/R2 cleanup checks succeed. No real inventory or backup payload was committed to public Git. Code commit 40ab108 passed CI #97.

## Concrete development policy proposal

Proposed development backup policy (awaiting owner storage preference): owner-triggered download after meaningful catalog changes and before bulk import/migration; keep the latest 7 completed packages in an independently controlled private location outside Cloudflare/public GitHub. This is a manual development policy, not an activated recurring automation. Restore-check after schema/export changes. Real-asset volume and production recovery needs must inform production frequency/retention and scalable exports. No new storage subscription, paid resource, scheduled task or production deployment is authorized. Next required input: identify an existing private backup location the owner can use; Cloudflare-side restore is still an additional validation followup.

## Actual live evidence

Live package cookie-catalog-dev-2026-10-12T22-53-46-644Z.json (7,834 bytes; SHA-256 724b645b1a4582ea4bc08499376a0fc072efc018c081a47194421390618d0149) passed payload checksum verification and restored into a new disposable local directory on 2026-10-12. Recovered 16 tables and 6 rows: both migration entries, one design, shape, cutter and link. Confirmed DEMO Holiday tree → DEMO Evergreen tree at 90 × 100 mm, SQLite integrity_check=ok and no foreign-key violations. Zero file objects matches the empty live bucket; this package does not prove live attachment recovery. The uploaded package and restored database are private and are not committed to public Git.

## Next file recovery check

Next browser action: refresh https://cookie-catalog-dev.j-brickey.workers.dev and choose Download file recovery test. This owner-only same-origin POST /api/dev/recovery-check creates unique, disposable synthetic cutter/design/location records plus PNG/STL originals and metadata, exports them, then deletes only its request-scoped data and verifies cleanup before returning the download. Attach that saved recovery JSON for actual file/relationship restoration. Local D1/R2 binding integration tests, real SQLite restore, failure-path cleanup, preservation of existing data, all 20 Node tests and TypeScript/Vite frontend/Worker build passed. Live recovery-test execution remains pending; CC-TODO-006 is still open for file recovery, Cloudflare-side restoration and backup destination/retention/scheduling.

## Current development route

Local CLI login is blocked by the owner's former organizational Defender enrollment. An owner-only browser download uses the existing private development Worker/D1/R2 bindings. No admin token is placed in the browser and no additional resource is created.

Open the signed-in Cookie Catalog development page, refresh after its feature-branch deployment, then choose **Download development backup**. Keep the resulting JSON in a private folder outside this public repository. Never upload real catalog backups to GitHub.

POST /api/dev/backup requires verified owner identity, same-origin Origin and X-Cookie-Catalog-Check: backup. The response uses attachment disposition and no-store. One D1 batch captures the 15 catalog tables, d1_migrations, schema/index definitions and foreign-key validation. Registered R2 objects are included as base64 with computed SHA-256, size and content type. Disposable dev-checks objects are excluded; any other unregistered object makes export fail rather than silently losing it.

## Development limits and consistency

The tool is intentionally bounded: 1,000 rows per table, 25 registered objects, 4 MiB total original bytes and 12 MiB download. Unknown schema, unsupported values, unsafe integers, missing files, checksum/size differences and relationship failures stop the download. It is not a general production backup service or a native D1 SQL export.

D1's batch is transactional; D1 and R2 do not share a transaction. Use an idle catalog with no simultaneous uploads, edits or cleanup during export. General persistent writes are not enabled in the current foundation. A coordinated write lock or reconciliation protocol is required before adopting this route for a mutable production catalog. SHA-256 detects corruption; it is not a signature proving who created a backup.

## Disposable local recovery

Restore ONLY a trusted download generated by this application. This creates a new local SQLite database and original files, never modifies Cloudflare resources:

```sh
python3 tools/restore_development_backup.py PRIVATE_BACKUP.json NEW_PRIVATE_DIRECTORY
```

The target must not already exist. Payload and every object's checksums, size, metadata, object-key paths, table counts and foreign keys are verified. Output: catalog.sqlite plus objects/attachments/... . Failures remove only the newly created restore directory; existing destinations are refused. The tool executes schema SQL from the trusted package; do not use it on untrusted or edited downloads.

## Verified locally

All 20 Node tests and TypeScript/Vite frontend/Worker build passed. Integration tests use the actual SQLite migrations: a cutter/design link, location, both migration entries and two synthetic files survive export and restore into a fresh directory. Tests reject altered payloads, missing files, corrupted originals, orphan objects, changed schema, excessive rows, broken relationships, duplicate destinations, unauthenticated/editor/viewer access and cross-origin requests. Existing SQLite schema/import checks passed.

These results do not prove live Cloudflare export, live R2 attachment recovery, or intended-user recovery access. The live development bucket was owner-confirmed empty after its earlier smoke check.

## Remaining acceptance

1. Completed: owner downloaded the live package and attached it for validation.
2. Completed: actual package restored locally, with the expected demonstration link/dimensions, migrations, counts, checksums and SQLite/FK integrity.
3. Completed for development: live temporary PNG/STL originals and attachment metadata exported together, restored locally with all associations intact; server reports cleanup verified. General user upload lifecycle remains CC-TODO-003.
4. Validate live Cloudflare import/restore separately from code rollback.
5. Approve an independently controlled private backup destination, cadence and retention before activation.
6. Add coordinated consistency handling and scalable exports before production.

Code rollback remains separate from records/file recovery. D1 Time Travel does not protect deleted R2 originals. CC-TODO-006 remains open.
