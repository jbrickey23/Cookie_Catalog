# Cookie_Catalog — TODO

Updated: 2026-10-13 UTC. Infrastructure first; stable component IDs and acceptance criteria are preserved. No component is closed merely because its development smoke check passed.

| ID | Component | Current status | Depends on |
| --- | --- | --- | --- |
| CC-TODO-001 | Repository and durable project state | Open: independent fresh-chat test pending | — |
| CC-TODO-002 | Database and catalog schema | In progress: live shape create/edit/search passed; search explanations added | 001 |
| CC-TODO-003 | File and image storage | In progress: live owner photo upload/read passed; deletion/other types pending | 001/002 |
| CC-TODO-004 | Runtime, hosting and deployment | In progress: development deployed | 001/002/003 |
| CC-TODO-005 | Identity and access | In progress: owner path verified | 004 |
| CC-TODO-006 | Backup, export and recovery | In progress: live sample exports restored locally | 002/003 |
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

Owner confirmed shape create/edit/refresh/search passed. Search explanations and broader metadata predicates implemented with 35 local tests/build passed; live highlighting pending. Remaining: live physical cutter/location/mapping checks; refine required/optional fields, ownership and known/proposed mappings using real samples; record deletion safeguards, tags/visual search, import, intended-device usability and production separation/migrations. Choice/cost rationale is in architecture notes.

Done when: a sample cutter and design can be created, linked, edited, searched and retrieved across sessions; migrations are reproducible and choice/cost documented.

## CC-TODO-003 — File/image infrastructure

Purpose: retain photos, artwork, STL and 3MF originals alongside records.

Verified: private R2 provisioned, FILES binding and adapter/lifecycle design implemented. Owner's three-file smoke test passed with cleanup; screenshot showed public access disabled and empty bucket afterward. Actual recovery export/local restore verified a tiny PNG and STL with metadata and record links.

Implemented 2026-10-13: owner-only persistent uploads/downloads, generated IDs/keys, hashed metadata, shape/design relationships and printable-original entries. Browser selection/upload/list/download/delete confirmation; missing-file detection; retryable deletion and bounded paginated manual orphan audit/cleanup. Existing schema reused. Local validation passed with 27 Node tests (real Miniflare D1/R2), SQLite schema/import and application build. PNG/JPEG/WebP, shape STL/3MF; maximum 4 MiB/file with lightweight headers rather than full format/model validation. Downloads are authenticated attachment responses with exact byte/hash verification.

Verified live owner photo upload/refresh/download on 2026-10-13; deletion is still unconfirmed. Remaining: design/STL flows, deletion and private denial behavior; full format validation/quotas, thumbnails and collaborator roles. Backup tool still caps originals at 4 MiB total/25 objects. No general real asset import yet. Lifecycle details in docs/Attachment_Lifecycle.md.

Done when: a cutter photo, design image and sample STL can be stored and retrieved privately, and broken links are detectable.

## CC-TODO-004 — Runtime/deployment infrastructure

Purpose: a private working interface reachable on business devices.

Verified: React/Vite/Workers development scaffold deployed from canonical feature branch; D1/R2/frontend bindings configured. Build root app, build npm run build, deploy npx wrangler deploy. Owner log confirms deployment of 8122a92; later downloaded packages prove newer backup routes were live, although their exact exporting commit was not independently attested. Code 40ab108 passed CI #97 (20 Node tests, SQLite schema/import, type-check/build); pre-reconciliation head 330ca8a passed CI #105.

Remaining: intended-device/browser validation, persistent product paths, build-project naming/preview review, appropriate branch protection/pre-merge checks, approved main-release deployment, known-good release and code rollback verification. Production resources are separate and unprovisioned.

Done when: a minimal private site deploys from recorded source and performs a persistent record read/write plus authorized attachment retrieval. This proves infrastructure; full catalog UX follows later.

## CC-TODO-005 — Identity/access infrastructure

Purpose: access for Jay's wife and explicitly allowed collaborators.

Verified: Cloudflare Access/PIN and owner session; server-side signed JWT validation and owner-only endpoint guards; local forged/expired/wrong-audience/unknown-owner and origin checks. OWNER_EMAIL is a secret with required-secret deployment validation.

Remaining: intended owner/editor/viewer needs, wife/collaborator access, D1 membership/roles, record/file authorization, account recovery and live negative-edge validation. Owner deferred the live alternate-email denial test; absent email codes are inconclusive. Do not resume that test automatically.

Done when: intended users can access their catalog, unauthorized access is rejected, and roles/recovery are documented.

## CC-TODO-006 — Backup/export/recovery infrastructure

Purpose: preserve catalog data independently of provider/app availability.

Verified: owner-only bounded browser export and disposable recovery-test endpoint, strict local restore tool, integrity/authorization/failure-cleanup tests. Actual normal package restored 16 tables/6 rows/0 objects; actual recovery package restored 16 tables/17 rows/2 objects with original bytes and relationships intact. See docs/Backup_Recovery_Plan.md for hashes and instructions.

Owner placed dated packages/manifest/instructions in personal OneDrive at Cookie_Catalog/Backups/Cookie_Catalog_Backups_20261012T231810Z. Local placement confirmed by owner; cloud sync not confirmed. Latest-seven normal snapshots after meaningful changes/before imports remains proposed; no schedule, transfer or pruning activated.

Remaining: verify independent cloud copy, settle retention/cadence/ownership, restore into isolated Cloudflare D1/R2, production-scale export/import and consistency across D1/R2. Current sample local-restore acceptance passed; the broader component remains open.

Done when: a sample backup restores into a clean test environment with relationships and attachments intact, and recovery instructions are recorded. This demonstrated sample gate does not replace the remaining durability/operational work.

## CC-TODO-007 — Sample import/seed infrastructure

Purpose: evaluate real workflows before bulk cataloging.

Verified: public-safe synthetic fixture, disposable SQLite importer and CI validation. All current catalog content is demonstration data.

Remaining: obtain authorized real purchased/printed cutters, an unprinted STL, size variants, multiple designs per cutter and a known flip; define/validate import manifests and duplicate-safe reruns; retain sources and unknowns.

Done when: authorized samples import reproducibly and support Christmas/tree search, cutter-to-design browsing, physical/file retrieval and known flip instructions.

## Scope and continuation

Slicer scaling in v1; store original files, dimensions and optional sizing guidance. Derived model generation, automatic flip suggestions and order/invoicing are deferred. Later product tasks cover entry, linking, visual search and usability.

Verify CC-TODO-002 Matched fields highlighting and remaining physical cutter/location/mapping checks; complete pending CC-TODO-003 deletion/design/STL gates. Continue CC-TODO-006 scalable backups/larger uploads before real inventory. Park the formerly managed Windows Defender/CLI issue; browser recovery works. No production deployment, extra paid resources, PC reset or automatic pruning authorized. Do not repeat completed checks.

Next unused task ID: **CC-TODO-008**.
