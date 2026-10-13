# Cookie_Catalog — Decision Log

Updated: 2026-10-13 UTC. Stable decisions are retained below in their historical wording. Selection, authorization, provisioning and verification are separate.

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

Next unused decision ID: CC-DEC-013.

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
