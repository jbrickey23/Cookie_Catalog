# Cookie Catalog — current TODO

## Proposed R2.1 / R2.2 / R2.3 roadmap — October 20, 2026 Pacific

This owner-authorized batch is **documentation/planning reconciliation only**: [proposed milestones and dependency matrix](docs/R2_Plan.md), [independent Cris/owner R2.1 checklist](docs/R2_1_Acceptance.md), [Cookie Sets specification and schema assessment](docs/Cookie_Sets_R2.md), and [next execution handoff, not launched](docs/R2_1_Execution_Handoff.md). R2.1 usable core → R2.2 Cookie Sets → R2.3 assisted ingestion/automation is a **proposal**, not a new execution priority or release approval. The prior approved R2 scope/history and engineering evidence remain intact. Stop this worker after the docs PR/checks; no feature change, dev-branch push, deployment, migration or merge is authorized by this batch.

R2 head remains `ffe35a67cbf275f3b74f0d62a292963eb2e69f66` in open PR #7; draft #12 remains isolated at `09cfa8539f53ee0e01c9c2e6820df1c04a181bb2`. Preserve their boundaries and #7's pre-existing main conflicts. Physical-photo migration 0005/live distinct-photo acceptance and independent Cris/owner core acceptance remain pending. CC-TODO-019 is unresolved and remains a production-release gate; safe migration/recovery/maintenance/rollback requirements cannot be postponed to R2.3. Last known migration state is prior-batch evidence, not a fresh cloud check here.

The owner explicitly reports **initial Change Request capture accepted** in this roadmap handoff (CC-TODO-018); exact request ID/device/test date not provided. Record this narrow reported acceptance, not a fresh worker test or downstream ingestion/operational recovery completion. CC-TODO-023 independent operational recovery remains open. CC-TODO-021 includes owner-requested [Issue #13](https://github.com/JBrickey23/Cookie_Catalog/issues/13), proposed 1.5-second hover dwell within the requested 1–3 seconds; not implemented/tested. Proposed Cookie Sets needs a distinct feature record: **CC-TODO-025**, design-only. No new numbered decision for an unapproved proposal. **Next unused task CC-TODO-026; decision CC-DEC-023.** Earlier next-unused values below are historical checkpoints, not the current allocator.

## Reference and inventory UX — October 20, 2026 UTC

Owner-approved CC-TODO-021, coordinated with CC-TODO-010, now targets the bounded reference/physical-inventory slice on `feature/cc-infrastructure-foundation` / PR #7. [Model, implementation, schema/recovery safeguards, validation and exact development walkthrough](docs/Reference_Inventory_UX_R2.md) is the current checkpoint for this batch. Preserve stable reference IDs, separate producer designs, grouped interchangeable quantities and distinct physical-photo ownership. No universal category parent or inferred photo dimensions/ownership.

Implementation/local validation, remote CI/deployment and owner browser acceptance are distinct. Physical-photo migration 0005 requires verified development activation; branch deployment does not apply it. Secure owner sign-in subsequently enabled synthetic development browser checks: reference/physical creation, producer separation, quantity/size grouping, URL recovery and Focus navigation passed. Physical photograph upload safely refused missing migration 0005; live distinct-photo acceptance remains blocked. A browser-found dirty-state cleanup bug was fixed and passed the actual deployed-source retest at f272e60, whose 183 application tests and required sqlite/Cloudflare development checks passed. [Final source acceptance and screenshot](docs/Reference_Inventory_UX_R2.md#final-source-acceptance-checkpoint) preserves the evidence; verify the closing documentation commit’s own exact-head checks in PR #7. Owner acceptance remains pending. Do not claim live UX or production readiness. CC-TODO-019 remains unresolved; release automation stays isolated in draft PR #12. Production and PR #7/#12 merges remain unauthorized. Next unused CC-TODO-025 / CC-DEC-023.

Main's later framework closeout remains accepted: CC-TODO-024 complete; CC-TODO-001 partially verified (exact next-task subcriterion unverified). Earlier blanket pending-test statements below are historical. Return to owner UX retesting after exact-head checks; do not start deferred extraction or unrelated release work.

## CC-TODO-024 — Adopt Durable_CHATGPT v1.0.0

Implementation and local validation complete: source/digest pin, unmodified policy copies, restore/Guided Switching/handoff/reconciliation instructions, engineering judgment integrated in existing guidelines. Documentation-only protected-main PR plus docs sync into active R2; verify merge/commit and exact-head CI in GitHub for publication status. No policy exceptions, feature/source/schema/data change, new resource or production promotion. Preserve current/history records, task IDs 020–023 and all R2 acceptance gaps below. Next unused task: **CC-TODO-025**.

[Policy pin](policies/README.md) · [Audit and procedures](docs/Durable_Workflow_Adoption_20261019.md). CC-TODO-001's history-free fresh-chat test is not closed by this history-assisted session.

R1 v0.1.0 released; production is the sole editing catalog. [Release evidence](docs/R1_Release_Closeout.md).

| ID | Work | Proposed milestone / current status and next action |
| --- | --- | --- |
| CC-TODO-021 | Housekeeping and core UX | **R2.1, open.** Existing environment/sign-out/Undo/Slot and reference/inventory implementation/browser evidence retained. Complete simplified Add a Cutter proposal review, Issue #13 dwell implementation, owner Reference & Inventory and independent Cris acceptance. None newly executed here. |
| CC-TODO-019 | Backup/restore root cause and reliability | **Cross-phase production-release blocker, open.** Existing diagnostics retained; identify/reproduce the cloud stall's cause, verify a fix and operational evidence. Do not defer safe recovery to R2.3 or blame managed-PC tooling without evidence. |
| CC-TODO-018 | Change Request ingestion | **R2.1 initial capture owner-accepted by this handoff only.** Existing private submit/review, export and guarded TODO/release assignment foundations retained. Downstream operational export/reconcile/planning and further assisted ingestion remain open; broader completion proposed in R2.3. See [workflow](docs/Change_Request_Workflow.md). |
| CC-TODO-020 | E2E push-button release automation | **R2.3 full automation; earlier release gates still apply.** Preserve read-only preflight and draft #12's approved KISS/native Run workflow engineering. Exact artifact/recovery/controlled release/compatible rollback evidence is required before any earlier promotion; no automation deployment or priority change here. |
| CC-TODO-022 | Release maintenance gate | **Under 020; cross-phase release safety.** Preserve HTTP/scheduled gate/admission/drain and draft protections. Earlier releases require real write/background coordination, safe verified reopening and approved R1 bootstrap; future full automation in R2.3 does not defer these. Draft #12 remains separate. |
| CC-TODO-010 | Photo inbox and ingestion workers | **R2.1 physical-photo activation/live acceptance pending; R2.3 extraction/matching/approval.** Retain implemented private inbox/queue/previews/retry and physical-photo schema/automated coverage. 0005 needs authorized dev activation with verified recovery; scale/confidence, proposed catalog updates and inbox recovery remain open. |
| CC-TODO-023 | Independent request recovery | **Enabled-data release dependency, open.** Retain checksum recovery copies, portable export/missing-key recovery and isolated source-disposed automated rehearsal. Owner off-bucket retention/operational recovery acceptance not proved; catalog archives exclude requests. Later automation is not a waiver. |
| CC-TODO-025 | Cookie Sets | **New proposal only, R2.2.** Persistent named/editable explicitly curated producer-reference membership regardless of physical stock. [Specification/reuse assessment](docs/Cookie_Sets_R2.md); persistence recommendation awaits owner approval, no implementation/migration. |
| CC-TODO-015 | Image standards / Canva and outlines | Deferred design input; no blanket rescaling/DPI restrictions approved. |
| CC-TODO-016 | Field help content | Existing Slot Ready/content evidence retained. Hover timing is Issue #13 under 021; no duplicate work item. |
| CC-TODO-008/009 | Legacy source audit/migration | Source-specific follow-up; preserve imports and evidence. No standing OneNote connector implied. |
| CC-TODO-011 | Canva/artwork interoperability | Later integration, not automatically authorized by R2.3 or this roadmap. |

[Proposed milestones and retained approved scope](docs/R2_Plan.md). Next unused ID: **CC-TODO-026**. Phase/product acceptance and production release gates are separate.

Operational follow-ups: cadence/retention/independent copies, account recovery arrangements and an isolated disaster-recovery rehearsal. Do not restore over live production just to test it. Preserve current roles, protected main, development separation and retained recovery evidence.

[Historical task details and checkpoints](Cookie_Catalog_TODO_History.md) preserve original IDs and acceptance. Old completion-pending text is historical; use the current table and release evidence first.

CC-TODO-023 — In progress: checksum-verified write-ahead request copies and owner-only revision-guarded recovery implemented; targeted recovery tests and production build passed. Portable checksum-verified export, owner-reviewed missing-key recovery and an isolated synthetic restore rehearsal implemented; live browser acceptance and owner retention of an independent copy remain open. Catalog backups currently do not include requests. Next unused ID: CC-TODO-025.

October 16, 2026, 18:28 Pacific: owner confirmed the R2 preview email was sent. R2 development head 7bb1967 passed both sqlite checks and the Cloudflare development build; live authenticated acceptance remains pending.
