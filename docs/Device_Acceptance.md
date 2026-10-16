# CC-TODO-004 — Intended-device acceptance

Prepared 2026-10-14. Actual owner-device/browser acceptance is not closed by cloud-browser checks.

## Current scope — October 16 owner decision

First-release targets are **Windows Chrome and Microsoft Edge only**. Safari/iPhone is removed from the active release checklist, not failed or passed. Historical observations below remain evidence of earlier scope.

| Browser | Current release outcome |
| --- | --- |
| Windows Chrome | Actual device/browser version and focused-layout/edit/download outcomes pending |
| Windows Edge | Actual device/browser version and focused-layout/edit/download outcomes pending |

Use the short owner check below on these two browsers; do not repeat full recovery drills.

## October 14 owner-mediated acceptance

Existing owner session displayed Admin / Owner. A separate private-browser viewer session showed read-only access; owner passed tree search, View details and existing-original download with forbidden controls absent. Browser name/version/device for these new observations was not explicitly captured, so do not assign them to Edge or iPhone Safari. Earlier Windows owner evidence and all completed functional passes remain valid. Next device work records the current Windows Chrome/Edge targets rather than rerunning every infrastructure check.

## Queued targets and sequencing

Owner specified Chrome and Microsoft Edge on Windows, plus Safari on iPhone on 2026-10-14. “Edge/Explorer” is recorded as modern Edge, with no legacy Internet Explorer support added. That was the earlier target list; October 16 scope above supersedes it. Current targets are acceptance criteria within CC-TODO-004, not the current implementation priority. Complete the current base-infrastructure follow-ups first; retain actual device verification before release. No compatibility fixes or new device passes are claimed by this update.

## Evidence and gaps

| Surface | Evidence | Status |
| --- | --- | --- |
| Assistant cloud Chrome desktop | Owner-authenticated catalog, matched search, original retrieval, archive/local restore, missing-original check, compatible code rollback/roll-forward | Passed for that browser; not a substitute for owner devices |
| Owner Windows PC | Node v24.21.0/npm.cmd 11.19.0 verified; earlier owner-confirmed UI/search/photo/archive evidence is preserved | Chrome and Edge targeted; exact browser versions and intended-device outcomes pending. Do not reinstall Node or repeat every prior test |
| Phone/tablet | No completed specific-device acceptance recorded | Outside first-release support per October 16 owner decision; no acceptance required for this release |
| Responsive source setup | app/index.html includes width=device-width, initial-scale=1.0 | Present in source; does not prove mobile usability |

## Short owner check

Use the normal development site on each device intended for day-to-day use. Record device, OS, browser/version, date, source commit if shown, and pass/failure. Keep credentials and PINs out of notes.

1. Sign in and confirm text and controls are readable without sideways scrolling or overlapping fields.
2. Browse Cutter shapes, search tree, and check that Matched fields identifies name/notes hits. Open a known record and confirm the form is readable. Previous search correctness passes remain valid; this checks the device experience.
3. On the primary editing device, inspect the labelled TEST Infrastructure shelf. If testing Save changes, retain its existing values, wait for Saved and refresh; do not alter real inventory for a device test.
4. Under Private files select the existing demonstration shape and download the retained TEST_ONLY STL. Confirm the file saves and can be opened with the intended local app. It is a synthetic recovery fixture, not an instruction to print it.
5. If that device will manage backups, try the appropriate TAR save/download method, confirm a nonempty saved file and its private location. Direct folder saving requires supported desktop Chrome/Edge; the bounded TAR download supports up to 64 MiB. Do not change browser security settings to make a picker work. Earlier verified local restore remains valid; another full restoration is not required merely to check file-saving usability.
6. Report the precise screen/control/message for failures. Keep real originals, full archives, credentials and personal identifiers out of public issues.

Record only observed outcomes. Mobile viewing, editing, downloads, backup handling and physical-cutter location retrieval can have different readiness. Support must be chosen and tested rather than inferred from viewport metadata or desktop success.

No owner-device remote control or browser emulation has been claimed. Once actual target-device outcomes are known, update this matrix and the User Companion; leave unsupported/pending workflows explicit.
