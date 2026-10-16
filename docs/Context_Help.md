# Context help — first-release optional enhancement

Hover a focused-card field label or its ? link to see a short explanation and example. Keyboard users can focus the ? link; Escape dismisses the explanation. The popup remains available while using its Full documentation link. Click ? or Full documentation to open the authenticated HTML field guide in a separate tab/window at `/api/help/fields#FIELD`. Closing it returns to the same catalog card. No hover request, record write or draft discard occurs.

`app/src/field-help.ts` is the shared content/status registry used by both quick help and the complete HTML page. `quickHelp: Ready` means authored brief/example/details are available; it is not a claim of owner content approval. `Missing` shows a friendly placeholder and remains a tracked content item. A test requires a registry entry for every focused inline field plus Tags and complete content for every Ready entry. Unknown future fields must be registered explicitly.

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
| SlotQuickHelp | Missing |
| CutterNotesQuickHelp | Ready |
| TagsQuickHelp | Ready |

- [ ] Confirm the intended meaning and a useful example for Slot, then replace Missing with reviewed brief/example/full documentation.
- [ ] Owner reviews Ready wording as the real catalog workflow is exercised; fix reported inaccuracies without reopening passed CRUD/access tests.
- [ ] Extend the same pattern to other screens/fields when useful; keep their content readiness explicit.

The full guide is read-only GET HTML behind the existing role/authentication boundary, usable by existing owner/editor/viewer roles. It requires no catalog DB/file bindings, has no scripts/forms/write controls and no new resource or permission grant. Existing form labels, inline edits, Save/Cancel, image links and record-change guards remain. No membership, schema, data, upload standard or production change. Next unused task is CC-TODO-017.
