# R2.1 front-of-catalog correction and Cris retest

## Current development candidate — November 17, 2026 Pacific

Use the [consolidated implementation and Cris checklist](R2_1_UX_Consolidation.md#implementation-and-verification). The owner confirmed mouse Back on the earlier `42b4dc6` build. The earlier checkpoints below retain their historical scope.


## Native browser Back/Forward — November 17, 2026

Owner observation against `28b8136`: using the browser Back action (including the mouse Back binding) does nothing from design details. This is not a request to remap mouse buttons. Source inspection confirmed only component state changed; opening a design did not push history and Browse had no popstate restoration. Owner explicitly requires default browser behavior. This bounded correction stays under 021/010 on existing PR #7, with development-only publication.

- `useCatalogHistory` records a native session-history entry when opening a different design. `?design=` / optional `cutter=` identify the selected view. Native Back/Forward restores the selected design or results plus search/query, ownership filter, demonstration toggle, page and recorded result/document position. Return focus uses the originating card when present. Search typing alone does not add history or cause per-keystroke history writes. Search/filter changes update the current catalog entry; this is scoped design navigation, not a new global tab/search router.
- **Back to results** traverses to the associated results entry without pushing a duplicate or repeatedly trapping Back in the detail. Direct links lacking that entry close to results in place instead of navigating off site. Existing link modifier/new-tab behavior remains. Reload/remount restores the recorded view; any startup canonical-record read is canceled for navigation so a late response cannot reopen the departed design.
- Reuse the existing dirty/busy guard. Native popstate occurs after traversal; on refused discard or busy save, return the history position to the current entry while keeping the same draft DOM, without a second confirmation loop. Explicit discard may navigate; clean Back/Forward does not mutate data. Existing beforeunload draft protection still handles full-document exits. Pending listeners are removed on unmount. Snapshots contain catalog navigation metadata, never editor drafts, upload files, credentials or write replay instructions.
- No new dependency, persistence, API/schema, role/Access change, migration activation or application-wide navigation replacement. These changes do not expand into unrelated Add, Sets, release, backup or PR conflict work.

**Evidence:** full local application run **217/217**, tooling **33/33**, schema smoke, **11 restore / 3 audit** checks, synthetic import, documentation links/JSON and TypeScript/Vite build pass. Final four focused history interactions pass after focus and bounded-history-write refinements. Coverage exercises actual jsdom history traversal rather than manually calling the popstate handler: Back/Forward, query/filter/page/position and focus, multiple designs, duplicate-entry prevention, dirty detail and result drafts, refusal URL restoration, busy delayed save, direct links/remount, delayed link reads, and unmount cleanup. Older interaction tests now isolate history per test and await asynchronous traversal. Failed initial test queries/timing assumptions were corrected; no failed run is acceptance. Exact final-source CI/build/version IDs are recorded on PR #7 after remote verification.

**Browser limitation:** one attempt to connect returned **Browser control was not allowed**. No device/Access workaround, credential change, live TEST write or synthetic pass is claimed. Actual browser/mouse behavior, scroll/layout/device rendering and authenticated running-source attestation remain unverified. Prior owner/Cris evidence is unchanged.

**Owner retest (development):** refresh to the new build; search and filter, open a design; use the normal browser/mouse Back action and confirm the same results/page/position; Forward reopens the design. Repeat design A → design B → Back/Forward. Use Back to results and then Forward. Stage a synthetic TEST edit, try Back, decline discard and confirm draft/view/URL remain; explicitly discard and confirm return. Never use real originals for testing. No production/merge/migration authorization is implied. Existing 0005/019/023, independent Cris/narrow-browser, preferred-image and #12 gates remain open.

Platform semantics checked against [MDN History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API), [popstate](https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event), and [go](https://developer.mozilla.org/en-US/docs/Web/API/History/go). Documentation semantics are not evidence of live Cookie_Catalog acceptance.

## Thumbnail and inline-table correction — November 17, 2026

**Owner feedback, not new acceptance:** screenshots of the development result show a one-at-a-time photo carousel rather than exposed thumbnails, the old My cutters heading, and reference fields hidden behind Additional details/source disclosures. Owner authorizes the correction and existing development publication under 021/010. Baseline feature head `2e65b337b8cec9adf11732d272899d76b2f93899`; main stays `539ec6275c21eb72a70d6d1a41b34b53585f55f6`. No conflict resolution, merge, production or migration activation.

- Result cards show every design/reference and associated physical photo together, reference first, as a wrapping thumbnail strip. Reuse **ImageWindowLink** (`target=_blank`, existing authenticated read-only image-window route and popup behavior). Alt/title retain photograph kind and filename for recognition/accessibility; filenames/captions/download-original links, Previous/Next image buttons and image counters are removed from results. Missing/unavailable images keep an accessible linked fallback.
- Reuse the existing read-only 200-photo pagination behind the scenes, accumulating/deduplicating all pages without user-operated pagination. Stop on unmount, non-increasing/invalid cursors or existing 100000-offset boundary; report partial-load errors rather than claim all images loaded. No new API or storage semantics.
- Inventory heading is **Cutters in Inventory** in results and opened details. Keep exact cutter/BIN hyperlinks and conditional Add Cutter behavior.
- The card center/green area contains an always-visible table: **Name, Producer, Link, Notes**. EntryEditor's new compact presentation reuses the **same** validation, conditional PUT, opened revision, record protection, maintenance guard, Save/Cancel and conflict-draft behavior. Four rows, no disclosures. Original tags/provenance remain in the existing guarded payload; no new model or mutation endpoint. Card form IDs are unique per reference. Existing field help uses the original registry labels despite the simpler visible labels.
- The representative left image remains an accessible link to design details. Saving the inline table updates that result in place instead of navigating away or reloading all results. Other cards' drafts remain. Current query membership is reevaluated on the existing guarded search/Refresh, not by silently dropping an edited card during Save.
- Stable per-card dirty/busy registration extends the existing search/filter/reset/page/design-navigation guard: do not discard during a save; require explicit confirmation before replacing dirty card results. Refusal preserves drafts. Confirmed discard resets the affected result editors. Do not recreate callback identities that transiently clear another card's dirty registration. Reference editing in the remaining result column is read-only while another detail/new-entry workflow is open.
- The opened design's former Additional details wrapper is an inline section; its Source link and design notes and Tags disclosures are also flattened, keeping editing, tags, deletion and photo-upload functions. Unrelated physical/form/search disclosures are unchanged. No preferred-image feature, photo upload/schema activation, authorization, workflow/configuration or dependency change.

**Validation:** focused interactions cover simultaneous thumbnail visibility, new-window links/fallbacks, automatic additional-page loading/no photo controls, inventory label/links, four visible editable rows, URL feedback/focus, revision-conflict draft retention, successful Save/Cancel preserving tags, saving one result without losing another draft, and guarded search/reset/design navigation. Existing grouped-producer, physical Add/edit, imperial, help, role and recovery regressions remain required. Local validation passed: 213 application tests, 33 tooling tests, schema smoke, 11 restore checks, 3 OneNote audit checks, synthetic import, TypeScript and Vite build. Remote CI and development build IDs are recorded on PR #7 after completion; failed assertions are not acceptance. Actual authenticated browser/layout/window verification is **not performed for this correction**; the previous Access sign-in blockage is not retried in a loop or converted into a pass.

**Owner retest:** in development, confirm all photo thumbnails are visible together with no photo caption/download/carousel controls; open each in its own image window. Confirm **Cutters in Inventory** and exact BIN links. Click a Name/Producer/Link/Notes value in the center table, edit and Save without leaving results. Stage changes in a second card and ensure saving the first preserves them; Cancel and decline a search/navigation discard. Check the opened design has no collapsed reference-details/source/Tags sections. Repeat at a narrow window. Use synthetic TEST data only; do not activate 0005. Owner/Cris acceptance, independent measurements, production/merge readiness and 019/023 remain open.

The November 16 carousel description below is historical and superseded for the **result cards** by this correction. Full galleries in opened image/details workflows retain their established behavior.


November 16, 2026 Pacific. Existing CC-TODO-021 / CC-TODO-010, PR #7 on `feature/cc-infrastructure-foundation`. New owner-authorized implementation, validation, reconciliation and existing **development-only** deployment. The owner separately approved distinct Admin after the permission audit. No production, PR merge, existing documentation conflict resolution, migration activation, credential provisioning or real-data test authority.

## Restored state and preserved evidence

Captured main `539ec6275c21eb72a70d6d1a41b34b53585f55f6`, PR #7 `3ab43dd9610708d244147536a8e6e9677a96d537`, separate draft #12 `09cfa8539f53ee0e01c9c2e6820df1c04a181bb2`, unmerged #14 `aa3b68543aea2ec5eef06f47f137fc09427d8081`. Refresh before publication. Pinned v1.0.0 manifest and both policies matched the authority at `53aa39ccedce935a702f44072cc647231c8cc02e`; no exception or policy redesign.

Owner's October 22 six-check selected-design/help PASS remains accepted, with 1200 ms dwell acceptable/nonblocking and Issue #13 closed. Its prepared acceptance/assessment commit `06c1a0aa41fd7fa1ae31a96e825d1fd1ea7ef56f` had not advanced the branch. This batch carries its eight-file documentation **content** forward explicitly, with the new checkpoint above the historical no-deployment limitation. It does not merge that commit's ancestry or resolve main's five conflicts. No duplicate task/decision IDs; 025 reserved, next unused task 026 / decision 023.

## Changes and trust boundaries

### Measurements

Central `measurements.ts` supplies formatting, decimal/mixed-fraction parsing and unchanged-value preservation. The UI accepts `2.5`, `.5`, `1/8`, `2 1/2` and `2-1/2` inches. Blank remains unknown. Reject invalid, zero/negative/nonfinite and excessive dimensions with retained input and field feedback. API keys and canonical millimeter values/schema are unchanged. Quantity and rotation are not dimensions and are not converted.

EntryEditor keeps the original metric snapshot; an unchanged displayed value reuses the exact original number, rather than converting rounded inches back. Dirty comparison normalizes payloads so reverting quantity or a measurement clears the pending state. Fractional/new values convert once on Save. Catalog advanced records use the same helpers and original snapshots. ImportReview uses the shared inch input, keeping invalid local text visible and invalidating the staged measurement rather than silently retaining the previous value. Labels/help, reference sizes, inventory details, import preview, advanced matching displays and authored diagnostic dimensions use inches. Original source notes, filenames, documents and evidence are preserved, not rewritten as normalized measurements.

### Permissions and Admin page

Reuse verified Access identity and private `CATALOG_MEMBERS`; add distinct `admin`, keep catalog `owner`, preserve legacy `editor` without an automatic grant, and keep `viewer` read-only. The bootstrap `OWNER_EMAIL` identity resolves to Admin, retaining administrative recovery. Explicit role assignments in the private map are never inferred from names, headers or JWT custom claims. **No private assignments or Access/secret configuration changed.** Configured existing `owner` entries now have catalog Owner capabilities; anyone intended as an additional Admin requires the owner's private explicit `admin` assignment.

| Capability | Viewer | Owner | Admin |
| --- | --- | --- | --- |
| Search/read/download | Yes | Yes | Yes |
| Catalog create/update/delete | No | Yes | Yes |
| Ordinary record Undo | No | Yes | Yes |
| Backup/restore/archive/cleanup | No | No | Yes |
| Operational diagnostics/release control/request reconciliation | No | No | Yes |

The separate `/api/admin` page is served only after server verification of Admin, before reading assets. Every protected API still enforces its own role, method/origin and maintenance/revision gates. Root catalog shows no technical operation panels. Owner keeps legitimate catalog work in **Catalog tools** (locations, advanced catalog records, source/review/file work, inbox and ordinary record Undo). Automatic per-change recovery copies/checkpoints remain implementation safeguards, not an administrative backup/restore interface. Legacy editor retains prior create/update scope; no new delete/admin authority. No login system, Cloudflare trigger/configuration change or migration.

If a private member is separately changed to `admin`, review that config before a code rollback: the previous version rejects `admin` map entries. The bootstrap administrative recovery identity retains access across code versions. Do not alter private roles as part of a rollback without approval.

### Search, result cards and photos

Remove the redundant global Search navigation and Add Something button; keep the actual search input/submission, Reset, ownership filtering, pagination and keyboard operation. Rename Show to **Filter** immediately after the input in the same row.

Reuse `CutterCard`, `BrowseItem`, existing search, inventory relationships, guarded EntryEditor and ImageGallery. Desktop results follow the owner's attached placement: representative design image left; name/producer center; inventory top right; photographs lower left. Producer fallback is **Producer: Not recorded**. Design name is a keyboard-accessible details link, replacing the redundant View button; no result ownership badge or Edit button. Each physical record remains separate and its cutter name and prominent BIN are links to the exact physical record. Direct links carry stable design/cutter IDs; reads verify their relationship. When the count is zero, authorized editors see **Add Cutter**, opening the existing physical form with that design selected. No Add Cutter action is shown for a nonempty or unknown inventory.

The search response supplies bounded associated inventory with source-location fallback, without multiplying design rows. Existing read-only attachment listing gains a `catalogPhotos` mode with 200-photo pages, reference/design photographs first and associated physical photographs afterward. Physical photo support is detected, never activated; absence of migration 0005 returns design photos safely. Carousel captions distinguish photograph kind. The representative image always uses reference association metadata, never a physical photo. Originals, purpose and relationships are unchanged. Failed/missing images preserve selection/navigation. Inventory lists disclose their existing 200-record bound; this is not a claim of unbounded inventory enumeration.

Full-width desktop cards retain the specified three columns. The existing details workspace makes its results column narrower than the minimum needed for that layout: container/media queries stack inventory/photos within that column or a narrow viewport. This constrained layout is documented rather than claiming the full desktop arrangement can fit every width. Actual browser layout remains an acceptance item, not proven by DOM tests alone.

## P2 outcome — deferred

No explicit persistent default-image relationship or safe existing mutation exists. Current ordering is deterministic association purpose/created-at/ID, and current gallery index is local presentation only. Repurposing purpose/created-at, notes or browser storage would create implicit semantics and recovery ambiguity. A proper default-image relationship plus guarded write, eligibility and recovery/archive tests needs separate persistence approval; no such API/schema/recovery change is included. Do not display a functional Set default action or imply artwork is verified. P1 proceeds with the existing representative fallback.

## Validation and acceptance classification

| P1 area | Implementation | Automated evidence | Development/browser boundary |
| --- | --- | --- | --- |
| Imperial dimensions | Shared conversion/input across authored displays/forms/help | Decimal/fraction validation, 100 unchanged round trips, exact original metric through unrelated Save, guarded fraction edit | Live editing/measurement acceptance pending |
| Roles/Admin route | Distinct roles, protected Admin HTML and APIs, clean Owner catalog tools | Signed identities/revocation, role matrix, Owner real D1 CRUD, denied admin routes/APIs before resource access, Viewer restrictions | Private collaborator assignments and real-role browser acceptance unperformed |
| Search/Filter | Existing search/pagination, adjacent Filter, no global task buttons | Submission/filter/reset and retained picker/editor/draft regressions | Live keyboard/responsive behavior pending |
| Cards/inventory | Required placement, name/BIN links, conditional Add, same design relationship | Zero/one/multiple states, exact link IDs, fallback, guarded Add/Save, producer separation | Annotated placement and synthetic Save/reopen need browser confirmation |
| Photos | Reference-first/physical-after, paged existing listing, missing-migration safe | Real D1/R2 association/order, unavailable images, pagination and original-byte regressions | No 0005 activation or physical-upload/live-photo acceptance |

Local full validation passed **210/210 application tests**, **33/33 tooling**, schema smoke, **11 restore helpers**, **3 audits**, synthetic import and TypeScript/build. A separately rerun real D1 photo test passed reference/physical order, migration-absent fallback and pagination beyond 200 photographs. First publication `6655abe3bd6cda64ca875d444cf888371bcdb5c7` passed the platform development build but remote CI caught a gallery race (209/210 app): an initial passive page-reset could overwrite the first Next click. The follow-up uses page-keyed selection, with no delayed reset, and separates Owner attachment deletion from Admin-only cleanup UI. Focused checks/build were rerun; final exact remote CI/build results, source/deployment commits and platform build IDs are recorded on PR #7. Earlier 204/33 counts belong to the baseline. No new browser/owner/Cris pass is inferred from a build. The connected-browser setup timed out; one cloud-browser attempt reached the ordinary Cloudflare Access sign-in wall. No authentication retry loop, credential entry, live TEST save or layout measurement occurred. Running-source attestation remains blocked by authentication. Preserve this distinction even if the platform build succeeds.

Run required application, tooling, schema/recovery/audit/synthetic import, TypeScript/build and Markdown/JSON checks; verify exact remote feature head and CI/development build. No production or data operation is needed for these tests. Pinned policies, dependency files, database/schema/migrations, Cloudflare configuration and workflows must remain unchanged.

## Cris retest checklist

Use development and existing synthetic TEST fixtures, not real originals. First let Cris try the task without demonstrating the route; record device, candidate and where she hesitates.

1. Search for a familiar design; try **Filter** and Reset.
2. Recognize the picture and producer. Confirm similar designs from two producers remain separate.
3. For an owned design, find the cutter/BIN on the card and follow either link to the right physical record. Confirm there is no Edit or Add Cutter button on that result.
4. For a design with no physical cutter, use **Add Cutter**. Enter decimal or fractional inches, quantity and a TEST location; Save and reopen. Confirm no duplicate reference and that units remain inches.
5. Start an edit, cancel or navigate away, and confirm unsaved work is protected.
6. Browse design then physical photographs, including a missing-image case. Do not activate physical uploads/migration to complete the test.
7. A catalog Owner should see catalog tools, not backup/diagnostic controls; verify Admin separately with an explicitly assigned account. Repeat at a narrow window and report any overflow.

Still open: independent Cris acceptance, independent narrow help/layout evidence, physical-photo migration 0005 activation/acceptance, CC-TODO-019 backup reliability, CC-TODO-023 independent operational recovery, existing PR #7 conflicts/integration readiness, draft #12 release limitations and production/merge approval. Weekly quota is not observable by the worker; the owner's 25% report is the stop/checkpoint signal. No quota amount is invented.
