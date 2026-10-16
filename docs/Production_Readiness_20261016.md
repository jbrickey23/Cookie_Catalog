# Production readiness preparation — October 16, 2026

This prepares the existing catalog for a separate production target. It creates no resources, grants no access, copies no live data and deploys no production service.

## Implemented compatibility

- Runtime CATALOG_ENVIRONMENT explicitly selects development or production. Missing value retains development compatibility; unknown values fail closed. Existing development configuration remains bound to the same resources.
- Session and read-only infrastructure reports identify the environment. The UI labels the private catalog accordingly; synthetic development checks are hidden and their server routes are unavailable in production. Owner-only archive export and read-only diagnostics remain available with existing guards.
- New portable archives and managed snapshots record the active source environment. Existing development manifests are retained without relabeling. Streaming archive assembly and offline restore accept development or production source labels, rejecting unknown labels. Restore preview identifies the saved source environment and describes replacing the current catalog. Freshness validation supports either retained manifest label.
- The legacy small JSON development backup remains development-only. Production uses the existing checked portable archive and managed snapshot workflows. No original format conversion, schema migration or retention/schedule activation is introduced.
- The offline preparation package now records sourceEnvironment separately from the destination. Tests round-trip the current 22-table/four-migration schema, saved review rows and import audit records, and compare complete schema/rows and original bytes. This is synthetic local evidence, not a current live transfer or remote target attestation.

## Separate configuration

app/wrangler.production.example.jsonc is a preparation template with deliberately unusable D1/Access placeholders. After authorization, copy it to ignored app/wrangler.production.jsonc and fill only verified separate target identifiers. Existing intended owner/member secrets must be set privately. Vite supports an explicit CC_WRANGLER_CONFIG path; normal builds continue to read wrangler.jsonc. The production build/deployment must use the same selected configuration and report its exact source/version. A filled production build is not yet verified because resources and IDs do not yet exist.

Run `node tools/check-production-config.mjs app/wrangler.production.jsonc` before any production build/deployment. The read-only gate checks separate approved names, distinct D1/bucket/Access audience, explicit production environment, required owner secret and disabled previews. It does not attest cloud account, actual resource existence, R2 privacy or Access coverage. The production minute trigger resumes approved jobs; daily backup creation remains opt-in, not enabled by this template.

## Transfer and remaining cutover evidence

Use tools/prepare_cloudflare_restore.py prepare on the fresh private checked archive at the coordinated write freeze. Its generated SQL contains schema plus all catalog rows and migrations; load into an empty verified target without separately pre-applying migrations. Keep all stable IDs, source provenance, reviews, import history and demo rows. Upload original keys unchanged. Use the verify action on an independent target re-export and downloaded originals, plus complete remote listing and private-access evidence. The preparation and payload stay outside Git. A source development label remains a source development label after transfer; later production snapshots identify production.

Remaining: owner authorization for the proposed cookie-catalog-prod Worker/D1, cookie-catalog-prod-private R2 and Cookie Catalog Production Access application on the existing account; verified actual IDs/hostname/private access; operational access-recovery owner; fresh exact-source archive and independently verified private recovery copy; actual transfer/readback and smoke checks; final version/PR/main/tag/deployment decision. Development remains the working catalog until the controlled cutover. Follow Production_Cutover_Plan.md for freeze and rollback rules.

## Local validation

154 application tests and build/type-check pass. Nine offline transfer/recovery tests pass, including both source environments and current schema. The refreshed self-contained Windows kit and its local validator accept either source environment and record it in receipts; 31 helper tests pass, including installer reproducibility and production-source validation. Two production configuration tests pass; incomplete or development-bound configurations are rejected. Existing Chrome/Edge and second-admin browse/edit acceptance remains valid. No real backup removal, restore, schedule activation or catalog edit was used for these checks. CI/development deployment acceptance is recorded separately after publication.
