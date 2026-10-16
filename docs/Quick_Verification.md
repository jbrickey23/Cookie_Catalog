# Quick verification

The saved-review checklist lets the user confirm source suggestions as Physical, Digital or Both, edit exceptions, save decisions, and run one guarded physical-import action. It reuses existing source references and private thumbnails rather than requiring another source-file export or upload.

## Daily workflow

1. Open Import preparation workspace and the existing saved review. Select Open quick verification.
2. Filter by name or bin. Review source evidence and thumbnails. Confirm safe suggestions in the filtered group or choose individual classifications. The group includes matching entries on other pages.
3. Use Review details for unresolved sets, variants, duplicates, ownership or print-status corrections. Leave unknown measurements/location for later collection.
4. Save checklist decisions to retain work without creating stock. An owner/admin can choose Back up and import confirmed cutters. A fresh protected snapshot is saved and checked automatically before inventory writes; no CMD or filename handoff is needed. The existing verified-backup option remains advanced compatibility support.
5. Review the completion report and any entries requiring detailed review. Catalog browsing refreshes. After a failed request, reopen the saved version; completed source mappings are skipped on retry.

Physical confirms an owned individual cutter. Digital records the source classification only; it never claims an original STL/3MF is possessed, uploaded or verified. Both retains the digital classification while creating eligible physical stock. Editors can save decisions; inventory application is owner/admin-only. Viewers cannot open the review API.

## Engineering boundaries

- GET `/api/import-reviews/:id/quick-check` requires editing access and the latest review If-Match revision. It bounds source shapes to 5,000, namespace mappings to 10,000 and saved items to the existing 1,000-item review ceiling. No external source URLs are loaded. Evidence is rendered as escaped text, with authenticated same-origin thumbnail URLs.
- Suggestions are deterministic metadata heuristics, not automatic ownership verification. Confirmation records optional `catalog.sourceClassification` in the existing saved item JSON. No migration is added; all four migrations/22 tables remain compatible with current backup/recovery code.
- One action saves through the existing conditional review PUT, plans at most 50 physical individuals per batch, excludes blockers/already-linked rows, replans the exact subset, then uses the existing owner-only apply API. Fingerprints and atomic database snapshots still prevent stale/concurrent imports. Completed batches are durable; later failure does not roll them back or replay them as new stock.
- Exact namespace/source-key identities reuse existing source-reference shape IDs and photo relationships. Duplicate identities block. Existing catalog-source mappings remain immutable when review metadata changes; their original snapshots remain audit evidence. Changed review metadata is skipped rather than written over inventory.
- Explicit not-printed/not-purchased source evidence is enforced by both the checklist and physical-import planner. Detailed review must explicitly correct ownership and print status before physical promotion. Sets, variants and duplicate ambiguity need individual review; different sizes remain separate physical entries.
- Unknown dimensions are omitted, not derived from reference size or photos. Recorded locations and OneNote bins are accepted without further confirmation. Existing imports inherit the source location; a later explicit catalog move takes priority. A bin does not imply physical ownership. Quantity retains existing explicit/default-one guards.
- Older application code that rejects new optional manifest keys cannot reopen newer classification reviews until its parser is updated. Archive schema is unchanged; classification metadata is covered by current TAR/helper/JSON/isolated D1 recovery tests. This does not establish a new old-code rollback pass.

## Validation and remaining acceptance

Automated checks exercise source shape/photo preservation, corrected-source skip behavior, negative evidence, duplicate identities, owner/viewer gates, group confirmation, batches over 50 with blocked subsets, backup gating, editor controls, stale drafts and recovery roundtrips. Local tests do not establish real-user, Edge/iPhone or visual/accessibility acceptance. No real inventory or attachments are mutated by publishing this feature. A fresh verified protected pre-change backup and user confirmation remain prerequisites for applying real stock.
