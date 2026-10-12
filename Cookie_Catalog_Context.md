# Cookie_Catalog — Context

## Live recovery checkpoint

Live package cookie-catalog-dev-2026-10-12T22-53-46-644Z.json (7,834 bytes; SHA-256 724b645b1a4582ea4bc08499376a0fc072efc018c081a47194421390618d0149) passed payload checksum verification and restored into a new disposable local directory on 2026-10-12. Recovered 16 tables and 6 rows: both migration entries, one design, shape, cutter and link. Confirmed DEMO Holiday tree → DEMO Evergreen tree at 90 × 100 mm, SQLite integrity_check=ok and no foreign-key violations. Zero file objects matches the empty live bucket; this package does not prove live attachment recovery. The uploaded package and restored database are private and are not committed to public Git.

Next browser action: refresh https://cookie-catalog-dev.j-brickey.workers.dev and choose Download file recovery test. This owner-only same-origin POST /api/dev/recovery-check creates unique, disposable synthetic cutter/design/location records plus PNG/STL originals and metadata, exports them, then deletes only its request-scoped data and verifies cleanup before returning the download. Attach that saved recovery JSON for actual file/relationship restoration. Local D1/R2 binding integration tests, real SQLite restore, failure-path cleanup, preservation of existing data, all 20 Node tests and TypeScript/Vite frontend/Worker build passed. Live recovery-test execution remains pending; CC-TODO-006 is still open for file recovery, Cloudflare-side restoration and backup destination/retention/scheduling.


## Latest continuation

2026-10-12 continuation: Node.js v24.21.0 and npm.cmd 11.19.0 work. This formerly managed PC still reports Defender for Endpoint enrollment (OnboardingState=1) and tamper protection; event 1126 blocks node.exe at registry.npmjs.org. Audit-mode change did not take effect, so Wrangler login was never retried. Previous IT is unavailable. Park local PC remediation; no reset/reinstallation is authorized. CC-TODO-006 now provides an owner-only browser development download at POST /api/dev/backup plus a disposable local restore tool. Local schema, linked-record and two-file restoration, negative authorization/integrity cases, all 16 Node tests, SQLite smoke/import and TypeScript/Vite frontend/Worker build passed. Live export/restore, independent backup destination, retention and scheduling remain pending; no production deployment or paid resources were added.


Updated: 2026-10-12 (America/Los_Angeles).

## Identity and purpose

- Project: `Cookie_Catalog`.
- Repository: `jbrickey23/Cookie_Catalog`.
- Default branch: `main`; repository visibility: public.
- Repository access resolved; initial repository was empty, with read/write permissions confirmed.
- Primary user: Jay's wife, who runs a cookie decorating business and owns hundreds or potentially thousands of purchased and 3D-printed cutters, plus purchased STLs.
- Goal: search a requested theme/subject, see available decorating designs and compatible cutters, and retrieve the physical cutter or printable file. Record known flips rather than losing them in scattered photos or memory.

## Current checkpoint

Development checkpoint (2026-10-12): active branch `feature/cc-infrastructure-foundation`, draft PR #1; `main` remains the earlier bootstrap/release branch. Cloudflare development Worker and D1 `cookie-catalog-dev`, private R2 `cookie-catalog-dev-private`, and Access application are provisioned. Owner reported successful login/session, synthetic D1 create/link/edit/read (90 × 100 mm), and three-file R2 round-trip/cleanup. R2 screenshot recorded Public Access Disabled and an empty bucket afterward. CI run #79 passed for `d012da6`. These checks do not complete general catalog CRUD, persistent attachments, collaborator access, backup/restore, or production readiness.

The live alternate-email denial test is deferred at the owner's request; failed code delivery is inconclusive. No production deployment or additional paid resources are authorized. Next work: CC-TODO-006 backup/export/recovery preparation; Node.js and npm are confirmed working; local Wrangler installation is blocked by Defender enrollment (see latest continuation). Do not redo passed checks or resume the deferred access test automatically.

## Approved direction

- Bootstrap the project using the durable ChatGPT/GitHub workflow.
- GitHub-first fresh-chat restoration is approved (CC-DEC-007). Read latest durable files before changes, reconcile conflicts and verify writes. Recovery with history assistance passed on 2026-10-12; a strict history-independent fresh-chat test remains pending. Read open development PRs when main is behind.
- CC-DEC-011 approved: Cloudflare Workers + D1 + private R2 as intended infrastructure, with slicer-based scaling in v1; future derived-model/3MF processing remains modular and deferred. Development provisioning was subsequently authorized and owner-confirmed; no production deployment is authorized.
- CC-DEC-010 approved: accelerated architecture-by-exception governance; assistant handles routine reversible engineering decisions and records evidence, while user approves material tradeoffs, costs, external provisioning and production changes. Evaluate infrastructure as a coherent stack, emphasizing long-term stability, maintainability and practical portability.
- CC-DEC-009 approved: balanced provider-selection preference—simple managed infrastructure with practical export and migration; Cloudflare subsequently selected under CC-DEC-011.
- CC-DEC-008 approved: use a SQLite-compatible relational database for operational catalog records; Cloudflare D1 subsequently selected and development provisioning owner-confirmed.
- Establish infrastructure first, with separate actionable TODOs for each component.
- Feature branches are used for development/review; `main` is the release branch (CC-DEC-006). CI and feature-branch development deployment are evidenced; branch protection, main release automation and rollback validation remain open.
- GitHub is canonical for application source (CC-DEC-005); hosting deploys from the repository. Any hosting-managed source exception requires explicit one-way synchronization and documented ownership; feature-branch development integration is evidenced; main release integration remains open.
- Keep application code and durable notes in one repository (CC-DEC-004): root durable files plus `docs/`, `app/`, `database/`, and `samples/`. Folders now contain foundation application, migrations, documentation and synthetic fixtures. Revisit separation only for a demonstrated requirement.
- Use real sample cutters from the user to seed and evaluate the eventual workflow. Samples have not yet been supplied.

## Architecture (development provisioned; acceptance incomplete)

- GitHub: source code, requirements, durable project state, schema/migrations, and reproducible sample data.
- Structured database: SQLite-compatible relational architecture approved (CC-DEC-008) for operational cutters, physical instances, designs, tags, locations, and relationships in development D1.
- File storage: photos, sketches, STL/3MF attachments.
- Private site: search, browse, add/edit records, and connect designs to cutters.
- Approved direction (CC-DEC-011): Cloudflare Workers for application/API, D1 for relational records, private R2 for attachments. Confirm identity, cost, recovery, deployment and export/restore before production; development resources are owner-confirmed. Slicer applies STL/3MF scaling in v1; catalog records dimensions and sizing guidance, preserving a future modular print-preparation path.

## First useful workflow

Search `Christmas + tree` → browse design photos → select a design → identify compatible cutter size → retrieve its physical location or printable file. Also open a cutter and see every saved design that uses it.

Support physical-ready, available-to-print, and inspiration-only states. Record whether a reuse mapping is tested or proposed. One cutter can support multiple designs; one design can fit multiple cutters.

## Scope and unresolved inputs

First-version candidates: cutter/design entry, photos, tags, sizes, locations, printable files, known flip mappings, visual search, export. These are a starting scope to refine with samples, not a finished specification.

Deferred: automatic new flip suggestions and broad bakery order/invoicing management.

Unknown: wife's devices, existing design tools, storage layout, existing file archive, sharing needs, sample records, and budget. Do not block repository preparation on these; resolve them in the appropriate infrastructure task.

## Current evidence

Repository metadata confirms the exact target, default branch, public visibility, and pull/push permissions. Contents/ref queries confirmed an empty repository before bootstrap. Core durable files, research notes, and initial model form the initial remote bootstrap. Development implementation evidence is recorded in the current checkpoint and component TODOs; main is behind the open draft PR.

## Continuation

Continue CC-TODO-006 backup/export/recovery preparation. Node.js is verified; local CLI login is blocked by Defender. Use the owner-only browser development download instead. Keep CC-TODO-002 through 007 open until their complete acceptance criteria pass. Preserve the deferred live access test. Reconcile on the feature branch and verify writes; merge/release is separate.

## Operating rules

- Fetch current repository state before relying on chat history.
- Use stable CC-TODO IDs; preserve proposed/selected/provisioned/validated distinctions.
- Keep meaningful decisions and next work reconciled across the core files.
- Preserve existing work; verify remote writes before claiming completion.
- Keep credentials out of repository files and client code.
- Catalogue purchased assets privately unless sharing rights are established.
- Do not fabricate sample cutters or silently treat demonstration records as real inventory.
