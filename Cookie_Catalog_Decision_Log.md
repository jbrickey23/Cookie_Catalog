# Cookie_Catalog — Decision Log

Newest first. Record selection separately from implementation and validation.

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

GitHub for source and durable project state; a relational database for live catalog records; object storage for assets; a private site for interaction. Sites/D1/R2 and alternatives remain candidates. No provider selection or resource provisioning has occurred.
