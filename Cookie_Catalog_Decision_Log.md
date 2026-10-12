# Cookie_Catalog — Decision Log

Newest first. Record selection separately from implementation and validation.

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
