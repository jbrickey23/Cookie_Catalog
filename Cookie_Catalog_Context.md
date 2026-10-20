# Cookie Catalog — current context

## Reference and inventory UX — October 20, 2026 UTC

Owner-approved CC-TODO-021, coordinated with CC-TODO-010, now targets the bounded reference/physical-inventory slice on `feature/cc-infrastructure-foundation` / PR #7. [Model, implementation, schema/recovery safeguards, validation and exact development walkthrough](docs/Reference_Inventory_UX_R2.md) is the current checkpoint for this batch. Preserve stable reference IDs, separate producer designs, grouped interchangeable quantities and distinct physical-photo ownership. No universal category parent or inferred photo dimensions/ownership.

Implementation/local validation, remote CI/deployment and owner browser acceptance are distinct. Physical-photo migration 0005 requires verified development activation; branch deployment does not apply it. Authenticated cloud-browser acceptance is blocked at Access sign-in. Do not claim live UX or production readiness. CC-TODO-019 remains unresolved; release automation stays isolated in draft PR #12. Production and PR #7/#12 merges remain unauthorized. Next unused CC-TODO-025 / CC-DEC-023.

Main's later framework closeout remains accepted: CC-TODO-024 complete; CC-TODO-001 partially verified (exact next-task subcriterion unverified). Earlier blanket pending-test statements below are historical. Return to owner UX retesting after exact-head checks; do not start deferred extraction or unrelated release work.

## Global workflow adoption — 2026-10-19 Pacific

Adopted Durable_CHATGPT **v1.0.0** under CC-DEC-022 / CC-TODO-024: [source commit/digest pin](policies/README.md), verified local policies, [audit and handoff/reconciliation](docs/Durable_Workflow_Adoption_20261019.md). Documentation-only adoption preserves the R2 current/history split and existing execution approvals. Source/production state remains as recorded below; this is not a new R2 feature or production release. Verify the adoption merge/sync commits and exact-head CI in GitHub.

Plan in ordinary Chat; proactively prepare a design-ready handoff and recommend Work/Codex for execution. User launch authority can already be supplied by an explicit execution request. Continue approved batches autonomously, checkpoint milestones and apply the pinned usage policy and [existing engineering judgment](docs/Development_Guidelines.md#critical-engineering-judgment). Initialization restores current records and policies before continuation; proposed, approved, implemented and validated remain distinct. Next unused task: **CC-TODO-025**. Existing R2 work remains authorized; adoption does not reprioritize it.

R1 v0.1.0 is released. Production is the sole real-catalog editing site: https://cookie-catalog-prod.j-brickey.workers.dev/ . Development is for testing: https://cookie-catalog-dev.j-brickey.workers.dev/ . The edit freeze is lifted.

[Release closeout](docs/R1_Release_Closeout.md) records accepted data/deployment/access/Save/Undo/backup evidence. PR #1 merged at c0cb3efa8915d88d95efa28e9dfaec3b4ebd0cda; tag v0.1.0 points there. Production promotion 62e92a16a1e32975ee6bc7f15679183120315411 passed Workers build c4a066ba-fb0b-45f9-aa15-d2ed1920478c. Completion notes merged through PR #6. Preserve release and recovery branches and private independent backups.

## Active work

Owner authorized housekeeping and small UX fixes October 16 at 17:34 Pacific (CC-TODO-021): streamline accumulated status history, review stale PRs/branches, clarify environment links, add sign-out and discoverable saved-change Undo, modest CSS refinement and Slot help. Changes must pass checks before publication; do not mark pending development acceptance as live production success.

[R2 fast-follow plan](docs/R2_Plan.md): UX, Change Request ingestion, E2E release automation, photo inbox/workers with preview and approval. R2 implementation was authorized at 18:05 Pacific. Finish housekeeping/UX, then implement private Change Request ingestion; progress the other tracks as concrete tested slices.

CC-TODO-019 backup/restore stall remains unresolved: root cause and a verified fix are required. Cloud in-app backup is separate from the managed-PC npm block. Preserve safe locks and fast bounded Save/Delete. No real catalog data, images, credentials, private emails or signed links belong in Git. Remote Cloudflare dashboard login remains blocked; owner dashboard and wife's unmanaged-PC Wrangler worked. Do not bypass managed Windows protections or repeat the transfer.

[Current TODO](Cookie_Catalog_TODO.md) · [Project charter](docs/Project_Charter.md) · [Historical context](Cookie_Catalog_Context_History.md). Historical checkpoints preserve evidence; their old pending instructions do not override this page.

## Latest R2 implementation checkpoint

PR #7 contains durable planning, UX fixes, private Change Requests, portable request backup/missing-key recovery, release maintenance/drain coordination, backup diagnostics and the first private photo inbox/queue. Request recovery passed an isolated rehearsal after the source test bucket was disposed. Gate tests cover concurrent/admitted work, background jobs, explicit unlock outcomes and draft preservation. Photo uploads preserve originals and have no configured extraction or catalog submission. See the dedicated workflow/release/reliability/photo documents for exact boundaries.

The owner sent the R2 preview email and authorized continued autonomous implementation at 22:05 Pacific October 16. Current local application/queue tests and build pass; inspect the latest PR-head CI before continuing or merging. Production remains R1. Live authenticated browser acceptance is pending because the agent session expired. Production release automation still needs a narrowly scoped machine principal, verified recovery/controller and safe interrupted-worker handling; ordinary Access service tokens remain rejected. The read-only preflight does not deploy and blocks reusing package version 0.1.0 as a new release. Backup root cause is unproven; inbox independent recovery/extraction/approval are open. Next unused CC-TODO-025.
