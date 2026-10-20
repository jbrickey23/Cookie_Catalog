# Cookie Catalog — current TODO

## Approved KISS release decision — 2026-10-20 Pacific

Owner approved **PREP → CLOSE SHOP → DRAIN → RELEASE → OPEN SHOP** under existing CC-TODO-020 / CC-TODO-022. Routine backward-compatible releases use a practical bounded settling check of known operations; exhaustive historical Worker census/provider retirement proof is **superseded as a universal prerequisite**. Preserve the earlier investigations as historical evidence. No proxy/controller or disposable cloud resources are required by this decision. Separate breaking/destructive changes require explicit planning/approval. Retain server-side maintenance, known-operation checks, exact reviewed artifacts, compatible verified rollback, stale-client protection and independent recovery evidence. CC-TODO-019 remains unresolved and blocks release readiness.

This handoff authorizes isolated-branch engineering/local tests and draft-PR reconciliation only. Initial R1 still needs a separately approved external restriction/cron pause and a first-transition runbook with explicit limited visibility/residual risk; known active/uncertain high-risk work or unverified recovery stops release. No production maintenance/deployment, credential/Access/production-trigger change, cloud resource, live-data operation, destructive migration or merge of #7/#12 is authorized. Next unused IDs remain CC-TODO-025 / CC-DEC-023.


## R1 quiescence investigation — 2026-10-19 Pacific

CC-TODO-020 / CC-TODO-022: [evidence, alternatives, exact rehearsal proposal and independent engineering sequence](docs/R1_Quiescence_Investigation_20261019.md). **No unconditional production drain proof established.** R1 daily schedule disable does not stop pending backup/restore/retention continuation; the expiring backup lease excludes normal edits. Access/cron restrictions do not prove admitted HTTP/backend work ended. A temporary proxy misses earlier writers; do not add one merely to count future traffic. Proposed: native provider-backed retirement evidence plus a compatible passive-stage rehearsal; first gate stays unarmed until legacy proof exists. Proposed disposable Worker/D1/bucket: cookie-catalog-r1-quiescence-test / same D1 name / cookie-catalog-r1-quiescence-test-private, separate test Access, quotas verified before any creation. Owner approval required; no target/configuration/execution performed. Existing dev resources are not presumed synthetic or safe to interrupt.

This batch is investigation/docs only; keep #12 draft, #7 unmerged, 019 unresolved. Credential-free artifact/workflow composition/failure/browser engineering can proceed in a separately scoped continuation without waiting for bootstrap. No production change, cloud rehearsal, credential, application/schema change or new policy/ID. Next unused CC-TODO-025 / CC-DEC-023. Return to Chat for the specific target/passive-stage/provider-evidence approval described in the report.


## Phase 2 engineering checkpoint — 2026-10-19 Pacific

CC-TODO-020 / CC-TODO-022 remain **in progress**. [Implementation, tests, gaps and handoff](docs/R2_Release_Automation_Phase2_20261019.md): machine identity/control, ownership/epoch fencing, fail-closed recovery components, browser protections and a synthetic R1 bridge rehearsal implemented for review on an isolated branch. Full production workflow integration and cloud/browser acceptance remain open. The real R1 transition is blocked on defensible pre-gate write quiescence; [production bridge proposal](docs/R1_Bridge_Production_Proposal.md) requires later owner approval. CC-TODO-019 remains unresolved. No deployment, credentials, live data or R2 PR #7 merge. Next unused CC-TODO-025 / CC-DEC-023.


## Phase 2 authorization checkpoint — 2026-10-19 Pacific

CC-TODO-020 / CC-TODO-022: owner approved Phase 2 engineering, isolated tests and a reviewable PR using the [merged Phase 1 design](docs/R2_Release_Automation_Phase1_20261019.md). Approved choices: native GitHub **Run workflow** (in-catalog button deferred); dedicated scoped Access machine identity plus independent GitHub OIDC and one production deployment writer; engineering and synthetic rehearsal of an R1-compatible bridge. These are architectural and implementation approvals, **not production authorization**.

No deployment, production maintenance, credential provisioning, Access-policy or production-trigger change, live-data change, paid resource or merge of R2 PR #7 is authorized. Implement on an isolated branch; pushing the active feature branch can deploy development and requires separate authorization. Preserve existing R2 sequence. CC-TODO-019 remains an unresolved release-readiness dependency. Implementation, local tests, remote CI and isolated rehearsal must be reported separately. Next unused: CC-TODO-025 / CC-DEC-023.


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
