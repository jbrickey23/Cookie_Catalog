# Cookie_Catalog — Decision Log

## October 15 — Quick source classification and bulk verification

Owner requests OneNote-derived suggestions with a compact Physical / Digital / Both checklist, grouped confirmation and bulk import. Preserve source references and photos; promote only confirmed eligible physical individuals using existing shape IDs. Digital reference status does not assert original STL/3MF possession. Sets, sizes and duplicate ambiguities remain explicit. This records the requested design; implementation is pending. See the authoritative current checkpoint in Cookie_Catalog_Context.md.

## October 15 — CC-DEC-016 — Reference sizing, bins and representative source

Owner confirmed personal OneDrive notebook. Reference/catalog size is the longest measured dimension: 4 by 2 inches is called a 4 inch cookie. Retain both measured axes, orientation, units and evidence; do not infer diagonal or photo-based measurements. Physical location convention is Bin #, optional future Slot #. Representative demonstration combines mixed item cases with a familiar theme. Q2 needs the existing source, beginning with a readable PDF section/sample and original notebook export ZIP, plus separate related originals when available. No notebook content or new live schema was imported/applied by recording these answers.

Next unused decision ID: CC-DEC-017.

## October 15 — CC-DEC-015 — Autonomous engineering and import-completion scope

Owner explicitly authorized going as far as possible on reversible work while they are away, using recommended defaults, batching open decisions and following source-verified application-development guidance. Costly/dependency-heavy improvements must be cataloged instead of blocking unrelated progress. This does not authorize production release, paid resources, destructive migration, source OneNote edits or external messages.

The source-import milestone (CC-TODO-009) includes a workflow to identify and collect missing size/location/photos/scale references and other applicable details. Importing incomplete records is allowed; guessed dimensions/ownership or automatically verified photos are not. Recommended initial implementation uses a read-only live queue and private editable staging drafts, preserving the validated live schema/archive format until source analysis supports a coordinated migration. Applied defaults and bulk Q1–Q5 are in docs/Batch_Review_20261015.md. Evidence references, reasons for exceptions and physical/file-only distinction are explicit; no real notebook source has been supplied/analyzed by this batch.

Historical checkpoint then: next unused decision ID was CC-DEC-016.

## October 14 — Confirmed access decisions and acceptance

Owner explicitly set admin equal to owner for now. Two privately specified accounts receive owner-equivalent access; the business info account is viewer only. Optional private Worker CATALOG_MEMBERS configuration implements the small fixed role list; existing signed Access identity and bootstrap OWNER_EMAIL remain. No real account identity is committed here. In-app membership editing and Cloudflare dashboard privileges are separate from catalog roles. Owner confirmed policy/secret Save/Deploy, existing admin session and viewer search/details/download acceptance; second admin sign-in remains pending. This supersedes the earlier distinction proposed between owner and admin and the earlier statement that all collaborator activation is pending. No new decision ID is allocated by this reconciliation.

## 2026-10-14 — CC-DEC-014 — Manual backup cadence, retention and owner

Status: explicitly approved by owner. Jay maintains complete TAR backups in private OneDrive after meaningful changes and before imports/bulk edits/deletions. Keep latest seven normal snapshots plus protected pre-change snapshots until changed-state checks and recoverability are verified. No automatic deletion/transfer/scheduling is enabled. User also requested scripting follow-up CC-TODO-012, accepting PowerShell for manual-step assistance. Scripting is a TODO, not an implemented backup service. Preserve owner-mediated verified cloud-copy and isolated data/original recovery evidence and the separately recorded metadata/runtime/scale limitations.

## 2026-10-14 — Isolated recovery import tooling prepared

CC-TODO-006 now has offline TAR-to-D1 SQL preparation and exact recovery comparison in tools/prepare_cloudflare_restore.py. Generated private output is refused inside git checkouts; existing destinations are preserved. Eight Python tests plus the expanded large-original local D1 integration pass; full 49 Node tests, schema/import and type-check/frontend/Worker build passed. Generated SQL imports into a separate local Miniflare D1 with all 16 tables/complete records retained. No remote restore is claimed, no private archive was used in this session, and no Cloudflare resources/settings were changed.

Next prerequisite: authenticated read-only Cloudflare inventory, then confirmed empty separate recovery targets and free-tier capacity/new-resource authorization. Proposed names: D1 cookie-catalog-recovery-20261014 and private R2 cookie-catalog-recovery-20261014-private. These do not exist as verified targets. Secure Cloudflare sign-in was attempted after preparation; the page rejected POST /api/v4/login with 403. No authenticated resource inventory is available; stop this browser attempt. GitHub Actions 38645828796 and 38645836608 both passed for tooling commit 15302ec. The plugin directory returned no Cloudflare integration. Preserve active cookie-catalog-dev and cookie-catalog-dev-private; no rebind, overwrite, paid resources, production release or automatic cleanup. See docs/Isolated_Cloudflare_Restore.md for the concrete preparation/import/download/comparison procedure and limits. Cloud execution, privacy/provenance, independent sync, retention and scale remain open. Device acceptance, roles, samples and deferred OneNote/photo/Canva sequencing are unchanged.

## 2026-10-14, 20:15 UTC — Development code rollback acceptance

The development code rollback and roll-forward drill passed. Exact deployed sources: baseline 489ed640 → compatible previous app redeployment 26c2425e → restored current app 0a613893. Signed-in owner reads, same-value synthetic-location saves, exact-byte original downloads and restored phase archives passed. All phases retained identical schema, all 14 rows across 16 tables, and the one 5400084-byte STL; integrity/FKs passed. CI and Workers Builds passed. No migration, data restore, resource/security change or production release occurred.

Next CC-TODO-004 prerequisites: intended-device acceptance and main-release safeguards. Read-only GitHub inspection found main and development branches unprotected with no rulesets; no settings were changed. CC-TODO-006 isolated Cloudflare restore/cloud sync/retention, 005 intended-user roles and 007 real samples stay open. Preserve deferred alternate-email testing and Windows remediation. OneNote/photo/Canva remain future work. See docs/Development_Rollback_Acceptance.md and docs/evidence/Development_Rollback_20261014.json.

This was the existing authorized development-only drill. A fresh private backup was saved/restored before changes. The old/new app and unchanged database/tools tree identities were verified; backward and forward commits were ordinary leased fast-forward updates. No app merge, schema/data/object restore, branch reset or provider-native rollback was used. The User Companion now explains what code rollback means and its limits.

## Earlier acceptance — 2026-10-14, 19:35 UTC

The controlled missing-original live gate now passed on deployed commit ec8f8640799bbdb2f3df4153f8fe4fca582443df. A unique synthetic photo returned 200 initially, 409 after only its R2 bytes were removed, and 200 after trusted bytes were restored. Listing marked it unavailable during loss; attachment metadata, checksum and shape link survived. Its record, metadata/link and object were then removed and cleanup verified. Existing catalog records and originals were preserved.

Post-test authenticated verification: both migrations, 16 tables, zero foreign-key violations; original catalog counts stayed 2 shapes/2 designs/2 physical cutters/2 mappings; one original remained in R2. The retained 5400084-byte test STL downloaded with its unchanged SHA-256 44f1d7d5617d5611da7832a8c3e7fd512d970b3e6f80a61775cbf981a18892f7. The earlier approved two attachment identities remain deleted; no new missing-test fixture remains.

49 Node tests, TypeScript/frontend/Worker build, GitHub Actions 38624720682/38624732060 and Workers Builds passed for ec8f864. Live result, scope and cleanup behavior: docs/Missing_File_Recovery_Check.md; sanitized runtime evidence: docs/evidence/Infrastructure_20261014_missing_recovery.json.

Current next prerequisite is CC-TODO-004 development code-rollback acceptance and intended-device checks. A development-only rollback checklist is prepared in docs/Development_Rollback_Acceptance.md; no rollback or production release has run. CC-TODO-006 isolated Cloudflare restore/operational durability, 005 intended-user access and 007 representative samples remain open. OneNote 008/009, photo extraction 010 and Canva 011 remain deferred. No new resources/cost/security changes; preserve the deferred alternate-email test.

## Latest acceptance — 2026-10-14

Approved deletion of the original two synthetic attachments passed; one STL was re-uploaded under a new identity for recovery and remains private. Live original-containing TAR local restore passed: 16 tables, 14 rows, one 5400084-byte original with matching bytes, valid relationships, SQLite integrity and completion receipt. Implementation 1ea5c0e matched the deployed SHA and passed 45 tests/build plus GitHub CI.

Download small TAR archive now supports complete archives up to 32 MiB when direct folder saving is unavailable. The direct-save 1 GiB originals ceiling and old JSON limits are unchanged. No payload/database/original is in GitHub.

The controlled live missing-original detection/recovery gate subsequently passed using a unique disposable fixture; see current acceptance above. Cloudflare restore, sync/retention, collaborators, release and real-sample gates remain open. Preserve deferred alternate-email testing and future OneNote/photo/Canva work. Full evidence and recovery checksums: docs/Infrastructure_Verification.md.

Updated: 2026-10-14 UTC. Stable decisions are retained below in their historical wording. Selection, authorization, provisioning and verification are separate.

## 2026-10-14 — CC-DEC-013 — Restore infrastructure acceptance as current priority

User explicitly directed reconciliation of the October 14 handoff: OneNote migration (008/009), photo metadata extraction (010) and Canva (011) are future work. Preserve their original IDs/criteria from main, defer them, and resume CC-TODO-002/003/004. The main TODO's 008 NEXT label was sequencing drift, not authorization to abandon infrastructure acceptance.

Preserve completed development provisioning/checks. Earliest unverified checkpoint is exact deployed source provenance/current authenticated Worker-D1-R2 report, followed by remaining linked cutter/design/location and persistent file acceptance. Existing owner Windows Node/npm.cmd verification stands; Defender-blocked Wrangler remediation remains parked. Browser/GitHub deployment is usable. Original-containing TAR recovery remains followup, not immediate priority.

Prepared read-only owner infrastructure report and build source SHA; 43 local tests/build passed. At preparation the browser required sign-in; the subsequent live evidence below closes that specific prerequisite. Main receives only reconciled durable notes, not application merge/release. No costs/resources/production/security changes authorized. Broader privacy and deferred access-test boundaries remain.

## 2026-10-14 — Larger development recovery and verified highlighting (routine engineering)

2026-10-14: owner confirmed Matched fields highlighting works. CC-TODO-006 now adds a larger TAR archive with a D1 schema/records/migration snapshot, separate original bytes, SHA-256 metadata and a required completion receipt. Browser assembly and direct folder saving use desktop Chrome/Edge; each original is a separate authenticated request, avoiding one long Worker invocation. Limits: 25 MiB/file, 1000 originals, 1 GiB originals total, 10000 rows/table, 16 MiB manifest. These are application ceilings, not demonstrated production throughput. Local tests recovered a 5,250,084-byte STL and all 16 tables/relationships; a separate test covered 26 originals. All 40 Node tests and type-check/frontend/Worker build passed. Corruption/truncation/extra data, missing/orphan/changed files and denied requests fail. At that earlier checkpoint live larger-upload/archive/save/restore acceptance was pending; the subsequent evidence below passes upload/retrieval, while TAR restore remains open. Old JSON backup/recovery-test formats and their 4 MiB total/25-object limits are retained for compatibility. No new resources, paid plan, automatic transfer/pruning or production changes.

Free Worker CPU/subrequest limits informed browser archive assembly and separate original requests. Existing D1/R2 and owner authorization reused; no provisioning or plan upgrade. Practical larger recovery remains development-gated until live saving/restoration passes. CC-TODO-006 is not closed; storage/sync/retention and production consistency require further verification.

## 2026-10-13 — Catalog continuation and live photo evidence (routine engineering)

Live evidence, 2026-10-13: owner screenshot shows the Private files section deployed, a 2,946,752-byte JPEG linked to DEMO Evergreen tree and present after refresh. Owner confirmed the downloaded photo opens. This verifies owner upload/persistence/retrieval; live deletion, design-image/STL workflows and negative-edge access remain unconfirmed. The photograph was user-provided; do not assume it is a synthetic or licensed-shareable fixture. No photograph or new backup payload is committed to GitHub.

Catalog continuation, 2026-10-13: owner-only create/full-update/read/literal-search routes and browser controls now cover shapes, designs, flat locations, physical cutters (millimeters/quantity/origin/location) and design/shape links (tested/proposed, standard/flip/combination, instructions/rotation/mirror/width range). Existing schema reused; no migration or provisioning. Generated stable IDs, parameterized queries, bounded JSON/field validation and same-origin mutations; 200-row search pagination. Local 32 Node tests and TypeScript/Vite frontend/Worker build passed. Live catalog deployment and create/edit/search across refresh still need owner acceptance. Record deletion, tags/visual search, full import and collaborator editing remain unimplemented.

The 4 MiB total/25-object development backup cap and 4 MiB/file upload cap are temporary application limits, not intended catalog capacity. Scalable backup/upload engineering remains required before real inventory; no paid resource or production change approved by this continuation.

## 2026-10-13 — Routine engineering continuation (no new architecture approval)

Reinitialized from current GitHub main and draft PR #1; main is stale bootstrap, active development head was 3afb30d. No AGENTS.md found. Same-conversation/history-assisted restoration does not close CC-TODO-001. User explicitly requested continuation.

Implemented owner-only persistent attachments with existing schema, generated keys, exact-byte/hash downloads, same-origin mutations, confirmed deletion and retryable cleanup. Metadata-first upload and a bounded manual audit address interrupted operations; unlinked generated objects younger than 24 hours are protected. File limit four MiB, lightweight format headers, owner-wide catalog permission until collaborator roles exist. Existing backup cap remains four MiB total; no production or extra resources. Local 27 tests plus schema/import/type-check/build passed; live acceptance remains pending. See Attachment_Lifecycle and TODO for remaining checks.

## Current implementation reconciliation

CC-DEC-011 selected Cloudflare Workers, D1 and private R2. The owner subsequently explicitly authorized and completed development provisioning, R2 activation and Access configuration. The initial architecture-only/no-resources statements below describe the earlier moment; they do not negate subsequent development authorization. Production and additional paid resources remain separately gated.

CC-DEC-004/005: the single source repository/layout is implemented, and GitHub-connected development deployment is evidenced. CC-DEC-006: feature branch/PR and CI exist; main-release protection, deployment and rollback acceptance remain open. CC-DEC-007: remote restoration/readback passed with history assistance; a strict independent fresh-chat test remains pending.

Owner access, synthetic database/storage checks and actual browser export/local restoration passed. Code 40ab108 passed CI #97 with 20 Node tests plus SQLite/type-check/build; pre-reconciliation head 330ca8a passed CI #105. General CRUD, collaborator access, Cloudflare-side restore and production readiness are unfinished. Persistent owner attachments are now implemented and locally tested; live acceptance remains pending. Real samples have not been supplied. The owner deferred live alternate-email denial testing and parked residual Windows Defender remediation.

## 2026-10-12 — CC-DEC-012 — Private dated backup handoff

User requested simple folders and date/time filenames, considered GitHub and offered OneDrive. Keep code, migrations and recovery instructions versioned in GitHub; keep full backup payloads private. The application repository is public.

Prepared two byte-identical UTC-named JSON snapshots, a checksum/size/migration/restore manifest and instructions in Cookie_Catalog_Backups_20261012T231810Z.zip. Owner supplied its extracted location under personal OneDrive: Cookie_Catalog/Backups/Cookie_Catalog_Backups_20261012T231810Z. Local placement is owner-reported; completed cloud sync is not yet verified. Exact exporting deployment commit was not independently attested; validation commit 40ab108 is traceability evidence, not export provenance.

Latest-seven normal snapshots after meaningful changes/before imports remains proposed, not an approved or activated pruning/scheduling policy. No automatic transfer, new subscription or production change was activated. See docs/Backup_Recovery_Plan.md.

Historical checkpoint then: next unused decision ID was CC-DEC-015.

## 2026-10-14 — Infrastructure acceptance evidence (routine engineering)

Live acceptance 2026-10-14: owner-authenticated browser report at 19:20:11.841Z identified deployed commit 2939565e128502c32b2cf3448f0c673f9b68c797 on feature/cc-infrastructure-foundation, matching GitHub. Workers Builds Node v24.18.0 is separate from owner Windows Node. D1: 16 tables, migrations 0001/0002, zero FK violations; R2: two objects/two linked originals sampled, none missing or size-mismatched. GitHub Actions run 38619770729 passed for that commit. Later documentation-only commits do not invalidate this timestamped deployment evidence; compare a new deployment report when code changes.

Live browser 2026-10-14: created and edited labelled TEST Infrastructure 20261014 location, design, physical cutter and proposed flip mapping, then reloaded/searched/retrieved them. Cutter retained 91 x 101 mm, quantity 3, printed origin and linked test shelf. Mapping retained design/shape, proposed flip, edited instructions, rotation 180, mirror Yes, width 90–95 mm. Search identified the matching notes/instructions. Existing demonstration records were preserved. Test records remain in development; record deletion is unavailable.

Live persistent file acceptance 2026-10-14: synthetic design PNG (1944 bytes, SHA-256 b176ff52e49f3b96495aebeae0a546b5b9fe8ce7ff47d6560438a28d618ced71) and synthetic STL (5400084 bytes, SHA-256 44f1d7d5617d5611da7832a8c3e7fd512d970b3e6f80a61775cbf981a18892f7) uploaded, survived full refresh, and downloaded byte-identically. This passes live >4 MiB upload/retrieval, not original-containing TAR recovery. Both synthetic originals remain linked in private R2. Deletion/missing-file live checks remain open; do not remove existing owner content.

Current next gate is live synthetic-original deletion/missing-file acceptance, then original-containing TAR recovery. No component is closed by these individual passes; release/collaborator/real-sample acceptance remains open.

## Historical decisions

The following entries record approval and implementation status at the time of each decision. Read them together with the current reconciliation above, Context and TODO.

## 2026-10-12 — CC-DEC-011 — Cloudflare infrastructure and slicer-based scaling

Status: user approved architecture direction, not resource provisioning. Use Cloudflare Workers for the application/API, Cloudflare D1 as the SQLite-compatible operational database, and Cloudflare R2 for private images, STL/3MF files and other attachments. GitHub remains canonical application source with feature-branch development and main releases. Prefer clean data/storage interfaces, portable migrations and independent full export/restore; validate security, identity, GitHub deployment, cost and recovery before production. User approved slicer-based scaling for v1: catalog stores original models, physical dimensions/units and optional target-size/scale metadata, while a slicer applies geometry transformations and printer settings. Preserve a modular future path to derived 3MF/STL generation or print preparation, but do not implement it in v1. Uniform scaling affects wall thickness and cutter height, so do not assume every model scales safely. No Cloudflare resources, paid plans or production deployments have been created or authorized by this decision.

## 2026-10-12 — CC-DEC-010 — Accelerated architecture-by-exception governance

Status: user approved. Prioritize long-term stability, functionality, maintainability, and practical portability over minimum initial setup. Delegate routine, reversible technical decisions to the assistant, documenting rationale and verification in GitHub. Seek user approval for material functionality/cost tradeoffs, hard-to-reverse commitments, external provisioning and production changes. Evaluate database, file storage, hosting, identity, backup and deployment as one coherent architecture rather than approving each provider in isolation. Present a researched consolidated architecture with explicit risks, costs, migration/export/restore plans and only material approval questions. Do not infer authorization to provision external services or incur costs. Keep existing CC-TODO component acceptance criteria and preserve CC-DEC-008/009. CC-DEC-010 is governance, not database-provider selection.

## 2026-10-12 — CC-DEC-009 — Balanced managed infrastructure and portability

Status: user approved as a provider-selection criterion, not a provider selection. Prefer simple, managed infrastructure while preserving practical migration, export, and recovery paths. Avoid unnecessary vendor-specific coupling, but do not add significant operational complexity solely for theoretical portability. Under CC-TODO-002, compare SQLite-compatible providers (including Cloudflare D1 and Turso) on integration, actual export/restore, pricing, privacy, and maintenance before approving one. Coordinate file storage and hosting choices with CC-TODO-003/004. No provider or resource has been selected/provisioned by this decision.

## 2026-10-12 — CC-DEC-008 — SQLite-compatible relational database architecture

Status: user approved; architecture selected, provider and implementation pending. Use a SQLite-compatible relational database as the operational source of structured catalog records (cutters, designs, physical instances, tags, locations, and many-to-many mappings). GitHub JSON files are not the primary live catalog database. Preserve portable schema/migrations and stable IDs. Evaluate hosting/provider, costs, backup, access and runtime compatibility under CC-TODO-002 before provisioning. Cloudflare D1 is a candidate, not an approved provider.

## 2026-10-12 — CC-DEC-007 — GitHub-first fresh-chat restoration

Status: user approved; in-session remote-file recovery check completed; independent fresh-conversation test pending. Every new Cookie_Catalog conversation must fetch current GitHub README, Context, TODO, Decision Log, bootstrap prompt and any applicable AGENTS.md before project changes. Reconstruct decisions, open tasks, and current work; identify conflicts or incomplete writes before proceeding; never repeat completed bootstrap work. Reconcile meaningful decisions and work back to GitHub and verify remote reads before handoff. GitHub is authoritative for code/project state; operational catalog data and attachments belong to their future database/object store.

Followup under CC-TODO-001: validate this workflow in a genuinely new conversation, then mark task completed if it reconstructs the correct next task. In-session readback is not a substitute for independent fresh-chat validation.


## 2026-10-12 — CC-DEC-006 — Feature branches and main release branch

Status: user approved; branch protection, CI and deployment automation not yet configured. Prepare application changes on feature branches; review and validate before merging; use `main` as the release branch. Once hosting is configured, deployment should follow approved merges to `main`. Preserve a known-good commit for rollback; document the actual deployment and rollback procedure under CC-TODO-004. Do not claim branch protections or deployment are operational yet.

Followups: CC-TODO-001 records the agreed workflow and validates fresh-chat restoration. CC-TODO-004 implements and verifies GitHub-connected deployments, pre-merge checks, branch protection as appropriate, and rollback. Database migration rollback/recovery must be handled separately under CC-TODO-002/006.


## 2026-10-12 — CC-DEC-005 — GitHub is canonical application source

Status: user approved; deployment integration not yet validated. `jbrickey23/Cookie_Catalog` is the single authoritative source for application code and versioned configuration. Hosting should deploy from this repository, not independently maintain competing application code. If a hosting provider requires managed source, document the exception and a one-way synchronization/deployment mechanism before adoption; do not silently introduce a second editable source.

Followups: under CC-TODO-001, define development/review/release workflow and validate fresh-chat restoration; under CC-TODO-004, verify GitHub integration, deployment/rollback and source synchronization behavior with the selected hosting provider. Operational catalog records and purchased assets remain outside public Git history.


## 2026-10-12 — CC-DEC-004 — Single repository and logical source layout

Status: user approved; folder implementation pending application stack selection. Keep application code and durable project notes together in `jbrickey23/Cookie_Catalog` for simpler maintenance. Proposed layout approved: `docs/` for requirements, research, infrastructure and recovery documentation; `app/` for website code; `database/` for schema and migrations; `samples/` for shareable test records and import examples. Keep README, TODO, Decision Log, Context and New Chat Bootstrap Prompt at the root. Live catalog records and private/purchased attachments belong in the operational database/file store rather than public Git history.

No compelling reason for separate repositories is currently established. Revisit only if a concrete hosting constraint or other requirement makes separation necessary; hosting-managed source compatibility remains unverified. Adapt physical application paths to the selected stack if required, and document the change rather than maintaining duplicate code silently.

Followups under CC-TODO-001: establish folders when content/stack is available; verify hosting can use this repository or document required synchronization and source ownership with CC-TODO-004; agree release workflow; validate fresh-chat restoration. These remain checklist items in their existing component tasks.

## 2026-10-12 — CC-DEC-003 — Infrastructure first; one task per component

Status: user approved. Establish repository, database, and other infrastructure as separate durable tasks. Initial backlog separates repository, database, files, hosting, access, recovery, and seed/import. Recording tasks does not imply these systems have been created.

## 2026-10-12 — CC-DEC-002 — Use real samples to evaluate the workflow

Status: user direction. The user has sample cutters to seed development. Samples have not yet been supplied or imported. Test theme/design retrieval, cutter availability/location, and known alternate designs before scaling catalog entry.

## 2026-10-12 — CC-DEC-001 — Project identity and durable bootstrap

Status: user approved. Name the project Cookie_Catalog and bootstrap its already-created GitHub repository. Repository verified as jbrickey23/Cookie_Catalog, default branch main. Initial repository was empty. Follow the established Context/TODO/Decision Log/New Chat Bootstrap Prompt convention.

## 2026-10-14 — User documentation companion (routine documentation)

Owner asked whether a user-facing documentation companion was being generated. Existing documents were technical/runbook-oriented, so docs/User_Companion.md was added and linked from README. It covers current catalog terms/workflows, search matches and metadata boundaries, files/removal/missing originals, backup choices/recovery, development controls and unavailable future work. Maintain it alongside user-visible changes; no new architecture decision/task ID, resources or costs.

## 2026-10-14 — Main safeguards and device continuation (prepared; not applied)

Current readback still shows main/development unprotected and no rulesets. Prepared the exact main-only PR + sqlite/GitHub Actions, up-to-date, conversation-resolution, admin-enforced/no-force-push/no-deletion policy with zero mandatory approving reviewers for the current single-owner workflow. GitHub source/PR integration lacks administration writes. Browser settings access requires owner sign-in, which has not completed. No protection/access/deployment settings changed; no application merge/release. Credentials and detailed sign-in values are not recorded.

Prepared intended-device evidence/checklist and User Companion links; cloud Chrome success and prior owner UI evidence do not substitute for target-device acceptance. Continue after secure owner sign-in, preserve all earlier passes and parked Windows/alternate-email boundaries. This is implementation of existing CC-TODO-004, not a new architecture/task ID.

## 2026-10-14 — Main protection applied and verified

Main-branch protection was created and read back on 2026-10-14 after owner sign-in. The exact main rule requires a pull request, sqlite from GitHub Actions, an up-to-date branch and resolved conversations, and applies to administrators. Mandatory approvals are disabled for the current single-owner workflow; force pushes/deletions are disabled. The branch API reports main protected=true and development protected=false. Detailed protection API access is unavailable to the integration (403); persisted checkbox/source selections were verified in the signed-in GitHub UI.

Main updates now use documentation-only pull requests and required checks. Application PR #1 remains draft/unmerged. A validation workflow covers the notes-only main state and preserves schema/import + Node tests/type-check/build whenever app source is present; incomplete source layout fails. Intended-device outcomes remain pending in docs/Device_Acceptance.md. No application release, new access, resource, cost or deployment setting changed.

Detailed rule API readback is integration-restricted; the signed-in GitHub edit form persisted all intended settings and the branch API independently reported protected=true. Added appropriate validation for notes-only main and retained the full app check path. Main source/doc changes now follow PR + check requirements; do not bypass protection. No new architecture/task ID or paid/production scope.
