# Context help — first-release optional enhancement

## Dismissal and layout correction — October 22, 2026

**Owner observations:** R2 hover delay approximately 1–3 seconds is acceptable. Help stays open after moving/clicking elsewhere and opening help shifts nearby fields. These are owner-reported defects, not new automated or Cris evidence. Keep Issue #13 open for owner verification after the correction; no new task/decision ID.

**Verified root cause:** FieldHelp delegated catalog help to MasterDetailWorkspace's shared rail and deliberately skipped leave/blur dismissal in rail mode. The rail had no outside-click/focus listener. Opening it inserted an aside and `with-help` grid columns (stacked above details on narrow screens), changing panel/field geometry. Standalone local popovers used separate behavior. The accepted hover timer itself was not the reported defect.

**Implemented correction:** reuse FieldHelp and the shared context to coordinate one popup by component instance. Render the existing brief/example/documentation content through a React DOM portal into the body, fixed to the ? trigger. Remove the help-only rail markup/grid rules; mounted details/results, navigation, editing and Add selection are unchanged. No dependency, schema, write/API, registry content, cloud config or persistence change.

- Only the ? trigger starts the existing **1,500 ms** hover timer. Early departure cancels. A **120 ms transit grace** bridges the small trigger/popup gap; entering the popup cancels dismissal. Pointer-opened help closes after leaving both, with no delayed reappearance.
- Focus/ordinary click opens immediately. Tab from the trigger enters popup controls; Shift+Tab returns to the trigger, and forward Tab after documentation resumes outside the popup. Focus can move into the documentation link without dismissal. Outside pointer-down, focus outside, Escape, Close help, browser blur and existing catalog-context changes dismiss. Escape/Close from popup content returns focus to the trigger without reopening it. Modified ? links still open the existing authenticated guide.
- Fixed placement clamps width and horizontal position to an 8 px viewport margin, chooses above/below for available space, caps height with internal scrolling and repositions on scroll/resize. Offscreen anchors dismiss. A body portal avoids ancestor clipping and takes no grid space.
- Document dismissal and window positioning listeners exist only while open; timers cancel on leave/dismiss/field/context/unmount. The existing mounted context reset remains, not a new navigation architecture. No form values are changed by help.

**Validation checkpoint:** local full 202/202 application tests passed; final keyboard-routing/positioning changes passed 34/34 focused interactions and TypeScript/build. 33/33 tooling, schema smoke, 11 restore helpers, 3 audits, synthetic import and 67 Markdown/link/docs-JSON checks passed. New deterministic tests cover dwell/early leave, pointer transit/departure, focus/click/documentation access, outside dismissal, Escape including pending dwell, context/unmount cleanup, narrow/clamped/flipped placement, unchanged workspace structure and single-popup coordination. Existing draft/edit tests are retained. Full/local and remote/browser results are recorded separately below when verified; jsdom structure/placement assertions alone are not proof of real layout stability.

**Owner retest (pending):** on a TEST record hover ? briefly, then for ~1.5 seconds; move into the popup/link, then outside. Try outside click, Tab/Shift+Tab, Escape and Close. Open/close beside a staged unsaved TEST edit and confirm fields stay still and the draft remains. Repeat in a narrow window. Only the owner can accept the corrected behavior; Cris acceptance and production/merge approval are not inferred.

The earlier help-rail behavior below is historical and superseded by this authorized correction. Existing content readiness remains unchanged. The proposed selected-design focus UX is excluded. Preserve 0005 physical-photo acceptance, CC-TODO-019 backup and CC-TODO-023 recovery gaps; PR #7 conflicts remain open.


## Earlier R2 behavior — Issue #13 / CC-TODO-021 (historical)

The [Contextual Workspace](Contextual_Workspace_R2_1.md) implements a 1.5-second initial pointer dwell. Leaving, Escape, field/context changes and unmount cancel pending help. Keyboard focus and an ordinary explicit ? click reveal quick help immediately; Full documentation (or modified ? link) retains the authenticated separate guide. Existing help-rail dismissal and field drafts remain. Deterministic timer tests cover the boundary/cancellation and intentional access; final browser/owner evidence is tracked in the workspace checkpoint. Earlier immediate-hover/click wording below describes the original release implementation.

Hover a focused-card field label or its ? link to see a short explanation and example. Keyboard users can focus the ? link; Escape dismisses the explanation. The popup remains available while using its Full documentation link. Click ? or Full documentation to open the authenticated HTML field guide in a separate tab/window at `/api/help/fields#FIELD`. Closing it returns to the same catalog card. No hover request, record write or draft discard occurs.

`app/src/field-help.ts` is the shared content/status registry used by both quick help and the complete HTML page. `quickHelp: Ready` means authored brief/example/details are available; it is not a claim of owner content approval. `Missing` shows a friendly placeholder and remains a tracked content item. A test requires a registry entry for every focused inline field plus Tags and complete content for every Ready entry. Unknown future fields must be registered explicitly.

## Verified development acceptance

Source `2de1175` passed 149 application tests, build/type-check, both CI checks and Workers deployment. Live cloud Chrome showed the BIN explanation/example, opened the separate full HTML guide at the correct section, returned to the same focused card on close, dismissed help with Escape and displayed Slot's Missing placeholder. No record or original was changed. Hover and unsaved-draft preservation are covered by local interaction tests. Empty applicable record fields still appear as Not recorded; quick-help readiness is a separate status. See [sanitized acceptance evidence](evidence/Context_Help_20261016.json).

## CC-TODO-016 content tracker

Status: foundation implemented; owner requested nice-to-have for R1. Missing text is **not an R1 release blocker**.

| Work item | State |
| --- | --- |
| NameQuickHelp | Ready |
| MakerQuickHelp | Ready |
| SourceLinkQuickHelp | Ready |
| ShapeNotesQuickHelp | Ready |
| BINQuickHelp | Ready |
| QuantityQuickHelp | Ready |
| OriginQuickHelp | Ready |
| ReferenceSizeQuickHelp | Ready |
| WidthQuickHelp | Ready |
| HeightQuickHelp | Ready |
| SlotQuickHelp | Ready |
| CutterNotesQuickHelp | Ready |
| TagsQuickHelp | Ready |

- [x] Author Slot help as an optional within-BIN position label, with a concrete example and no automatic numbering/printing implication. Ready denotes authored content; owner wording review remains open.
- [ ] Owner reviews Ready wording as the real catalog workflow is exercised; fix reported inaccuracies without reopening passed CRUD/access tests.
- [ ] Extend the same pattern to other screens/fields when useful; keep their content readiness explicit.

The full guide is read-only GET HTML behind the existing role/authentication boundary, usable by existing owner/editor/viewer roles. It requires no catalog DB/file bindings, has no scripts/forms/write controls and no new resource or permission grant. Existing form labels, inline edits, Save/Cancel, image links and record-change guards remain. No membership, schema, data, upload standard or production change. Next unused task is CC-TODO-017.

## Earlier left-side placement (historical)

Focused-card help appears in a separate sticky panel to the left, so no fields are covered. It stays open after the pointer leaves; Close help or Escape dismisses it, and switching records clears it. Narrow screens stack help above the focused card. Standalone editors retain the compact local fallback. No record writes or original changes occur.
