# R2.1 — usable core acceptance and simplified Add a Cutter proposal

**October 20, 2026 Pacific. CC-TODO-021 / 010, with 018/019/020/022/023 gates.** This document is a proposed acceptance protocol, not a report of a completed Cris walkthrough or authorization to deploy/migrate. [Roadmap](R2_Plan.md) · [retained implementation/browser evidence and existing test IDs](Reference_Inventory_UX_R2.md).

## Simplified Add a Cutter workflow — proposed UI, existing model

Offer one obvious **Add a cutter** entry for the normal physical-cutter task. Reuse current Browse/EntryEditor/Focus Card, existing reference picker, guarded Save and private photo path. Do not expose advanced Catalog record-type management as the normal workflow or make Cris understand 'Reference versus Objects' before starting. User-facing wording below is proposed for owner/Cris validation; no UI was changed in this planning batch.

1. Ask what the user wants to do: **I have a cutter** (normal physical route) or **Save a design for later** (reference-only). The latter must not imply ownership.
2. Search existing names/producers first; show a recognizable photograph if present and the producer so similar designs remain distinguishable. Select the intended design. If none matches, visibly choose **New design** and enter its name/producer, with source/reference image/digital files optional. Do not auto-merge or create on a search click.
3. For 'I have a cutter', show the chosen design read-only and ask the few physical questions: where it is, how many interchangeable copies, and optional size/origin/Slot/notes/photo. Quantity defaults to the existing 1; unknown location/origin are allowed and clearly labeled, not guessed. Keep existing unit labels and do not infer dimensions from images. Further physical details can use established inline editing after Save.
4. Save once, open the persisted normal Focus Card, and clearly explain if the record saved but its optional photograph did not. Preserve drafts and field-specific validation; URL values need explicit http:// or https://. A failed/unconfirmed write is reviewed before retrying.
5. From any saved design/cutter, **Add another size or copy** can use the existing Add to Inventory route. Interchangeable copies at the same tracking location use quantity; separate sizes/locations/tracking use separate physical records. Keep reference edit available from its own card, not in the physical-create form.

Current code already provides New physical cutter, New reference, name/producer selection, Create a new reference, read-only linked creation, quantity, optional photos, normal persisted Focus Cards and navigation. The work proposed here is entry wording, progressive presentation and small usability fixes validated by Cris, not a new schema or universal shape hierarchy. Existing reference/digital-file interfaces remain available; this entry need not duplicate every advanced attachment tool. New digital-file ingestion/analysis is not required for basic cutter addition.

## Help timing — GitHub Issue #13

[Issue #13](https://github.com/JBrickey23/Cookie_Catalog/issues/13) belongs to existing CC-TODO-021. Owner requested a 1–3 second dwell; initial proposal **1.5 seconds**. Current FieldHelp reveals immediately on wrapper mouse enter/focus; the dwell is **not implemented/tested**. Future implementation must specify the '?' trigger hover boundary, cancel pending reveal on leave/unmount/trigger change, avoid stale timers/rail flicker, show intentional keyboard focus/explicit activation immediately, and preserve existing full-help links, Escape, dismissal and field drafts. Do not silently remove the existing separate full-documentation link while making intentional quick help immediate.

## Independent Cris usability walkthrough

**Current status: NOT RUN / NOT ACCEPTED.** Prior agent Chrome and automated passes remain accepted engineering evidence; they do not count as Cris usability acceptance. No duration/click-count target is invented.

Owner prepares a known development candidate and synthetic fixtures, records commit/environment/browser/device privately where appropriate, and confirms migration/recovery preconditions. Cris performs the tasks without the agent/owner pointing out controls or explaining database entities. In-app instructions/help are allowed. The owner may observe silently and record success, hesitation, mistaken clicks, data misunderstandings and any assistance needed. A coached completion is not an independent pass; record the blockage, fix only an authorized gap and repeat that task independently.

| ID | Task Cris performs independently | Required observable result | Current status |
| --- | --- | --- | --- |
| C1 | Find a cutter by ordinary name or theme/tag, identify producer and location. | Recognizes what is actually recorded as physical stock versus a reference; can open/close its Focus Card and return to results. | Pending |
| C2 | Add a new producer design with a cutter using the simple entry. | No database vocabulary/tutorial/CLI; saved record opens directly in normal viewing mode. A duplicate reference is not silently created. | Pending |
| C3 | Add a Medium and a Large cutter for one existing design. | One stable producer reference, two correct physical records; selected shared fields stay read-only while adding inventory. | Pending |
| C4 | Record two interchangeable copies and a separately tracked item. | Quantity 2 for the group; separate record only where size/location/tracking warrants it. No fabricated possession from a file. | Pending |
| C5 | Add the same-named design from a second producer. | Separate reference IDs, recognizable producer distinction; can later find both. | Pending |
| C6 | Save without photo, STL or source URL; then correct an invalid entered URL. | Optional data truly optional; invalid field highlighted/focused, input retained, explicit scheme requested, no silent URL rewrite. | Pending |
| C7 | Add/view a finished-cookie reference photo and a different actual-cutter photo. | Distinct labels/ownership; physical photo appears only on its intended record, not the other size or producer. Refresh confirms persistence. | Blocked until safe 0005 activation; then independent test pending |
| C8 | Follow reference ↔ associated inventory, make a small inline edit, and deliberately cancel a draft. | Normal Save/Cancel/navigation, drafts guarded once; no hidden reset, repeated stale confirmation or accidental shared-reference change. | Pending |
| C9 | Move across ? briefly, hover deliberately, use keyboard/click help, dismiss it. | No accidental popup before dwell; pending reveal cancels on leave; intentional help is immediate and preserves the draft. | Issue #13 implementation and live test pending |

After C1–C9, owner records the exact candidate, outcomes and any assistance. Cris states whether she can use the normal workflow on her own; owner accepts or lists concrete remaining changes. **All required independent tasks must pass** before saying R2.1 usable-core owner acceptance is complete. A new design collection/Set task is reserved for R2.2; do not fail R2.1 for absent future Set controls.

## Owner engineering and release checklist

- [ ] **O1:** Attest the candidate/environment, exact-head required CI, development build and actual running source. Reuse recorded synthetic fixtures; never modify real originals to fabricate acceptance.
- [ ] **O2:** Review safe physical-photo migration 0005 preconditions: approved dev target/operator, expected 0001–0004 baseline, fresh protected recovery copy, compatible archive tools/profiles and rollback plan. Stop on unexpected pending migrations, an active/unknown restore/backup/import/retention operation or unverified recovery. No activation occurs in this batch.
- [ ] **O3:** After separately authorized development activation, verify 0005/FKs and both live photograph types, cross-size isolation, optional-empty saves, original download/persistence and recoverability. Existing originals must remain byte-identical; no destructive cleanup test.
- [ ] **O4:** Record independent Cris C1–C9 and owner's Reference & Inventory acceptance separately from agent tests; do not close 021/010 on builds alone. Review #13 wording/dwell only after the behavior is real.
- [x] **O5a — owner-reported:** Initial Change Request capture accepted, as explicitly stated in the roadmap handoff. Acceptance date/device/request ID not supplied; this is not a new independent worker test.
- [ ] **O5b:** Separately verify downstream request export/reconcile/planning and the operational independent recovery path under 018/023 before claiming them complete. Catalog backups do not include request records or inbox state. Initial capture acceptance does not waive protection for enabled data.
- [ ] **O6 — production gate:** CC-TODO-019 root cause and verified fix/operational evidence; current private independent catalog/original recovery point and required enabled-data recovery evidence. Successful resume or a local archive test alone does not close the stall.
- [ ] **O7 — production gate:** Reviewed immutable candidate/artifact, compatible rollback baseline, approved R1 first-transition restrictions, maintenance/server write rejection, known-operation/background coordination, practical drain, stale-browser/draft safeguards, actual post-deploy verification and controlled reopening. Keep uncertainty closed; no automatic data restore or timeout unlock. Automation implementation stays in #12; essential controls cannot wait for R2.3.
- [ ] **O8 — separate authorization:** Owner approves a concrete production transition/release only after gates pass. PR #7 conflicts/protected review must be resolved through separately authorized work; neither #7 nor #12 is merged by this reconciliation.

O1–O5 and C1–C9 provide the product/development acceptance record. O6–O8 additionally govern any production release. Record blocked/unverified criteria explicitly; never convert blank checkboxes into success from the phase label.
