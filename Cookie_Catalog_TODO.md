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

## CC-TODO-002 — Understand, devise, and create database infrastructure

Purpose: durable structured records that support cutters, designs, and many-to-many reuse.

- Decided (CC-DEC-008): SQLite-compatible relational database for live structured catalog records, rather than GitHub JSON. Architecture selected; provider and implementation pending. Consider edits, scale, cross-device use, portability, maintenance and cost in provider evaluation.
- Select provider/runtime compatibility; D1 is one candidate, not a decision.
- Refine the initial model using representative examples; define stable IDs, size units, required/optional fields, ownership, deletion behavior, and known-versus-proposed mappings.
- Create development/production separation, schema/migrations, and application record access.
- Done when: a sample cutter and design can be created, linked, edited, searched, and retrieved across sessions; migrations are reproducible and choice/cost documented.

## CC-TODO-003 — Understand, devise, and create file storage infrastructure

Purpose: retain photos, decorating artwork, STLs, and 3MFs alongside records.

- Compare storage options; determine costs, upload limits, supported formats, and privacy.
- Define stable attachment IDs/object keys, metadata, originals versus thumbnails, and record links.
- Implement authorized upload/download, missing-file handling, and deletion/orphan behavior.
- Done when: a cutter photo, design image, and sample STL can be stored and retrieved privately, and broken links are detectable.

## CC-TODO-004 — Understand, devise, and create site/deployment infrastructure

Purpose: a private working interface reachable on the devices used in the business.

- Establish device/browser needs; compare suitable runtimes/hosting and record expected costs.
- Select stack and connect source, database, and storage; validate deployment from canonical GitHub repository (CC-DEC-005). If hosting-managed source is unavoidable, document one-way sync and prevent competing edits.
- Establish local/development preview, repeatable deployment from `main` after feature-branch review (CC-DEC-006), pre-merge checks, appropriate branch protection, configuration/secrets, environment separation, and code rollback procedure.
- Done when: a minimal private site deploys from recorded source and performs a persistent record read/write plus authorized attachment retrieval. This task proves infrastructure; full catalog UX follows later.

## CC-TODO-005 — Understand, devise, and create identity/access infrastructure

Purpose: make the private catalog usable by Jay's wife and any explicitly allowed collaborators.

- Determine owner/editor/viewer needs and whether the chosen private hosting actually permits the wife's access.
- Select authentication and enforce record/file authorization on the server.
- Establish account recovery and secret handling.
- Done when: the intended users can access their catalog, unauthorized access is rejected, and roles/recovery are documented. Do not assume owner-private deployment grants access to another person.

## CC-TODO-006 — Understand, devise, and create backup/export/recovery infrastructure

Purpose: preserve catalog data independently of provider or app availability.

- Specify complete export of records, relationships, metadata, and original attachments with stable IDs.
- Define snapshot/backup retention and ownership; keep sensitive/purchased assets out of public Git history.
- Implement export/import or restore and distinguish code rollback from database recovery.
- Done when: a sample backup restores into a clean test environment with relationships and attachments intact, and recovery instructions are recorded.

## CC-TODO-007 — Understand, devise, and create sample import/seed infrastructure

Purpose: test real workflows with a small representative collection before bulk cataloging.

- Obtain user samples: purchased/printed cutters, unprinted STL, size variants, multiple designs per cutter, and at least one known flip.
- Define an import manifest/template, validate files/relationships, and prevent duplicate creation on reruns.
- Separate demonstration fixtures from real inventory; track source and unknown information.
- Done when: authorized samples import reproducibly and support Christmas/tree search, cutter-to-design browsing, physical/file retrieval, and known flip instructions.

## Later product work

After infrastructure tasks and real samples, create separate product TODOs for catalog entry, design linking, visual search, and usability iteration. Automatic new flip suggestions remain deferred.

Next unused task ID: CC-TODO-008.
