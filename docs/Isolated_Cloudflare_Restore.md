# CC-TODO-006 — Isolated Cloudflare restore preparation

Status: prepared, not executed. Local original-containing archive restoration and compatible code rollback already passed; preserve those results.

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
