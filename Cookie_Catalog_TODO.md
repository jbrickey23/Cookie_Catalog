# Cookie Catalog — current TODO

## Context-help dismissal and layout — October 22, 2026

Owner reports the existing 1–3 second hover timing is acceptable, but sticky help and shifting fields are defects. Issue #13 / CC-TODO-021 authorizes a bounded FieldHelp correction on PR #7: retain 1,500 ms dwell/content and existing workflows, use an anchored overlay, dismiss on pointer/focus departure/outside click/Escape, and verify actual desktop/narrow layout coordinates. No Add selection/focus redesign, persistence/API, dependency, cloud configuration, production or merge authority.

Source correction is implemented. Local full regression passed 202/202 application tests; final focused keyboard/dismissal/positioning regressions passed 34/34, TypeScript/build, 33/33 tooling, schema/11 restore helpers/3 audits/synthetic import and 67 documentation checks passed. Exact remote CI/development/runtime/browser verification remains pending publication at this checkpoint. [Root cause, implementation and current evidence](docs/Context_Help.md#dismissal-and-layout-correction--october-22-2026). Issue #13 remains open until owner verification. Preserve the five October 21 owner functional passes, independent Cris pending, default-image deferral, 0005/019/023 and unresolved #7 conflicts. No duplicate IDs; reserved 025, next unused task 026 / decision 023. Immediate continuation: validate development help, then owner retest; selected-design focus improvement stays outside this batch.


## Visual Add search and owner acceptance — October 21, 2026

The owner reports **PASS** for five functional checks against verified development candidate `ebcc415383a9dfde81cd4d1dfed98b0390ad75b0`: unified producer results/ownership filters; gallery/My cutters; physical edit → Save → same design/results; unsaved Cancel/navigation draft protection; understandable existing Add workflows. This is owner-reported functional acceptance on October 21, not Cris, automated or production acceptance, and not merge approval.

Remaining presentation concern: **Add Something's existing-design search needs image-backed results. A user unfamiliar with the catalog cannot reliably recognize cutters from text-only boxes.** The underlying Add flow passed. This bounded CC-TODO-021 / CC-TODO-010 correction reuses unified search cards and query; no new task/decision ID. [Current acceptance, implementation and delivery evidence](docs/Unified_Search_R2_1.md#visual-add-search-closeout--october-21-2026) supersedes earlier pending-owner statements for those five checks only.

Visual picker application `bc6f138efb0045b449e94bdf7d8efa146d57af95` is development-verified: local and required remote CI passed 196/196 application tests and 33/33 tooling plus schema/recovery/audit/synthetic-import/docs/build checks; Cloudflare build and running-source attestation passed. Actual Chrome synthetic Add smoke passed image/fallback selection, keyboard/mouse, Reset, guarded draft replacement/workspace preservation, Save and post-refresh readback without creating a reference. [Exact evidence and retained synthetic fixture](docs/Unified_Search_R2_1.md#visual-add-development-delivery). Closing docs/evidence have unchanged application source; their own final-head CI/build/runtime evidence is recorded on PR #7. Next: independent uncoached Cris **Search → Recognize → Select → Add**. Persistent default selection remains deferred; 0005 physical-photo acceptance, CC-TODO-019, CC-TODO-023 and PR #7 conflicts remain open. Production release/merges are not authorized; #12 remains draft and #14 unmerged. Preserve reserved 025; next unused task 026 / decision 023.


## Unified Search & Design Details — October 21, 2026

**Verified development application:** `0b62c593829e276b1dfd5192c90926be62725635` passed exact-head CI (193 app / 33 tooling), development build and runtime attestation with migrations 0001–0004. Synthetic Chrome grouped-search/gallery/Add/edit-and-return smoke passed, including a browser-found stale image-count fix and draft-preserving upload retest. [Exact evidence, limitations and owner checklist](docs/Unified_Search_R2_1.md#verified-development-delivery--october-21-2026-pacific). Closing docs have unchanged application source; final-head checks are recorded on PR #7. Preferred-image persistence remains proposed/unapproved, owner/Cris retesting remains pending.

Current CC-TODO-021 / CC-TODO-010 batch: owner-approved one result per producer-specific `shapes.id`, one Search with ownership filters, design-centered details/gallery, and edit/return via existing guarded editors. [Assessment, preferred-image boundary, implementation and acceptance](docs/Unified_Search_R2_1.md) supersedes the previous presentation checkpoint while preserving its evidence and working Add/admin/diagnostics/help behavior.

**Owner-reported accepted scope:** physical Add with quantity/size/location, existing producer selection, saving a design without inventory, and workspace separation function satisfactorily. This report comes from the new handoff; original test date/device and independent Cris evidence were not supplied. Search/results/details/images/edit-and-return require owner retesting of the new candidate; no full R2.1/Cris pass inferred.

No preferred-image field or existing Set default mutation exists. Gallery and deterministic associated-photo fallback are within this batch; persistent Set as default image requires a separately approved small migration/write/recovery change and is deferred, not implemented through notes/timestamps/browser storage. Image-to-decorating-design promotion is documented future work only. No schema/0005 activation, new write API, production operation, merge, service or release change. PR #12 stays draft; #14 stays unmerged planning. CC-TODO-019 and CC-TODO-023 remain open; preserve reserved 025 and next unused **CC-TODO-026 / CC-DEC-023**. Immediate continuation is verified development delivery, owner search/details/edit-and-return retest, then independent Cris; review preferred-image persistence separately.


## Contextual Workspace — October 21, 2026

**Verified delivery:** application `b2511b3fa05de123cec23faf8d22c89161ccc673` passed exact-head CI (190 app / 33 tooling), development build and runtime source attestation; cloud Chrome synthetic creation, search, inline edit, draft and navigation smoke passed with documented limits. [Exact evidence, local-run limitation and owner/Cris checklist](docs/Contextual_Workspace_R2_1.md#exact-source-development-acceptance-checkpoint). Closing documentation has unchanged application source; its own final-head checks are on PR #7. No owner/Cris pass or 0005 activation.

The owner-authorized R2.1 Contextual Workspace handoff is the active CC-TODO-021 batch, coordinated with CC-TODO-010 / Issue #13. It authorizes presentation/component refactoring and existing development delivery on `feature/cc-infrastructure-foundation` / PR #7. [Assessment, implementation, validation and owner/Cris handoff](docs/Contextual_Workspace_R2_1.md) is the current checkpoint; earlier reference/inventory evidence below remains history.

Catalog now separates Find Something, Add Something and My Cutters from Administration and Development & Diagnostics. Existing persistence, stable producer IDs, permissions, revisions, maintenance safeguards and drafts remain authoritative. Issue #13 uses 1.5-second pointer dwell, immediate intentional help and cancellation. Implementation/local checks, remote CI, runtime source and browser smoke are distinct; consult the specialized checkpoint for the latest verified status. Owner functional acceptance and independent Cris usability are still pending, not full R2.1 completion.

Planning PR #14 at `aa3b68543aea2ec5eef06f47f137fc09427d8081` remains unmerged. This handoff approves the Contextual Workspace implementation, not every proposed phase/persistence decision in #14. Cookie Sets remains unimplemented; preserve its reserved CC-TODO-025. **Next unused CC-TODO-026 / CC-DEC-023**; no duplicate IDs allocated here. No 0005 activation, production, PR merges, new import engine or release-architecture changes. CC-TODO-019 backup root cause and CC-TODO-023 operational independent recovery remain unresolved. Draft #12 stays isolated. Immediate continuation: verify the attested dev candidate, then owner functional sanity check and independent Cris walkthrough; authorize photo migration/recovery separately.


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
