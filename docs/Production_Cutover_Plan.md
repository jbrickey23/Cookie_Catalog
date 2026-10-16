# First production cutover — reviewable proposal

## Production provisioning APPROVED; dashboard access blocked — October 16, 2026, 12:49 Pacific

Owner explicitly APPROVED creation of the separate free production resources proposed in the preceding review: cookie-catalog-prod Worker and D1, cookie-catalog-prod-private R2, Cookie Catalog Production Access application on the existing account, preserving development. Do not ask for the same provisioning approval again. Paid resources/upgrades, data cutover, production application deployment and final merge/tag remain outside that provisioning approval.

Execution attempt: no direct Cloudflare plugin was found and no Cloudflare API credentials were configured in the executor. Secure browser-auth sign-in submitted, then Cloudflare displayed API Request Failed: login (403). This is a current remote-browser sign-in failure, not proof of incorrect credentials or an account outage. Stopped after the site error; no method switching, repeated login or security bypass. No production resources were created or verified. Existing development and data remain intact. Owner must provision through their accessible dashboard or provide an approved supported management path; never send secrets in chat or commit them. Next concrete step is create the separate free D1 cookie-catalog-prod and record its non-secret database ID, then private R2, protected Worker/Access setup and configuration verification. Fresh cutover archive/independent copy/transfer/deployment still follow separately.

Latest application 4daa4a24e085c1ae5b52de7eb6ba1f2964b38855 passed both CI checks and development Workers deployment; live read-only source/schema/sample-file verification passed. R1 scope stays fixed. Change Requests CC-TODO-018 is after R1; next unused 019.

Prepared October 16, 2026 (Pacific). This is a preparation plan, not production authorization. Current supported first-release browsers: **Windows Chrome and Microsoft Edge**. The owner removed Safari/iPhone from this release's acceptance scope; no mobile pass is claimed.

## Proposed separate targets

| Resource | Proposed value | Required evidence before use |
| --- | --- | --- |
| Cloudflare account | Existing owner-controlled account hosting development | Owner confirms account, available capacity and current plan; no paid upgrade assumed |
| Worker | `cookie-catalog-prod` | Newly verified separate Worker; record actual identifier/hostname; do not rebind or rename development |
| D1 | `cookie-catalog-prod` | Actual database ID differs from development and recovery IDs; empty target inventory and approved schema/import procedure |
| Private R2 | `cookie-catalog-prod-private` | Separate bucket, public access disabled; actual binding and original-key/checksum inventory |
| Access | `Cookie Catalog Production` | Separate application/audience protecting the actual production hostname; existing intended accounts/roles only, private settings reviewed by owner |
| Secrets | Production OWNER_EMAIL and CATALOG_MEMBERS as needed | Set privately; no real identifiers, tokens or secrets in Git, public evidence or catalog TAR |
| Source | Accepted descendant of `4ca1b1d`, final version to be recorded | Required checks passed, reviewed release tree, exact source SHA and deployment version |

These names are proposals, not provisioned resources or verified URLs. No new paid plan, domain purchase, access grant or automatic backup/cleanup activation is included.

## Preparation findings to resolve before deployment

Update October 16: environment/source-provenance compatibility and synthetic current-schema transfer preparation are now implemented; see [production readiness preparation](Production_Readiness_20261016.md). The paragraphs below record the original findings. Actual separate resource IDs, filled production build, live transfer, private-access attestation and final cutover evidence remain outstanding. No production provisioning is authorized by this update.

The current app/configuration deliberately identifies development. `app/wrangler.jsonc` binds only development D1/R2 and Access. UI footer and restore copy, infrastructure report, archive writers and archive validator contain development labels or format assumptions (`main.tsx`, `ManagedBackups.tsx`, `server/infrastructure-check.ts`, `server/archive-backup.ts`, `server/development-backup.ts`, `archive-format.ts`). Production requires a reviewed environment/configuration and backup-provenance decision, compatible with existing checked archives. Do not just rename strings or relabel an old archive as production. Keep development diagnostics controlled and decide which synthetic test actions are appropriate for production.

Existing offline restore preparation/comparison tooling and isolated restore evidence remain useful, but they are not an unattended production importer. Select and test the current-schema transfer procedure against a fresh private archive before loading production. An empty target receives either the validated complete schema/rows from the archive, or the approved migration-plus-import procedure; do not apply both and duplicate migration/catalog tables.

## Cutover sequence and acceptance

1. Preserve October 16 owner-confirmed Chrome/Edge and second-admin sign-in/browse/edit passes. Record any remaining specific download/access-recovery observation without repeating accepted workflows. Confirm who can recover private configuration; do not infer unreported admin-only control tests.
2. Resolve the preparation findings and prepare an explicit production configuration with actual distinct IDs. Keep development configuration/deployment unchanged. Obtain approval of the named targets, private access settings, transfer procedure and supported users/browsers before creating/changing production resources.
3. Agree the cutover window and owner responsible for ending edits. Stop catalog/import/file mutations during the final source capture/copy/verification. Keep the source development application and all existing backups intact. A maintenance window is coordinated; no new technical maintenance control is claimed here.
4. Capture a fresh checked full snapshot and portable private archive of the exact agreed source state, with records, original bytes, hashes, completion receipt and source report. Existing 592-original snapshots remain recovery points, not proof that current catalog rows are unchanged. Record exact counts from this fresh capture. Identify and verify the corresponding independent private recovery copy; never put the payload in Git.
5. Transfer the approved catalog without silently filtering demo rows, rewriting identities/provenance or merging catalogs. Initial proposal is an exact copy, including hidden demonstration fixtures; any desired filtering needs a separately reviewed transformation. Verify full row/schema/relationship and original key/byte/hash readback, not counts alone. Account membership/access settings are configured separately; they are not in catalog archives.
6. Deploy only the approved source/configuration to the separate target with Access in place before sharing the production hostname. Confirm source/version, intended owner/admin/viewer behavior, forbidden writes, persistent synthetic edit/refresh and private original retrieval. Record exact source/data baseline and rollback owner. Enable no new daily schedule or pruning as part of this plan.
7. Final release review resolves findings, reviews PR #1 under existing main protection and records the final version/tag/source/CI. Confirm how the approved main source reaches production without changing the existing feature-to-development deployment. Mark production live only after deployment and data/access smoke evidence pass. End the write freeze and use one authoritative live catalog.

## Rollback

Before production accepts new writes, failure means keep or return users to the unchanged development source after confirming the frozen baseline still matches. Do not destroy failed production targets; preserve evidence for inspection.

After production accepts writes, development becomes stale. Stop edits and capture/verify the new production state before deciding recovery. Compatible code rollback keeps current data. Whole-data rollback to a prior snapshot requires explicit review of writes that would be lost. Never silently send users back to stale development data, restore an old snapshot over newer writes, or combine two active catalogs. Record the selected recovery target, source, preserved delta and owner approval.

## Outstanding inputs

- Chrome/Edge browse/edit and second-admin independent sign-in passed by owner report October 16, 11:15 Pacific. Operational access-recovery ownership remains to be confirmed.
- Production resource/access authorization and a usable owner-controlled provisioning path; parked Cloudflare login/Windows remediation is not reopened by this plan.
- Verified resource IDs/audience/hostname; environment/provenance compatibility implementation and transfer validation.
- Fresh source archive and independently verified private recovery copy at the agreed cutover window.

See [current release status](First_Release_Status.md), [device checks](Device_Acceptance.md) and [existing deployment/rollback runbook](Deployment_Runbook.md). Next unused task is CC-TODO-019; this continues 004/005/006/014.
