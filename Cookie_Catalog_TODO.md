# Cookie_Catalog — TODO

## Current checkpoint — 2026-10-14, 20:15 UTC

The development code rollback and roll-forward drill passed. Exact deployed sources: baseline 489ed640 → compatible previous app redeployment 26c2425e → restored current app 0a613893. Signed-in owner reads, same-value synthetic-location saves, exact-byte original downloads and restored phase archives passed. All phases retained identical schema, all 14 rows across 16 tables, and the one 5400084-byte STL; integrity/FKs passed. CI and Workers Builds passed. No migration, data restore, resource/security change or production release occurred.

Next CC-TODO-004 prerequisites: intended-device acceptance and main-release safeguards. Read-only GitHub inspection found main and development branches unprotected with no rulesets; no settings were changed. CC-TODO-006 isolated Cloudflare restore/cloud sync/retention, 005 intended-user roles and 007 real samples stay open. Preserve deferred alternate-email testing and Windows remediation. OneNote/photo/Canva remain future work. See docs/Development_Rollback_Acceptance.md and docs/evidence/Development_Rollback_20261014.json.

## Latest acceptance — 2026-10-14

Approved deletion of the original two synthetic attachments passed; one STL was re-uploaded under a new identity for recovery and remains private. Live original-containing TAR local restore passed: 16 tables, 14 rows, one 5400084-byte original with matching bytes, valid relationships, SQLite integrity and completion receipt. Implementation 1ea5c0e matched the deployed SHA and passed 45 tests/build plus GitHub CI.

Download small TAR archive now supports complete archives up to 32 MiB when direct folder saving is unavailable. The direct-save 1 GiB originals ceiling and old JSON limits are unchanged. No payload/database/original is in GitHub.

The controlled live missing-original detection/recovery gate subsequently passed using a unique disposable fixture; see current acceptance above. Cloudflare restore, sync/retention, collaborators, release and real-sample gates remain open. Preserve deferred alternate-email testing and future OneNote/photo/Canva work. Full evidence and recovery checksums: docs/Infrastructure_Verification.md.

Updated: 2026-10-14 UTC. Infrastructure first; stable component IDs and acceptance criteria are preserved. No component is closed merely because its development smoke check passed.

| ID | Component | Current status | Depends on |
| --- | --- | --- | --- |
| CC-TODO-001 | Repository and durable project state | Open: independent fresh-chat test pending | — |
| CC-TODO-002 | Database and catalog schema | In progress: live shape create/edit/search passed; search explanations added | 001 |
| CC-TODO-003 | File and image storage | In progress: live owner photo upload/read passed; design/STL retrieval and approved deletion passed; controlled missing-original recovery passed | 001/002 |
| CC-TODO-004 | Runtime, hosting and deployment | In progress: development deployment and code rollback/roll-forward verified | 001/002/003 |
| CC-TODO-005 | Identity and access | In progress: owner path verified | 004 |
| CC-TODO-006 | Backup, export and recovery | In progress: live database-only TAR restored; original-containing local restore passed; Cloudflare restore/durability pending | 002/003 |
| CC-TODO-007 | Sample import and seed workflow | Open: synthetic importer verified; real samples absent | 002/003/005 |

## CC-TODO-001 — Repository infrastructure

Purpose: make the repository a verified durable source of truth.

Verified: public `jbrickey23/Cookie_Catalog`, read/write access, bootstrap committed/read back, single-repository source ownership, populated app/database/docs/samples/tools/tests layout and GitHub-connected development. Active branch `feature/cc-infrastructure-foundation`, draft PR #1; main is release and lags development. No AGENTS.md found at this checkpoint.

Remaining: a genuinely new, history-independent conversation must read current GitHub state, inspect the open PR and reconstruct the correct next task. This history-assisted session does not satisfy that test. Coordinate release protections/rollback with 004.

Done when: remote bootstrap is verified, independent fresh-chat restoration works from latest GitHub contents, actual branch is recorded, and source ownership is clear.

## CC-TODO-002 — Database infrastructure

Purpose: durable structured records supporting cutters, designs and many-to-many reuse.

Verified: D1 selected/provisioned for development; DB binding configured. Both migrations applied/tracked; 15 catalog tables plus migration metadata. SQLite schema, foreign-key, size-variant/component and synthetic import tests pass. Owner confirmed demonstration create/link/edit/read across sessions at 90 × 100 mm; live exports retained those records.

Implemented 2026-10-13: Catalog continuation, 2026-10-13: owner-only create/full-update/read/literal-search routes and browser controls now cover shapes, designs, flat locations, physical cutters (millimeters/quantity/origin/location) and design/shape links (tested/proposed, standard/flip/combination, instructions/rotation/mirror/width range). Existing schema reused; no migration or provisioning. Generated stable IDs, parameterized queries, bounded JSON/field validation and same-origin mutations; 200-row search pagination. Local 32 Node tests and TypeScript/Vite frontend/Worker build passed. Live shape creation/edit/search now owner-confirmed; physical cutter/location/mapping acceptance remains open. Record deletion, tags/visual search, full import and collaborator editing remain unimplemented.

Owner confirmed shape create/edit/refresh/search passed. Search explanations and broader metadata predicates implemented with 35 local tests/build passed; live highlighting owner-confirmed 2026-10-14. Live synthetic location/physical cutter/design/mapping create/edit/refresh/search/retrieve passed 2026-10-14, including dimensions/location/proposed flip metadata. Remaining: refine required/optional fields, ownership and known/proposed mappings using real samples; record deletion safeguards, tags/visual search, import, intended-device usability and production separation/migrations. Choice/cost rationale is in architecture notes.

Done when: a sample cutter and design can be created, linked, edited, searched and retrieved across sessions; migrations are reproducible and choice/cost documented.

## CC-TODO-003 — File/image infrastructure

Purpose: retain photos, artwork, STL and 3MF originals alongside records.

Verified: private R2 provisioned, FILES binding and adapter/lifecycle design implemented. Owner's three-file smoke test passed with cleanup; screenshot showed public access disabled and empty bucket afterward. Actual recovery export/local restore verified a tiny PNG and STL with metadata and record links.

Implemented 2026-10-13: owner-only persistent uploads/downloads, generated IDs/keys, hashed metadata, shape/design relationships and printable-original entries. Browser selection/upload/list/download/delete confirmation; missing-file detection; retryable deletion and bounded paginated manual orphan audit/cleanup. Existing schema reused. Local validation passed with 27 Node tests (real Miniflare D1/R2), SQLite schema/import and application build. PNG/JPEG/WebP, shape STL/3MF; initial 4 MiB/file limit (now increased to 25 MiB) with lightweight headers rather than full format/model validation. Downloads are authenticated attachment responses with exact byte/hash verification.

Verified live owner photo upload/refresh/download on 2026-10-13; approved synthetic deletion passed 2026-10-14; controlled missing-original gate remains. Live synthetic design PNG and 5400084-byte STL upload/refresh/download passed byte-identically on 2026-10-14. Controlled missing-original live acceptance and approved synthetic deletion passed. Remaining: intended collaborator/private-denial behavior; full format validation/quotas, thumbnails and collaborator roles. Larger TAR supports 1 GiB originals/1000 files; old JSON retains its 4 MiB total/25-object cap. Larger live upload/retrieval passed; original-containing TAR local restore passed; Cloudflare restore pending. No general real asset import yet. Lifecycle details in docs/Attachment_Lifecycle.md.

Done when: a cutter photo, design image and sample STL can be stored and retrieved privately, and broken links are detectable.

## CC-TODO-004 — Runtime/deployment infrastructure

Purpose: a private working interface reachable on business devices.

Verified: React/Vite/Workers development scaffold deployed from canonical feature branch; D1/R2/frontend bindings configured. Build root app, build npm run build, deploy npx wrangler deploy. Owner log confirms deployment of 8122a92; later downloaded packages prove newer backup routes were live, although their exact exporting commit was not independently attested. Code 40ab108 passed CI #97 (20 Node tests, SQLite schema/import, type-check/build); pre-reconciliation head 330ca8a passed CI #105.

Remaining: intended-device/browser validation, persistent product paths, build-project naming/preview review, appropriate branch protection/pre-merge checks, approved main-release deployment, known-good production release and provider-native/production rollback verification. Development compatible-code rollback/roll-forward passed. Production resources are separate and unprovisioned.

Done when: a minimal private site deploys from recorded source and performs a persistent record read/write plus authorized attachment retrieval. This proves infrastructure; full catalog UX follows later.

## CC-TODO-005 — Identity/access infrastructure

Purpose: access for Jay's wife and explicitly allowed collaborators.

Verified: Cloudflare Access/PIN and owner session; server-side signed JWT validation and owner-only endpoint guards; local forged/expired/wrong-audience/unknown-owner and origin checks. OWNER_EMAIL is a secret with required-secret deployment validation.

Remaining: intended owner/editor/viewer needs, wife/collaborator access, D1 membership/roles, record/file authorization, account recovery and live negative-edge validation. Owner deferred the live alternate-email denial test; absent email codes are inconclusive. Do not resume that test automatically.

Done when: intended users can access their catalog, unauthorized access is rejected, and roles/recovery are documented.

## CC-TODO-006 — Backup/export/recovery infrastructure

Purpose: preserve catalog data independently of provider/app availability.

Verified live: Live TAR database recovery verified 2026-10-14: uploaded Cookie_Catalog_2026-10-14T15-47-38-889Z.tar restored 16 tables/7 rows/0 originals. Manifest/completion checks, SQLite integrity and foreign keys passed; migrations 0001/0002 and the existing design/shape/cutter relationship survived. Zero attachment rows/objects means this proves the live database archive path only; it does not prove current TAR original-file recovery or intentional deletion. This earlier database-only TAR gate was followed by the successful 5400084-byte original-containing TAR local restore documented in the latest checkpoint. No payload or database is committed to public Git.

Latest implementation: 2026-10-14: owner confirmed Matched fields highlighting works. CC-TODO-006 now adds a larger TAR archive with a D1 schema/records/migration snapshot, separate original bytes, SHA-256 metadata and a required completion receipt. Browser assembly and direct folder saving use desktop Chrome/Edge; each original is a separate authenticated request, avoiding one long Worker invocation. Limits: 25 MiB/file, 1000 originals, 1 GiB originals total, 10000 rows/table, 16 MiB manifest. These are application ceilings, not demonstrated production throughput. Local tests recovered a 5,250,084-byte STL and all 16 tables/relationships; a separate test covered 26 originals. All 40 Node tests and type-check/frontend/Worker build passed. Corruption/truncation/extra data, missing/orphan/changed files and denied requests fail. Live database-only TAR save/restore and >4 MiB persistent upload/retrieval passed; original-containing TAR acceptance remains pending. Old JSON backup/recovery-test formats and their 4 MiB total/25-object limits are retained for compatibility. No new resources, paid plan, automatic transfer/pruning or production changes.

Verified: owner-only bounded browser export and disposable recovery-test endpoint, strict local restore tool, integrity/authorization/failure-cleanup tests. Actual normal package restored 16 tables/6 rows/0 objects; actual recovery package restored 16 tables/17 rows/2 objects with original bytes and relationships intact. See docs/Backup_Recovery_Plan.md for hashes and instructions.

Owner placed dated packages/manifest/instructions in personal OneDrive at Cookie_Catalog/Backups/Cookie_Catalog_Backups_20261012T231810Z. Local placement confirmed by owner; cloud sync not confirmed. Latest-seven normal snapshots after meaningful changes/before imports remains proposed; no schedule, transfer or pruning activated.

Remaining: verify independent cloud copy, settle retention/cadence/ownership, restore into isolated Cloudflare D1/R2, live original-containing TAR recovery, production-scale export/import and consistency across D1/R2. Current sample local-restore acceptance passed; the broader component remains open.

Done when: a sample backup restores into a clean test environment with relationships and attachments intact, and recovery instructions are recorded. This demonstrated sample gate does not replace the remaining durability/operational work.

## CC-TODO-007 — Sample import/seed infrastructure

Purpose: evaluate real workflows before bulk cataloging.

Verified: public-safe synthetic fixture, disposable SQLite importer and CI validation. All current catalog content is demonstration data.

Remaining: obtain authorized real purchased/printed cutters, an unprinted STL, size variants, multiple designs per cutter and a known flip; define/validate import manifests and duplicate-safe reruns; retain sources and unknowns.

Done when: authorized samples import reproducibly and support Christmas/tree search, cutter-to-design browsing, physical/file retrieval and known flip instructions.

## Current sequencing — October 14 correction

1. CC-TODO-004 current deployment proof passed: deployed 2939565 matched GitHub; current D1/R2 report passed. Development code rollback/roll-forward also passed; preserve broader release/intended-device gates.
2. CC-TODO-002 synthetic location/physical cutter/design/mapping create/edit/refresh/search/retrieve passed. Preserve broader real-sample/field/schema acceptance.
3. CC-TODO-003 design PNG and 5400084-byte STL upload/refresh/download passed byte-identically. Approved synthetic deletion and original-containing TAR restore now passed. Controlled missing-original live detection/recovery subsequently passed. Development code rollback/roll-forward passed. Next: CC-TODO-004 intended-device/main-release safeguard acceptance.
4. Then continue CC-TODO-006 isolated Cloudflare restore/operational durability, 005 intended collaborator readiness and 007 representative samples.
5. Only afterward resume deferred 008–011. No OneNote export/access, image extraction or Canva integration is the current prerequisite.

Node v24.21.0/npm.cmd 11.19.0 on owner Windows already passed; Defender blocks local Wrangler download, not Node itself. Remediation parked; browser deployment path remains usable. Assistant Linux Node v24.19.0 is a separate environment. Optional read-only Windows version helper prepared, not owner-executed.

New verification: GET /api/dev/infrastructure-check (owner, no-store, no writes), build SHA from Workers Builds/CI, D1 migrations/FKs and R2 listing/sampled file existence/size. Local 43 tests/build and GitHub CI passed; exact deployed SHA/live report passed for 2939565. See docs/Infrastructure_Verification.md.

Slicer scaling remains v1. Production, new paid resources, security bypass, PC reset and automatic pruning are not authorized. Preserve deferred live alternate-email test. Independent fresh-chat test remains open.

## Deferred future integrations — CC-TODO-008 through 011

These are newly scoped tasks, not claims of completed integration. Preserve existing OneNote content and never overwrite the source.

### CC-TODO-008 — Audit OneNote legacy catalog (DEFERRED)
Status: Deferred; resume after infrastructure acceptance and representative sample/import readiness. Notebook access/export is a later input, not the current blocker.
- Determine whether the notebook is personal Outlook/OneDrive or Microsoft 365 work/school.
- Inventory notebook/section/page structure, page titles, images, attachments, cutter outlines, decorated designs, sizes and physical locations.
- Identify source identifiers and provenance; estimate record counts, gaps, duplicates and relationships.
- Produce a representative extraction/mapping report before any bulk import. Do not alter source OneNote.
- Done when representative pages are extracted, counted and mapped with unknowns explicitly recorded.

### CC-TODO-009 — OneNote migration importer
Status: Deferred; depends on 008 and existing import/attachment infrastructure (007/003).
- Choose supported export or Microsoft Graph path after account type is confirmed; do not assume direct OneNote connector availability.
- Preserve original images/files, page links/IDs, titles, hierarchy and attribution.
- Idempotent staging import with duplicate review, error report, dry run and record-count reconciliation.
- Keep originals private; require approval before bulk live migration.
- Done when a representative sample imports and round-trip audit confirms records and attachments.

### CC-TODO-010 — Photo-assisted metadata extraction
Status: Deferred; depends on representative source photos from 008.
- Propose name, category, aliases, tags, shape description, symmetry and complexity from cutter-outline or decorated-cookie photos.
- Track per-field source, confidence and unknowns; require human review for uncertain values.
- Support search match explanations (name/tag/alias/description) without replacing existing search behavior.
- Never infer verified physical dimensions, ownership, location or manufacturing data from unscaled photos.
- Done when sample photo records can be reviewed, corrected, searched and traced to source.

### CC-TODO-011 — Canva artwork and cutter-outline interoperability
Status: Deferred; discovery/prototype; depends on example Canva design and cutter image.
- Validate actual Canva connector capabilities and vector export; do not assume editable SVG paths are available through API.
- Prototype photo/artwork to clean closed SVG contour; retain original artwork separately from geometric cutter outline.
- Require known dimension/reference scale and geometry validation before generating STL/3MF.
- Preserve v1 slicer-based scaling decision; derived geometry remains an optional later capability.
- Done when one sample outline has a reviewed, dimensioned SVG and a documented viable or rejected integration route.

Next unused task ID: CC-TODO-012. These tasks do not precede CC-TODO-002/003/004 acceptance.

## Ongoing user documentation

Maintain docs/User_Companion.md alongside user-visible changes. First version is implemented, linked from README and reviewed against current controls/server search fields. Keep technical evidence/runbooks distinct, avoid promising unavailable features, and include owner review/intended-device usability in acceptance. This is continuing documentation within existing component tasks, not a replacement priority or a new task ID.
