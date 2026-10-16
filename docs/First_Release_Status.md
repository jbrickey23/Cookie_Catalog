# First release status — October 16, 2026, Pacific

**v0.1.0-rc.1 is implemented, tested and deployed to development. It has not been released to production.** This is the current release checklist; older chronological entries describe earlier states and do not reopen completed work.

## Verified checkpoint

- Application: `4ca1b1ddfff5745e037549ca5415cdc4bfc1efbe`, branch `feature/cc-infrastructure-foundation`.
- Source changes: `251bebd` retention/RC, `5606b23` layout polish, `4ca1b1d` compact remaining-record cards. `0fe7e40` records the earlier candidate acceptance.
- GitHub CI runs **38923760542 / 38923770340** both succeeded; rechecked October 16 at reconciliation. Workers Build **7571dbaa-043e-460c-a06e-24e1337497d5** succeeded; version **4ae028e7-05e6-4f88-ab0e-c63c9c45aa08**.
- The prior authenticated live check in this conversation matched `4ca1b1d` / `0.1.0-rc.1`, 22 tables, four migrations, zero foreign-key violations, and five sampled originals without missing/size mismatches. This reconciliation rechecks GitHub evidence; it does not claim a new live data/storage audit.
- Latest application suite: 141 tests; build/type-check, 28 helper tests, schema/synthetic import, eight Python recovery and three audit tests passed. Current-head CI includes the required checks. Documentation reconciliation changes no application code.
- PR #1 is open, draft and mergeable; main remains protected at `db3ffe8`. There is no application merge, final version tag or production deployment.

## Completed for this feature cut

| Area | Accepted behavior |
| --- | --- |
| Catalog/BIN | Photo-first search and paging; physical/digital status independent of assigned BIN; imported provenance preserved |
| Routine changes | Inline shape/physical create, edit and guarded delete; staged tags; small durable recovery records and reviewed Undo; no full-catalog pass on routine Save/Delete |
| Focused layout | Images above editable fields; heading/caption wrapping; compact nearby rows with thumbnail, name, BIN, quantity and View; four full cards plus part of a fifth observed in the cloud desktop viewport |
| Private files/imports | Private originals and retrieval, saved source-preserving reviews, classification and bounded guarded inventory import; real source/reference/photo import already completed |
| Recovery | Checked 592-original snapshot and read-only restore preview; existing local/isolated-cloud sample recovery, missing-file recovery and development code rollback evidence preserved |
| Backup retention | Usage visibility, reviewed resumable cleanup, shared-file preservation and protected-point acknowledgement; synthetic deletion/interruption tests passed; live view/protection review passed |
| Access/build | Existing owner and viewer acceptance, server role/origin guards, source/version reporting and required CI |

Existing snapshots remain retained. Last observed retention view: three checked snapshots, 46.6 MiB actual managed storage and 88.0 MiB conservative allowance used. These are prior observed values, not current capacity promises. No real backup removal, protection release or schedule activation was used as a test.

## Remaining steps, in order

| Order | Task | Who / completion evidence |
| --- | --- | --- |
| 1 | Target-device acceptance and any resulting layout fixes (004/014) | Owner on Windows Chrome, Windows Edge and iPhone Safari: record device/browser/version, readable layout, search/BIN, focused images, compact results, safe editing on an intended editing device and original download. Use synthetic/demo data for writes. Fix reported failures only; do not repeat every passed infrastructure drill. |
| 2 | Intended second-admin access and operational recovery (005) | Intended admin independently signs in and confirms the intended role/workflow. Confirm who can recover access; keep identifiers and credentials private. Existing owner/viewer passes do not prove this account. Parked alternate-email/login investigations stay parked. |
| 3 | Concrete production/cutover decision (004/006) | Prepare and approve exact separate Worker/D1/private R2/Access targets, supported initial users/devices, selected source/verified snapshot, data freeze/copy/readback, independent recovery copy and rollback responsibility. Production targets/credentials are currently unprovisioned or unattested. Preserve development bindings and data. |
| 4 | Provision and verify the approved production target | After authorization/access: apply reproducible migrations, configure private bindings/access, transfer approved records/originals with checksums, verify counts/FKs/original retrieval and access, and verify cutover/rollback evidence. Do not infer this from a development build labelled Production by Cloudflare. |
| 5 | Final first release | Resolve release findings; review PR #1, obtain the concrete release approval, set final version/tag as appropriate, merge through protected main and deploy only to the approved target. Record source, CI, deployment, data/recovery baseline and a short smoke result. |

Device/admin observations require the actual intended devices/accounts; the assistant cannot mark them passed from source rules or an existing owner session. No production provisioning, cost, access grant, cutover or merge/tag is authorized by this status update.

## Follow-up, not a reason to rebuild the candidate

- Further cosmetic refinement beyond reported release defects; broader design/mapping inline workflows and imported-identity reassignment policy.
- Independent off-provider backup automation and broader recovery/scale/MIME improvements. Preserve completed manual Windows/OneDrive-copy verification; the latest candidate snapshot's independent copy must be identified for actual cutover.
- Native OneNote integration, assisted image extraction, Canva/outline generation and geometry scaling beyond the existing slicer workflow.
- A history-independent fresh-chat continuity test remains unverified (001); this history-assisted reconciliation does not close it.

Continue existing task IDs; next unused is **CC-TODO-015**. Full component scope may remain open even when its first-release portion is accepted. See [candidate scope](Release_Candidate_v0.1.0.md), [device checklist](Device_Acceptance.md), [retention](Backup_Retention.md), [layout refinement](Layout_Refinement_20261016.md) and [deployment runbook](Deployment_Runbook.md).
