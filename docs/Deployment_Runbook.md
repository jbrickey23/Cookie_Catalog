# CC-TODO-004 — Deployment and rollback runbook

Status: pre-provisioning draft. GitHub CI has passed SQLite fixtures and TypeScript/Vite build; no Cloudflare deployment has occurred.

## Environments and release rules
- Feature branch: development only; draft PR #1. Do not deploy real catalog content from it.
- Development Cloudflare environment: isolated D1 database and private R2 bucket, separate Access app and test identities.
- Production: separate Worker name, D1 database, R2 bucket, Access app/audience and credentials. Deploy only reviewed main commits.
- Never commit Cloudflare account tokens, private Access JWTs, real D1 IDs tied to secrets, purchased assets or exports to public Git.
- Only provision after explicit owner authorization. Use least-privilege deploy credentials.

## Before first deployment
1. Obtain approval for Cloudflare account, domain/hostname, development and production resources, identity provider and anticipated costs.
2. Provision distinct dev/prod resources. Bind D1 as `DB` and R2 as `FILES` after recording actual IDs and bucket names in appropriate environment configuration.
3. Enable Cloudflare Access with intended identities, then implement and test server-side JWT validation and role authorization. Current Worker API returns 503 deliberately.
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
