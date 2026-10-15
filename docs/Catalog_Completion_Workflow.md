# Catalog completion and collection workflow

This is part of CC-TODO-009's import milestone, not an extra requirement to finish every measurement before importing. The target is the existing catalog imported with its gaps visible and a practical way to fill them. The current batch implements a read-only live queue and editable local staging drafts; durable live completion decisions are not implemented yet.

## Recommended defaults used

One source page can describe several entities: a physical cutter, its printable file and one or more decorated designs. Keep those separate and linked. A printable file does not establish ownership of a physical cutter. Unclassified pages remain unclassified until a person identifies their contents.

| Item type | Default review requirements | Not assumed |
| --- | --- | --- |
| Physical cutter | Width/height in mm, storage location, identifying image, image with known scale, source/provenance | Dimensions from unscaled photos; that a decorated cookie image is a cutter photo |
| Printable file | Modeled width/height, identifying image/preview, authorized original, source/provenance | A physical storage location, possession of a printed cutter, print-ready scale |
| Decorating design | Identifying example/artwork and provenance | Its exact physical size, a verified cutter match or permission to redistribute |
| Unclassified page/item | Determine item type/ownership, preserve source | Page title or file extension as proof of the intended catalog entity |

Record orientation and measurement method alongside numeric dimensions. The current draft uses width/height in millimeters; it does not choose the final cutting-edge versus outside-dimension convention or discard maker sizing labels. Keep such labels in review notes until the real-source audit establishes the mapping. Scaling remains a slicer operation in v1.

## Status meanings

| Status | Meaning | Completion rule |
| --- | --- | --- |
| Missing / unknown | Detail was not collected or cannot yet be established | Keep it unknown; do not substitute zero or guess |
| Needs verification | Value/reference exists, but its meaning or accuracy is not reviewed | A saved size or image alone stays here |
| Not applicable | A person documented an allowed exception | Requires a reason; source, classification and printable-original requirements cannot be waived in this draft |
| Complete | Supplied facts and a specific review reference support this requirement | Dimensions use measured evidence; images/location use visual review; originals use file check; provenance uses source review |

Complete reflects owner-supplied review evidence, not independent certification by the app. A scale photo is not automatically a measurement. Image role declarations do not analyze image pixels; offline staging validates referenced file identity, not photographic content.

## Collection loop

1. Preserve an original source export and source identifiers. Audit it without changing OneNote.
2. Stage every identifiable item; retain unclear pages and unmatched files for review. Missing optional details do not prevent staging.
3. Classify/split page items and assign only the correct source files. Review possible duplicates; do not merge automatically.
4. Work the queue by item type: measure, locate, photograph, include a scale reference and identify originals as needed.
5. Record the value, status, exception reason and evidence reference. Save the reviewed manifest as a new private file.
6. Run offline preparation to validate files/hashes, create the private report and compare against an earlier report if available.
7. Review the import plan and resolve unsafe file/source issues. Later live importer work will retain incomplete entries without wiping existing verified fields.
8. After a separately authorized import, reconcile source pages/items/files, catalog rows/links and all original checksums. Keep the pre-change backup until recoverability and changed state are verified.

## What is usable now

**Catalog review queue:** all authenticated roles can inspect paged live physical cutters, printable files, designs and shapes with neither kind recorded. It reads current metadata only and does not write reviews or inspect original bytes. Existing metadata is marked as needing verification. The scale-reference requirement is unknown because the saved schema cannot record that evidence yet.

**Import preparation workspace:** admins/editors can open a prepared JSON manifest in their browser, classify/split items, add dimensions/location, label relative file references and record review decisions. Download the reviewed manifest to keep changes. It makes no network request for the manifest/content and creates no live records. No localStorage persistence or automatic sync is used. Browser unload warnings may help but are not a substitute for saving.

**Offline preparation:** produces private JSON and a script-free HTML review report, copied referenced originals, possible-duplicate candidates and new/changed/unchanged/absent-from-input classifications. It never imports, deletes or merges. A missing or untrusted referenced file is reported as an issue and cannot count as a present photo/original.

## What remains before the full milestone

The actual notebook audit, source-specific extraction and duplicate mapping; a reviewed schema for persistent provenance/review history; archive/restore upgrades; a live idempotent importer with conflict handling; and a representative approved import/reconciliation. The source export and actual device checks remain owner inputs. See [import staging](Import_Staging.md) and [decision queue](Batch_Review_20261015.md).
