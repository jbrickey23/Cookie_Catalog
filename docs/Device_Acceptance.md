# CC-TODO-004 — Intended-device acceptance

Prepared 2026-10-14. Actual owner-device/browser acceptance is not closed by cloud-browser checks.

## Evidence and gaps

| Surface | Evidence | Status |
| --- | --- | --- |
| Assistant cloud Chrome desktop | Owner-authenticated catalog, matched search, original retrieval, archive/local restore, missing-original check, compatible code rollback/roll-forward | Passed for that browser; not a substitute for owner devices |
| Owner Windows PC | Node v24.21.0/npm.cmd 11.19.0 verified; earlier owner-confirmed UI/search/photo/archive evidence is preserved | Browser/version and intended-device checklist outcome not fully recorded; do not reinstall Node or repeat every prior test |
| Phone/tablet | No completed specific-device acceptance recorded | Pending if intended for use; device/browser choice not yet established |
| Responsive source setup | app/index.html includes width=device-width, initial-scale=1.0 | Present in source; does not prove mobile usability |

## Short owner check

Use the normal development site on each device intended for day-to-day use. Record device, OS, browser/version, date, source commit if shown, and pass/failure. Keep credentials and PINs out of notes.

1. Sign in and confirm text and controls are readable without sideways scrolling or overlapping fields.
2. Browse Cutter shapes, search tree, and check that Matched fields identifies name/notes hits. Open a known record and confirm the form is readable. Previous search correctness passes remain valid; this checks the device experience.
3. On the primary editing device, inspect the labelled TEST Infrastructure shelf. If testing Save changes, retain its existing values, wait for Saved and refresh; do not alter real inventory for a device test.
4. Under Private files select the existing demonstration shape and download the retained TEST_ONLY STL. Confirm the file saves and can be opened with the intended local app. It is a synthetic recovery fixture, not an instruction to print it.
5. If that device will manage backups, try the appropriate TAR save/download method, confirm a nonempty saved file and its private location. Direct folder saving requires supported desktop Chrome/Edge; the bounded TAR download supports up to 32 MiB. Do not change browser security settings to make a picker work. Earlier verified local restore remains valid; another full restoration is not required merely to check file-saving usability.
6. Report the precise screen/control/message for failures. Keep real originals, full archives, credentials and personal identifiers out of public issues.

Record only observed outcomes. Mobile viewing, editing, downloads, backup handling and physical-cutter location retrieval can have different readiness. Support must be chosen and tested rather than inferred from viewport metadata or desktop success.

No owner-device remote control or browser emulation has been claimed. Once a target device and outcome are known, update this matrix and the User Companion; leave unsupported/pending workflows explicit.
