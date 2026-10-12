# Cookie_Catalog — Context

Updated: 2026-10-12 (America/Los_Angeles).

## Identity and purpose

- Project: `Cookie_Catalog`.
- Repository: `jbrickey23/Cookie_Catalog`.
- Default branch: `main`; repository visibility: public.
- Repository access resolved; initial repository was empty, with read/write permissions confirmed.
- Primary user: Jay's wife, who runs a cookie decorating business and owns hundreds or potentially thousands of purchased and 3D-printed cutters, plus purchased STLs.
- Goal: search a requested theme/subject, see available decorating designs and compatible cutters, and retrieve the physical cutter or printable file. Record known flips rather than losing them in scattered photos or memory.

## Approved direction

- Bootstrap the project using the durable ChatGPT/GitHub workflow.
- Establish infrastructure first, with separate actionable TODOs for each component.
- GitHub is canonical for application source (CC-DEC-005); hosting deploys from the repository. Any hosting-managed source exception requires explicit one-way synchronization and documented ownership; provider integration is not yet validated.
- Keep application code and durable notes in one repository (CC-DEC-004): root durable files plus `docs/`, `app/`, `database/`, and `samples/`. Folder creation awaits useful content/stack selection. Revisit separation only for a demonstrated requirement.
- Use real sample cutters from the user to seed and evaluate the eventual workflow. Samples have not yet been supplied.

## Proposed architecture (not selected or provisioned)

- GitHub: source code, requirements, durable project state, schema/migrations, and reproducible sample data.
- Structured database: operational cutters, physical instances, designs, tags, locations, and relationships.
- File storage: photos, sketches, STL/3MF attachments.
- Private site: search, browse, add/edit records, and connect designs to cutters.
- Sites with D1/R2 is a candidate, not an approved implementation. Database/provider choice remains open. Resolve source ownership/synchronization between the user's GitHub repo and Sites-managed source if Sites is selected.

## First useful workflow

Search `Christmas + tree` → browse design photos → select a design → identify compatible cutter size → retrieve its physical location or printable file. Also open a cutter and see every saved design that uses it.

Support physical-ready, available-to-print, and inspiration-only states. Record whether a reuse mapping is tested or proposed. One cutter can support multiple designs; one design can fit multiple cutters.

## Scope and unresolved inputs

First-version candidates: cutter/design entry, photos, tags, sizes, locations, printable files, known flip mappings, visual search, export. These are a starting scope to refine with samples, not a finished specification.

Deferred: automatic new flip suggestions and broad bakery order/invoicing management.

Unknown: wife's devices, existing design tools, storage layout, existing file archive, sharing needs, sample records, and budget. Do not block repository preparation on these; resolve them in the appropriate infrastructure task.

## Current evidence

Repository metadata confirms the exact target, default branch, public visibility, and pull/push permissions. Contents/ref queries confirmed an empty repository before bootstrap. Core durable files, research notes, and initial model form the initial remote bootstrap. No application infrastructure has been provisioned.

## Continuation

Continue CC-TODO-001 one decision at a time with the user. Single repository and logical source layout approved (CC-DEC-004). Canonical application source ownership is approved (CC-DEC-005). Next decide development/review/release workflow, then restoration verification. Hosting integration and any managed-source exception are validation followups in CC-TODO-004. Record each answer and followup tasks. Bootstrap persistence is established; the larger repository infrastructure task remains open until source ownership/release workflow is defined. Then select database, file storage, and hosting in their separate tasks.

## Operating rules

- Fetch current repository state before relying on chat history.
- Use stable CC-TODO IDs; preserve proposed/selected/provisioned/validated distinctions.
- Keep meaningful decisions and next work reconciled across the core files.
- Preserve existing work; verify remote writes before claiming completion.
- Keep credentials out of repository files and client code.
- Catalogue purchased assets privately unless sharing rights are established.
- Do not fabricate sample cutters or silently treat demonstration records as real inventory.
