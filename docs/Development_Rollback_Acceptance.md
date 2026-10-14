# CC-TODO-004 — Development code rollback acceptance

Completed 2026-10-14. The current application is restored and healthy. This is development-only compatible code redeployment through GitHub/Workers Builds; provider-native rollback and production release were not exercised.

## Exact source mapping

| Stage | GitHub/deployed commit | Application tree | Evidence |
| --- | --- | --- | --- |
| Baseline | 489ed640d4e4fe14178e63e5aec5deca224818b6 | 7a401bedd91bb378a1b80373a18b3f7f4d47885d | Authenticated report at 20:10:10.649Z; fresh private TAR restored before changes |
| Previous compatible app | 26c2425e3c400cecf6105078ba827a48d39413c3 | c2059aed8f16e7d577ff12fa765e26aacb27519a, identical app to 1ea5c0e | Authenticated report at 20:12:05.071Z, owner same-value save, exact-byte download and phase TAR restore |
| Restored current app | 0a6138938e0a8a872732c925afb38e49a9766b38 | 7a401bedd91bb378a1b80373a18b3f7f4d47885d, identical to baseline/current ec8f864 app | Authenticated report at 20:14:22.913Z, owner same-value save, exact-byte download and phase TAR restore |

Normal commits changed only the app subtree; all project notes were preserved. The changed app paths were InfrastructureVerification.tsx, worker.ts and the isolated missing-file check module/test. The previous version omits that new diagnostic while preserving the rest of the catalog/backup behavior. Database tree 562c0b453bf3f0747bf60fb7b8ec7a76865f4126 and tools tree f6732640a8bbc7f716e5d58fc6979b791920ad40 are identical in both versions. Migrations 0001/0002 are unchanged. No force-reset, reverse migration, D1 overwrite, R2 original deletion or resource provisioning ran.

## Verified preservation

Each live phase archive was restored into a separate new local directory using the trusted repository restore tool. All phases matched across schema definitions, column identities, every table row and all originals; this is stronger than comparing just row counts.

| Check | Result across all three phases |
| --- | --- |
| Schema | 16 tables; schema digest a2387bfffe1db18bdfefbc848a7500f727940db6358570c32154d4b4d778bae8 |
| Data | 14 rows; full canonical-row digest b56f9e0b9078488e6e99e318a0bbb3181c6eb5130479ffa573b0a3b2efe0151d |
| Original | One STL, 5400084 bytes; SHA-256 44f1d7d5617d5611da7832a8c3e7fd512d970b3e6f80a61775cbf981a18892f7 |
| Relationships | SQLite integrity ok and zero foreign-key violations |
| Owner application path | Authenticated catalog reads, same-value save of labelled synthetic shelf and private original downloads passed on previous and restored-current code |
| Build/CI | Backward runs 38629951178/38629957882 and forward runs 38630242972/38630250482 plus Workers Builds all passed |

Canonical data comparison sorts table names, records and JSON keys, includes column identities and all values, and hashes UTF-8 JSON. Schema digest includes sorted sqlite_schema type/name/table/SQL definitions, excluding SQLite internal entries. Original identity/hash maps were compared privately; raw records/keys are omitted from this public summary.

### Archive checksums

| Phase | TAR bytes | SHA-256 |
| --- | --- | --- |
| Fresh pre-drill backup | 5413888 | 5c4b42140e6306805f9e739ac467d6c3e545b0448f055fd6cd2578a43787febd |
| Previous-version successful download | 5413888 | 2839bdbc9de3ff5fbb29d9a86475f4066e83dbfc71aa63202d37575a77d695f9 |
| Restored-current successful download | 5413888 | 8527e0348ff26612d77ea576ddf5cbf1dccc1f860fe206347d55ee79c133e679 |

Different TAR hashes are expected because each envelope has a new export time; schema, rows and original bytes match. Fresh private checkpoint Cookie_Catalog_Before_Rollback_20261014T201056Z.tar was retained separately before rollback. No payload or database is in GitHub. Two intermediate browser download paths did not materialize in the assistant workspace; standalone retries supplied the actual archives restored. Missing transfers were not treated as usable backups.

## Repeatable development drill

1. Keep catalog mutations/exports idle; record current source and app tree, live deployment, migrations, row/file evidence and a fresh trusted private backup. Restore the backup into a new local directory before changes.
2. Select a previously verified app with compatible schema. If provider-native rollback is unavailable, create a normal development commit using only that app subtree. Preserve current notes and data; use an expected-head lease and do not reset history or change main/production.
3. Wait for successful CI and actual Workers deployment. Refresh/sign in, attest the deployed commit, verify authenticated reads/a labelled test save and original retrieval, then export/restore and compare full schema/rows/originals with baseline.
4. Restore the saved current app subtree through a normal leased development commit. Wait for CI/deployment; repeat checks and comparisons, then record evidence.
5. Stop on a mismatch and preserve evidence; keep code rollback separate from schema/data/object recovery. Do not run destructive recovery or provisioning to make a code drill pass.

## Remaining gates

Read-only GitHub observations: main and development branches reported protected=false; repository rulesets were empty. CI workflow Schema smoke tests has job sqlite, covering schema/import, Node tests and type-check/build. Required-check/main-release safeguards are not configured or validated. No settings changed during this drill.

Intended desktop/mobile/browser acceptance, wife/collaborator roles, main-release approval, provider-native and production rollback remain open. CC-TODO-006 isolated Cloudflare D1/R2 restore, sync/retention/operational consistency remain open. Preserve deferred alternate-email testing and parked Windows remediation. See docs/evidence/Development_Rollback_20261014.json for sanitized machine-readable phase reports.
