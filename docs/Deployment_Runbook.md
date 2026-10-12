# CC-TODO-004 — Deployment and rollback runbook

Status: development deployed; production and rollback acceptance remain pending.

Development checkpoint (2026-10-12): active branch `feature/cc-infrastructure-foundation`, draft PR #1; `main` remains the earlier bootstrap/release branch. Cloudflare development Worker and D1 `cookie-catalog-dev`, private R2 `cookie-catalog-dev-private`, and Access application are provisioned. Owner reported successful login/session, synthetic D1 create/link/edit/read (90 × 100 mm), and three-file R2 round-trip/cleanup. R2 screenshot recorded Public Access Disabled and an empty bucket afterward. CI run #79 passed for `d012da6`. These checks do not complete general catalog CRUD, persistent attachments, collaborator access, backup/restore, or production readiness.

The live alternate-email denial test is deferred at the owner's request; failed code delivery is inconclusive. No production deployment or additional paid resources are authorized. Next work: CC-TODO-006 backup/export/recovery preparation; the last user-side setup issue was PowerShell not finding Node.js. Installation has not been verified. Do not redo passed checks or resume the deferred access test automatically.

## Environments and release rules
- Feature branch: development only; draft PR #1. Do not deploy real catalog content from it.
- Development Cloudflare environment: isolated D1 database and private R2 bucket, separate Access app and test identities.
- Production: separate Worker name, D1 database, R2 bucket, Access app/audience and credentials. Deploy only reviewed main commits.
- Never commit Cloudflare account tokens, private Access JWTs, real D1 IDs tied to secrets, purchased assets or exports to public Git.
- Only provision after explicit owner authorization. Use least-privilege deploy credentials.

## Remaining deployment gates (preserve completed development evidence)
1. Development authorization and provisioning are evidenced. Obtain separate approval before production or additional paid resources.
2. Keep existing development resources isolated; production resources remain unprovisioned and require separate approval. Bind D1 as `DB` and R2 as `FILES` after recording actual IDs and bucket names in appropriate environment configuration.
3. Enable Cloudflare Access with intended identities, then implement and test server-side JWT validation and role authorization. Owner session and development smoke endpoints are implemented; unsupported/general API operations remain incomplete.
4. Validate D1 migrations against isolated development D1. Verify SQLite foreign keys, record CRUD and relationship queries.
5. Test private R2 upload/download/cleanup with synthetic content, deny unauthenticated and cross-record access.
6. Validate build output and deployed routes. Set deployment to approved main commit only after gates pass.
7. Document DNS, custom domain, secret injection and break-glass access in private operator notes, not this repository.

## Rollback
- Identify the last known-good main commit and corresponding Worker deployment.
- Roll back code through the Cloudflare-supported deployment rollback mechanism or redeploy that verified commit.
- Database schema/data rollback is separate: additive migrations should be preferred; restore from verified database export when needed.
- Restore R2 objects independently from backup manifest and checksums. Do not mistake code rollback for data recovery.
- Verify authenticated read and write paths after rollback.

## Current automated gates
GitHub Actions runs Python SQLite schema tests, synthetic import, TypeScript type-check and Vite build. CI success does not prove deployment, Cloudflare D1 compatibility, private R2 access, authentication, or recovery.
