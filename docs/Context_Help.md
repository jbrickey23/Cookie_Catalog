# Context help — first-release optional enhancement

## Current R2 behavior — Issue #13 / CC-TODO-021

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

## Left-side placement

Focused-card help appears in a separate sticky panel to the left, so no fields are covered. It stays open after the pointer leaves; Close help or Escape dismisses it, and switching records clears it. Narrow screens stack help above the focused card. Standalone editors retain the compact local fallback. No record writes or original changes occur.
