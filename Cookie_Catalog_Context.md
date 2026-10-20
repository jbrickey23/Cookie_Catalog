# Cookie Catalog — current context

## Phase 2 authorization checkpoint — 2026-10-19 Pacific

CC-TODO-020 / CC-TODO-022: owner approved Phase 2 engineering, isolated tests and a reviewable PR using the [merged Phase 1 design](docs/R2_Release_Automation_Phase1_20261019.md). Approved choices: native GitHub **Run workflow** (in-catalog button deferred); dedicated scoped Access machine identity plus independent GitHub OIDC and one production deployment writer; engineering and synthetic rehearsal of an R1-compatible bridge. These are architectural and implementation approvals, **not production authorization**.

No deployment, production maintenance, credential provisioning, Access-policy or production-trigger change, live-data change, paid resource or merge of R2 PR #7 is authorized. Implement on an isolated branch; pushing the active feature branch can deploy development and requires separate authorization. Preserve existing R2 sequence. CC-TODO-019 remains an unresolved release-readiness dependency. Implementation, local tests, remote CI and isolated rehearsal must be reported separately. Next unused: CC-TODO-025 / CC-DEC-023.


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
