# Import reviewed entries into inventory

A saved review is source information. An inventory import is an explicit, separate action that creates or links catalog records. Nothing is selected automatically.

## Cutter identity and quantity

A shape can have several physical sizes. A 3-inch cutter and a 3.25-inch cutter of that shape are separate physical records with quantity one each. Quantity two means two identical copies at the same size. An omitted import quantity defaults to one individual cutter; that decision is retained in its import evidence. Do not import a multi-cutter set as one individual cutter: split and classify its members first.

Reference size is the longest edge, entered in inches and stored in millimeters. It never fills oriented width/height. Optional Slot stays separate from location. Missing size, location or photos can be collected after a confirmed cutter is imported.

## Setup

Use the current backup kit: Refresh-Backup-Tools.cmd preserves settings and backups. Both the earlier 16/20-table backups and the importer-enabled 22-table backups are supported. Older helpers intentionally reject a profile they do not understand.

In a saved review, expand **Import reviewed entries into inventory** and choose **Check import setup**. If activation is needed, first save and verify a protected pre-change backup; enter its reference and confirm it, then choose **Activate inventory importing**. Only an owner/admin can activate or apply an import. The application activates migration 0004 in one D1 transaction. It adds import audit/mapping tables and nullable reference-size/Slot fields while retaining inventory. Repeating successful activation is safe. Partial or unexpected schema profiles are refused. No Cloudflare console paste or local migration script is required.

After activation, verify an updated backup before applying inventory changes. The application records the supplied backup reference for each import, but cannot independently attest a local receipt or cloud-provider provenance.

## Review, plan and import

1. Open the latest saved review. Save browser changes before planning.
2. For each entry, leave it for later, create a record, or link an existing record. At most 50 entries are selected in one batch. Confirm selected physical cutters are owned. Entries explicitly marked not owned or not printed remain blocked. Designs can be created independently.
3. Prepare an inventory plan. The server checks saved-version identity, duplicate names/source links, chosen targets and prior source mappings. Matching known sizes are potential duplicates. Distinct known sizes can share a unique matching shape; a supplied existing shape ID can resolve ambiguity. Separate sizes selected together under the same name can share a new shape. Missing sizes never establish a known match. Explicit exceptions require a reason. Inspect the plan's shape IDs and sizes before applying it; name/source matching is conservative metadata comparison, not geometric recognition.
4. Record a verified protected pre-change backup reference and confirm it. Import selected entries only after reviewing the plan. Blocked entries must be corrected or left for later. Links never change existing quantities or other inventory fields.
5. Refresh catalog lists. Physical cutter details show reference size in inches and millimeters, quantity, oriented dimensions and Slot. Additional fields remain editable with revision protection. Existing legacy-schema catalogs remain usable before activation.

Physical creation requires owned status in the saved review or the explicit ownership confirmation for the selected batch. Supplied quantities must be 1–10000. Measurements and location remain unknown when absent; a source Bin label alone does not establish a current location. Only visually confirmed review locations create/reuse a location record. Printable entries remain blocked until their actual originals can be uploaded and verified in a coordinated attachment workflow. Source file paths and image references are not uploads. Assemblies/components, file uploads, geometric duplicate recognition and automatic updates to previously mapped inventory remain separate work.

## Integrity and recovery

Each source namespace/key maps once to its resolved physical or design record. Original review snapshots, decision/default evidence, actor and import batch remain in the private database and backups. A completed request can be retried safely. A source entry changed after import is blocked for manual reconciliation rather than silently overwriting inventory. A deleted/changed target is not replaced silently.

Plans bind the selected saved version and the relevant inventory/mapping snapshots. The write transaction checks those snapshots again before inserting audit, locations, shapes, cutters, designs and mappings. Any failed statement rolls back the batch. Concurrent edits require another plan; no partial import is retained. Plans cover at most 5000 records per supported inventory type and 10000 mappings per source namespace; selected evidence must fit one MiB. No automatic merge, pruning, record deletion or inventory rollback button is included.

Backup exporters, Node validation, Python TAR/JSON recovery and isolated D1 preparation retain all 22 tables and four migration records. The existing 16/20-table profiles continue to validate. The portable backup envelope remains version 1.

Runtime references: [D1 transactions in batch](https://developers.cloudflare.com/d1/worker-api/d1-database/#batch) and [D1 limits](https://developers.cloudflare.com/d1/platform/limits/). Import planning uses bounded reads and set-based writes within the free-tier query budget. No paid resource is required.
