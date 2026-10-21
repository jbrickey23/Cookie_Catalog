# R2.1 Unified Search & Design Details — CC-TODO-021 / CC-TODO-010

## Assessment and approved scope — October 21, 2026 Pacific

Owner's new implementation handoff approves one producer-specific result per stable `shapes.id`, one Search with plain ownership filters, design-centered details/gallery and retained Add/workspace safeguards. The owner reports that adding physical cutters (quantity/size/location), saving designs without inventory, existing-design selection and workspace separation function satisfactorily. Record that narrow owner-reported acceptance; no independent Cris or full R2.1 pass is inferred. The earlier [Contextual Workspace evidence](Contextual_Workspace_R2_1.md) remains history.

At initialization PR #7 is open/unmerged at `e52aabcd525aa03e597ed97eef00ddb910eb3594`, required sqlite/development checks passed. Draft #12 remains `09cfa8539f53ee0e01c9c2e6820df1c04a181bb2`; unmerged #14 remains `aa3b68543aea2ec5eef06f47f137fc09427d8081`. All have existing merge conflicts; this UX batch does not merge/rebase them. Main/R1 refs remain unchanged. Pinned v1.0.0 policy digests match, no exceptions or AGENTS.md. Feature pushes use the approved existing development workflow; migrations are not activated by deployment.

## Smallest coherent change (recorded before implementation)

| Existing capability | Change / reuse |
| --- | --- |
| `server/browse.ts` physical rows + reference-only UNION | Query `shapes` once; use EXISTS for physical ownership, tags, assigned locations and linked decorating names/tags. Apply count/pagination to designs, never joined multiplicity. Keep bounded literal AND/phrase search and Reset. |
| Browse / CutterCard / MasterDetailWorkspace | One Search plus Add Something; plain All designs / In my collection / Saved designs filter. Cards show image/name/producer/status only, optional image navigation must not activate card selection. Retain dirty/busy checks and mounted results. |
| CutterDetails / EntryEditor / RecordPhotos | Design header/gallery, My cutters with sizes/count/location, existing guarded physical editor and return to design, then expandable source/tags/notes/files. Existing Add, validation, revisions, maintenance and photo outcome handling reused. |
| Existing attachment GET / shape and design junctions | Read associated images without duplicating or moving originals. Explicit existing decorating compatibility links may contribute images/search text, labeled proposed/tested; images alone never create a decorating record or compatibility claim. |
| Existing inventory GET | Add location/origin to its bounded read so physical summaries do not require write APIs or one record request per summary. |

## Preferred-image persistence boundary

Verified executable migrations and attachment/workspace/catalog handlers contain **no preferred/default image relationship or mutation**. Shape/design attachment `purpose` is generic photo/original intent; it neither selects a preferred image nor certifies finished-cookie subject matter. Filenames and creation order do not establish that an image depicts a finished cookie. Existing attachment GET sorts creation time/ID. No gallery/default control has previously been implemented.

Within authorization: show one prominent associated producer-design image, prefer existing `purpose=photo` to other image-purpose metadata, then stable creation time/ID. No image is honestly labeled a verified finished cookie from filename alone. No image/digital-only record establishes ownership. Additional shape images are browseable; explicitly linked decorating images are viewable with compatibility provenance in details. Original image associations remain intact. Temporary gallery position is not a persisted default.

**Deferred for owner approval:** persistent “Set as default image”. Smallest proposed model change: an optional attachment ID on `shapes`, checked by the server to be an existing permitted image associated with that producer design. It would require a separately reviewed migration, revision-guarded editing/recovery support, archive/profile/restore compatibility and safe activation/rollback evidence before enabling a control. Do not overload notes, timestamps, filenames or attachment purpose, create browser-local fake defaults, add a write API or activate DDL here. No dead-end Set default button is offered.

## Decorating-design promotion — future only

A photograph remains an image unless an independently useful decorating concept needs reusable artwork/instructions/sizing/compatibility. A future explicit Create decorating design action may create that record, associate the existing attachment without losing its original gallery association and optionally link cutter designs as **proposed/unverified** until tested. Search would still return producer cutter cards via explicit links, not a second top-level decorating card. No promotion implementation, schema change, compatibility inference, Cookie Sets, 0005 activation or release work is included.

## Validation and handoff

Implementation, local/remote validation, attested development deployment and agent browser smoke are recorded below as completed. Owner search/details/images/edit-and-return retesting precedes Cris's independent uncoached walkthrough. Preserve CC-TODO-019 and CC-TODO-023. Keep reserved 025, next unused task 026 / decision 023; no new ID needed for this refinement.

## Implemented behavior and validation before publication

- Browse now starts at Search, with one Search/Add Something task bar and All designs / In my collection / Saved designs. No separate Find/My Cutters system. Default cards omit quantity, location, dimensions, IDs and physical/reference labels; those belong under My cutters in details.
- Design rows are counted/paged before related data is rendered. EXISTS matches preserve AND/quoted phrases across producer/name/shape tags, current/imported BINs and explicitly linked decorating names/tags. Legacy read-only `kind` query aliases resolve to this same producer-design query; they do not retain a second result implementation.
- Ownership counts actual physical records, including a recorded zero quantity; zero availability is visible in cutter details, never inferred from images/files. Explicit unknown/review status remains understandable; known not-owned/not-printed designs with no records are Saved design. The ownership filters select actual record existence, and uncertain records retain review labels.
- Cards offer restrained image arrows only when multiple direct associated images exist. Image controls stop propagation and do not select the card. Details expose existing linked decorating images with proposed/tested provenance, deduplicated by original attachment ID. No image is promoted into a new decorating record. Missing originals remain associated and display unavailable; originals are not relocated or rewritten.
- My cutters shows recorded size, quantity and assigned/inherited location, opens the existing guarded editor, and returns to the same producer design/results. Save/cancel/revision/maintenance/draft guards and Issue #13 remain. Physical photographs stay on the selected physical record and remain migration-0005-gated in development. Existing Add forms and write handlers were reused, not reimplemented.
- Editing, image browsing and context changes preserve drafts or require explicit discard. Result scroll stays mounted. Switching between design and cutter clears stale contextual help and focuses the selected context. A root photo upload refreshes gallery data without remounting an unrelated unsaved design editor.

Local validation: **192/192 application tests passed** in a serialized run (`--test-concurrency=1 --test-force-exit`); no assertion was skipped. Thirty focused query/workspace/editor/gallery interactions passed, with the three new detail/gallery tests rerun after focus cleanup. TypeScript/production build, schema smoke, 11 restore-helper tests, 3 source-audit tests, synthetic import and 33 tooling tests passed. No schema, auth, write handler, workflow, dependency, production configuration or pinned policy change. This is local evidence; exact-head CI, cloud build, runtime source and actual browser smoke are separate records below.

## Owner retest — new candidate, pending

Use synthetic `TEST UX 20261020 Christmas Tree` references (Producer A and Producer B) or clearly named TEST records; do not change production or real originals.

- [ ] Search Christmas Tree: one card per producer, regardless of A's sizes/copies/images. Names/producers/statuses suffice without physical/reference terminology. Filter All / In my collection / Saved designs; Reset restores the same unified catalog.
- [ ] Open Producer A: images/decorating ideas, then My cutters with size/quantity/location. Open each physical record, edit one field, Save, return to design and results. Other shared and physical values remain intact.
- [ ] Open Producer B: Saved design and clear Add a cutter action, no inferred ownership from any image or digital file.
- [ ] Browse image arrows on a card without selecting it; select the card separately. Browse detail images, check image-window/original links and missing-image fallback. Permanent default selection is not implemented; assess the proposed persistence change separately.
- [ ] Unsaved edit → try another cutter/design/results: cancel discard and keep draft; explicitly discard or Cancel as appropriate. Switch workspaces and return without losing draft. Check keyboard/mouse/touch behavior on intended devices.
- [ ] Briefly confirm the previously owner-accepted Add paths remain satisfactory: existing/new design physical Add with quantity/size/location, design-only Save, optional files, explicit URL validation, workspace separation and help dwell/focus/Escape.

Record date/device/source and friction; do not infer acceptance from this checklist. After owner confirmation, Cris independently performs uncoached Search → Results → Details and ordinary Add/edit/return tasks. CC-TODO-019, CC-TODO-023 and safe 0005 recovery/activation remain separate release prerequisites. No production readiness is claimed.

## Verified development delivery — October 21, 2026 Pacific

Implementation **`8784ed9c039bfa1df1fa86a11f7d49df709ef614`**, tree `6f5958661d549a063b40fc91de029efa485e82ba`, passed [exact-head required CI](https://github.com/JBrickey23/Cookie_Catalog/actions/runs/39655237361/job/119413628284) (192 application / 33 tooling) and development build `505b876c-6739-4a24-9de5-ec28c7a28408`. Initial live smoke found that uploaded images appeared in details but the cached result-card image count needed Refresh. This was corrected, not waived.

Final application **`0b62c593829e276b1dfd5192c90926be62725635`**, tree `a50a1f8d2e26bd9c65fa03aee5e35ad6a18931be`, adds a photo-success metadata refresh and focused draft-preservation regression. [Required CI](https://github.com/JBrickey23/Cookie_Catalog/actions/runs/39655833982/job/119415700082) passed **193/193 application tests, 33/33 tooling**, schema/restore/audit/synthetic import, 67 Markdown/link/docs-JSON checks and TypeScript/build. Four focused detail/gallery tests and build also passed locally after the fix; the earlier complete local integration pass was 192 cases, not a claimed 193-case local run. Development build **`e3928141-260d-4d4f-b845-1a8d2dc9d110`** passed. The authenticated running infrastructure endpoint independently attested full `0b62c593829e276b1dfd5192c90926be62725635`, branch `feature/cc-infrastructure-foundation`, source `cloudflare-workers-builds`, checks passed and only migrations 0001–0004. No 0005 activation.

Both remote trees matched their local trees exactly, fetched checkouts were clean, and branch updates used expected-head leases. The closing documentation/evidence commit has unchanged application source; its own final-head CI/build/runtime attestation is recorded on PR #7 to avoid a self-referential commit loop.

### Actual Chrome development smoke

| Check | Observed evidence / limit |
| --- | --- |
| Unified results | TEST UX 20261020 Christmas Tree returns exactly 2 cards: TEST Producer A and TEST Producer B. A's 85/76.2/101.6 mm physical records and 4 images do not multiply its card. [Actual synthetic-only search screenshot](evidence/Unified_Search_20261021.jpg). |
| Ownership filters and saved design | In my collection returns only A; Saved designs only B. Opening B shows Saved design, no recorded cutters and Add a cutter. No image/file inference. Unknown/review and linked decorating text are additionally proven in isolated D1 tests, not newly claimed as live cloud acceptance. |
| Design details / gallery | A shows design images, then My cutters with sizes, quantity and assigned/inherited location. Existing synthetic original retained; 3 distinct tiny invented green/gold/blue PNG test swatches were added through the existing photo uploader. Detail navigation showed image 2/3 and 3/3 before the final fourth image; card navigation changed images without selecting a card. No decorating record was automatically created. |
| Upload-refresh regression | On exact final application `0b62c59`, a fourth image upload preserved unsaved name `TEST UNSAVED GALLERY NAME`. That name draft was canceled, not saved. Returning to results immediately showed 1 / 4 and exactly two producer cards, without Refresh. The original default fallback remained the existing synthetic cookie image. |
| Edit / cancel / return | Opened A's 76.2 mm record, staged quantity 7, dismissed the discard confirmation and retained it; Cancel restored 2. Saved 3 and read back unchanged shared name and 76.2 mm size, then saved 2 to restore the synthetic baseline. Returned through design details to the same two results. No real record was edited. |
| Retained Add flows | Saved new TEST UNIFIED 20261021 Star / TEST Unified Producer without physical inventory or optional files; normal persisted design showed Saved design. Then I have a cutter → searched/selected that existing design read-only → saved quantity 2, size 50.8 mm and existing TEST Infrastructure 20261014 Shelf. Persisted physical details opened and values read back correctly. |
| Workspaces / help / drafts | A temporary quantity 3 on the new synthetic cutter survived Administration → Catalog, immediate keyboard Quantity help and Escape. Cancel restored 2. An immediate scripted Cancel → Search once encountered a conservative discard confirmation while dirty notifications settled; dismissed it, then settled navigation succeeded. No draft/data loss; owner should assess rapid mouse/keyboard friction. Pointer dwell itself remains deterministic automated coverage and prior Issue #13 behavior. |
| Limits | Cloud Chrome agent smoke is not owner or independent Cris acceptance. No new live linked-decorating relationship, physical-photo success, production readiness, device/touch certification, backup root-cause fix or operational recovery acceptance is inferred. Original download/image-window contracts are regression-tested; no new live download proof is claimed. |

Synthetic fixtures retained for owner retesting: existing A `shape_dce00219f42f4bf98c2182f939f51446`, existing B `shape_02ca2837be04465687684aafdc9092d7`, new Star `shape_09491b804ecf47fcb8b08c716ed6c4f5` (search TEST UNIFIED 20261021). The new Star has one physical record, quantity 2 / 50.8 mm / TEST shelf. Existing test-cookie image and all real originals remain in place. New swatches are deliberately invented test images, not claims of actual cutters or finished-cookie content. No backup/restore/cleanup/schedule/import/release/credential/resource operation or production write was performed.

## Concrete preferred-image proposal for a separate approval

Proposed engineering scope only, **not implemented/activated**:

1. Add nullable `shapes.preferred_image_id` referencing an existing attachment. Initially permit only a supported image already directly associated through `shape_attachments`; a linked decorating-only image would need an explicit association decision, never silent cloning or compatibility inference.
2. Extend the existing revision-guarded shape edit contract for authorized editors to select/clear it; no new service/role needed. Validate the association/media type on the server and retain every original/association. Invalid/missing selection falls back honestly; associated file removal needs defined pointer-clearing behavior.
3. Extend exact-column archive/profile/import/restore and record Undo coverage together. Prove old profiles initialize the value to null, new profiles restore the exact selection and files, conflicting/stale choices preserve drafts, and rollback uses compatible code. Do not call a column addition operationally safe merely because it is nullable.
4. Review migration ordering independently of prepared, unactivated 0005. Engineering approval must not silently authorize 0005, cloud activation, production, or a release. Prepare the exact target/recovery/rollback activation checklist for separate operational authorization.

Immediate next owner actions: retest the new Search → Results → Details and edit/return checklist, decide whether to approve this bounded preferred-image engineering proposal, and only after functional readiness invite Cris's independent uncoached test. Keep 019/023 and photo/release prerequisites open. No new ID allocated; 025 remains reserved by unmerged #14, next unused task 026 / decision 023.
