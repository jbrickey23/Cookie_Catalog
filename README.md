# Cookie_Catalog

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
