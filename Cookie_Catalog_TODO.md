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

## Accelerated infrastructure governance (CC-DEC-010)

- Approved: research and recommend the integrated database, storage, hosting, identity, backup and deployment architecture together; prefer stable maintainable interfaces, practical migration/export/restore, and a little upfront overhead to avoid future refactoring.
- Assistant may decide/document routine reversible engineering details; require explicit user approval for material tradeoffs, costs, provisioning, hard-to-reverse commitments and production changes.
- Preserve component task IDs and acceptance checks. Architecture research is not provisioning or task completion. Next checkpoint: consolidated researched architecture proposal and material approval gate; provider remains unselected.

## CC-TODO-002 — Understand, devise, and create database infrastructure

Purpose: durable structured records that support cutters, designs, and many-to-many reuse.

- Decided (CC-DEC-008): SQLite-compatible relational database for live structured catalog records, rather than GitHub JSON. Architecture selected; provider and implementation pending. Consider edits, scale, cross-device use, portability, maintenance and cost in provider evaluation.
- Decided (CC-DEC-009): balanced preference for managed simplicity with practical portability/export; selection criterion only, not a provider approval.
- Select provider/runtime compatibility; compare D1, Turso and other appropriate SQLite-compatible choices on integration, export/restore, privacy, costs, and maintenance. No provider selected yet.
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

Next unused task ID after the additions below: CC-TODO-012.


## 2026-10-14 — Existing OneNote and Canva migration workstream

These are newly scoped tasks, not claims of completed integration. Preserve existing OneNote content and never overwrite the source. Current legacy task status descriptions above require separate reconciliation against newer implementation commits/deployment; do not infer the app is unbuilt from this older checklist.

### CC-TODO-008 — Audit OneNote legacy catalog (NEXT)
Status: Open; blocked only on obtaining a representative notebook export or authorized access.
- Determine whether the notebook is personal Outlook/OneDrive or Microsoft 365 work/school.
- Inventory notebook/section/page structure, page titles, images, attachments, cutter outlines, decorated designs, sizes and physical locations.
- Identify source identifiers and provenance; estimate record counts, gaps, duplicates and relationships.
- Produce a representative extraction/mapping report before any bulk import. Do not alter source OneNote.
- Done when representative pages are extracted, counted and mapped with unknowns explicitly recorded.

### CC-TODO-009 — OneNote migration importer
Status: Open; depends on 008 and existing import/attachment infrastructure (007/003).
- Choose supported export or Microsoft Graph path after account type is confirmed; do not assume direct OneNote connector availability.
- Preserve original images/files, page links/IDs, titles, hierarchy and attribution.
- Idempotent staging import with duplicate review, error report, dry run and record-count reconciliation.
- Keep originals private; require approval before bulk live migration.
- Done when a representative sample imports and round-trip audit confirms records and attachments.

### CC-TODO-010 — Photo-assisted metadata extraction
Status: Open; depends on representative source photos from 008.
- Propose name, category, aliases, tags, shape description, symmetry and complexity from cutter-outline or decorated-cookie photos.
- Track per-field source, confidence and unknowns; require human review for uncertain values.
- Support search match explanations (name/tag/alias/description) without replacing existing search behavior.
- Never infer verified physical dimensions, ownership, location or manufacturing data from unscaled photos.
- Done when sample photo records can be reviewed, corrected, searched and traced to source.

### CC-TODO-011 — Canva artwork and cutter-outline interoperability
Status: Open; discovery/prototype; depends on example Canva design and cutter image.
- Validate actual Canva connector capabilities and vector export; do not assume editable SVG paths are available through API.
- Prototype photo/artwork to clean closed SVG contour; retain original artwork separately from geometric cutter outline.
- Require known dimension/reference scale and geometry validation before generating STL/3MF.
- Preserve v1 slicer-based scaling decision; derived geometry remains an optional later capability.
- Done when one sample outline has a reviewed, dimensioned SVG and a documented viable or rejected integration route.

Next recommended action: CC-TODO-008 — obtain a representative OneNote export/sample and inspect structure before choosing migration implementation.
