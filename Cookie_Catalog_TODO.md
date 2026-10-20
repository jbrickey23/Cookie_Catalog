# Cookie Catalog — current TODO

## Reference and inventory UX — October 20, 2026 UTC

Owner-approved CC-TODO-021, coordinated with CC-TODO-010, now targets the bounded reference/physical-inventory slice on `feature/cc-infrastructure-foundation` / PR #7. [Model, implementation, schema/recovery safeguards, validation and exact development walkthrough](docs/Reference_Inventory_UX_R2.md) is the current checkpoint for this batch. Preserve stable reference IDs, separate producer designs, grouped interchangeable quantities and distinct physical-photo ownership. No universal category parent or inferred photo dimensions/ownership.

Implementation/local validation, remote CI/deployment and owner browser acceptance are distinct. Physical-photo migration 0005 requires verified development activation; branch deployment does not apply it. Secure owner sign-in subsequently enabled synthetic development browser checks: reference/physical creation, producer separation, quantity/size grouping, URL recovery and Focus navigation passed. Physical photograph upload safely refused missing migration 0005; live distinct-photo acceptance remains blocked. A browser-found dirty-state cleanup bug was fixed and passed the actual deployed-source retest at f272e60, whose 183 application tests and required sqlite/Cloudflare development checks passed. [Final source acceptance and screenshot](docs/Reference_Inventory_UX_R2.md#final-source-acceptance-checkpoint) preserves the evidence; verify the closing documentation commit’s own exact-head checks in PR #7. Owner acceptance remains pending. Do not claim live UX or production readiness. CC-TODO-019 remains unresolved; release automation stays isolated in draft PR #12. Production and PR #7/#12 merges remain unauthorized. Next unused CC-TODO-025 / CC-DEC-023.

Main's later framework closeout remains accepted: CC-TODO-024 complete; CC-TODO-001 partially verified (exact next-task subcriterion unverified). Earlier blanket pending-test statements below are historical. Return to owner UX retesting after exact-head checks; do not start deferred extraction or unrelated release work.

## CC-TODO-024 — Adopt Durable_CHATGPT v1.0.0

Implementation and local validation complete: source/digest pin, unmodified policy copies, restore/Guided Switching/handoff/reconciliation instructions, engineering judgment integrated in existing guidelines. Documentation-only protected-main PR plus docs sync into active R2; verify merge/commit and exact-head CI in GitHub for publication status. No policy exceptions, feature/source/schema/data change, new resource or production promotion. Preserve current/history records, task IDs 020–023 and all R2 acceptance gaps below. Next unused task: **CC-TODO-025**.

[Policy pin](policies/README.md) · [Audit and procedures](docs/Durable_Workflow_Adoption_20261019.md). CC-TODO-001's history-free fresh-chat test is not closed by this history-assisted session.

R1 v0.1.0 released; production is the sole editing catalog. [Release evidence](docs/R1_Release_Closeout.md).

| ID | Work | Status / next action |
| --- | --- | --- |
| CC-TODO-021 | Housekeeping and UX fast fixes | Authorized October 16, 17:34 Pacific; in progress. Current/history split, stale PR review, visible environment/sign-out/Undo and Slot help. |
| CC-TODO-019 | Backup/restore root cause and reliability | Open. Progress/lease diagnostics and sanitized timing/error-category logs added. [Investigation](docs/Backup_Reliability_R2.md). Reproduce the cloud stall and verify a fix; later successful resume is not resolution. |
| CC-TODO-018 | Change Request ingestion | First vertical slice deployed to development (CI passed): private submit/review, owner export and revision-guarded release/TODO assignment; live dev acceptance and operational backup coverage pending. [Workflow](docs/Change_Request_Workflow.md). |
| CC-TODO-020 | E2E push-button release automation | Read-only exact-commit/target/version/SQL preflight tool and manual build/dry-run workflow added. Machine-auth controller, recovery verification, promotion and safe rollback remain open. Release click will be authorization without another final approval. |
| CC-TODO-022 | Release maintenance gate | Under 020: durable HTTP/scheduled write gate, admission/drain coordination, background-job checks and draft-preserving notice implemented. Machine-auth controller, safe interrupted-worker recovery and live acceptance remain open. [Checkpoint](docs/Release_Automation_R2.md). |
| CC-TODO-010 | Photo inbox and ingestion workers | Private batch upload, durable bounded preparation queue, previews/downloads and retries implemented. [Checkpoint](docs/Photo_Inbox_R2.md). Extraction benchmark, matching, scale/confidence evidence, per-cutter approval/commit and inbox recovery remain open. |
| CC-TODO-015 | Image standards / Canva and outlines | Deferred design input; no blanket upload rescaling/DPI restrictions approved. |
| CC-TODO-016 | Field help content | Slot authored Ready in current UX batch; owner wording feedback remains welcome. |
| CC-TODO-008/009 | Legacy source audit/migration | Source-specific follow-up; preserve completed imports and evidence. No standing OneNote connector implied. |
| CC-TODO-011 | Canva/artwork interoperability | Later integration; not automatically part of R2 photo inbox. |

[R2 scope and sequencing](docs/R2_Plan.md). Next unused ID: CC-TODO-025.

Operational follow-ups: cadence/retention/independent copies, account recovery arrangements and an isolated disaster-recovery rehearsal. Do not restore over live production just to test it. Preserve current roles, protected main, development separation and retained recovery evidence.

[Historical task details and checkpoints](Cookie_Catalog_TODO_History.md) preserve original IDs and acceptance. Old completion-pending text is historical; use the current table and release evidence first.

CC-TODO-023 — In progress: checksum-verified write-ahead request copies and owner-only revision-guarded recovery implemented; targeted recovery tests and production build passed. Portable checksum-verified export, owner-reviewed missing-key recovery and an isolated synthetic restore rehearsal implemented; live browser acceptance and owner retention of an independent copy remain open. Catalog backups currently do not include requests. Next unused ID: CC-TODO-025.

October 16, 2026, 18:28 Pacific: owner confirmed the R2 preview email was sent. R2 development head 7bb1967 passed both sqlite checks and the Cloudflare development build; live authenticated acceptance remains pending.
