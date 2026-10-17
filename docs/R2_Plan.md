# R2 — fast follow scope

Owner established these four R2 tracks October 16, 2026 at 17:43 Pacific, confirmed enough detail to start at 18:03 and explicitly authorized implementation/reconciliation at 18:05. Begin with the housekeeping/UX batch already in progress, then the private Change Request ingestion foundation. Preserve R1 production while developing R2; paid services, new credential grants and destructive migrations still require concrete review.

| Track | Work item | Outcome |
| --- | --- | --- |
| UX fast fixes | CC-TODO-021 | Small display/CSS refinements, visible environment, sign-out, discoverable saved-change Undo and useful field help. |
| Change ingestion | CC-TODO-018 | Context-filled validated user requests feed reconciliation and feature/release planning. Previously R1.1; now included in R2. |
| E2E release automation | CC-TODO-020 | One controlled release action runs checks, builds immutable artifacts, promotes to the correct targets, verifies deployment and supports rollback. |
| Photo ingestion and workers | CC-TODO-010 | Capture to inbox, review/extraction in workers, proposed import preview, user approval, then validated catalog updates. Preserve original files and provenance. |

## Backup/restore prerequisite and release blockers

CC-TODO-019 remains unresolved: identify the cause of the 332/592 backup stall and resolve it with a regression/reproduction test and operational evidence. A successful later resume proves recoverability of that job, not the cause or reliability fix. Managed in-app backup runs in Cloudflare; the managed PC's npm/Defender restriction is a distinct CLI setup issue, not an established cause of the cloud backup stall.

Release automation must eliminate machine-specific npm dependence, manual copying of identifiers/commands, stale dry-run retries, ambiguous branch/source/version evidence and manual verification bookkeeping. Preserve production/development separation, exact-head CI gates, safe data migration checks, retained recovery points, private originals and authenticated access. Inventory supported Cloudflare/GitHub automation authentication and permissions before choosing an execution path; do not commit credentials or assume remote dashboard access works. Paid resources remain unapproved.

Photo ingestion must handle duplicate/retry detection, confidence and missing values, scale evidence and physical-vs-reference status. Extraction is a proposal, not authoritative inventory or dimensions. No unapproved automatic catalog writes. Photo capture standards and Canva/outline interoperability (CC-TODO-015/011) inform the design; prior ideation alone did not authorize imposing upload restrictions or implementing Canva.

## Sequencing

Finish the currently authorized housekeeping and easy UX batch first. Then plan the smallest usable Change Request flow and release-automation foundation, address backup root cause, and prepare an independently useful photo inbox/preview/approval vertical slice. R2 implementation is authorized. Detailed acceptance criteria are refined per vertical slice; independently progress authorized work and only raise decisions that materially affect workflow, scope, cost, access or production data. This does not authorize unbounded integrations or destructive production migrations.

Next unused work item: CC-TODO-023.

## Release scenario decisions — October 16, 2026, 17:54 Pacific

- Change Requests: private app storage, context/type/title/description with preview/confirmation and request ID; reconciliation can map to TODO and release labels. No broader status/reply interface until requested. User response plumbing may be added when needed; no automatic GitHub issue creation/public disclosure.
- Release is the authorization: pressing Release executes the gated release without a second final approval. Exact-version preflight, correct targets, tests, recovery readiness, serialized execution, post-deploy verification and safe rollback are required. Report Released / Rolled back / Needs attention. Code rollback must not erase later catalog edits; destructive data changes need explicit planning outside the routine path.

### CC-TODO-022 — Release maintenance gate

Owner authorizes temporarily disabling live edits during release. Gate catalog mutations server-side, including inline CRUD, file upload/deletion, imports and restore operations; disabling buttons alone is insufficient. Show a clear maintenance notice and preserve unsaved drafts. Coordinate with already in-flight mutations and active backup/import/restore jobs before claiming a stable baseline. Fail or defer the release safely if a conflicting operation cannot drain; do not assume a process-local boolean or deployment reset is a durable lock. Keep browsing available where compatible.

Use an exclusive, durable release owner/state and verify identity before reopening writes. Release snapshots, migrations and deployment follow the established gate; verify then reopen after success or verified rollback. On an interrupted/uncertain release, keep writes safely paused, show Needs attention, and provide a reviewed recovery/unlock path so maintenance cannot silently persist forever. Include concurrent-write, interrupted-release and successful/rollback unlock tests. This reduces release-time races; it does not replace migration compatibility, recovery integrity or stale-edit revision checks after reopening.

This is a small work item under CC-TODO-020, not an independent new feature track. Next unused work item: CC-TODO-023. Photo ingestion decisions are recorded below.

## Photo ingestion scenario — confirmed October 16, 2026, 18:03 Pacific

Both new cutter creation and existing-record enrichment are required. Start with an authenticated private website inbox, not a GitHub photo folder (repository is public). Existing catalog file storage/authentication can be reused; no local tools on a particular computer are required. Upload a batch and optionally associate it with an existing focus record. Use small queued jobs with bounded concurrency, visible progress, per-item errors and safe retries so one failure does not block a whole batch. Leaving the page must not cancel durable work.

A site preview shows originals, extracted proposed fields, missing/uncertain values and suggested existing-record matches. User explicitly confirms Create new vs Update existing and the match before submit. Preserve populated fields unless replacement is expressly approved. Preserve originals and extraction provenance; require valid scale evidence for proposed measurements and never infer possession/printing from an image. Start with approval per cutter; no unreviewed batch writes. Inbox/review foundations can progress before selecting an image-analysis service. Benchmark representative photos for accuracy/time/cost before committing to paid analysis. No Canva integration or wholesale image resizing/DPI policy is implied.

## Discovery and scope control

Expect additional details as each slice is unpacked. Record discoveries, preserve current task IDs, and raise changes to scope/cost/workflow instead of silently expanding the release. Owner does not need to approve routine reversible implementation choices. User email below is a planned-feature preview, not release availability or a delivery-date commitment.
