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

## Exact-source development acceptance checkpoint

Application candidate **`b2511b3fa05de123cec23faf8d22c89161ccc673`**, tree `f3bf5177f2981293cd35dfc9f18577c129c3251b`, is published on the existing feature branch. GitHub tree matched the local tree byte-for-byte and the fetched checkout was clean. [Required sqlite CI](https://github.com/JBrickey23/Cookie_Catalog/actions/runs/39639300912/job/119358313956) passed **190/190 application and 33/33 tooling tests**, schema/recovery/audit/synthetic import, documentation checks and TypeScript/build. Cloudflare development build **`1fa62e60-389b-450f-974d-7c704641b7dc`** passed. The authenticated running `/api/dev/infrastructure-check` independently attested full commit `b2511b3fa05de123cec23faf8d22c89161ccc673`, branch `feature/cc-infrastructure-foundation`, source `cloudflare-workers-builds`, Node v24.21.0, checks passed, zero foreign-key violations and **only migrations 0001–0004**. This is development delivery, not production release readiness.

The long local serialized suite emitted 190 case results, including the earlier header failure and three workspace/Undo failures, then did not produce a clean completion summary. It is **not** recorded as a full local pass. Header behavior was corrected and its 2 focused regressions passed. The three workspace failures subsequently passed unchanged in one isolated 3-test run; all 190 passed on the exact remote candidate. The local-run instability/root cause is unproven; no backup/recovery timeout or application protection was relaxed. CC-TODO-019 remains unresolved. Seven new workspace/help tests and 18 inline regressions also passed locally. The remote complete-suite result is the comprehensive regression evidence, with this local limitation retained explicitly.

### Actual cloud Chrome smoke — observed, not owner/Cris acceptance

| Check | Observed result / limit |
| --- | --- |
| Task home and context separation | Passed: clean task home, persistent catalog navigation, no backup/fixture controls in everyday workspace, no active Cookie Sets control. [Actual task-home screenshot](evidence/Contextual_Workspace_Home_20261021.jpg). |
| Find and ownership | Passed: retained TEST UX fixtures showed Producer A physical entries and Producer B with no recorded inventory. Name/producer identity retained. Review/unknown labels additionally covered in automated tests; no ownership inferred from images. |
| Save design for later | Passed: explicit new Star design; missing-scheme source URL was rejected, containing section reopened and field focused, name/producer/draft survived. Corrected explicit HTTPS URL saved and opened a normal persisted card with no inventory. |
| Workspace draft preservation | Passed: invalid design draft and later unsaved quantity survived Administration navigation; Catalog navigation/keyboard return restored the draft. Footer mouse activation was unreliable through the automation locator, while keyboard return and top navigation worked; owner mouse usability remains on the checklist. |
| I have a cutter / existing design | Passed: searched the persisted Star, selected producer design read-only, saved 2 copies at 76.2 mm in the existing synthetic TEST shelf; no photo/STL/source URL was required for physical creation. |
| Another size / shared design | Passed: Add to Inventory saved a distinct 101.6 mm record with quantity 1; readback showed both cutter IDs linked to the same Star. |
| I have a cutter / new design | Passed: explicitly created Heart and its physical record together without optional files; persisted Focus Card opened normally. |
| My Cutters and reference discovery | Passed: physical filter selected; TEST WORKSPACE search returned 3 physical records with sizes/quantity/location. Reference filter returned the 2 producer designs, including those with stock. |
| Inline editing | Passed: saved optional cutter note through the advanced disclosure; readback retained quantity 2, synthetic shelf and shared producer design. Temporary quantity 7 was canceled, not saved. |
| Intentional help | Passed: keyboard activation immediately showed Quantity help; Escape dismissed it and kept the quantity draft. Pointer dwell/cancellation, context change and full-help href are deterministic automated coverage; live pointer timing/full-guide navigation not newly attested. |
| Retained administration/diagnostics | Passed: Undo shortcut revealed Administration and recent-change review; backup controls available, diagnostic controls separate. No Undo mutation, backup/restore, cleanup, schedule edit, import, fixture or maintenance operation executed. |
| Physical photos / device coverage | Gated: existing development schema still lacks 0005; friendly unavailable warning is visible. No migration activation or live physical-photo success claimed. Cloud Chrome desktop is agent smoke; owner browsers/responsive layout and independent Cris remain acceptance work. |

Synthetic development fixtures retained for retesting (not real catalog data):

- Star producer design `shape_7c1f4c857e864f299a2f6ccc888405e4`, named **TEST WORKSPACE 20261021 Star**, producer **TEST Workspace Producer**. Source `https://example.test/workspace`.
- Medium `cutter_67ec39020838405a815c7fba7387bed5`: 76.2 mm, quantity 2, purchased, existing **TEST Infrastructure 20261014 Shelf**, notes `Synthetic workspace acceptance; optional notes.`
- Large `cutter_16f77301a8a745b3b1b5fb0e2caa55cc`: 101.6 mm, quantity 1, unknown origin/location.
- Heart producer design `shape_1ce1d1e801bc4c1e90ebd58167f439ac`, named **TEST WORKSPACE 20261021 Heart**, same producer; one physical cutter with quantity 1 and unknown size/location. No images or digital files uploaded. Discover through the shared TEST WORKSPACE search.

Retained earlier TEST UX fixtures/originals were read, not edited. No production, credential, cloud configuration, schedule, release gate, migration or other repository content changed. Main/R1 refs and #12/#14 boundaries are verified separately at final publication. The following closing documentation commit changes no application source; its own exact-head CI/development attestation is recorded on PR #7 to avoid a self-referential commit loop.

## Immediate handoff and remaining decisions

The tested development candidate is ready for the owner's functional sanity check above, then independent Cris usability. Record mouse/keyboard friction, intended-browser/window results and observed source; do not close CC-TODO-021 or claim full R2.1/Cris acceptance from this smoke. The owner must separately authorize safe 0005/recovery activation before live physical-photo acceptance, and later any production transition. No new architecture, identity, infrastructure or cost decision was required here. PR #7 still has its pre-existing main conflict; #12 stays draft and unmerged, #14 remains unmerged planning whose overlapping documentation will need reconciliation if later selected for merge. This batch does not resolve those branches by merging or change R2 priorities.
