# Cookie_Catalog

## Latest verified recovery and next decision

Live file recovery verified on 2026-10-12: owner supplied cookie-catalog-dev-recovery-2026-10-12T23-06-58-377Z.json (11,830 bytes; SHA-256 7824069a2faa5db5193818607d5662bcc6f113791a66505bb245f65486da3794). Payload and both original-file checksums passed. A new disposable local restore recovered 16 tables, 17 rows and 2 objects: a readable 1 × 1 PNG (68 bytes) and ASCII STL (111 bytes). Confirmed the synthetic design/cutter/location link at 90 × 100 mm, two shape attachments, one design image and one printable STL association. SQLite integrity and foreign keys passed. The download reports cleanupVerified=true; server code only returns after request-scoped D1/R2 cleanup checks succeed. No real inventory or backup payload was committed to public Git. Code commit 40ab108 passed CI #97.

Proposed development backup policy (awaiting owner storage preference): owner-triggered download after meaningful catalog changes and before bulk import/migration; keep the latest 7 completed packages in an independently controlled private location outside Cloudflare/public GitHub. This is a manual development policy, not an activated recurring automation. Restore-check after schema/export changes. Real-asset volume and production recovery needs must inform production frequency/retention and scalable exports. No new storage subscription, paid resource, scheduled task or production deployment is authorized. Next required input: identify an existing private backup location the owner can use; Cloudflare-side restore is still an additional validation followup.


## Live recovery checkpoint

Live package cookie-catalog-dev-2026-10-12T22-53-46-644Z.json (7,834 bytes; SHA-256 724b645b1a4582ea4bc08499376a0fc072efc018c081a47194421390618d0149) passed payload checksum verification and restored into a new disposable local directory on 2026-10-12. Recovered 16 tables and 6 rows: both migration entries, one design, shape, cutter and link. Confirmed DEMO Holiday tree → DEMO Evergreen tree at 90 × 100 mm, SQLite integrity_check=ok and no foreign-key violations. Zero file objects matches the empty live bucket; this package does not prove live attachment recovery. The uploaded package and restored database are private and are not committed to public Git.

Next browser action: refresh https://cookie-catalog-dev.j-brickey.workers.dev and choose Download file recovery test. This owner-only same-origin POST /api/dev/recovery-check creates unique, disposable synthetic cutter/design/location records plus PNG/STL originals and metadata, exports them, then deletes only its request-scoped data and verifies cleanup before returning the download. Attach that saved recovery JSON for actual file/relationship restoration. Local D1/R2 binding integration tests, real SQLite restore, failure-path cleanup, preservation of existing data, all 20 Node tests and TypeScript/Vite frontend/Worker build passed. Live recovery-test execution remains pending; CC-TODO-006 is still open for file recovery, Cloudflare-side restoration and backup destination/retention/scheduling.


## Latest continuation

2026-10-12 continuation: Node.js v24.21.0 and npm.cmd 11.19.0 work. This formerly managed PC still reports Defender for Endpoint enrollment (OnboardingState=1) and tamper protection; event 1126 blocks node.exe at registry.npmjs.org. Audit-mode change did not take effect, so Wrangler login was never retried. Previous IT is unavailable. Park local PC remediation; no reset/reinstallation is authorized. CC-TODO-006 now provides an owner-only browser development download at POST /api/dev/backup plus a disposable local restore tool. Local schema, linked-record and two-file restoration, negative authorization/integrity cases, all 16 Node tests, SQLite smoke/import and TypeScript/Vite frontend/Worker build passed. Live export/restore, independent backup destination, retention and scheduling remain pending; no production deployment or paid resources were added.


A visual catalog for a cookie decorating business: find designs, compatible cutters already owned or available to print, their locations/files, and known cutter flips.

## Current checkpoint

Development checkpoint (2026-10-12): active branch `feature/cc-infrastructure-foundation`, draft PR #1; `main` remains the earlier bootstrap/release branch. Cloudflare development Worker and D1 `cookie-catalog-dev`, private R2 `cookie-catalog-dev-private`, and Access application are provisioned. Owner reported successful login/session, synthetic D1 create/link/edit/read (90 × 100 mm), and three-file R2 round-trip/cleanup. R2 screenshot recorded Public Access Disabled and an empty bucket afterward. CI run #79 passed for `d012da6`. These checks do not complete general catalog CRUD, persistent attachments, collaborator access, backup/restore, or production readiness.

The live alternate-email denial test is deferred at the owner's request; failed code delivery is inconclusive. No production deployment or additional paid resources are authorized. Next work: CC-TODO-006 backup/export/recovery preparation; Node.js and npm are confirmed working; local Wrangler installation is blocked by Defender enrollment (see latest continuation). Do not redo passed checks or resume the deferred access test automatically.

## Restore order

1. Read this README on the default branch.
2. Inspect open PRs and branch heads. Until PR #1 is merged, read the current development checkpoint on `feature/cc-infrastructure-foundation`; do not assume default-branch notes describe development.
3. Read Cookie_Catalog_Context.md, Cookie_Catalog_TODO.md, Cookie_Catalog_Decision_Log.md, Cookie_Catalog_New_Chat_Bootstrap_Prompt.md, and applicable AGENTS.md from the identified branch.
4. Read component documentation only as needed.

GitHub is authoritative for source/project state; D1 and private R2 are authoritative for operational records/attachments. This conversation restored state using GitHub plus supplied/retrieved history, so it is not a history-independent restoration acceptance test. CC-TODO-001 remains open for that strict test. Development remains on the feature branch; production requires separate approval.
