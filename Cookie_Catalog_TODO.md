# Cookie_Catalog — TODO

## 2026-10-14 — Autonomous implementation batch; backup helper ready for Windows acceptance

Owner requested faster autonomous engineering: complete implementation and automated checks before delivering one bundled acceptance checklist; ask for user input only for actual blockers, missing identities/roles, material decisions or actions needing their device/session. Do not repeat completed checks or require screenshots for clear successful output.

CC-TODO-012 now has tools/backup-helper.mjs plus an optional Backup-CookieCatalog.ps1 launcher and docs/Backup_Helper.md. Node 24.10+ built-in SQLite avoids npm/Wrangler/Python installation on the owner's Windows PC. The helper validates complete TAR schema/rows/migrations/relationships/original hashes/completion, copies to an existing private folder outside git, uses UTC unique names, writes local and separate independent-cloud-download receipts, and reviews latest-seven retention without deleting anything. Pre-change and unverified/changed backups are protected. No scheduling, automatic cloud upload/pruning, credentials or security-policy changes. Eight helper tests, eight Python recovery tests, schema/import, 53 app tests and type-check/build passed; the large-original integration invokes the helper too. Owner Windows execution/receipt acceptance remains pending; do not close 012 yet. Optional PS launcher was reviewed but not runtime-tested here; direct node command is the recommended acceptance path.

CC-TODO-005 role foundation is prepared: viewer read/search/download, editor create/update/upload, owner-only deletion/maintenance/export. All dev endpoints now explicitly deny non-owners. Optional trusted membership resolver is tested after signed JWT verification, per-request revocation, unknown membership, unavailable store and invalid roles. No resolver is wired into the Worker, so current sign-in still only admits the existing owner. No D1 membership migration, collaborator email/policy/secret, grants or role-aware client controls were activated. Durable membership/administration/export compatibility and client controls are still needed before adding users; owner must identify intended accounts/roles first.

Next user acceptance: run the packaged helper on Windows using the known trusted TAR and private OneDrive folder, verify 16 tables/14 rows/one original and local receipt, then review-only retention output. A separate cloud receipt step is documented; existing cloud-copy/isolated restore passes remain valid. Preserve MIME limitation and all earlier deferred boundaries. Existing development resources remain; no production release, paid resources or security weakening.

## 2026-10-14, 23:25 UTC — Approved manual backup policy and scripting follow-up

Owner approved the proposed policy: Jay is responsible for complete private TAR backups in OneDrive Cookie_Catalog/Backups after meaningful catalog changes and before imports or bulk edits/deletions. Retain the latest seven normal backups plus a protected pre-change backup until the changed state is verified and recoverability established. This is the current manual operating policy; no scheduled export, automatic transfer or automatic deletion/pruning has been enabled. Earlier statements that the policy is merely proposed are historical.

Owner requested a TODO to script the workflow, accepting PowerShell even when it only automates the manual parts. CC-TODO-012 is created as an open follow-up under CC-TODO-006. It is not implemented or running and does not replace the remaining access/device/sample sequence. Preserve validated restore/cloud-copy passes, R2 MIME limitation and all parked/deferred boundaries.

## 2026-10-14, 23:21 UTC — Owner-mediated independent cloud-copy checksum passed

Following instructions to copy the fresh TAR into private OneDrive Cookie_Catalog/Backups, locate it in OneDrive web and download it, the owner supplied Cookie_Catalog_2026-10-14T22-44-32-792Z(1).tar. It is 5413888 bytes with SHA-256 93ec5093d5f2c24604b1886775571b2280c73a3d6763596a8c5f1fac0950138d, byte-identical to the original validated TAR. This passes the owner-mediated cloud-copy return/checksum check; OneDrive path/account/sync were not independently inspected by the assistant. No need to repeat unchanged-archive restore tests. Preserve the previous isolated D1 records/schema and R2 original-byte passes, with documented MIME limitation.

Next CC-TODO-006 decision: backup cadence, retention and responsibility. Proposed manual policy: Jay saves a complete TAR after meaningful catalog changes and before imports or bulk edits/deletions; keep the latest seven normal snapshots and retain a pre-change snapshot until the changed state is checked and recoverability established. No automatic deletion, scheduled export, provider transfer or pruning is enabled. The proposal still needs owner acceptance; do not count it as an approved/operational schedule. Then continue intended-user access and queued device checks before real sample import/release. CC-TODO-006 remains open for operational policy, R2 HTTP metadata fidelity and scale/consistency. Retain recovery resources; no active-development or production changes.

## 2026-10-14, 23:17 UTC — Sample isolated data/original restore passed with MIME limitation

Owner confirmed that only the 5.4 MB original remains after deliberately removing the two zero-byte dashboard folder markers. Combined with the earlier flat root listing, complete cloud database JSON comparison and exact downloaded-original hash, this passes the sample isolated D1 record/schema/relationship and R2 key/byte recovery check. Preserve the separately created recovery database/bucket for review; do not delete resources. The R2 HTTP Content-Type mismatch (application/octet-stream versus model/stl) is an explicitly recorded limitation, not a metadata-restoration pass. No recovery application runtime was deployed, so browser/application reads against recovery are untested. Existing development remains unchanged.

Next CC-TODO-006 work: independent private cloud-copy verification, then owner-approved retention/cadence/ownership. Latest-seven snapshots remains a proposal; no automatic sync, transfer, schedule or pruning is activated. Guide owner to place the fresh 22:44:32.792Z TAR in private OneDrive, verify it through OneDrive web, and ideally download the cloud copy for checksum comparison to archive SHA-256 93ec5093d5f2c24604b1886775571b2280c73a3d6763596a8c5f1fac0950138d. Local placement/sync icon alone is not completed cloud verification. CC-TODO-006 remains open for these operational criteria, metadata fidelity and scale/consistency. Preserve intended-device, intended-user roles and real-sample gates plus deferred alternate-email and OneNote/photo/Canva work.

## 2026-10-14, 23:11 UTC — Isolated cloud record/original readback matched

The owner ran the validated import in separate D1 cookie-catalog-recovery-20261014 after an empty-table check. Returned console output lists all 16 expected tables; nine nonempty-table counts match 14 total rows; foreign_key_check returned no violations and owner reports quick_check=ok. The assistant's first UNION count query exceeded D1's compound-SELECT limit; scalar subqueries worked. PRAGMA integrity_check is rejected by remote D1 (SQLITE_AUTH); use documented quick_check remotely, retaining full integrity_check for local SQLite.

Owner supplied a complete JSON recovery_snapshot readback. Programmatic comparison confirms every row in all 16 tables (including seven empty tables), both migration entries and all 21 schema objects match the trusted 22:44:32.792Z archive. Four CREATE TABLE SQL strings differ only in spaces; quote-preserving lexical review verified identical tokens, and local reconstruction from returned cloud schema/rows passed full SQLite integrity and foreign keys. The existing strict comparator was not silently weakened. Raw readback remains private; only sanitized comparison evidence is committed.

Owner uploaded the original to recovery R2 at attachments/file_77f92535c7654231854cfd600bab0eb8/original. Screenshots show the exact path, 5.4 MB file and Public Access Disabled. The owner downloaded it from the recovery object page and supplied that file; its 5400084 bytes and SHA-256 44f1d7d5617d5611da7832a8c3e7fd512d970b3e6f80a61775cbf981a18892f7 match the archive exactly. This is owner-mediated cloud readback evidence, not direct authenticated assistant API access.

Remaining before the full isolated restore gate: audit a complete flat recovery bucket listing (including any folder-marker objects from dashboard Add folder) and address/document R2 HTTP Content-Type application/octet-stream versus archived model/stl. The object-details screen has no visible metadata editor. Do not delete/re-upload automatically. No recovery Worker was created; app/browser runtime recovery, provider-native restore, cloud sync/retention and operational scale remain separate. CC-TODO-006 stays open. Existing development data/bindings remain untouched, and the assistant browser login 403 remains parked. Next user step: recovery bucket root, clear prefix, uncheck View prefixes as folders, screenshot full listing.

## 2026-10-14, 22:45 UTC — Owner-created isolated targets and fresh archive

Owner screenshots show separate D1 cookie-catalog-recovery-20261014 (UUID 4d182441-b08e-4739-932d-34ca5511b747), overview reporting zero tables/queries, and separate R2 cookie-catalog-recovery-20261014-private, empty (0 B), Standard storage and Public Access Disabled. Owner chose automatic location/Standard. This is screenshot evidence, not authenticated assistant/API inventory; confirm the recovery database has no catalog/migration tables immediately before import. The owner performed creation during the guided recovery workflow. Active development bindings/data were not changed.

Fresh owner-supplied Cookie_Catalog_2026-10-14T22-44-32-792Z.tar validated/prepared locally: SHA-256 93ec5093d5f2c24604b1886775571b2280c73a3d6763596a8c5f1fac0950138d; 16 tables/14 rows, migrations 0001/0002, one 5400084-byte STL with SHA-256 44f1d7d5617d5611da7832a8c3e7fd512d970b3e6f80a61775cbf981a18892f7; integrity/FKs/completion and exact local SQL round-trip passed. Original key attachments/file_77f92535c7654231854cfd600bab0eb8/original. Source commit is not attested by the TAR. Private recovery ZIP handed off separately; no payload, SQL data or originals in GitHub.

Next: guided owner dashboard import into the empty recovery D1, original upload at its exact key into private recovery R2, then independent readback/export/download comparison. Cloud import/upload has not run, and CC-TODO-006 remains open. Cloudflare rejects this assistant browser login with 403; owner dashboard works. No retry of the blocked login, new Worker, paid resource, production change, current-development rebind/overwrite or automatic cleanup. Preserve recovery targets for review.

## 2026-10-14 — Isolated recovery import tooling prepared

CC-TODO-006 now has offline TAR-to-D1 SQL preparation and exact recovery comparison in tools/prepare_cloudflare_restore.py. Generated private output is refused inside git checkouts; existing destinations are preserved. Eight Python tests plus the expanded large-original local D1 integration pass; full 49 Node tests, schema/import and type-check/frontend/Worker build passed. Generated SQL imports into a separate local Miniflare D1 with all 16 tables/complete records retained. No remote restore is claimed, no private archive was used in this session, and no Cloudflare resources/settings were changed.

Next prerequisite: authenticated read-only Cloudflare inventory, then confirmed empty separate recovery targets and free-tier capacity/new-resource authorization. Proposed names: D1 cookie-catalog-recovery-20261014 and private R2 cookie-catalog-recovery-20261014-private. These do not exist as verified targets. Secure Cloudflare sign-in was attempted after preparation; the page rejected POST /api/v4/login with 403. No authenticated resource inventory is available; stop this browser attempt. GitHub Actions 38645828796 and 38645836608 both passed for tooling commit 15302ec. The plugin directory returned no Cloudflare integration. Preserve active cookie-catalog-dev and cookie-catalog-dev-private; no rebind, overwrite, paid resources, production release or automatic cleanup. See docs/Isolated_Cloudflare_Restore.md for the concrete preparation/import/download/comparison procedure and limits. Cloud execution, privacy/provenance, independent sync, retention and scale remain open. Device acceptance, roles, samples and deferred OneNote/photo/Canva sequencing are unchanged.

## Preview-build correction — 2026-10-14, 21:51 UTC

Diagnosed from the owner's pasted Cloudflare log for build 0b5aa3fa-6963-479b-ad5f-ec496f4caf54 (docs/cc-browser-backlog-20261014, 0816b899): preview trigger ran npx wrangler preview from repository root with no build command; it failed because no previews block was present. The owner's settings screenshots confirmed preview builds enabled, root /, no build command, and preview command npx wrangler preview. This is separate from the successful feature deployment at 6069211, Worker version 1ae89578-b6f4-4c01-9839-d8a568a4df25.

Owner reported completing the instruction to disable Builds for Preview branches and check persistence after refresh. Treat the setting as owner-confirmed, not an independent API readback. Normal deployment remains feature/cc-infrastructure-foundation, root app, npm run build, npx wrangler deploy; the production-settings screenshot showed Disable builds off. Here Cloudflare's Production label means this development Worker's active deployment, not approval for business production. No previews block, credentials, access changes, paid resources or app release were added. Historical failed checks remain historical; the next documentation PR can verify no new Workers preview check is triggered.

Next: CC-TODO-006 isolated Cloudflare restore preparation (docs/Isolated_Cloudflare_Restore.md), then execution only with confirmed separate recovery targets. Preserve existing development DB/R2 and all completed local restore/rollback evidence. Browser acceptance remains queued; OneNote/photo/Canva and the alternate-email test remain deferred. Dashboard automation is currently blocked by a Cloudflare login 403 in the remote browser; owner dashboard access works.


## Owner sequencing clarification — 2026-10-14

Keep building the base application infrastructure under CC-TODO-002/003/004. Preserve the completed D1/R2, deployment, rollback and main-protection passes. Next actionable infrastructure follow-up: inspect the failed Cloudflare Workers Builds check on documentation-only PR #2 and review build/preview branch selection; diagnose before changing deployment settings. Continue the existing infrastructure/recovery/access/sample sequence below. No browser compatibility implementation is started by recording these requirements.

Browser/device backlog within CC-TODO-004: support Chrome and Microsoft Edge on Windows, plus Safari on iPhone. Interpret the owner's “Edge/Explorer” as modern Edge; legacy Internet Explorer support is not added. Before release, verify sign-in, record/search/form usability, private file upload/download, responsive layout and the appropriate backup path on those targets. Desktop direct-folder saving and the bounded TAR fallback have different capabilities; keep limitations explicit. Actual Edge/iPhone outcomes remain pending. This acceptance work follows the current base-infrastructure prerequisites; it does not replace them or introduce a new task ID.

## Current continuation — Main protection active

Main-branch protection was created and read back on 2026-10-14 after owner sign-in. The exact main rule requires a pull request, sqlite from GitHub Actions, an up-to-date branch and resolved conversations, and applies to administrators. Mandatory approvals are disabled for the current single-owner workflow; force pushes/deletions are disabled. The branch API reports main protected=true and development protected=false. Detailed protection API access is unavailable to the integration (403); persisted checkbox/source selections were verified in the signed-in GitHub UI.

Main updates now use documentation-only pull requests and required checks. Application PR #1 remains draft/unmerged. A validation workflow covers the notes-only main state and preserves schema/import + Node tests/type-check/build whenever app source is present; incomplete source layout fails. Intended-device outcomes remain pending in docs/Device_Acceptance.md. No application release, new access, resource, cost or deployment setting changed.

## Current checkpoint — 2026-10-14, 20:15 UTC

The development code rollback and roll-forward drill passed. Exact deployed sources: baseline 489ed640 → compatible previous app redeployment 26c2425e → restored current app 0a613893. Signed-in owner reads, same-value synthetic-location saves, exact-byte original downloads and restored phase archives passed. All phases retained identical schema, all 14 rows across 16 tables, and the one 5400084-byte STL; integrity/FKs passed. CI and Workers Builds passed. No migration, data restore, resource/security change or production release occurred.

Historical checkpoint: the next gates were intended-device acceptance and main-release safeguards. Main protection has since been completed as recorded above; intended-device acceptance remains queued. CC-TODO-006 isolated Cloudflare restore/cloud sync/retention, 005 intended-user roles and 007 real samples stay open. Preserve deferred alternate-email testing and Windows remediation. OneNote/photo/Canva remain future work. See docs/Development_Rollback_Acceptance.md and docs/evidence/Development_Rollback_20261014.json.

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
3. CC-TODO-003 design PNG and 5400084-byte STL upload/refresh/download passed byte-identically. Approved synthetic deletion and original-containing TAR restore now passed. Controlled missing-original live detection/recovery subsequently passed. Development code rollback/roll-forward passed. Main protection is now complete. Next: CC-TODO-004 Cloudflare docs-only build/preview review; retain intended-device acceptance before release without starting a compatibility workstream ahead of base infrastructure.
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

Next unused task ID: CC-TODO-013. These tasks do not precede CC-TODO-002/003/004 acceptance.

## CC-TODO-012 — Script the manual backup workflow (PowerShell acceptable)

Status: In progress; implemented and automatically verified, awaiting owner Windows acceptance. Owner-requested October 14. Operational follow-up to CC-TODO-006. No scheduled export or pruning is activated. See docs/Backup_Helper.md. Next unused task ID: CC-TODO-013.

Purpose: reduce the manual download, naming, copying, verification and retention steps under the approved policy without depending on a security bypass or creating new paid resources.

Scope and acceptance:

- Provide a documented Windows PowerShell helper. It may open the existing authenticated app and guide browser export/file selection when unattended export is unavailable; clearly state which steps still require the owner. Never collect sign-in codes/passwords, scrape browser sessions, or embed credentials in scripts, logs or GitHub.
- Accept/configure the private OneDrive backup folder; validate the path before use, use UTC timestamp filenames, refuse unintended overwrite and distinguish normal versus protected pre-change backups. Keep originals/private exports out of the public source checkout.
- Validate completed archives with the existing restore/checksum workflow (or a reviewed equivalent), retain byte size/SHA-256 and completion/verification receipts, and fail clearly on partial/corrupt files. Document any dependency; do not assume Python is installed or require unblocking the parked Windows Wrangler download.
- Copy safely to the private backup destination and verify the destination checksum. A successful local OneDrive-folder copy is not verified remote sync. Guide a OneDrive web download/checksum check, or use an explicitly authorized supported remote verification method; report pending sync honestly.
- Implement latest-seven retention as a review/dry-run report initially. Exclude protected pre-change and failed/unverified backups from automatic pruning; preserve the pre-change snapshot until changes/recoverability are verified. No automatic deletion or scheduler is authorized by this TODO. Any later activation needs explicit authorization and a concrete reviewed implementation.
- Meaningful synthetic verification covers success, spaces/Unicode paths, absent/unavailable OneDrive folder, interrupted/corrupt export, checksum mismatch, duplicate filenames, and preservation of protected snapshots. Never prune real backups to test retention.
- Done when a reviewed helper and plain-language instructions are committed, an owner Windows run demonstrates the supported manual workflow and trustworthy receipts/failure reporting, and the remaining manual cloud verification steps are explicit. A scheduled/unattended backup service is separate future scope.

## Ongoing user documentation

Maintain docs/User_Companion.md alongside user-visible changes. First version is implemented, linked from README and reviewed against current controls/server search fields. Keep technical evidence/runbooks distinct, avoid promising unavailable features, and include owner review/intended-device usability in acceptance. This is continuing documentation within existing component tasks, not a replacement priority or a new task ID.
