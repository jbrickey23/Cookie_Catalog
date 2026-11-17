# R2.1 front-of-catalog correction and Cris retest

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

Local full validation passed **210/210 application tests**, **33/33 tooling**, schema smoke, **11 restore helpers**, **3 audits**, synthetic import and TypeScript/build. A separately rerun real D1 photo test passed reference/physical order, migration-absent fallback and pagination beyond 200 photographs. Exact remote CI/build results, source/deployment commits and platform build IDs are recorded on PR #7 after publication. Earlier 204/33 counts belong to the baseline. No new browser/owner/Cris pass is inferred from a build. The connected-browser setup timed out; one cloud-browser attempt reached the ordinary Cloudflare Access sign-in wall. No authentication retry loop, credential entry, live TEST save or layout measurement occurred. Running-source attestation remains blocked by authentication. Preserve this distinction even if the platform build succeeds.

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
