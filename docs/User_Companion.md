# Cookie Catalog — User Companion

## Browse and edit in place

Select a result card to open details on the left and scroll remaining results on the right. Attached cutter images appear at the top of the focused card, above the editable fields. Click a value to change it. Save/Cancel appear only while values differ; switching or closing asks before discarding a draft. Save keeps a small recovery copy of the affected entry automatically; it does not wait for a full-catalog backup or file scan. Tags can be searched or drafted here; new tags and shapes are saved only with the entry. Cancel creates no vocabulary. Existing shape values and files are shared across size variants. New physical cutter can select an existing shape or draft a named new shape; New shape reference adds no physical stock.

BIN/location uses an existing assignment. A selected physical location overrides the original OneNote assignment; clearing it returns to that source assignment. Location does not confirm physical ownership or printing. Admin deletion asks for confirmation, protects the current state, and blocks linked records rather than deleting related inventory/files/history. Conflicts keep your draft; compare with the latest record before retrying. Designs and compatibility mapping management remain in the advanced catalog section.


## Open an image without leaving your card

In a focused cutter card, click any available photo or its Open image link. It opens the original in a separate read-only browser window so you can inspect, snip or save it. Close that window to continue at the same focused card; unsaved field edits stay in the catalog tab. Download original remains beside every available file. The browser may choose a tab instead of a window or require allowing pop-ups for this site. Ctrl-click/open-in-new-tab remains available. Viewing or saving a local copy does not update the catalog original; changing the stored file still uses the website attachment workflow.

## Undo a routine record change

Admin/owner can expand **Undo recent record changes**, select **Review change**, and then **Undo this change** after reviewing it. This restores that entry's previous values when its current saved state still matches the recorded result. Newer changes and new linked records block undo. Failed attempts may appear in the list but cannot overwrite unrelated state. Images and originals stay shared and in place. Undo also retains a recovery copy of the values it replaces.

## Backups and recovery from inside the app

Use the Backups and recovery panel. **Back up now** saves and checks a private app-managed snapshot. No CMD, file download or pasted reference is required. **Back up and import confirmed cutters** automatically creates and checks its protected snapshot before importing. The advanced existing-backup option is optional compatibility support.

For recovery, choose **Review restore**, review the selected snapshot and current physical-cutter counts, then **Approve restore**. The app protects the current state first. It holds catalog maintenance until the selected data/originals and database readback are consistent. Interrupted operations can be resumed, or rolled back to their automatic pre-restore snapshot after approval. Publishing the app does not restore your data.

Daily fresh backups are off initially. Enable them and save a Pacific-time hour to schedule them. Approved work resumes in the background if the browser closes. Complete/checked snapshots are shown in the list. Open **Storage and backup cleanup** to see storage usage and review selected removals. The newest checked points stay protected. Older protected points require reviewed protection release before a separate cleanup approval. Incomplete jobs need an explicit discard acknowledgement. Approved cleanup resumes if the page closes and preserves shared files, live originals and record Undo history. App-managed snapshots share the existing private storage provider; independent OneDrive/off-provider copies remain a separate protection layer. See [managed backups](App_Managed_Backups.md).

## Bins and Physical/Digital are separate

The bin identified by OneNote is the recorded location. It needs no extra confirmation. Existing imports use that bin automatically; new imports record it. If a cutter moves or the source was incorrect, edit its Storage location. The editor's Use OneNote bin option retains the inherited assignment. A chosen storage location overrides it.

Physical / Digital / Both describes the collection status independently. Digital entries can have an assigned bin without claiming that a physical cutter already exists. A bin assignment never proves physical ownership. Recorded locations are complete in the review queue; missing sizes, originals and other checks remain separate.

## Quickly confirm Physical / Digital / Both

Open Import preparation workspace, list/open the existing saved review, then choose Open quick verification. Search by name or bin and review thumbnails/source evidence. Physical means an owned cutter; Digital records a source reference, not an original STL/3MF on file. Both records both classifications.

Choose Confirm safe suggestions in this group to confirm all matching unconfirmed entries, including other pages. Change individual choices as needed. Sets, size variants, possible duplicates and unknown suggestions stay for detailed review. Not-printed/not-purchased evidence blocks physical stock until explicitly corrected under Review details.

Save checklist decisions keeps your work without creating inventory. Admin/owner can supply a verified protected pre-change backup reference, check its confirmation, then choose Save decisions and import confirmed cutters. The app saves decisions, plans batches and imports eligible individual cutters; blocked entries stay for review. Digital-only choices create no stock or originals. Existing source shapes/photos are reused, already imported entries are skipped, and catalog browsing refreshes. Keep edits idle while importing. If a request fails, reopen the latest review; completed source mappings prevent duplicate inventory on retry. Missing measurements and locations remain collection tasks.

This is development functionality; actual device and owner acceptance still apply. See [Quick verification](Quick_Verification.md).

## Save your import review work

After the saved-review development activation, Import preparation workspace can save and reopen a prepared review across sessions. Save new review keeps classifications, ownership, quantity unknowns, Bin/optional Slot, longest-edge reference size, original size labels, source references and review notes. Download reviewed manifest still gives you a separate copy. Save review changes retains earlier versions and protects against overwriting somebody else's work.

Record import preview summarizes gaps in a saved version. This does not create inventory or upload originals. Earlier versions can be opened as drafts; saving creates a new version. Changing item type resets ownership/quantity assertions and completion, retaining applicable source notes. Actual bulk catalog import remains a separate next step. See [saved review instructions](Saved_Import_Reviews.md).

Updated October 14, 2026. This guide describes the current development app and will be updated when its behavior changes.

## Access roles

Admin and owner currently have identical catalog permissions: all existing editing, file deletion, backup/export and maintenance controls. Viewer access is read only: browse, search, view record details and download originals. Viewers do not receive editing, upload, deletion, backup/export or maintenance controls. Accounts are managed through private Cloudflare settings; there is no user-management screen in the app. Catalog roles do not grant Cloudflare dashboard access.

## Start here

Cookie Catalog helps you find a decorating design, identify the cutter shape it uses, locate a physical cutter, and retrieve its photo or printable original.

The current site is a private development version. Use clearly labelled TEST or DEMO examples while acceptance work continues. Owner sign-in works. Approved admin/viewer accounts are configured privately. Existing-owner and viewer sign-in/read-only workflows passed owner checks; the second admin's separate sign-in remains pending.

Open the development site at https://cookie-catalog-dev.j-brickey.workers.dev/ and use its email-code sign-in. Enter sign-in codes on the sign-in page, never in a chat.

For a first example, create a shape, a storage location, a physical cutter, a design, and a mapping between the design and shape. Add originals afterward under Private files.

## Find missing catalog details

Catalog review queue shows physical cutters, printable files, designs and unclassified shapes. Open an item to see missing or unverified dimensions, location, images, scale reference or provenance. Existing values are not automatically verified. Printable-only entries do not request a physical storage location. This queue is read only and does not save completion decisions yet.

Admins/editors can expand Import preparation workspace to open a prepared JSON manifest. Classify an item, split another item from the same source page, enter dimensions/location, label source-file references and record review notes/evidence. Download reviewed manifest to keep changes. It stays in the current tab until saved; no manifest or source payload is uploaded and no live import occurs. Viewers do not receive this workspace. Keep original exports and downloaded drafts private. See [workflow](Catalog_Completion_Workflow.md) for details.

## Avoid overwriting another editor

Edit opens the latest saved record. If someone changes it before you save, your save is refused and your draft stays in the form. Copy your draft, reopen the latest record and compare the changes before saving. After an application upgrade, refresh older tabs before beginning a new edit. Unsaved-change prompts help when switching records/sections, but keep a copy before leaving a page.

## What each record means

| Browse choice | What it describes | Example |
| --- | --- | --- |
| Cutter shapes | The reusable outline, regardless of whether you own a physical copy | Evergreen tree |
| Decorating designs | The decorated-cookie idea or artwork | Snow-covered Christmas tree |
| Storage locations | Where physical cutters are kept | Cabinet A / Bin 3 |
| Physical cutters | Actual cutters you own, linked to a shape, with size, quantity and location | Two printed evergreen cutters, 90 × 100 mm, in Bin 3 |
| Design/cutter mappings | A recorded relationship between a design and a compatible shape | Snow-covered tree uses evergreen shape in the standard orientation |

A printable STL or 3MF file is an attachment to a shape. Keeping that file does not mean you already own a printed cutter. Add a Physical cutters record when you need to track physical inventory.

One shape can serve several designs. A design can have mappings to several shapes. Current controls record these links individually; a richer assembly or multiple-component workflow is future work.

## Add and edit records

1. Under Catalog records, select Cutter shapes in Browse. Enter Shape name; add Maker, Source link and Notes / themes when known. Select Create record.
2. Select Storage locations and create a clear Location label, such as Cabinet A / Bin 3. Add notes if useful.
3. Select Physical cutters. Choose the Cutter shape and optional Storage location. Record Width and Height in millimeters, Quantity, and Origin: purchased, printed or unknown. Leave unknown optional dimensions blank rather than guessing.
4. Select Decorating designs. Enter Design name, an optional Source link and useful Notes / themes.
5. Select Design/cutter mappings. Choose the design and shape, then record compatibility and how the cutter is used.

An asterisk marks a required field. Wait for the Saved message before navigating away. There is no autosave.

To change a record, find it in its Browse category, select Edit, review the form and select Save changes. Clearing an optional field removes its previous value when saved. Use Start a new record before adding another entry.

After an uncertain save or connection error, refresh and search before creating the same record again. The first save might have succeeded.

The current app edits records but does not yet delete catalog records. Removing a file is a separate action. Large collections also need an improved linked-record chooser; current selectors show up to the first 200 choices.

### Compatibility and flips

| Field | How to use it |
| --- | --- |
| Compatibility: proposed | You believe the shape may work; it has not been confirmed |
| Compatibility: tested | You have checked the fit/use yourself |
| Use: standard | Ordinary use of that shape |
| Use: flip | Record an alternate orientation/use in Instructions |
| Use: combination | This mapping participates in a combination; explain the other parts in Instructions |
| Rotation / Mirror | Record the intended orientation |
| Minimum / maximum compatible width | Record a known size range in millimeters; these fields do not resize a model |

Example instructions: “Proposed flip for a party hat; rotate 180 degrees; verify the outline before printing.”

Changing a label to tested does not perform a geometric fit check. Automatic flip suggestions and model transformations are future work. V1 sizing happens in your slicer; the catalog keeps originals and sizing information.

## Name records and understand search

Use a specific name for the main identity and Notes / themes for useful descriptions and themes.

For example, keep Evergreen tree as a shape name and put Christmas, woodland and winter in its notes. Name a decorating design Snow-covered Christmas tree. Use its physical-cutter record for the actual size, quantity and shelf.

To search:

1. Choose the relevant Browse category.
2. Enter a word or phrase in Search record metadata and select Search.
3. Read Matched fields under each result. The field label and highlighted excerpt explain why the result appeared.
4. Select Edit to inspect the stored values. Use Next page when offered.

Searching tree can match Tree, Christmas tree and Tree house. It can also find a record whose notes contain tree. Matched fields distinguishes a name hit from a notes hit.

Search uses literal text within individual fields. It is not a photo search, synonym engine or automatic category classifier. A phrase must occur within one searchable field; searching Christmas tree does not combine Christmas from a name with tree from separate notes. Ordinary English letter case is ignored.

| Browse category | Currently searchable metadata |
| --- | --- |
| Cutter shapes | Name, notes/themes, maker, source link |
| Decorating designs | Name, notes/themes, source link |
| Storage locations | Label and notes |
| Physical cutters | Related shape name, location label, cutter notes, origin, width, height, quantity |
| Design/cutter mappings | Related design and shape names, compatibility status, use type, instructions |

Not every stored field is searchable. For example, mapping rotation/mirror/width-range fields and attachment filenames are not part of the current catalog search.

Metadata is stored with catalog records. The app does not currently embed it into photo/STL/3MF originals or extract photo metadata automatically. Dedicated tags, aliases, custom metadata and photo-assisted extraction are future work.

## Keep photos and printable originals

Under Private files:

1. Choose Record type: Cutter shape or Decorating design.
2. Choose the existing Record.
3. Select Original file.
4. For a printable shape file, optionally add source/license notes.
5. Select Save private file and wait for confirmation.
6. Use Refresh files or reload, then Download original to retrieve the stored original.

Accepted images are PNG, JPEG and WebP. Cutter shapes also accept STL and 3MF. Decorating designs currently accept images, not model files. Maximum original size is 25 MiB.

Files are private and downloads require owner sign-in. The app verifies the stored byte count and checksum when downloading. Current checks do not establish that a model will print correctly; inspect it in your slicer and retain its license/source.

### Remove a file or handle a missing original

Keep a trusted private backup before removal. Select Remove, review the warning, then Delete original. This permanently removes the stored original and all catalog attachment links to it. It does not delete the cutter shape or design itself. A derived printable relationship may block removal until that dependency is handled.

If Original missing appears, the catalog still has an attachment entry but cannot find its stored bytes. Do not treat the listing as a usable copy. Preserve the metadata and trusted backup, and get help with recovery. The development app does not yet offer a general Restore original button.

If a download reports an integrity failure, retain the backup and report the error rather than replacing the record blindly.

Storage cleanup checks for originals without catalog metadata after an interrupted operation. It is a development/maintenance tool, not a daily task. Files younger than 24 hours are kept; removal is manual. Do not remove an unfamiliar object simply because it appears in a cleanup list.

## Save and verify backups

GitHub holds application source and instructions. Full catalog archives and originals belong in a private backup folder, such as your personal OneDrive Cookie_Catalog/Backups folder.

Keep edits, uploads and deletions idle while creating a backup.

Approved backup routine: Jay saves a complete TAR to private OneDrive after meaningful catalog changes and before imports or bulk edits/deletions. Keep the latest seven normal backups plus a protected pre-change backup until the changes and recoverability are verified. Retention is manual; automatic deletion is not enabled. A backup helper with an optional PowerShell launcher is implemented under CC-TODO-012 and awaits Windows acceptance. See [Backup helper](Backup_Helper.md). It validates/copies TARs, writes receipts and reviews retention without deleting backups.

| Control | When to use it |
| --- | --- |
| Save catalog archive | Save a TAR directly to a chosen private folder in compatible desktop Chrome or Edge; supports the larger archive path |
| Download small TAR archive | Download a complete TAR up to 32 MiB when direct folder saving is unavailable |
| Download development backup | Older small JSON export, limited to 4 MiB of originals total and 25 files |

The 32 MiB TAR limit is a limit on that download method, not your catalog's total storage capacity. Current larger-path development ceilings are 25 MiB per original, 1,000 originals and 1 GiB of originals per archive. Those ceilings are not a promise of verified production capacity.

Use a folder and timestamped filename. Generated names use UTC; Z indicates UTC. A practical pattern is:

`Cookie_Catalog/Backups/2026-10-14/Cookie_Catalog_<timestamp>.tar`

The folder is your choice; the app does not create a backup schedule, prune old snapshots, or confirm OneDrive sync. Check that the saved file exists and that your cloud folder has finished syncing.

A Saved or Download started message alone does not prove recoverability. A trusted archive must pass a restore check into a new isolated location, with original bytes and relationships verified. Local TAR recovery with a 5.4 MB original has passed; full restoration into isolated Cloudflare resources remains future acceptance work.

Technical recovery steps are in [Archive backup and restore](Archive_Backup.md) and [Backup recovery plan](Backup_Recovery_Plan.md). Do not restore over the live catalog or run a restore against an untrusted archive.

If a backup fails or is cancelled, keep an earlier known-good copy and retry when the catalog is idle. Do not rely on a partial file.

## Understand the development controls

These controls help verify infrastructure. They are not required each time you use the catalog.

| Control | What it checks or changes |
| --- | --- |
| Verify development infrastructure | Reads the running source version, database migrations/relationships and storage. It does not change records or files |
| Test missing-file recovery | Creates one temporary synthetic photo/record, simulates loss of only those bytes, restores them, and verifies cleanup |
| Check development database | Reads a specific demonstration relationship; changing that demonstration can make this check fail |
| Check private file storage | Saves, reads and removes three tiny invented files |
| Download file recovery test | Creates temporary sample records/files, packages them, and removes the temporary fixtures; the downloaded package still needs restoration verification |

A passed infrastructure report is a snapshot, not proof of every business workflow or a production-readiness certificate. Source commit identifies the deployed application version. Build Node describes the cloud build environment; it is separate from the Node installation on your Windows PC.

If a test says cleanup could not be verified, stop repeating it and request review. Tests have their own temporary fixtures; ordinary catalog records should not be removed to make a development check pass.

## What an application rollback means

A code rollback runs an earlier application version. Some newer controls may temporarily disappear. Your catalog records and original files need separate preservation and recovery checks whenever a rollback is planned.

On October 14 the development app was moved to a verified earlier version and returned to the current version. Sign-in, a test-record save and original downloads worked in both. Fresh backups confirmed that every record, relationship and original stayed unchanged. This was a compatible development-code test; production release and full cloud data restoration remain future acceptance work.

You do not need to run a rollback as part of daily catalog use. Keep a trusted backup and ask for help before attempting data restoration or changing application versions.

## Current boundaries and getting help

Current owner catalog entry, matched-field search, private file retrieval, deliberate synthetic-file deletion, missing-original recovery testing and a live original-containing TAR/local restore have passed acceptance checks.

Additional-user access, production release/rollback, intended-device acceptance, full Cloudflare restore and operational backup policy remain open. OneNote migration, photo metadata extraction and Canva integration are future work.

For help, report the control you used, the message shown and whether saving or downloading appeared to finish. Include the reported source commit when available. Keep sign-in codes, passwords, private originals and full backup contents out of public GitHub issues.

This companion should change alongside user-visible behavior. Technical implementation and evidence remain in the linked runbooks; features described as future work should not be treated as available.

## Check your everyday device

Use the app on the computer or phone you intend to use day to day. Check readability, search matches, opening/editing a test record, and saving an original file. If that device will handle backups, confirm that its save/download method works and the file lands in a private location. A desktop browser check does not establish phone usability.

The short [Device acceptance checklist](Device_Acceptance.md) records what has passed and what still needs checking. Existing test records are available; keep real inventory unchanged for these checks. Main-branch protection is a source-management safeguard described in [Main branch safeguards](Main_Branch_Safeguards.md); it is now active: main changes go through pull requests and passing validation checks, including administrator changes. Application release still requires its separate review. It does not change how you enter or search catalog records.
