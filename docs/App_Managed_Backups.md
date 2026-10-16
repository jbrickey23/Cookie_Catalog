# App-managed backups and recovery

This development workflow replaces routine file exports, CMD execution and pasted backup references. The existing private R2 bucket stores snapshot manifests, immutable originals keyed by SHA-256, receipts and resumable job metadata under `catalog-backups/`. No new bucket, database, paid plan or schema migration is created. The public Git repository contains code and sanitized evidence only.

## User workflow

- **Back up now** creates a complete snapshot and performs its checks automatically. Progress reports copied originals. The app and background worker can resume unfinished work.
- **Back up and import confirmed cutters** saves review decisions, creates and checks a protected pre-change snapshot, verifies freshness, then applies existing guarded inventory batches. No downloaded file or pasted filename is required. The advanced existing-backup option remains a compatibility fallback.
- **Review restore** shows snapshot time, physical-cutter/design counts, originals and current catalog counts. **Approve restore** automatically creates a separate protected pre-restore snapshot before entering maintenance and restoring. No live restore is performed by publishing this feature.
- **Resume restore** continues an interrupted approved operation. **Roll back interrupted restore** returns to its automatic pre-restore snapshot after explicit approval. Failed background restoration pauses for review; catalog access stays in maintenance until consistency checks finish.
- **Daily automatic backups** is off until an owner enables it and saves an hour in Pacific time. The scheduled handler obtains a fresh database/file manifest; it does not just copy an old downloaded archive. It resumes approved work even with the browser closed. A missed daylight-saving hour starts at the next available hour that day.

Existing local/OneDrive archives and the Windows helper remain available for independent recovery and older exports; they are not required for the routine managed workflow. Same-provider snapshots do not establish an independent OneDrive/off-provider copy or restore Access/deployment secrets.

## Validation and safety

Every snapshot starts with the existing transactional schema/row/migration/foreign-key export. Each original must match its captured size/etag. R2 checks SHA-256 while storing a new immutable backup object; reused objects must have the expected size and stored SHA-256 checksum. Only complete jobs receive a verified receipt. Shared immutable originals avoid repeatedly storing unchanged image/model bytes. Backup jobs and snapshots are excluded from live-original orphan detection and portable catalog archives.

Owner/admin authentication, same-origin/custom-header checks and bounded requests precede backup resource access. Viewers/editors cannot create snapshots, change schedules or restore. Managed imports validate a real complete protected snapshot and its freshness before the first batch; existing plan hashes, review revisions and transaction guards remain active across the batch. Catalog edits must remain idle during the operation; broad multi-editor production consistency remains an acceptance gate.

Restore requires the exact current schema and a fresh matching preview. It copies/checks originals, then guards every current database table against the protected baseline. All database deletes/inserts run in one foreign-key-preserving D1 transaction. A concurrent database change or failing statement aborts that transaction. The operation removes only originals registered in its known before/target snapshots that are absent from the selected state. It preserves the managed snapshots. Database readback must match before maintenance is released. The completion tombstone uses conditional writes, avoiding an old request releasing a newer restore lock.

Restore approval applies to the development catalog only. A schema-incompatible snapshot is blocked until a recovery adapter is prepared. Failed/partial work is never reported as a successful complete snapshot or restore.

## Operational limits and remaining acceptance

This first managed release retains snapshots without automatic pruning. It stops creation at 12 retained jobs or a conservative 2 GiB sum of snapshot-original sizes; the existing per-snapshot limits still apply. Reaching a limit requires retention review; it does not silently delete protected recovery points or upgrade a paid plan. In-app retention approval/reclamation remains follow-up work under CC-TODO-013. Daily scheduling is opt-in and surfaces its last creation error. Do not treat a configured schedule as proof that a daily snapshot completed: check its complete receipt/job.

The worker advances originals in bounded groups of eight, below the verified free-plan subrequest ceiling. Existing jobs resume from private stored state, and completed hash objects are reusable. Provider CPU/wall-time limits, actual 592-original runtime and interrupted-browser behavior still need live acceptance; local Miniflare tests do not prove Cloudflare production-scale throughput.

Automated tests cover actual D1/R2 snapshots, deduplication, checksum failure, stale backups, role/origin gates, app import handoff, resumable jobs, scheduled fresh exports, live-data maintenance, restore readback, an injected mid-transaction SQL failure and approved rollback. No real owner data was restored or deleted during implementation.

## Platform references checked October 15, 2026

- [R2 Workers API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/): conditional writes, streaming bodies and SHA-256 validation.
- [Worker limits](https://developers.cloudflare.com/workers/platform/limits/): bound work per invocation; local tests do not enforce the deployed CPU limit.
- [Scheduled handler](https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/): background invocation through the existing worker.
- [R2 pricing](https://developers.cloudflare.com/r2/pricing/): storage and operations count toward the account's usage. No claim is made that uninspected account-wide usage is free.
