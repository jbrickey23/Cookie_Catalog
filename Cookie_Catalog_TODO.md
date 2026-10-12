# Cookie_Catalog — TODO

Updated: 2026-10-12. First workstream: understand, devise, and create infrastructure. One task per component; the acceptance checklist inside each task defines its completion.

| ID | Component | Status | Depends on |
| --- | --- | --- | --- |
| CC-TODO-001 | Repository and durable project state | Open: independent fresh-chat validation pending | — |
| CC-TODO-002 | Database and catalog schema | Open | 001 for implementation |
| CC-TODO-003 | File and image storage | Open | 001; coordinate with 002 |
| CC-TODO-004 | Site runtime, hosting, and deployment | Open | 001; coordinate with 002/003 |
| CC-TODO-005 | Identity and access | Open | 004 architecture |
| CC-TODO-006 | Backup, export, and recovery | Open | 002/003 |
| CC-TODO-007 | Sample import and seed workflow | Open | 002/003/005 |

## Backup location selection

Owner selected an existing private cloud folder for independent backup storage on 2026-10-12. Provider and exact folder are not yet specified or verified. Suggested layout: Cookie_Catalog/Backups for normal catalog packages, with recovery-test packages kept separately as test evidence. The latest-7 manual development retention policy remains proposed; no cloud transfer, automated pruning or recurring backup has been configured.

## Live file recovery passed; storage decision pending

Live file recovery verified on 2026-10-12: owner supplied cookie-catalog-dev-recovery-2026-10-12T23-06-58-377Z.json (11,830 bytes; SHA-256 7824069a2faa5db5193818607d5662bcc6f113791a66505bb245f65486da3794). Payload and both original-file checksums passed. A new disposable local restore recovered 16 tables, 17 rows and 2 objects: a readable 1 × 1 PNG (68 bytes) and ASCII STL (111 bytes). Confirmed the synthetic design/cutter/location link at 90 × 100 mm, two shape attachments, one design image and one printable STL association. SQLite integrity and foreign keys passed. The download reports cleanupVerified=true; server code only returns after request-scoped D1/R2 cleanup checks succeed. No real inventory or backup payload was committed to public Git. Code commit 40ab108 passed CI #97.

Proposed development backup policy (awaiting owner storage preference): owner-triggered download after meaningful catalog changes and before bulk import/migration; keep the latest 7 completed packages in an independently controlled private location outside Cloudflare/public GitHub. This is a manual development policy, not an activated recurring automation. Restore-check after schema/export changes. Real-asset volume and production recovery needs must inform production frequency/retention and scalable exports. No new storage subscription, paid resource, scheduled task or production deployment is authorized. Next required input: identify an existing private backup location the owner can use; Cloudflare-side restore is still an additional validation followup.

## Verified live download restoration

Live package cookie-catalog-dev-2026-10-12T22-53-46-644Z.json (7,834 bytes; SHA-256 724b645b1a4582ea4bc08499376a0fc072efc018c081a47194421390618d0149) passed payload checksum verification and restored into a new disposable local directory on 2026-10-12. Recovered 16 tables and 6 rows: both migration entries, one design, shape, cutter and link. Confirmed DEMO Holiday tree → DEMO Evergreen tree at 90 × 100 mm, SQLite integrity_check=ok and no foreign-key violations. Zero file objects matches the empty live bucket; this package does not prove live attachment recovery. The uploaded package and restored database are private and are not committed to public Git.

Next browser action: refresh https://cookie-catalog-dev.j-brickey.workers.dev and choose Download file recovery test. This owner-only same-origin POST /api/dev/recovery-check creates unique, disposable synthetic cutter/design/location records plus PNG/STL originals and metadata, exports them, then deletes only its request-scoped data and verifies cleanup before returning the download. Attach that saved recovery JSON for actual file/relationship restoration. Local D1/R2 binding integration tests, real SQLite restore, failure-path cleanup, preservation of existing data, all 20 Node tests and TypeScript/Vite frontend/Worker build passed. Live recovery-test execution remains pending; CC-TODO-006 is still open for file recovery, Cloudflare-side restoration and backup destination/retention/scheduling.

## Browser checkpoint

Owner reported the browser backup flow worked on 2026-10-12 after opening https://cookie-catalog-dev.j-brickey.workers.dev. Code commit 8eb666a passed GitHub CI #93. Obtain the downloaded JSON for actual checksum/contents inspection and disposable restoration; live package recovery is not yet verified. Keep downloads and any catalog content outside public GitHub.

## Latest continuation

2026-10-12 continuation: Node.js v24.21.0 and npm.cmd 11.19.0 work. This formerly managed PC still reports Defender for Endpoint enrollment (OnboardingState=1) and tamper protection; event 1126 blocks node.exe at registry.npmjs.org. Audit-mode change did not take effect, so Wrangler login was never retried. Previous IT is unavailable. Park local PC remediation; no reset/reinstallation is authorized. CC-TODO-006 now provides an owner-only browser development download at POST /api/dev/backup plus a disposable local restore tool. Local schema, linked-record and two-file restoration, negative authorization/integrity cases, all 16 Node tests, SQLite smoke/import and TypeScript/Vite frontend/Worker build passed. Live export/restore, independent backup destination, retention and scheduling remain pending; no production deployment or paid resources were added.

## Current continuation

Development checkpoint (2026-10-12): active branch `feature/cc-infrastructure-foundation`, draft PR #1; `main` remains the earlier bootstrap/release branch. Cloudflare development Worker and D1 `cookie-catalog-dev`, private R2 `cookie-catalog-dev-private`, and Access application are provisioned. Owner reported successful login/session, synthetic D1 create/link/edit/read (90 × 100 mm), and three-file R2 round-trip/cleanup. R2 screenshot recorded Public Access Disabled and an empty bucket afterward. CI run #79 passed for `d012da6`. These checks do not complete general catalog CRUD, persistent attachments, collaborator access, backup/restore, or production readiness.

The live alternate-email denial test is deferred at the owner's request; failed code delivery is inconclusive. No production deployment or additional paid resources are authorized. Next work: CC-TODO-006 backup/export/recovery preparation; owner confirmed Node.js v24.21.0 and npm 11.19.0 working in PowerShell on 2026-10-12. This supersedes earlier installation-unverified snapshots in other documents. Owner screenshot confirms `npx.cmd wrangler@4 login` failed while downloading Wrangler from `https://registry.npmjs.org/wrangler` with `ERR_SSL_SSL/TLS_ALERT_HANDSHAKE_FAILURE` (SSL alert 40), accompanied by a reported non-interactive security popup and “Content blocked by ITADMIN”. Cloudflare login was not reached. Node/npm.cmd work; plain npm.ps1 is blocked by PowerShell execution policy. Owner found no Export option in D1 dashboard. Owner states this is an older formerly managed computer that should now be personal. Access work or school screenshot shows no connected account; SecurityCenter2 lists only Windows Defender. Subsequent screenshot confirms EnableNetworkProtection=1 and Defender Operational event 1126 at 2026-10-12 15:21:43 local, blocking node.exe to https://registry.npmjs.org. Defender network protection is the evidenced cause. Owner attempted the Administrator PowerShell audit-mode test; the effective setting did not become AuditMode, and the script stopped before retrying Wrangler. Subsequent screenshot shows IsTamperProtected=True and OnboardingState=0x1, so the machine still reports Defender for Endpoint onboarding despite no connected work/school account. Supported organization offboarding is the next remediation; local setting changes alone did not work. CLI login/export remain blocked and unverified. Do not claim backup completion or retry the blocked flow without resolving the restriction. Do not redo passed checks or resume the deferred access test automatically.

Initialization reconciled stale root notes against the active development TODO and PR. This was history-assisted recovery, not the strict independent test; CC-TODO-001 remains open.

## CC-TODO-001 — Understand, devise, and establish repository infrastructure

Purpose: make the repository a verified durable source of project truth.

- Completed: repository resolved as `jbrickey23/Cookie_Catalog`, default branch main, public, read/write permissions confirmed.
- Completed: contents/ref checks confirmed an empty repository before initialization; no existing files or repository agent instructions. Assess any release/protection requirements when choosing the development workflow.
- Completed: seven bootstrap files committed on main and read back; all contents match the prepared package.
- Decided: single repository for application and durable project notes; logical layout `docs/`, `app/`, `database/`, `samples/`, with core durable files at root (CC-DEC-004).
- Followup: create folders as content becomes available; confirm physical app paths against the selected stack. Layout approval does not mean application scaffolding exists.
- Followup (coordinate with 004): verify hosting can use this repo; if it requires managed source elsewhere, document canonical ownership and synchronization before creating duplicate code. Revisit repository separation only for a demonstrated constraint.
- Decided (CC-DEC-005): GitHub repository is canonical for application code; hosting deploys from GitHub. Any hosting-managed source must use documented one-way synchronization rather than competing edits.
- Followup (CC-TODO-004): verify actual provider GitHub integration, synchronization/deployment and rollback; not yet validated.
- Decided (CC-DEC-006): develop on feature branches; review/validate before merging; `main` is the release branch. Deployment from `main` begins only once configured and verified.
- Decided (CC-DEC-007): GitHub-first fresh-chat restoration; read latest durable files, reconcile conflicts, avoid redoing completed work, verify remote writes.
- Verified: current conversation independently retrieved the remote durable files and reconstructed the correct decisions/open tasks (in-session recovery check).
- Pending acceptance: start a genuinely new conversation using the bootstrap prompt and verify correct restoration and next task without relying on prior chat. Only then close CC-TODO-001.
- Followup (CC-TODO-004): implement/verify pre-merge checks, appropriate branch protection, deployment from `main`, known-good release identification and rollback.
- Completed: read/write verified using the actual bootstrap writes and readback.
- Done when: remote bootstrap is verified, independent fresh-chat restoration works from latest GitHub contents, actual branch is recorded, and source ownership is clear. All checks except independent fresh-chat test are satisfied.

## Accelerated infrastructure governance (CC-DEC-010)

- Approved: research and recommend the integrated database, storage, hosting, identity, backup and deployment architecture together; prefer stable maintainable interfaces, practical migration/export/restore, and a little upfront overhead to avoid future refactoring.
- Assistant may decide/document routine reversible engineering details; require explicit user approval for material tradeoffs, costs, provisioning, hard-to-reverse commitments and production changes.
- Preserve component task IDs and acceptance checks. Architecture research is not provisioning or task completion. CC-DEC-011 approves Cloudflare Workers + D1 + private R2 and slicer-based scaling for v1. Draft migration and infrastructure contracts are in feature/cc-infrastructure-foundation; validate before merge or provisioning.

## CC-TODO-002 — Understand, devise, and create database infrastructure

Purpose: durable structured records that support cutters, designs, and many-to-many reuse.

- Decided (CC-DEC-008): SQLite-compatible relational database for live structured catalog records, rather than GitHub JSON. Architecture selected; provider and implementation pending. Consider edits, scale, cross-device use, portability, maintenance and cost in provider evaluation.
- Decided (CC-DEC-009): balanced preference for managed simplicity with practical portability/export; selection criterion only, not a provider approval.
- Select provider/runtime compatibility; compare D1, Turso and other appropriate SQLite-compatible choices on integration, export/restore, privacy, costs, and maintenance. Cloudflare D1 approved under CC-DEC-011. Owner confirmed development database creation on 2026-10-12; `DB` binding recorded in `app/wrangler.jsonc`. Owner applied migrations `0001_initial.sql` and `0002_variants_components.sql` through the D1 console on 2026-10-12; table-list results confirm all 15 catalog tables, and `d1_migrations` records both files at approximately 21:31 UTC. Dashboard flattened line comments caused empty-query errors; comment-free SQL succeeded. Owner confirmed synthetic D1 create/link/read for `design_dev_tree`, `shape_dev_tree` and `cutter_dev_tree`, followed by an edit/read returning 90 × 100 mm. Added authenticated read-only `/api/dev/database-check` and foundation-page button scoped to these exact synthetic IDs. Nine local auth/database-boundary tests and TypeScript/Vite build passed; Owner reported the deployed database check fixed and good to go after restoring `OWNER_EMAIL` as a Secret on 2026-10-12. Required-secret validation is now configured to block deployment when `OWNER_EMAIL` is absent.
- Refine the initial model using representative examples; define stable IDs, size units, required/optional fields, ownership, deletion behavior, and known-versus-proposed mappings.
- Drafted initial migration in `database/migrations/0001_initial.sql` and synthetic local SQLite smoke test in `tests/test_schema.py` on feature branch; local/CI schema validation and owner-reported development D1 application are now evidenced.
- Local SQLite 3.46.1 smoke validation passed for 0001 (table creation, relationships, FK enforcement) and additive 0002 (size variants and multi-cutter components); development D1 application and automated tests are evidenced; full application CRUD, real samples and production migration remain pending.
- Drafted `database/migrations/0002_variants_components.sql` on feature branch; slicer-based size recipes are guidance, not geometry transforms.
- Added GitHub Actions SQLite smoke-test workflow and initial TypeScript D1 repository boundary on feature branch. CI run #51 verified passing for SQLite fixtures, synthetic import, TypeScript type-check and Vite build; authentication is required before exposing repository operations.
- Create development/production separation, schema/migrations, and application record access.
- Done when: a sample cutter and design can be created, linked, edited, searched, and retrieved across sessions; migrations are reproducible and choice/cost documented.

## CC-TODO-003 — Understand, devise, and create file storage infrastructure

Purpose: retain photos, decorating artwork, STLs, and 3MFs alongside records.

- Compare storage options; determine costs, upload limits, supported formats, and privacy.
- Define stable attachment IDs/object keys, metadata, originals versus thumbnails, and record links.
- Initial private R2 store interface, R2 adapter and lifecycle design committed on feature branch; initial implementation preceded the live owner-authenticated R2 smoke check recorded below; general attachment operations remain incomplete. Owner confirmed R2 subscription activation after reviewing included usage and overage billing, then creation of `cookie-catalog-dev-private` with instructed private access and Standard storage on 2026-10-12. `FILES` binding is recorded in `app/wrangler.jsonc`; the subsequent screenshot and smoke check below provide privacy/runtime evidence.
- Added owner-authenticated, same-origin POST `/api/dev/storage-check` and foundation-page button. Uses three tiny server-generated synthetic fixtures (cutter PNG, design PNG, STL), verifies retrieved bytes and media types, deletes only this request's disposable keys, and verifies cleanup. Thirteen local auth/database/storage tests and TypeScript/Vite build passed; owner reported the live R2 check passed on 2026-10-12: three synthetic fixtures round-tripped and cleanup verified. Owner screenshot confirms `cookie-catalog-dev-private` uses Standard storage, Public Access Disabled, bucket size 0 B and an empty object listing after the smoke check on 2026-10-12. This smoke check does not implement persistent attachment metadata, general user uploads/downloads or orphan recovery.
- Implement authorized upload/download, missing-file handling, and deletion/orphan behavior.
- Done when: a cutter photo, design image, and sample STL can be stored and retrieved privately, and broken links are detectable.

## CC-TODO-004 — Understand, devise, and create site/deployment infrastructure

Purpose: a private working interface reachable on the devices used in the business.

- Establish device/browser needs; compare suitable runtimes/hosting and record expected costs.
- Select stack and connect source, database, and storage; validate deployment from canonical GitHub repository (CC-DEC-005). If hosting-managed source is unavoidable, document one-way sync and prevent competing edits.
- Initial React/Vite/Workers runtime scaffold, disabled API boundary, development Wrangler configuration, and Git ignore rules committed on feature branch. Dependency installation, TypeScript and Vite build passed in GitHub Actions run #51; foundation deployment confirmed by Cloudflare build log; synthetic database/file smoke checks are evidenced below; full product operations remain incomplete.
- Deployment runbook added at `docs/Deployment_Runbook.md`, covering isolated dev/prod resources, authorization gates, CI and code/data rollback. Owner has provisioned development D1 and R2 resources; bindings are configured on the feature branch. Development Worker deployment succeeded from commit `8122a92` at 2026-10-12T20:38:58Z, confirmed by owner-supplied build log; D1 `DB`, R2 `FILES` and frontend bindings uploaded. No production environment configured. User configures Cloudflare manually; assistant prepares and verifies GitHub changes and provides dashboard instructions.
- Owner confirmed Zero Trust Free plan, one-time PIN provider and saved Access application `Cookie Catalog Dev`, targeting development Worker and its regular/preview URLs. Owner reported emailed-code login followed by the home screen. Team domain confirmed as `cookie-catalog-jbrickey.cloudflareaccess.com`; AUD supplied and recorded in development config.
- Cloudflare build settings: feature branch `feature/cc-infrastructure-foundation`, root `app`, build `npm run build`, deploy `npx wrangler deploy`. Repeated failures cloned `main`; fresh feature commit built successfully and deployed `cookie-catalog-dev` despite build-project dashboard label `cookie-catalog`. Align/review build project naming and preview behavior later; do not retry old main builds.
- Establish local/development preview, repeatable deployment from `main` after feature-branch review (CC-DEC-006), pre-merge checks, appropriate branch protection, configuration/secrets, environment separation, and code rollback procedure.
- Done when: a minimal private site deploys from recorded source and performs a persistent record read/write plus authorized attachment retrieval. This task proves infrastructure; full catalog UX follows later.

## CC-TODO-005 — Understand, devise, and create identity/access infrastructure

Purpose: make the private catalog usable by Jay's wife and any explicitly allowed collaborators.

- Determine owner/editor/viewer needs and whether the chosen private hosting actually permits the wife's access.
- Drafted Cloudflare Access candidate design with server-side signed-JWT verification requirement, application owner/editor/viewer roles, deny-by-default identity boundary, and negative test cases. Development Access is configured and owner login reported successful. Server-side verifier and read-only session endpoint added; local cryptographic negative tests and TypeScript/Vite build passed. Owner confirmed `OWNER_EMAIL` secret setup and successful live `/api/session` response (`authenticated: true`, `role: owner`) on 2026-10-12. GitHub Actions runs #64 and #65 passed for auth commit `a3ceb37`; D1 membership, collaborator access, negative edge tests and recovery remain open.
- Live alternate-email Access denial test deferred at owner request on 2026-10-12. Initial attempt used an inaccessible inbox; subsequent code delivery was not observed. Neither attempt proves policy denial. Automated forged/expired/wrong-audience/unknown-owner tests passed; live unapproved-user denial remains pending.
- Select authentication and enforce record/file authorization on the server.
- Establish account recovery and secret handling.
- Done when: the intended users can access their catalog, unauthorized access is rejected, and roles/recovery are documented. Do not assume owner-private deployment grants access to another person.

## CC-TODO-006 — Understand, devise, and create backup/export/recovery infrastructure

Purpose: preserve catalog data independently of provider or app availability.

- Verified: actual live database-only package and subsequent two-file recovery package restored locally with records, relationships, original bytes, checksums and migration metadata intact. Server reported verified synthetic cleanup. Backup location and development retention policy await owner selection; scheduling and production recovery remain unactivated.
- Provider-neutral backup/recovery design now includes a bounded owner-only browser development package (records, schema, migration metadata and registered R2 bytes/checksums) plus tools/restore_development_backup.py. The local synthetic export/restore test recovered relationships and two files into a new directory; corruption, omissions, unknown schema, excess records and unauthorized requests fail. All 16 Node tests and frontend/Worker build passed. Live export/restore, independent destination, retention, scheduling and production recovery remain unverified.
- Specify complete export of records, relationships, metadata, and original attachments with stable IDs.
- Define snapshot/backup retention and ownership; keep sensitive/purchased assets out of public Git history.
- Implement export/import or restore and distinguish code rollback from database recovery.
- Done when: a sample backup restores into a clean test environment with relationships and attachments intact, and recovery instructions are recorded.

## CC-TODO-007 — Understand, devise, and create sample import/seed infrastructure

Purpose: test real workflows with a small representative collection before bulk cataloging.

- Added public-safe synthetic fixture, disposable SQLite importer, and CI test command; GitHub CI execution is evidenced, including passing run #79 for d012da6. Real sample import and full workflow acceptance are pending.
- Obtain user samples: purchased/printed cutters, unprinted STL, size variants, multiple designs per cutter, and at least one known flip.
- Define an import manifest/template, validate files/relationships, and prevent duplicate creation on reruns.
- Separate demonstration fixtures from real inventory; track source and unknown information.
- Done when: authorized samples import reproducibly and support Christmas/tree search, cutter-to-design browsing, physical/file retrieval, and known flip instructions.

## V1 scaling boundary (CC-DEC-011)

- Store original printable assets, dimensions in millimeters, and optional target size/scale guidance. The slicer performs scaling and printer setup in v1. Preserve the ability to add derived STL/3MF generation later without requiring it now.

## Later product work

After infrastructure tasks and real samples, create separate product TODOs for catalog entry, design linking, visual search, and usability iteration. Automatic new flip suggestions remain deferred.

Next unused task ID: CC-TODO-008.
