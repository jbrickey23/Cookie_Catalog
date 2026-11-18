# Cookie_Catalog — R2.1 Search & Detail Card UX Consolidation

**Repository:** `JBrickey23/Cookie_Catalog`
**Target branch:** `feature/cc-infrastructure-foundation`
**Pull request:** #7
**Execution mode:** ChatGPT Work / Codex
**Authorization:** Approved bounded implementation and development deployment
**Framework:** Durable_CHATGPT v1.0.0

## 1. Objective

Implement the owner's approved search-result, design-detail, cutter-detail, photograph, navigation, and tag-management improvements.

The goal is a consistent, intuitive catalog experience across search results and detail pages, with shared components and minimal duplication.

This is an **R2.1 development update**, not an R1 production release.

## 2. Initialization and safeguards

Before editing:

1. Read the current repository bootstrap, Context, TODO, Decision Log, and development guidelines.
2. Verify the adopted Durable_CHATGPT policy version and its source/digest pin.
3. Read the relevant R2.1 reference/inventory, search, contextual-workspace, and UX records.
4. Refresh PR #7's current head, existing changes, conflicts, CI, and deployment status.
5. Inspect the actual current application code before selecting implementation approaches.
6. Compare this specification with existing functionality. Implement only missing or incorrect behavior.

Previous worker reports identify `42b4dc6` as the Browser Back implementation and owner-confirmed pass. Verify its presence in the current branch; do not reimplement it.

**Hard boundaries:**

- No R1 production changes or deployment.
- No PR merge.
- No database migration without additional approval.
- Do not activate migration 0005.
- No changes to real catalog data or original images.
- No changes to Cloudflare Access identities or credentials.
- No unrelated backup/recovery, release automation, or PR-conflict work.
- No new UI framework or unnecessary dependencies.
- Preserve existing permissions, guarded persistence, Undo, and draft protection.

Use synthetic test data and existing fixtures.

## 3. Binding visual specifications

[Repository screenshots and binding layout requirements](evidence/r2_1_ux/README.md)

The owner's annotated screenshots supplied with this request define the required desktop placement.

They include:

- Search-result card with main photo, photo strip, design information, and cutter/BIN links.
- Design-detail page with pink design-information area, blue photograph area, yellow tags area, and green associated-cutter area.
- Existing physical-cutter details showing fields to hide and help text to relocate.
- Final cutter-card layout with a three-row, two-column table.

**Do not substitute a new layout based on aesthetic preference.**

If a screenshot is missing, request the exact image before implementing its layout.

Preserve the specified desktop arrangement. For narrow viewports, use a usable responsive adaptation while retaining the same field order and interactions. Report any genuine placement constraints.

## 4. Shared UI and CRUD behavior

Search-result cards and detail pages must be consistent in:

- Field labels and terminology.
- Field positions and sizing where the same component appears.
- Hyperlink styling and destinations.
- Inline editing and pencil controls.
- Photo interactions and sizing conventions.
- Contextual help.
- Save, Cancel, validation, Undo, and draft protection where applicable.

Reuse shared components where practical.

**Inline editing rule:** Edit directly in place without unnecessary Save/Cancel controls. Use explicit Save/Cancel when needed for multi-field changes, validation, or unsaved-draft protection. Do not weaken persistence safeguards.

For an editable linked field, the displayed value is a hyperlink and a separate small pencil activates editing. During editing, prevent accidental navigation.

Do not introduce a redundant View Details button.

## 5. Search-result card corrections

### 5.1 Design name

- Restore the design Name value as a hyperlink to its design-detail page.
- Add a small pencil beside the Name for inline editing.
- Preserve the existing guarded update behavior.
- The main photograph must not navigate to design details.

### 5.2 Design information table

- Show Name, Producer, Link, and Notes.
- Widen the label column so Producer does not break awkwardly.
- Preserve the owner's annotated positions.
- Use consistent field spacing and alignment.
- Avoid redundant detail panels or disclosures.

### 5.3 Main photograph and thumbnail strip

- The main upper-left photograph must have the same displayed height as the adjacent four-field design-information table.
- Maintain its aspect ratio without distortion.
- Increase the lower photo-strip thumbnail height modestly.
- Scale all thumbnail images proportionally.
- Clicking a thumbnail displays it in the main image position.
- The previously displayed image returns to the thumbnail strip.
- Clicking the main image opens the original photograph in a new browser tab/window.
- It must not open design details.
- Design/reference photographs appear before physical-cutter photographs.
- Support multiple images and existing pagination where needed.
- Remove redundant photo-detail links and buttons.
- Preserve original files and photo ownership relationships.

This is a temporary viewing selection, not a persistent default-image change.

**Persistent default design-photo selection remains deferred P2.**

### 5.4 URL entry

Accept source links such as:

`example.com/design`

Normalize these to:

`https://example.com/design`

Preserve valid explicitly supplied `http://` or `https://` links. Do not create double schemes.

Validate the resulting URL, preserve drafts on errors, and retain the existing safe-link behavior.

Apply the same normalization consistently across design editing surfaces.

### 5.5 BIN navigation

BIN ID is a first-class key:value pair.

- Display prominently in the upper-right of applicable cutter/search representations.
- Example: `BIN ID: 2`.
- The BIN value links to an inventory view filtered to that exact BIN across all designs.
- The cutter name independently links to that cutter's details.
- Preserve existing search terms and filters only where compatible with showing all cutters in the selected BIN; do not silently produce incomplete exact-bin results.
- Preserve correct behavior when several cutters share a BIN.
- Use a separate pencil if the BIN value is editable.

Reuse the same BIN presentation and navigation component across search and detail pages.

## 6. Design-detail page restructuring

Implement the owner's approved two-column desktop layout:

**LEFT — Design**

**RIGHT — Associated cutters**

Do not render unrelated search-result cards in the right column.

### 6.1 Left column — Design

Move the existing design information from the lower Design details section to the upper-left portion of the page.

Show:

- Name
- Producer/Maker
- Source Link
- Notes

Match the search-result card's field presentation and inline-edit behavior.

Below the design information, display the photograph viewer and thumbnail strip using the shared search-card photo behavior.

Remove redundant image navigation, download, and photo-detail controls when the shared viewer provides the required functionality.

Place Tags in the designated left-column area.

Remove obsolete duplicate Design details content after the information has moved.

Preserve the existing design identity, source metadata, and relationships.

### 6.2 Right column — Associated cutters

Display every physical cutter record associated with the selected design.

**One independent cutter detail card per physical cutter record.**

- Zero cutters: show the existing Add Cutter path with this design preselected.
- One cutter: show one cutter detail card.
- Multiple cutters: show one card per record, with no arbitrary truncation.
- Editing one cutter must not alter another cutter or the shared design.
- Preserve legitimate add-another-size/copy functionality.
- Use existing physical-cutter CRUD and authorization.

Do not confuse a cutter's storage BIN with the cutter's own record identity.

## 7. Final physical-cutter card layout

Each physical-cutter detail card is a compact two-column, three-row table.

| Row | Left column | Right column |
|---|---|---|
| 1 | Cutter Name | BIN ID |
| 2 | Quantity | Reference Size (inches) |
| 3 | Notes, spanning both columns | |

### Row 1

**Name**

- Display the physical cutter's name.
- Link to that specific cutter's details.
- Provide a separate pencil for editing if editable.

**BIN ID**

- Position in the upper-right.
- Prominent key:value presentation.
- Link to exact-bin inventory across designs.
- Separate pencil if editable.
- Match search-result behavior exactly.

### Row 2

**Quantity**

- Show the quantity associated with that physical record.
- Allow inline editing under existing validation rules.

**Reference Size**

- Label: `Reference Size (inches)`.
- This is the single user-facing size measurement for the current cutter workflow.
- It represents the cookie's height under the owner's current convention.
- Use the existing imperial formatting and precision-preservation implementation.
- Do not recalculate or overwrite historical values merely because other fields are hidden.

### Row 3

**Notes**

- Span both columns.
- Display the existing cutter notes.
- Support inline editing.

### Hidden fields

Do not display these in the cutter detail cards:

- Origin
- Width
- Separate Height
- Slot

Preserve their stored values, schema, relationships, and any existing backend compatibility.

Do not delete these fields or rewrite their data.

Remove the unnecessary Measurements, slot and cutter notes collapsible presentation.

Do not duplicate Reference Size as a separate Height field.

## 8. Contextual help cleanup

The existing permanently displayed explanatory notes about BIN assignment, physical ownership, and OneNote location precedence should move into the appropriate `?` contextual help.

Requirements:

- Preserve useful help content.
- Remove redundant permanent explanatory blocks.
- Use the existing contextual-help component and established hover/keyboard behavior.
- Do not introduce layout shifts or a new help system.
- Keep help available to keyboard and touch users.

Do not remove functional data or controls merely because explanatory text is relocated.

## 9. Tags — Autocomplete and multi-tag management

Improve the existing tag input rather than creating a separate tag-management subsystem.

### Required behavior

- Suggest existing tags as the user types.
- Support keyboard navigation through suggestions.
- Tab selects or targets the highlighted suggestion for application.
- Support semicolon-separated entry of multiple tags.
- Trim surrounding whitespace.
- Prevent duplicate associations.
- Reuse existing tag records instead of creating duplicates.
- Create a new tag only when no equivalent existing tag exists.
- Preserve the catalog's established tag identity and uniqueness rules.
- Keep editing accessible by mouse, keyboard, and touch.
- Do not accidentally submit the entire design form when selecting a suggestion.
- Preserve existing tag removal and save behavior.

### Acceptance example

Existing tags:

`TAG1`, `TAG2`

User enters:

`TAG1;TAG2;TAG3`

Expected result:

- Reuse TAG1.
- Reuse TAG2.
- Create TAG3 once.
- Associate all three with the current design.
- A subsequent use of TAG3 must reuse the existing tag.
- No duplicate tag records or associations.

Handle capitalization and whitespace consistently with the repository's current tag rules. If the existing model has stricter identity semantics, preserve those semantics and report the decision.

### Important implementation constraint

Inspect the current tag schema, endpoints, and editor before implementing.

Prefer existing autocomplete and association patterns already used in the application or dependencies.

Avoid an unnecessary third-party tag-management package.

## 10. Acceptance and regression tests

Add focused tests covering:

**Search cards**
- Name hyperlink and separate pencil editing.
- Label widths and layout.
- Main image click opens the original.
- Thumbnail click swaps the selected photograph.
- Previous image returns to the strip.
- Correct image ordering and pagination.
- Image aspect ratio and fallbacks.
- BIN links to all records in the exact BIN.
- Cutter name links to the correct cutter.
- URL normalization and validation.

**Design-detail page**
- Design-left / cutters-right desktop layout.
- Design information at the specified position.
- Shared photo viewer behavior.
- Zero, one, and multiple associated cutters.
- Independent cutter editing.
- No duplicate search-result section.
- Consistent inline-edit behavior.

**Cutter cards**
- Three-row, two-column arrangement.
- BIN ID upper-right.
- Quantity and Reference Size.
- Notes spanning both columns.
- Origin, Width, Height, and Slot hidden.
- Hidden stored values preserved after edits.
- Correct navigation and draft protection.

**Tags**
- Existing-tag autocomplete.
- Keyboard selection using Tab.
- Semicolon-separated multiple tags.
- New-tag creation.
- Existing-tag reuse.
- No duplicate associations.
- Validation and cancellation.

**Security and persistence**
- Viewer/Owner/Admin permissions unchanged.
- Server-side authorization retained.
- No cross-record updates.
- Save/reopen persistence.
- No precision loss.
- Existing Undo and recovery checks continue to pass.

Run focused tests first, then required repository validation, CI, and build checks.

Automated tests are not a substitute for live owner/Cris acceptance.

## 11. Execution and usage limits

**November 17 owner amendment:** the following 25% reserve was withdrawn for this batch. The scope and development-only boundaries still apply.

The owner wants to conserve weekly ChatGPT usage.

**Target: preserve at least 25% of the weekly allowance.**

The worker must not claim to know remaining usage unless that information is actually available.

Operate efficiently:

1. Inspect the existing implementation.
2. Identify the smallest changes that satisfy the specification.
3. Reuse existing components and data structures.
4. Implement the approved work.
5. Run focused tests.
6. Run required full validation.
7. Publish the verified candidate to development.
8. Reconcile durable project records.
9. Return a concise implementation and acceptance report.

Avoid rabbit holes, repeated full-suite runs without a reason, and unrelated refactoring.

If a substantial architectural issue, schema change, or unexpected authorization risk appears, stop that portion and report the blocker. Continue independent approved items where safe.

If usage telemetry is unavailable, stop at a meaningful checkpoint rather than pretending the 25% threshold can be measured.

## 12. Publication and reconciliation

Publish to the existing R2 development branch only.

A development-branch push and its normal development deployment are authorized.

After publication:

- Verify exact commit SHA.
- Verify required CI.
- Verify development deployment status.
- Verify runtime source/version when accessible.
- Perform browser checks when authentication permits.
- Do not claim browser verification if blocked by Cloudflare Access.
- Record implemented versus unverified functionality.
- Update Context, TODO, Decision Log, Bootstrap, and relevant UX documentation.
- Preserve PR #7's unrelated conflict/release status.
- Do not merge to main.
- Do not deploy production.

## 13. Required completion report

Provide a concise report with:

1. Branch and exact implementation SHA.
2. Changed components and reused functionality.
3. Acceptance matrix for each requested change.
4. Focused/full test results.
5. CI and development deployment evidence.
6. Browser verification results and limitations.
7. Deferred or blocked items.
8. Durable-state reconciliation evidence.
9. Confirmation that production, real catalog data, originals, and migration 0005 were untouched.
10. A short **Cris Retest Checklist**.

Include a clickable link to the updated development catalog:

https://cookie-catalog-dev.j-brickey.workers.dev/

## 14. Definition of done

A user can:

- Search and recognize a design.
- Open its detail page through the linked Name.
- Edit design fields inline.
- Browse all associated photographs and open originals.
- See all associated physical cutters on the right side.
- Navigate to an individual cutter or all cutters in a specific BIN.
- Edit cutter information without altering unrelated records.
- Enter and reuse multiple tags without duplication.
- Save, reopen, and continue without losing existing information.

The search and detail views must feel like two presentations of the **same catalog model**, not separate applications.

**Stop at a verified R2.1 development candidate ready for Cris's next acceptance walkthrough. Production promotion requires separate owner approval.**

## Implementation and verification

November 17, 2026 Pacific. The application change is [implementation `bba7105`](https://github.com/JBrickey23/Cookie_Catalog/commit/bba710552adb3a5226537d7c57939644f7f9db73), based on `42b4dc6095d13bbed4f142f6dc12ebf0fb268b31`. The original mouse-Back fix was already deployed and owner-confirmed. PR #7 remains the source of exact publication, CI and development deployment receipts.

| Surface | Implementation and automated evidence |
| --- | --- |
| Search | Linked Name and a separate pencil, nonwrapping field labels, original-image link, paged thumbnail swap, HTTPS completion and validation. |
| Navigation | Cutter Name opens its record. BIN clears incompatible filters and matches the effective location across designs, with catalog location taking precedence over OneNote. Native Back restores the search. |
| Design details | Shared four-row design editor on the left, followed by photographs and tags. The right column provides a separate three-row card per record and retains Add Cutter and add-another paths. Associated inventory reads continue past 200 records. |
| Physical updates | The physical table has no independent name in the schema. Its displayed name comes from the design. Each Save addresses one cutter with its revision and writes only changed quantity, BIN, reference size or notes. Synthetic readback preserved a null origin, slot, exact historical width, design, tags and sibling cutter. |
| Tags | Keyboard/Tab selection, semicolon lists, explicit Save/Cancel and existing shared tag removal. Reuses existing ID or the server’s normalized identity (NFKC, trimmed/collapsed whitespace, case-folded). |
| Boundaries | Visual selection is temporary. Persistent preferred image, independent recovery, physical-photo migration activation, conflict resolution and production release remain separate. |

The local application suite passed 220/220 and tooling passed 33/33. SQLite schema, 11 restore-helper tests, 3 audit tests, synthetic import, TypeScript and Vite build passed. Automated interaction and database fixtures cover revisions, draft preservation, permission boundaries and persistence. Current live browser verification, exact layout measurements and independent Cris acceptance require separate evidence. The five original annotations are specifications.

### Cris retest

1. Search for a design with several photos. Swap thumbnails, open the main original and open design details from Name.
2. Compare the design on the left with all cutters on the right. Follow one cutter name, then its BIN. Confirm the BIN shows other designs stored there. Mouse Back should restore your place.
3. On a TEST record, stage notes on one cutter and save a fractional size on another. Check the first draft, Cancel, and reopen the saved record.
4. Enter a bare source URL and existing/new semicolon-separated tags. Try Tab, Cancel, Save and reopen. Check the same layout on a narrow screen.

## Physical location management

The November 17 owner addition extends the consolidated UX candidate on PR #7. [Implementation 5377e7f](https://github.com/JBrickey23/Cookie_Catalog/commit/5377e7fa92f78b1231cdf0832c825d652ba03815) uses the existing locations table, physical cutter foreign key and backup format. There is no schema migration or backfill.

- BIN 1 through BIN 50 and Classes are offered alongside stored names. Opening the selector performs no writes. Saving a missing preset resolves it to a durable catalog ID. The pencil creates or reuses a named location and can rename a selected custom location. A rename changes the shared label immediately. Cutter assignment takes effect on Save.
- Name matching accounts for capitalization, spacing and common numbered BIN punctuation. Leading zeros remain significant. An exact stored spelling disambiguates existing equivalent labels. Creation and rename guard against concurrent changes. Cutters keep their location IDs when a shared label changes.
- Each physical save requires one effective location. OneNote assignments continue to apply when the explicit field is empty. A historical record with neither value stays readable until the user chooses its location on a physical save. Import review holds a new unlocated physical record for an explicit choice and retains its original source evidence.
- Search and detail cards link to the whole selected location across designs. Reassigning a record moves its full quantity. Other physical copies, source notes and recovery snapshots retain their existing relationships.

Local validation passed 224 application tests, 33 tooling tests, the schema smoke check, 11 restore-helper tests, three OneNote audit tests, synthetic import, TypeScript and the development-targeted build. Focused checks covered final edits, including concurrent duplicate creation. An initial parallel local run lost a Miniflare loopback connection. The suite passed with bounded concurrency. Local Chromium could not start because the host denied its socket. Automated DOM and database fixtures cover the workflows; authenticated development browser acceptance and Cris’s independent walkthrough are pending.

See the [current PR and publication checks](https://github.com/JBrickey23/Cookie_Catalog/pull/7/checks) and the [location retest](R2_1_Cris_Retest_20261116.md#physical-locations).
