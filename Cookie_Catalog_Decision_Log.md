# Cookie_Catalog — Decision Log

Newest first. Record selection separately from implementation and validation.

## 2026-10-12 — Checkpoint reconciliation (existing decisions; no new approval)

Development checkpoint (2026-10-12): active branch `feature/cc-infrastructure-foundation`, draft PR #1; `main` remains the earlier bootstrap/release branch. Cloudflare development Worker and D1 `cookie-catalog-dev`, private R2 `cookie-catalog-dev-private`, and Access application are provisioned. Owner reported successful login/session, synthetic D1 create/link/edit/read (90 × 100 mm), and three-file R2 round-trip/cleanup. R2 screenshot recorded Public Access Disabled and an empty bucket afterward. CI run #79 passed for `d012da6`. These checks do not complete general catalog CRUD, persistent attachments, collaborator access, backup/restore, or production readiness.

The live alternate-email denial test is deferred at the owner's request; failed code delivery is inconclusive. No production deployment or additional paid resources are authorized. Next work: CC-TODO-006 backup/export/recovery preparation; the last user-side setup issue was PowerShell not finding Node.js. Installation has not been verified. Do not redo passed checks or resume the deferred access test automatically.

Later development provisioning authorization supersedes the original architecture-only limitation in CC-DEC-011 for the approved development environment. Its production and cost limits remain. Historical entries below describe their state at the time; the current checkpoint/TODO supersedes outdated implementation status. Initialization read main and the active PR branch, confirmed permissions and CI #79, and identified stale restoration notes. History assistance was used, so CC-TODO-001's strict independent test remains pending.

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

## Architecture proposals awaiting evaluation

GitHub for source and durable project state; an approved SQLite-compatible relational database for live catalog records; object storage for assets; a private site for interaction. Sites/D1/R2 and alternatives remain candidates. No provider selection or resource provisioning has occurred.
