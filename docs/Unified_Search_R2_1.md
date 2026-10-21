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
