# R2 reference and inventory UX — CC-TODO-021 / CC-TODO-010

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

**Development activation is not automatic on a branch build.** Use the established authorized development D1 tooling, not production configuration. Inspect migration status and a protected, verified recovery copy first. Expected prerequisite: migrations 0001–0004 applied; the only pending migration must be 0005. From `app`, list with `npx wrangler d1 migrations list cookie-catalog-dev --remote --config wrangler.jsonc`; after verifying the exact development binding and recovery point, apply through the existing authorized workflow with `npx wrangler d1 migrations apply cookie-catalog-dev --remote --config wrangler.jsonc`. Stop if other migrations/schema drift appear or recovery cannot be verified. This worker has no authenticated Cloudflare CLI/session and does not claim remote activation. Do not add credentials or change the build/deployment command to force it.

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

Automated evidence and exact remote publication/CI state are recorded in the closing checkpoint below. The actual cloud browser reached **Log in to Cookie Catalog Dev** on October 20; no authenticated UX interaction or remote migration was executed. All ten live scenarios and owner acceptance therefore remain pending. Do not label a build or DOM interaction test as live browser success.

### Local evidence before publication

- Full application regression: **180 passed**, no failures, including real Miniflare D1/R2 producer identity, quantity/size linkage, photo ownership, guarded mutations/Undo and same-profile managed restore.
- Final UI/selected-reference refinement: **33 focused tests passed**, including two additional creation/photo-caption interactions; TypeScript and frontend/Worker build passed. Exact-head CI must run the resulting **182-test** suite.
- Offline tools: **33 passed**; SQLite schema smoke, **11** recovery/preparation tests (including new-profile photo link/original recovery and Node archive validation), **3** OneNote audit tests and synthetic import passed. Legacy archive profiles remain covered.
- Documentation relative-link/JSON checks, policy manifest/digest verification and whitespace checks are required before publication.
- No production or cloud D1 migration/rehearsal, live-data write or credential provisioning performed. Remote commit/check/development-build evidence follows after publication.
