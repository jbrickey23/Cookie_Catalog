# R2.1 Contextual Workspace — CC-TODO-021 / CC-TODO-010

## Approved implementation scope — October 21, 2026

The owner's Contextual Workspace handoff authorizes frontend implementation, tests and delivery to the existing development branch/PR #7. It supersedes the narrower proposed UI batch in [planning PR #14](https://github.com/JBrickey23/Cookie_Catalog/pull/14) at `aa3b68543aea2ec5eef06f47f137fc09427d8081`; it does not merge that planning PR, approve Cookie Sets persistence, activate migration 0005 or authorize production. Durable_CHATGPT v1.0.0 remains pinned without exceptions.

## Assessment recorded before implementation

Before: one page mounts photo intake, request reconciliation, Browse, record Undo, managed backups, import review, readiness, generic catalog CRUD, source references, batch attachments, archive exports and development fixtures. Everyday browsing and privileged technical actions share the same vertical navigation. New physical/reference buttons expose the data model before intent; every optional field appears immediately. FieldHelp opens on incidental hover.

After: **Catalog**, **Administration**, and **Development & Diagnostics** are distinct workspaces. Catalog starts with Find Something, Add Something and My Cutters, with persistent task navigation. Cookie Sets is future information only. Add asks “I have a cutter” or “Save a design for later”, searches existing producer designs first and requires explicit new-design creation. Optional information uses stable expandable sections. Switching workspaces preserves mounted drafts; catalog record/task changes retain existing dirty/busy checks.

| Existing component | Treatment / responsibility |
| --- | --- |
| AppHeader / session / ReleaseNotice | Retain environment, identity, request capture, sign-out and release pause; compose workspace navigation without new permissions. |
| Browse / CutterCard / CutterDetails | Retain search, paging, thumbnails, guarded focus and persisted-record navigation; compose task home, intent controls and plain ownership labels. |
| EntryEditor / InlineField / RecordPhotos | Retain validation, revision checks, persistence, optional upload outcome and drafts; progressively disclose design, inventory and optional details. |
| MasterDetailWorkspace / FieldHelp | Retain independent result pane and help rail; add 1.5-second pointer dwell with immediate intentional help. |
| ManagedBackups / ArchiveBackup / RecordRecovery / RequestRecovery | Relocate unchanged guarded operations to Administration; Undo remains directly accessible. |
| Catalog | Reuse the existing location editor as an Administration view; keep other technical entities in advanced catalog tools. No schema changes. |
| ImportReview / SourceReferences / BatchAttachments / Attachments / Readiness | Retain supported reviewed-import and catalog-completion tools under expandable Administration sections. Prepared source import is not general catalog import or backup restore. |
| PhotoInbox | Retain existing private photo preparation in Administration; no extraction or catalog submission claim. |
| InfrastructureVerification / synthetic fixtures | Development & Diagnostics, existing owner/development restrictions. No new backend authority. |

Server role, origin, revision and maintenance checks remain authoritative. Mounted hidden panels preserve state; they do not grant permissions or execute writes merely by navigation. No controller, dependency, migration, new import engine or infrastructure is introduced.

## Acceptance and delivery record

Implementation, automated validation, exact-head CI, deployed-source attestation and agent browser smoke are recorded separately below as evidence becomes available. Owner functional acceptance and independent Cris usability remain subsequent gates. Existing [reference/inventory evidence](Reference_Inventory_UX_R2.md), CC-TODO-019 backup root cause and CC-TODO-023 operational request recovery remain open where previously open. Physical-photo live acceptance remains blocked by separately authorized safe 0005 activation/recovery evidence.

## Implemented behavior and deliberate deferrals

- Catalog tasks share Browse's established search/paging/dirty guard. My Cutters starts with physical entries; Find retains all/reference/physical filters and producer/tag/phrase search. Design cards report a read-only inventory count, with distinct missing/review/recorded states; files do not establish ownership. No persistence schema or write endpoint changed.
- Add exposes existing producer-aware selection before optional new-design creation. Selecting an existing design for later opens it without a duplicate POST. A physical addition keeps the design read-only. Save opens the persisted Focus Card; optional photo failure remains a separately reported saved-record outcome. Source URLs are never silently repaired.
- Source/design notes, tags and advanced measurements/Slot/notes use native disclosures with mounted values. A validation error forces its containing disclosure open and focuses the field. Existing revision/conflict, cancel, draft, busy and maintenance protection is reused.
- Workspace navigation preserves mounted state; catalog task/record changes retain confirmation or busy rejection. Undo directly reveals Administration without discarding the catalog draft. Existing owner/editor/viewer server guards are unchanged. Development fixtures remain owner/development-only; production exposes no synthetic fixture actions.
- Administration retains backups/status/schedules/retention, record Undo, private request export/recovery, storage locations, source/review/completion/attachments and existing prepared-manifest import. It offers no new general catalog-import capability. No live backup/restore, diagnostic mutation or schedule change is part of browser smoke.
- Cookie Sets remains text only, not an active control. Extraction/matching, new imports, physical-photo 0005 activation, production transition and release engineering remain deferred or separately gated.

## Owner functional sanity check — subsequent acceptance, not yet passed

Use the development site and invented `TEST WORKSPACE` records; preserve real catalog data/originals. Record date/device/source, observed results and friction against each item. The retained `TEST UX 20261020` producer/tree fixtures can be searched without recreating them.

- [ ] Home makes Find Something / Add Something / My Cutters understandable without database terminology; task navigation works without returning Home.
- [ ] Find a cutter and a producer design by name, producer and tag. Recognize physical inventory, no recorded inventory and review/unknown status; photos/files alone never imply ownership.
- [ ] Add Something → I have a cutter → search/select an existing producer design. Save quantity/location/size; verify the persisted card. Add another size/copy without changing shared design information.
- [ ] Add Something → I have a cutter → Create a new design. Save a distinct producer/name with optional physical details; no required photo/STL/source URL.
- [ ] Save a design for later → search first → explicitly create a distinct producer design. Verify no physical record was created. Selecting an existing design opens it without creating a duplicate.
- [ ] Expand Source link and design notes; try `example.test`, collapse it and Save. Error reveals/focuses the field, preserves other input, and requires explicit `https://example.test` before saving.
- [ ] My Cutters shows recognizable name/image, size, quantity and location. Open the card, edit one field, inspect optional details, Cancel and guarded navigation; preserve unrelated saved values.
- [ ] Switch to Administration and back with an unsaved catalog draft; it survives. Undo opens Administration. Inspect retained backup/status/location/import tools without authorizing restore, cleanup, schedules or import writes.
- [ ] Brief pointer transit does not open help; sustained hover does. Focus/explicit ? is immediate, Escape/Close help dismisses, Full documentation opens the field guide without saving the draft.
- [ ] Check layout/keyboard use on the owner's intended browser/window size. Cookie Sets is clearly future-only. Development fixtures are separate and no new permissions are implied.

After the owner's functional sanity check, Cris independently attempts the same everyday tasks without coaching on database terms. Record her observations separately; agent synthetic smoke cannot satisfy that gate. Full physical-photo acceptance remains blocked pending separately approved 0005/recovery activation. CC-TODO-019 and enabled-data recovery/CC-TODO-023 remain production gates regardless of UI acceptance.

## Validation before development publication

Policy copies and manifest are byte-identical to authoritative v1.0.0 Git blobs at `53aa39ccedce935a702f44072cc647231c8cc02e`; SHA-256 digests passed, no exceptions. Initialization verified PR #7 at `ffe35a67cbf275f3b74f0d62a292963eb2e69f66` (open, pre-existing main conflict), draft #12 at `09cfa8539f53ee0e01c9c2e6820df1c04a181bb2`, and open/unmerged #14 at `aa3b68543aea2ec5eef06f47f137fc09427d8081`. Main is protected at `539ec6275c21eb72a70d6d1a41b34b53585f55f6`; R1 ref is `62e92a16a1e32975ee6bc7f15679183120315411`.

Local focused evidence: 7 new Contextual Workspace/timer tests, 18 existing inline-workspace regressions and 2 header/recovery tests passed; TypeScript and production build passed. Schema smoke, 11 restore-helper tests, 3 source-audit tests, synthetic import and 33 tooling tests passed. All 66 Markdown/link checks, docs JSON, policy hashes and clean-diff checks passed. The broad application run is tracked separately: it exposed a header animation-frame dependency in jsdom, corrected to a deferred window event and verified by the 2 header tests. Do not treat the earlier failed invocation as passing; exact-head required CI must establish the complete suite result.

No production or migration workflow is run. Existing feature pushes trigger the approved `cookie-catalog-dev` build; the source inspection confirms that this is deployment, not migration activation. The live dev candidate, required CI and browser smoke are pending until separately recorded below or on PR #7 with exact commit links.
