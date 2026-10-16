# Cookie Catalog v0.1.0 — first feature release candidate

Candidate package version: **0.1.0-rc.1**. This is a private development candidate, not an approved production deployment. GitHub PR #1 is the review vehicle for the first application release into protected main. GitHub remains canonical; real catalog data and originals remain private.

Current reconciliation and ordered remaining work: [First release status](First_Release_Status.md). Latest application head is `4ca1b1d`; its CI/deployment and compact-card visual acceptance passed. Earlier `251bebd` evidence below remains the accepted retention baseline.

## Included in this first cut

- Photo-first catalog search, BIN lookup, paging and responsive focused details with images above editable values.
- Inline create/read/update/guarded-delete for shape references and physical inventory, staged managed tags, explicit BIN overrides and preserved OneNote provenance.
- Quick routine Save/Delete with small recovery records; owner-reviewed field-by-field Undo with conflict, relationship and permission checks.
- Private original upload/retrieval and source-preserving saved import reviews, quick Physical/Digital/Both classification and guarded bounded inventory import.
- One-click full backup, opt-in daily fresh snapshots, checked 592-original development acceptance, reviewed whole-catalog restore and interrupted-operation recovery.
- Storage usage, reviewed retention cleanup, default recommendation to keep seven normal snapshots, protected recovery points, explicit protection release, shared-object preservation and resumable approved reclamation.
- Owner/admin, editor and viewer controls; same-origin write guards; optimistic revisions and atomic SQL; recorded deployment source and reproducible validation.

## Evidence for the candidate

Baseline application and synthetic recovery validation passed before retention work: 135 app tests; routine create/edit/delete and record Undo passed live around one second; a full snapshot checked 592 originals and its read-only restore preview passed. See [fast editing](evidence/Fast_Inline_Acceptance_20261016.json) and [full snapshot](evidence/Managed_Backup_Acceptance_20261016.json).

The retention candidate passes 141 application tests and build/type-check locally. Tests cover kept/shared originals, normal/protected/latest points, approval, changed previews, incomplete snapshots, concurrent backup/import/restore exclusion, interruption after deletion, idempotent resumption, rejected storage leases, and ordinary editing remaining available during cleanup. No real backup is removed to establish these tests. Development source `251bebda01dc4a5337200d9702619b6f06d4c371` passed push/PR CI (38855813166 / 38855816581), Workers build and an authenticated exact-source report. Live storage/protection views passed: 46.6 MiB, three checked 592-original snapshots, all protected selections disabled, and protection-release acknowledgement required. All three points were preserved; no eligible cleanup preview or real deletion was forced for acceptance. See [candidate evidence](evidence/Retention_Release_Candidate_20261016.json) and [infrastructure report](evidence/Infrastructure_20261016_v010rc1.json).

SQLite schema/import, eight Python recovery tests, three audit tests and 28 offline backup-helper checks also passed locally and in CI. Candidate changes add no schema migration, dependency, external resource, paid plan, automatic pruning or schedule activation.

## Production decision still required

The current live URL is the existing development Worker/D1/private R2/Access environment. The approved architecture requires separate production Worker, D1, private R2 and Access configuration with explicit credentials and release/rollback mapping. These production resources are not provisioned or attested by this candidate. The earlier Cloudflare dashboard login restriction and alternate-email investigation remain parked. Do not turn the existing development environment into production by renaming it or silently changing its bindings.

Actual intended-device targets remain Windows Chrome and Microsoft Edge. Cloud browser checks and responsive source rules are not a substitute for recording those owner-device outcomes. A second intended admin's independent sign-in and operational account recovery also remain to be accepted. The [device checklist](Device_Acceptance.md) retains exact outcomes rather than asking the owner to rerun every infrastructure test.

A production approval should name the supported initial devices/users and authorize a concrete production target/data-cutover plan after these gaps are settled. No production deployment, application merge/tag or live whole-catalog restore is performed by this candidate build. Main remains protected; PR #1 stays a concrete reviewable candidate until the release decision.

## Refinement after the cut

Requested compact card density and focused heading/caption/touch-control spacing refinements are deployed and visually checked in cloud desktop. Further spacing, mobile comfort and admin-panel organization can be refined without rebuilding storage or slowing routine edits. Broader design/mapping inline editing, STL scaling/outline generation, independent off-provider backup automation and broader operational recovery remain follow-up scope. Slicer remains the v1 geometry scale tool.

## Rollback and durability

Retain the previously verified development application head and the checked complete snapshots. Routine record Undo is distinct from application rollback and whole-catalog disaster recovery. Review cleanup never removes live originals, catalog records, record Undo history, the newest verified normal snapshot or the newest verified recovery point. Protected pre-change points require verified-change acknowledgement and another newer checked point before their protection can be released; they still need separate cleanup approval afterward. No real cleanup or protected-point release is used as an unapproved smoke test.
