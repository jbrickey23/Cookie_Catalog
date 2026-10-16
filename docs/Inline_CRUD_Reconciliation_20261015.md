# Browse inline CRUD and vocabulary — reconciled decision (2026-10-15)

Status: approved design direction, NOT implemented or deployed. Preserve existing development branch and protected-main PR workflow.

## User experience
- Browse begins with existing full-width result cards. Selecting a card opens expanded details on the left, with remaining results in a scrollable right column.
- Clicking another result switches the detail focus without navigation or resetting search/filter/scroll. Closing detail returns to the grid.
- No "Edit catalog entry" button or separate edit mode. Click individual values to edit in place.
- Save/Cancel appear only when draft differs from persisted record. Reverting all changes removes the pending-save state. Do not silently discard edits when switching records.
- Support create, read, update, delete in this workspace; delete is guarded by confirmation and relationship checks.
- Reusable master-detail and field-editing components across browse/search/inventory. Responsive small-screen layout required.

## Field vocabulary policy
- Fixed values: controlled dropdown, no ad-hoc creation.
- Managed vocabulary: searchable select or multiselect with inline create; e.g. tags and shape references.
- Free text: editable input/textarea.
- Field metadata specifies editor type, source, validation, permissions and whether creation is allowed; JSON is configuration, not persistence or authorization.
- Newly drafted vocabulary values are not persisted until Save; Cancel leaves no orphan entries. Canonical IDs, normalized duplicate detection and transactional association updates.
- New Shape is a first-class entity: require minimum valid shape fields; do not create an empty shape by treating it like a tag.
- Removing a tag association must not delete the shared tag. BIN IDs are not arbitrarily created from this control.

## Persistence and safeguards
- Server-side validation, role checks, optimistic concurrency/conflict response, atomic commits where supported, and audit/restore considerations.
- Preserve existing schema relationships (shapes, tags, physical cutters, designs, locations); inspect actual schema before migrations.
- Physical/Digital classification remains orthogonal to BIN location.
- OneNote BIN is authoritative for import; explicit user BIN edits require a documented synchronization conflict/reconciliation policy, not silent overwrite.

## Sequencing / open work
1. Finish BIN assignment/alignment using existing OneNote BIN as BINID without redundant confirmation.
2. Implement automated pre-risk archive, verified recovery points, scheduled/one-click backup and approval-gated restore, reusing existing TAR and integrity tests.
3. Implement read-only master-detail browse and then inline CRUD with managed vocabulary.
4. Reconcile current DB/archive counts against actual live development data before changes; prior documented snapshots are not proof of current counts.
5. Use feature branch/PR, tests and protected main. No production release or paid resources without separate approval.

No application implementation is claimed by this document.

## Development reconciliation — 2026-10-16

The approved decision above is preserved. Source branch `df377933d98b3010def851ed0fd0c85fa498e8a4` added this document only, based on protected main. Continuing implementation remains on `feature/cc-infrastructure-foundation` / draft PR #1 so newer BIN/import/backup work is retained.

- BIN alignment deployed in `ae39eb5`; managed archive/restore deployed in `3f2457a`. Both heads passed GitHub checks and Workers Builds.
- Responsive Browse master-detail, reusable value editors, transactional shape/physical inventory CRUD, staged tags and first-class shape creation are implemented next on that feature branch. Source shape identity/files remain shared. Existing physical-to-shape bindings are preserved; the managed shape picker supports new physical entries. Designs and compatibility mappings retain their existing management workspace.
- Explicit physical location selection uses an existing canonical location ID; no arbitrary BIN creation. It overrides inherited OneNote location. Clearing it restores inheritance. Original source snapshots remain immutable; later source review/reimport must not overwrite an explicit catalog move. If OneNote changes later, show/reconcile that disagreement explicitly rather than automatically applying it. Source-only references retain their original OneNote assignment.
- Current schema was inspected (four migrations / 22-table supported archive profile); no schema migration is introduced. User notes edit `catalogNotes` inside existing imported notes metadata, preserving its source/review provenance. Records, associations and vocabulary remain in D1; editor metadata is presentation configuration only.
- New inline Save/Delete automatically obtains a complete, fresh pre-change recovery point. Record fields and tag associations commit in one guarded D1 transaction. Delete is owner-only and rejects every inbound relationship, including associations normally covered by cascade. Removing a tag association never deletes the shared tag. Recovery point/change-intent metadata records actor, operation and revision; an intent is not proof a transaction committed.
- Current-data counts and the real-original backup acceptance are recorded in the current Context checkpoint. Historical export counts alone are not treated as current-state proof. No live catalog restore is used as an acceptance test.
