# PDF source audit and import requirements — October 15, 2026

This is sanitized aggregate evidence for CC-TODO-007/008/009/010. The real source, entry names, URLs, images, PDF hashes and manifests are private. No live catalog data changed.

## Observed source and limits

The owner supplied 14 PDF exports: eleven numbered-bin sections and three other catalog sections. All 478 pages have extractable text. A first-pass boundary detector uses the OneNote creation-date header plus one reviewed missing-date exception, producing 343 proposed source entries and 135 continuation pages. Boundaries remain reviewable; source entries are not physical-cutter quantities.

| Source observation | Entries |
| --- | ---: |
| Explicitly marked not printed | 37 |
| Explicitly marked not purchased | 2 |
| STL/printing mention | 168 |
| Automatically detected size expression | 263 |
| PDF hyperlink annotation present | 114 |
| Embedded raster image present | 342 |
| Duplicate hint from normalized title, URL or image | 26 |

Categories overlap. Size expressions can describe packaging, assemblies, components or a nominal reference size; the parser does not populate width/height automatically. Missing hyperlink annotations do not establish missing provenance. One no-raster entry was visually checked and has no visible identifying image. A PDF image is not automatically a physical-cutter photo or valid scale reference.

575 distinct extracted image byte streams were preserved. No embedded printable originals were found. An STL mention does not establish possession, licensing, a usable original, a printed physical cutter, or quantity. Soft masks, crop/split content and image resampling require retaining complete PDF-page evidence. No vendor content was fetched.

Visual review covered the previously supplied 35-page first bin, each other section's first page, and the no-raster candidate. The remaining rendered previews are available for review, not visually accepted. The offline HTML report passed structural/local-asset checks; actual browser layout acceptance is not claimed.

## Validated preparation

The private report includes searchable per-entry page previews, verbatim extracted source text, original link annotations, image/PDF hashes, source assertions, duplicate candidates and unknown-versus-unverified fields. Actual source is kept out of GitHub.

The existing Node staging tool processed the real manifest:
- 343 unclassified entries; zero file issues.
- 589 unique referenced sources totaling 53,488,468 bytes.
- 686 open checks at the unclassified stage: classification and provenance only, not a final missing-details count.
- Repeat with baseline: 343 unchanged; zero new, changed or absent entries.
- Ten proposed demo examples: zero file issues and 50 open physical-item checks. This combines four mixed candidates and six from a familiar theme, retaining source assertions and unverified facts.

All 478 pages were assigned once without gaps/overlaps. All source PDF/image hashes match; 343 preview paths and review cards exist. The audit finds 26 entries with duplicate hints, versus 23 from the existing staging tool's narrower names/images comparison. Shared set images/links are review hints and never authorize merging.

PDF source IDs currently derive from PDF bytes plus page location. They are stable for an identical export, but a changed PDF needs explicit cross-export mapping. Native OneNote page IDs were not provided. None of this is evidence that a live bulk importer is implemented.

## Required application work

1. Keep source assertions, verification state and current catalog facts distinct. A source bin must not prove physical presence. Preserve not-purchased/not-printed states, quantity unknowns and unusable-original flags.
2. Store the longest-edge nominal/reference size separately from oriented measured axes and original units. Never assign a single reference value to an arbitrary axis. Keep packaging and assembled-set dimensions separate.
3. Split a source entry into zero or more physical cutters, printable assets and decorating designs, preserving component relationships and original source lineage.
4. Persist review decisions, evidence, imported-source mappings and import-run history with coordinated migration, archive validation, restore and older-format compatibility. Existing local drafts are not durable live review history.
5. Preview idempotent changes before applying them. Use source mappings, not only titles, URLs or images. Treat source disappearance as absence, never deletion. Preserve conflicts for review.
6. Use the approved protected pre-change backup before a representative development import. Then accept real examples before expanding to the full catalog.
7. Keep optional native/XML extraction for better page identity and original recovery. Native decoding is not a prerequisite for continuing from these supplied PDFs. Authorized STL/3MF originals must still be collected separately.

The Windows export used Microsoft's documented GetHierarchy and Publish methods. A first script's section predicate emitted two Boolean expressions instead of combining them with -and, unintentionally including unrelated sections. It exported the catalog sections and then failed on Quick Notes; the successfully created PDFs were packaged and supplied. Future automation must explicitly combine the predicates, report failures per section, and preserve a complete export index even on partial failure. This is observed owner-mediated export behavior, not proof of a generally validated export utility.

References:
- https://learn.microsoft.com/en-us/office/client-developer/onenote/application-interface-onenote
- https://learn.microsoft.com/en-us/office/client-developer/onenote/enumerations-onenote-developer-reference

## Open decisions and current defaults

Use unknown until supported by evidence; do not silently merge, infer measured dimensions from unscaled photos, or count unprinted entries as physical stock. Location remains Bin with optional future Slot. Stage incomplete entries without requiring the owner to clean the notebook first. Batch ownership/original-location/component conflicts after proposed mappings are concrete.

Pending infrastructure acceptance and recovery boundaries remain unchanged. Draft PR #1 remains unreleased. No paid resources, production release, source edits, live bulk import, external messages or security changes occurred.

