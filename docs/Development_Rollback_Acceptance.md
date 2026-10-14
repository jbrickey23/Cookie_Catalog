# CC-TODO-004 — Development code rollback acceptance

Prepared 2026-10-14. Not executed. Existing development resources only; no production release or database rollback is authorized by this checklist.

| Role | Exact source | Evidence |
| --- | --- | --- |
| Current known-good development code | ec8f8640799bbdb2f3df4153f8fe4fca582443df | 49 tests/build, both GitHub CI runs, Workers Builds, signed-in report and missing-original recovery passed |
| Previous schema-compatible development code | 1ea5c0eb28f6b57078ddd90bd055627610fbf1fd | 45 tests/build/CI, exact deployment match, live original-containing TAR download and local restore |
| Trusted data recovery checkpoint | Cookie_Catalog_Recovery_20261014T192755Z.tar | 16 tables/14 rows/one 5400084-byte STL; SHA-256 7b1b84faa65c55deff0ee29673083e118b9f0371bd5c8513cacaeb2be88b1577 |

The two code versions use the same migrations 0001_initial.sql/0002_variants_components.sql. The current app has additional development diagnostics; no schema migration accompanies the change.

## Drill to perform next

1. Keep catalog mutations/exports idle; record current source head, deployed SHA, record counts, migrations, file hashes and latest trusted private backup. If data changed since the recorded TAR, create and verify a fresh backup first.
2. Identify the exact corresponding Worker deployment in the existing development project's deployment history. If provider rollback is unavailable, prepare a normal reviewed development commit restoring only the selected previous application files. Preserve all durable notes and intervening data. Never force-reset branches or change main/production.
3. Redeploy/roll back code only to the recorded compatible version and verify Access login, deployed-source/build evidence, migrations, original records and exact-byte file retrieval. New diagnostic controls may disappear on the old version; that is expected and must not be confused with lost D1/R2 data.
4. Roll forward to the current known-good application source through a normal development deployment, then repeat source, data/file and owner-auth checks. Record every source/deployment mapping and result. Stop and preserve evidence if any check fails.
5. Keep schema/data/object restore separate. This drill must not run reverse migrations, overwrite D1, delete R2 originals, provision resources or treat local restore as Cloudflare-side recovery.

Completion requires actual backward/forward development deployments with unchanged D1/R2 evidence. Intended desktop/mobile/browser and wife/collaborator readiness, branch protection/main-release approval and production rollback remain separate open gates. Preserve the owner-deferred alternate-email denial test.
