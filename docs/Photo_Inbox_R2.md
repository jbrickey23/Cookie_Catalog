# R2 photo inbox — foundation, not completed ingestion

CC-TODO-010. Existing owners/editors can select up to 20 PNG/JPEG/WebP files in the private site and upload sequentially. Each file is bounded to 10 MiB. This is a temporary safety limit, not a DPI/physical-size standard. Original bytes, filename/hash, source subject/time and advisory focused-record context are preserved privately under catalog-photo-inbox/v1/. No public GitHub photo folder or new paid resource is used.

Per-file UUIDs and immutable original checksums allow response-loss retries without duplicate items. Failed files do not stop the rest of a selected batch; Retry skips already-saved files and keeps upload identities/context. Selected files still require the browser until their upload succeeds. Once accepted, durable R2 queue markers let preparation continue after the browser closes. Retrying a queued upload repairs a missing queue marker. Inbox mutations are serialized through the existing short backup-storage lock; live release maintenance also blocks them.

The scheduled Worker prepares at most one photo per tick after backup continuation, verifies original length/hash and marks ready-for-review or failed with a fixed error code. A failed preparation can be explicitly requeued. Competing preparation attempts use conditional metadata writes. The UI lists paginated previews, read-only image windows, original downloads and progress/retry controls. Queue state survives deployments and catalog records are never mutated by this phase.

**No analysis provider is configured.** Proposed fields remain empty with a visible explanation. No name, size, scale, ownership, physical status or record match is inferred. Magic bytes/extensions are checked using the existing attachment validator; this does not prove a complete image decoder can render every accepted file. Keep original capture files while this R2 foundation is under development.

Inbox capacity is capped at 100 stored originals / 250 MiB and checked while serialized; old photos are not automatically deleted. Failed metadata writes can leave a retained original; retrying the same upload identity repairs it. An original with different bytes cannot be overwritten. Context is advisory; it does not confirm a catalog association.

## Remaining before ingestion release completion

Benchmark representative photos before choosing an extraction service or paid integration. Add proposals with confidence/missing/scale evidence and record-match suggestions, then explicit per-cutter Create new / Update existing approval. Preserve populated values unless replacement is explicitly approved; no guessed dimensions or physical ownership. Attach accepted originals through the established catalog workflow with idempotent commit/recovery protection. Add private inbox backup/export coverage, reviewed retention/abandon cleanup, durable-worker error telemetry and queue repair/rehearsal. Existing catalog/request backups do not include inbox originals or queue state. No automatic extraction, final approval or catalog submission is claimed complete.

Live authenticated development acceptance is pending. Synthetic tests cover byte preservation, retry identity, queue processing and corruption retry, permissions, type/size rejection, release blocking and batch UI failure isolation. Production remains R1.
