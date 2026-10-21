# R2 reference and inventory UX — CC-TODO-021 / CC-TODO-010

## Current presentation continuation

The October 21 owner-authorized [Contextual Workspace batch](Contextual_Workspace_R2_1.md) refines the presentation and task flows on PR #7. The model, prior synthetic evidence and migration/recovery boundaries below remain intact. This does not award owner/Cris acceptance or activate 0005.

## Approval and boundaries — October 20, 2026 UTC

Owner approved this bounded implementation on `feature/cc-infrastructure-foundation` / open PR #7, including the established development deployment. Production, PR merges, originals/data migration, authentication changes, release automation and paid resources are excluded. This is Work/Codex execution under the unchanged Durable_CHATGPT v1.0.0 pin, not a new framework or feature track. Next unused IDs remain CC-TODO-025 / CC-DEC-023.

Restored feature head `912e0981c9ec4a1c2b7e8ce954561f29fd9433c8`, main `539ec6275c21eb72a70d6d1a41b34b53585f55f6`, production branch `62e92a16a1e32975ee6bc7f15679183120315411`. PR #7 was already open with merge conflicts against main before this work; no merge or conflict-resolution batch is implied. Main is protected; its required sqlite check, up-to-date PR and conversation rules remain in force. The feature branch is unprotected and is the existing development deployment source. `.github/workflows/schema-tests.yml` runs sqlite checks for feature pushes and PRs; Cloudflare Workers Builds uses root `app`, `npm run build`, `npx wrangler deploy` for **cookie-catalog-dev**. No trigger/configuration changes are made.

Main's operating-framework closeout remains accepted: CC-TODO-024 adoption complete; CC-TODO-001 partially verified, with the reported independent test's exact next-task subcriterion unverified. Do not repeat that closeout. Release engineering remains isolated in [draft PR #12](https://github.com/JBrickey23/Cookie_Catalog/pull/12), inspected head `09cfa8539f53ee0e01c9c2e6820df1c04a181bb2`; its later KISS approval/history is not superseded by older release text on this branch. Do not merge it or pull its unrelated implementation into this UX batch.

## Approved model and existing implementation

| Owner model | Existing representation / bounded change |
| --- | --- |
| One producer design per reference | Reuse `shapes.id`; descriptive name, maker/producer, source URL and notes remain editable. No universal shape-category parent. |
| Similar designs from different producers | Separate IDs, even with identical names. Creation rejects a normalized name + producer duplicate, with an atomic vocabulary guard. Distinct designs from the same producer should use distinguishable descriptive names. No automatic merge. |
| Physical inventory | Reuse `physical_cutters.shape_id`; zero or more inventory records per reference. |
| Interchangeable copies | Existing quantity field; independent records for different size, geometry, location or tracking. Optional color/material can be recorded in notes and do not force new identity. |
| Available reference sizes | Reuse `shape_size_variants`, displayed when present. Existing digital assets/size recipes remain unchanged. This slice does not add a size-library editor or infer sizes from images. |
| Reference photograph / digital files | Existing `shape_attachments` and printable assets; reference image normally depicts a finished/decorated cookie. Historical image content is not reclassified or moved. |
| Physical photograph | New additive `physical_cutter_attachments` links the original attachment to one physical record with enforced foreign keys. Other inventory records do not inherit it. |

Existing tags, dimensions, origin, BIN/location, Slot, guarded revisions, private attachment authentication, storage locks, maintenance gate, write-ahead record protection and Undo are reused. No original is converted, resized, deleted or relinked. CC-TODO-010's private inbox/queue remains separate: extraction, matching, camera station, scale tags, inferred dimensions/outlines, Canva and automated catalog submission are deferred.

## Implemented interaction

- **New reference** creates a producer design without claiming physical ownership. New-entry fields are immediately visible. **New physical cutter** offers a name/producer search with distinguishable producer labels or an explicit **Create a new reference** action, which explains its state and focuses Name.
- **Add to Inventory** is available from either type of Focus Card. It shows the selected reference and tags read-only and collects only physical fields and an optional photograph. The server rejects shared-reference/tag changes on that create path; its reference revision is preserved.
- Save opens the actual persisted reference or inventory in its normal Focus Card. Inline editing, dirty/busy navigation protection, private originals, image windows and download behavior remain available. **View shared reference** and **Associated inventory** connect records without changing search filters. The References filter includes designs that already have inventory; the default all-entry view retains its previous nonduplicated behavior. Search also matches producer.
- Physical/reference photographs have distinct labels. Photos are optional at creation and can also be added from the saved card. Upload is a separate operation after record creation: a failed/unconfirmed photo upload leaves the saved record open with a warning, rather than retrying creation. Review its file list before retrying an uncertain upload. Reference STL/3MF originals still use Private files.
- Invalid required fields, quantities, dimensions and source URLs show a highlighted field, actionable error and focus/scroll. Input stays in the draft. Source URLs require an explicit `http://` or `https://`; no prefix is inserted. A duplicate reference highlights Name and points back to existing-reference selection. Existing selected reference metadata is not rewritten when adding physical inventory.

## Schema, recovery and development activation

`database/migrations/0005_physical_photographs.sql` only adds the physical-photo junction; existing tables/rows/files are unchanged. Server photo reads remain compatible with pre-0005 databases and explain pending activation; attempted physical uploads fail before object/catalog writes. Saving inventory without a photograph does not depend on 0005.

The exact 23-table/five-migration profile is added to app snapshots, managed restore, offline Python restore/preparation, Node archive validation and regenerated backup-kit installer/checksum. Legacy 16/20/22-table profiles remain supported. Import setup and infrastructure checks recognize the new profile. Unknown/incomplete schemas still fail closed. The new FK also prevents deleting/Undo-removing a physical record while its photograph remains linked. Removing an original remains an explicit owner operation; this batch does not remove retained originals.

**Development activation is not automatic on a branch build.** Use the established authorized development D1 tooling, not production configuration. Inspect migration status and a protected, verified recovery copy first. Expected prerequisite: migrations 0001–0004 applied; the only pending migration must be 0005. From `app`, list with `npx wrangler d1 migrations list cookie-catalog-dev --remote --config wrangler.jsonc`; after verifying the exact development binding and recovery point, apply through the existing authorized workflow with `npx wrangler d1 migrations apply cookie-catalog-dev --remote --config wrangler.jsonc`. Stop if other migrations/schema drift appear or recovery cannot be verified. This worker has no authenticated Cloudflare CLI and does not claim remote activation. A development app session was subsequently established for synthetic UI checks; it does not grant dashboard/CLI migration access. Do not add credentials or change the build/deployment command to force it.

Refresh the backup tools before validating a new-profile archive. Preserve older backups. A code rollback must understand the new profile; an old binary/tool may refuse it. Do not drop the junction or restore data automatically to make an older build work. Production migration/transition requires its own approval and recovery review. CC-TODO-019 cloud backup stall remains unresolved; local archive tests do not establish cloud backup reliability or production readiness.

## Owner development walkthrough

Use [development](https://cookie-catalog-dev.j-brickey.workers.dev/) with synthetic names such as **TEST UX 20261020 Christmas Tree**; never alter existing catalog originals or real rows for this acceptance. Use two small, distinct synthetic PNGs for the finished cookie and actual cutter. Do not put real images/data in Git. Confirm the deployed commit and physical-photo activation before photograph acceptance.

1. Click **New reference**. Enter the test name and Maker **TEST Producer A**; leave source/files empty if desired. Save. Expect its normal Viewing Focus Card with inline **Change Name**, not a lingering creation form.
2. From that card choose **Add to Inventory**. Verify the selected name/producer/tags are read-only and only physical values can be entered. Enter origin Printed, quantity 1 and notes **Medium** with reference size 76.2 mm. Save. Expect the saved physical card.
3. Choose **Add to Inventory** again from that physical card. Record **Large**, reference size 101.6 mm, and any different location/Slot. Save. Use **View shared reference** and **Associated inventory**; both records must share the same reference ID and retain different physical IDs/sizes.
4. For an interchangeable pair, edit the appropriate physical card's Quantity to 2 and Save. Expect one record with quantity 2, not two references. Do not combine noninterchangeable sizes merely to increase quantity.
5. Create another reference with the same test name and Maker **TEST Producer B**. It must persist as a distinct reference. Attempt the same name + Producer A again; expect a duplicate warning with the draft preserved. Change the producer/name or select the existing reference explicitly.
6. Open Producer A's reference card and **Add finished-cookie reference photograph**, then **Save photograph**. Navigate to Medium and **Add physical cutter photograph** using a different test PNG. Verify distinct captions and exact original download links. Navigate to Large: the shared reference photograph remains visible, Medium's physical photo must not appear there. Refresh and verify persistence.
7. Create an inventory record with no photograph, STL or source URL. Save must succeed; physical ownership is recorded by that explicit action, not inferred from file presence.
8. In a new reference enter `example.test/tree` as Source link and save. Expect Source link highlighted/focused, with Name/Maker/other input retained and no record created. Enter `https://example.test/tree` or clear the optional URL and retry once. The saved URL must be exactly what was supplied, apart from surrounding whitespace.
9. After each creation verify Viewing opens immediately, the persistent record is loaded and fields show normal inline controls. Close/refresh/search and reopen to confirm it was saved. A photo warning must clearly say the record was saved even if its photo failed.
10. Search the quoted producer phrase (`"TEST Producer A"`), the test design name and an explicitly assigned tag. Use **All references / producer designs**, **Physical cutters**, shared-reference navigation and associated inventory. Confirm Producer B never merges with A and unsaved edits require confirmation before navigation.

Record actual commit, browser/device, test IDs and results. These steps are an owner acceptance checklist, not accepted browser evidence. Retain only synthetic fixtures or remove them later through approved normal controls; do not delete real originals to test recovery.

## Validation checkpoint

Automated evidence and exact remote publication/CI state are recorded in the closing checkpoint below. The cloud browser initially stopped at Access sign-in, then completed secure owner sign-in. The live development checks below supersede that initial blocker. No remote migration was executed. Owner acceptance and the blocked physical-photograph scenario remain pending; do not equate agent browser tests with owner acceptance.

### Local evidence before publication

- Full application regression: **180 passed**, no failures, including real Miniflare D1/R2 producer identity, quantity/size linkage, photo ownership, guarded mutations/Undo and same-profile managed restore.
- Final UI/selected-reference refinement: **33 focused tests passed**, including two additional creation/photo-caption interactions; TypeScript and frontend/Worker build passed. Exact-head CI must run the resulting **182-test** suite.
- Offline tools: **33 passed**; SQLite schema smoke, **11** recovery/preparation tests (including new-profile photo link/original recovery and Node archive validation), **3** OneNote audit tests and synthetic import passed. Legacy archive profiles remain covered.
- Documentation relative-link/JSON checks, policy manifest/digest verification and whitespace checks are required before publication.
- No production or cloud D1 migration/rehearsal, real catalog-row/original modification or credential provisioning performed. Only the synthetic development fixtures below were created. Remote commit/check/development-build evidence follows after publication.

### Remote/browser checkpoint — October 20, 2026 UTC

Implementation commit `41dab1bae685c67081fe40ee5a90de78e66a9e3b` was fetched back with tree `d512171078dc17ee6639f31bb77c9c96cc8ad954`. Cloudflare development build `1f88f615-46a7-4f38-9ccb-a319e8f1fe3f`, version `861ad1ee-2d02-4728-bd6c-f1689abec19d`, succeeded. Authenticated `/api/dev/infrastructure-check` independently attested that exact commit/branch; schema was 22 tables, migrations 0001–0004, supported, with zero FK violations. **0005 is not active.**

The initial sqlite run [39489334920](https://github.com/JBrickey23/Cookie_Catalog/actions/runs/39489334920) failed because the new Python recovery test invoked the Node 24 helper before CI's Node setup stage. No app deployment failure was inferred. Commit `e06d70bec4c2cb7fe1fcbf1e180027802d3f2100` moves that assertion into the Node-stage managed-backup test without changing workflows/triggers. [sqlite run 39490539899](https://github.com/JBrickey23/Cookie_Catalog/actions/runs/39490539899/job/118862213533) passed: **182 application tests**, 33 tooling tests, schema/11 recovery/3 audit/synthetic-import checks and build. Final browser-driven cleanup below adds one regression test; final exact-head CI must verify **183** app tests. PR #7's current check/description is the final-publication evidence; no merge is performed.

| Scenario | Actual live development evidence on the implementation (not owner acceptance) |
| --- | --- |
| New reference | Producer A and B's identically named Christmas Tree references persisted separately and opened normal Focus Cards. |
| New reference + physical record | Combined **New physical cutter → Create a new reference** created the Snowflake reference/inventory, with no source URL, images or digital files. Visible new-reference confirmation and saved normal Focus Card observed. |
| Medium / Large | 76.2 mm and 101.6 mm records share Producer A's Christmas Tree reference; both appeared in Associated inventory. |
| Quantity | Medium persisted as one inventory row with quantity 2; Large remained quantity 1. |
| Producer separation / duplicates | Reference filter exposed two different Tree IDs. Repeating name + Producer A was rejected; Name highlighted and input retained. |
| Photographs | Synthetic reference PNG uploaded and displayed as Reference photograph / digital file. Medium's physical PNG was explicitly rejected before upload because 0005 is absent. Distinct physical-photo rendering/persistence/isolation passed automated tests, **not live acceptance**. |
| Optional files | Both combined Snowflake and Medium/Large inventory saved without photograph/STL/source requirements. |
| Invalid URL | `example.test/tree` was retained unchanged, error highlighted Source link, actual focus moved to `inline-shape-source_url`; correction to `https://example.test/tree` saved. |
| Focus Card | Persisted records opened directly with normal Change controls, correct quantities/sizes and reference navigation. |
| Search / navigation | Name search and References filter found separate producer records; shared-reference/associated-inventory links navigated correctly. Quoted-producer/tag search and post-refresh checks belong to final verification/owner retest. |

Live testing found a workspace dirty-state cleanup bug after a failed photo draft was explicitly discarded: a later creation could prompt again. Fixed by clearing combined dirty/busy state when the focused panel unmounts; added a DOM interaction regression. Create buttons now visibly disable during a busy operation. Fresh valid references are labeled Producer reference rather than incorrectly requiring inventory review, and absent optional images are labeled No image attached. **21 focused browser-interaction/browse tests and type-check/Worker/frontend build passed** after this refinement. Final deployed cleanup retest is recorded in PR #7's closing checkpoint.

Retained synthetic fixtures only (do not recreate them blindly):

- Tree Producer A reference: `shape_dce00219f42f4bf98c2182f939f51446`.
- Tree Producer B reference: `shape_02ca2837be04465687684aafdc9092d7`.
- Medium quantity 2: `cutter_8086b08ab0bc48779a8db4a72e496b49`; Large quantity 1: `cutter_af0578d8044e43ca8217ff55dcb6630c`.
- Combined Snowflake reference: `shape_994664c521c34c50bbfa410abfd2b27f`; its physical record is discoverable by the same synthetic name.
- One synthetic `test-finished-cookie.png` original is retained on Producer A. The rejected physical PNG did not become an inventory attachment. No existing originals or real catalog rows were edited/deleted.

Remaining: verified recovery/development migration activation for 0005, live distinct physical-photo acceptance after activation, final owner acceptance on intended devices, pre-existing PR #7/main conflicts, and separately unresolved CC-TODO-019. Do not activate production, merge #7/#12, bypass authentication, or expand extraction/release scope to close these gaps. No additional product/identity decision is required for this slice; development migration access/recovery and owner retesting are the immediate continuation.

### Final source acceptance checkpoint

Source `f272e607ab0dc5e801598bf9faf01a82c556bf7d` passed [exact-head sqlite run 39491528241](https://github.com/JBrickey23/Cookie_Catalog/actions/runs/39491528241/job/118865645218): **183 application tests**, **33 tools**, schema, 11 offline recovery, 3 audit, synthetic import, documentation and TypeScript/frontend/Worker build, all passing. Cloudflare development build `b026a33c-b5a5-4a7d-bea6-f23a4a36e433` succeeded, version `26b40f4c-819b-43bc-93cd-4a54af51a3be`. Authenticated infrastructure readback matched the full source SHA/feature branch, reported zero FK violations, and confirmed 0005 still absent.

Actual Chrome development retest on that deployed source: full refresh retained the saved test records/reference PNG; quoted producer + tag-only search found the correct reference and both physical sizes. Selecting a physical-photo draft, confirming Close once, then starting New reference opened immediately with **no second dialog**. Medium quantity 2 and Large quantity 1 remained navigable from the same reference. The [synthetic-only Focus Card screenshot](evidence/Reference_Inventory_UX_20261020.jpg) shows the saved reference image, distinct producers, linked sizes, optional photo control and explicit pending-migration notice. No real rows/images or private identities appear in this evidence.

This closing documentation/evidence commit does not change the tested application source. Verify its own exact-head checks/build and branch state in PR #7 before continuing. Owner acceptance is still separate; the distinct physical-photograph live test is blocked until a verified recovery point and development migration activation. Production/main and draft #12 were independently read back unchanged. PR #7 remains open with its pre-existing main conflicts; neither PR was merged.
