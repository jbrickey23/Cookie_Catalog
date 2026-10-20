# Cookie_Catalog — Durable workflow adoption and audit

Date: 2026-10-19 Pacific. Task: CC-TODO-024. Decision: CC-DEC-022.

## Inspected baseline and scope

Cookie_Catalog main: `6c475e67cd8eebd789a5aa66f1eb4400de996de6`. Framework: `53aa39ccedce935a702f44072cc647231c8cc02e`, release 1.0.0. Inspected the discovered tree, root README and four core records, development guidelines, release status/closeout, main safeguards, deployment runbook, workflow, branch metadata, and separate development/production configuration. Also inspected open PR #7 at `9f53bf618a5b5ae7d88d1cdd2d6a030b34efc3b2` (active R2), its streamlined core records/R2 plan/development guidelines/charter, and PR #5 at `e20303cd923a54830bc05c978f9609140adce2b5` (pending charter). No AGENTS.md or existing global-policy copy/pin was present in the discovered baseline tree.

This adoption changes documentation and policy copies only. It does not change Durable_CHATGPT, runtime source, database/schema, original files, deployment settings, credentials, resources, release tags, or live catalog data. The user's execution request authorizes this audit/adoption/validation/commit/reconciliation batch; it is not authorization to implement R2 features or deploy a release.

## Requirement audit

| Requirement | Baseline | Adoption action / authority |
| --- | --- | --- |
| Current-state initialization | Partial: CC-DEC-007 requires GitHub restoration; bootstrap contains long chronological checkpoints without a concise restore entry | Added top restore/continuation block with policy pin, branch/PR verification and historical precedence |
| Independent project state and source authority | Implemented: CC-DEC-004/005/007; root records and specialized release evidence | Preserve filenames, IDs, private operational data ownership and existing records |
| Versioned inheritance | Missing: no release pin, verified copies or manifest | [Policy pin](../policies/README.md), unmodified policies and source manifest |
| Guided Switching | Partial: autonomous work approved and active branch charter preserves execution continuity; no explicit design-ready/launch handoff | Apply DCHAT-POL-001; bootstrap links this local procedure |
| Usage efficiency | Partial: sustained work and targeted evidence practices; no shared routing/retry policy | Apply DCHAT-POL-002 unchanged; no competing local efficiency policy |
| Critical engineering judgment | Partial: CC-DEC-010 and development guidelines already require researched, reasoned engineering | Add one explicit judgment subsection to existing guidelines, link it from bootstrap; no third global policy |
| Execution handoff / reconciliation | Partial: historical batch and interrupted-worker records; no reusable entry procedure | Use pinned upstream templates with project mapping below |
| Proposed / approved / implemented / validated distinctions | Present throughout evidence records; not explicit at bootstrap entry | Explicit status vocabulary and evidence requirements at entry/procedure |
| Main workflow and R1/R2 boundaries | Implemented: protected-main PR/checks; R1 closeout and separate runtime configurations | Preserve safeguards; docs-only PR and no release promotion |

## Production and development boundary

[Current R1 closeout](R1_Release_Closeout.md) and [first-release status](First_Release_Status.md) record R1 v0.1.0 released, tag at `c0cb3efa8915d88d95efa28e9dfaec3b4ebd0cda`, final production promotion `62e92a16a1e32975ee6bc7f15679183120315411`. Accepted baseline: 22 tables, 4048 rows, 592 independently verified originals and checked production backup. These are existing release evidence, not a fresh live audit by this adoption session.

Production is the sole editing catalog; development is for testing. Tracked configs target distinct Workers/D1/private R2 and separate Access audiences. Do not promote this documentation branch to `release/r1-production`, retag R1, reimport, restore over production, or place real catalog edits in development.

Main's post-R1 task summaries are older than active R2 PR #7. That branch records all four R2 tracks as authorized (October 16 at 18:05, continued autonomous execution at 22:05 Pacific): UX CC-TODO-021, Change Requests CC-TODO-018, release automation CC-TODO-020/022, and photo ingestion CC-TODO-010. CC-TODO-023 is private request backup/recovery. Development slices are implemented with local test evidence; authenticated browser acceptance, machine-auth release controller/recovery, backup stall root cause and photo extraction/approval/recovery remain open. Slot help is authored Ready there. Do not revert these to older main's R1.1/deferred sequencing or call R2 released.

PR #7 uses concise current records plus `_History.md` files and already contains `docs/Project_Charter.md` (also pending separately in PR #5). Preserve that split and charter when eventually reconciling branches. This adoption starts from protected main and does not merge feature code, replace active branch records with main history, or merge/close either existing PR. Before resuming R2 or integrating PR #7, restore its latest core records and merge the small adoption entry/pin links into those current records, retaining its task statuses/history links. No task is duplicated: adoption uses the next free ID CC-TODO-024; next unused is 025. This adoption does not reopen completed R1 gates or close CC-TODO-001's independent fresh-chat acceptance test.

## Session initialization and Guided Switching

“Initialize Cookie_Catalog” restores current GitHub records, [policy pin](../policies/README.md), local policies, applicable AGENTS.md if present, and relevant specialized evidence. Inspect current branch heads/open PRs to distinguish accepted main from unmerged work. Read the current top checkpoints first; consult historical sections only for needed evidence. Report the checkpoint, mode/authority, unresolved conflicts, and next concrete task. Initialization alone authorizes restoration, not a new implementation batch.

Ordinary Chat handles design. When decisions support a concrete batch, proactively identify that design is ready and prepare the pinned handoff; recommend Work/Codex when its execution capabilities serve that work. The user authorizes launch. Do not claim an automatic UI/session switch. Explicit execution requests can already supply that approval, as this adoption request does. Within an approved batch, continue implementation, validation, commit and reconciliation without repeatedly asking to proceed.

Use [existing engineering judgment](Development_Guidelines.md#critical-engineering-judgment) when evaluating requests and proposals. Do not confuse constructive disagreement with an additional approval gate for routine authorized work.

## Handoff and reconciliation procedure

Use these upstream templates at the **pinned commit**, adapting fields to existing records instead of copying a second set of policies/templates into this project:

- [Execution handoff](https://github.com/JBrickey23/Durable_CHATGPT/blob/53aa39ccedce935a702f44072cc647231c8cc02e/templates/Execution_Handoff_Template.md)
- [Reconciliation checkpoint](https://github.com/JBrickey23/Durable_CHATGPT/blob/53aa39ccedce935a702f44072cc647231c8cc02e/templates/Reconciliation_Checkpoint_Template.md)
- [Bootstrap reference](https://github.com/JBrickey23/Durable_CHATGPT/blob/53aa39ccedce935a702f44072cc647231c8cc02e/templates/Project_New_Chat_Bootstrap_Template.md)

Before execution, fill repository/branch/base SHA, restore paths/pin, approved decisions, outcome/task IDs, included work, exclusions, acceptance checks, model/reasoning recommendation, actual launch step if needed, and authorization reference. A pending handoff is proposed; a user-approved handoff is approved. Changes present in a tree are implemented; only checks actually passed establish validated scope. A local commit or open PR is not merged main or deployed production.

At meaningful milestones and before handoff, update existing Context/TODO/Decision Log/Bootstrap and affected specialized records with completed work, validation/limitations, decision IDs, remaining tasks, blockers/attempts, exclusions, exact commit/PR and remote verification status, and next action/authority. Keep one durable account rather than replaying the full chat. Preserve unrelated edits and current SHAs. Two unsuccessful attempts on one blocker require a changed approach; productive verified work has no artificial cap. Follow the pinned usage policy for reasoning and proportionate validation.

Publish docs through a branch/PR with required `sqlite` checks, current base and resolved conversations; never bypass protection. Do not promote production branches. If upstream templates cannot be read, the field list above and verified local policies suffice for continuation; report unavailable source access. External ChatGPT Project Instructions are not automatically changed by repository adoption.

## This batch checkpoint and validation

Policies are copied byte-for-byte and verified with SHA-256 against the source manifest. Root records link the pin/procedure; existing history is retained. CC-DEC-022 records adoption without exceptions; CC-TODO-024 tracks this documentation batch, next unused task CC-TODO-025. Validation includes repository documentation/JSON/layout checks, digest parity, preserved historical bodies, scoped diff/whitespace checks and the existing required GitHub CI. Publication/merge evidence belongs to the resulting PR and completion report; do not infer a merge from this document. No live production revalidation or independent history-free fresh-chat test is claimed.

Immediate continuation: complete the protected documentation PR, inspect CI/merge status, then restore active R2 PR #7 and continue under its recorded existing authorization. Non-blocking design/adoption discussions do not reprioritize that work; only the owner changes priorities. New batches beyond existing authorization need a prepared handoff. The global framework source is read-only in this batch; its downstream-adoption tracking task is not modified here.

## Validation evidence

Local validation passed for 51 Markdown files / 131 local links, documentation and policy JSON, complete repository layout, both source-manifest SHA-256 digests, pin parity, preserved historical record bodies, scoped documentation-only diff, SQLite schema and synthetic import, ten recovery tests and three OneNote audit tests. Plain `git diff --check` flags six upstream Markdown hard-break lines; those two-space line endings are preserved to keep policy copies byte-identical. Other new text passes whitespace validation. Required GitHub `sqlite` CI runs the existing helper/app tests and build before protected-main merge. Exact CI and merge results are recorded by the PR and completion report.

## Active R2 documentation integration

After the protected-main adoption PR, synchronize only the adopted documentation into the active R2 branch using a merge commit that preserves both parent histories. Keep the R2 current/history split and its current task states, add policy restoration to its concise bootstrap, retain existing R2 authorization and charter, and advance its next-unused task to 025. Preserve every runtime/config/schema/tool/test/history blob from the inspected R2 parent. Do not merge R2 application code into main or production as part of this integration. Verify the resulting tree and exact-head CI; GitHub commit/PR records establish completed publication, not this procedural text alone.
