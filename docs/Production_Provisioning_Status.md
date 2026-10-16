# Production provisioning status — October 16, 2026, Pacific

## Fresh transfer backup verified — October 16, 2026, 14:04 Pacific

Owner confirmed both users paused catalog edits at 13:53 Pacific. Managed snapshot dated 13:53:45 completed and automatically checked all 592 originals; retained earlier snapshots preserved. Fresh portable TAR subsequently exported and independently validated offline: 22 tables, 4,048 total rows and 592 originals; exact local SQL restore roundtrip passed. SHA-256: `480b42093d8645720830dd6f2b8f49f7f17774dcd66724ba2e76b8657cfaf6a7`. Private TAR and prepared transfer ZIP saved privately outside this repository. No private payloads or Library identifiers belong in Git.

Read-only source verification at 21:03:49 UTC matched development head `6650e2146ef22509c12db5901ee2f390ded018f6`, version 0.1.0-rc.1, 22 tables/four migrations, zero FK violations and five originals sampled without missing/size mismatches. Evidence: docs/evidence/Transfer_Source_Verification_20261016.json. The complete archive validation, rather than this sample, checked all 592 originals.

Production Workers dry-run build succeeded at release head `48e8b0adefb2966d7433fdeb8a79873c755d81b5`; see docs/evidence/Production_Dry_Run_20261016.json. Owner confirmed encrypted OWNER_EMAIL and CATALOG_MEMBERS runtime secrets, production branch/build settings and dry-run deploy command. This is not a live production catalog deployment.

NEXT: establish a supported private execution path for the prepared D1/R2 import (remote Cloudflare dashboard sign-in remains blocked; Windows Wrangler setup was parked). Keep production deployment command in dry-run until separately authorized. Before importing, verify actual empty D1/private R2 targets and Access settings; obtain concrete data-transfer authorization, then import, independently re-export/download and compare all rows/object hashes, verify both owners/private access and recovery, and review final deployment/cutover/merge/tag. No production data import, deployment, cutover, main merge or tag has occurred. Source freeze is a manual owner pause, not an enforced maintenance lock; any resumed edits require a new final transfer export. R1 feature scope remains fixed; Change Requests stays R1.1, next unused CC-TODO-019.

## Cloud dry-run passed — 13:48 Pacific

Owner confirmed builds enabled and Deploy command includes --dry-run. Pushed source-identical checkpoint 48e8b0adefb2966d7433fdeb8a79873c755d81b5 to release/r1-production, retaining tree a9b60f948e1c8e8688e15b63a09ab9a23e058e37. GitHub Workers Builds: cookie-catalog-prod completed success, build 5cb3f2d4-8773-4c48-b50f-095a5c7ab77e. No production version ID reported. Full build log not accessible through the blocked remote dashboard; retain owner-confirmed --dry-run distinction rather than treating build success as a live deployment. Evidence: evidence/Production_Dry_Run_20261016.json.

Keep --dry-run in place. Next is fresh checked source backup / independently verified private recovery copy and reviewed transfer preparation, followed by separately approved actual deployment/cutover, target readback and Access/role smoke checks. Do not remove --dry-run or push a deployment command change without actual production deployment approval. Existing development remains authoritative. Runtime secret values, production data and bucket privacy are not attested by the build check.

## Current checkpoint — 13:36 Pacific

Owner screenshot confirms Worker cookie-catalog-prod and runtime Secret entries OWNER_EMAIL / CATALOG_MEMBERS, both encrypted; values were not read or validated. Bindings currently show none, consistent with no successful application deployment. Earlier build c2a61198 stopped at cloning because main lacked root app; it did not reach deployment. Subsequent screenshot confirms production branch release/r1-production and root app. Owner reported renaming the Worker and disabling builds; command fields disappear when builds are disabled. Build token settings and Access/R2 privacy still need actual readback.

Release application source 795c9a921be0e809ab9e6a959a5e830575974278 passed both GitHub CI checks and development Workers deployment. Production config/build/dry-run passed locally. Next: temporarily enable only the configured release build with explicit production build command and deployment --dry-run. Start a NEW build for release/r1-production, not Retry of the old main commit. This does not authorize a real production application deployment or data cutover. Verify source/binding report, then return to build hold while preparing checked transfer/access/cutover. Do not initialize production schema twice; final transfer package already contains schema and migration rows.

Owner approved separate free production resource creation at 12:49. Catalog deployment, data cutover and final merge/tag remain separate. Remote dashboard login 403 is a known blocker; use owner dashboard guidance, not repeated remote sign-in attempts.

| Resource | Current evidence |
| --- | --- |
| D1 cookie-catalog-prod | Owner supplied ID 9428a5b4-4675-4f45-9ec8-aba243848e27 after creation; instructed to remain empty. Distinct from development. Remote inventory/schema verification pending. |
| R2 cookie-catalog-prod-private | Owner reported ready after Standard/Automatic/private instructions; actual public-access/bucket settings readback pending. |
| Access Cookie Catalog Production | Owner created self-hosted app for cookie-catalog-prod.j-brickey.workers.dev and supplied AUD 47fc0140931f95ca368ec190f86ce65307e8bd198f133bb148b4dab4ee26f720. Screenshot confirmed existing Cookie Catalog Dev - Jay Allow policy selected. Persisted settings/private access test pending. |
| Worker cookie-catalog-prod | GitHub create-app wizard open, repository selected, path app, previews disabled and protection all traffic instructed. No catalog deployment approved or observed. |

app/wrangler.production.ready.jsonc contains the non-secret supplied identifiers; no credentials or member emails. Configuration gate, Vite production-selected build, generated binding readback and Wrangler deployment dry-run pass. Generated deploy configuration is app/dist/cookie_catalog_prod/wrangler.json. Default development config is unchanged.

Prepare release/r1-production from the reviewed source plus this wiring; development continues on feature/cc-infrastructure-foundation. After the production Worker exists, select the release branch explicitly rather than accepting main or feature deployment defaults. Production automatic deployment must remain held until release approval.

Intended production build (root app): `node ../tools/check-production-config.mjs wrangler.production.ready.jsonc && CC_WRANGLER_CONFIG=wrangler.production.ready.jsonc npm run build`.

Intended deployment after approval (root app): `npx wrangler deploy --config dist/cookie_catalog_prod/wrangler.json`.

To create the Git-connected Worker without deploying catalog code when the wizard does not expose branch selection, use an explicit initial build hold: `node -e "console.error('Provisioning only: catalog deployment is held'); process.exit(1)"`. The deliberate build stop is expected, not an application failure. Then configure the release branch and deployment hold before installing the real commands. Review existing self-hosted Access coverage to avoid duplicate application destinations from automatic wizard protection. Verify owner/member runtime secrets privately before any real application deployment.

Still required: actual Worker/Access/R2/account settings, free-resource verification, filled production build evidence in cloud, operational recovery owner, coordinated freeze/fresh checked source archive and independently verified private copy, exact transfer/readback, role/private-image smoke, separate catalog deployment/cutover approval and final release review. No data transfer/migration or production deployment occurred during local checks.
