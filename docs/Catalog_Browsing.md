# Private collection browsing

The collection page presents individual physical cutters and source references with private catalog images. Search matches names, confirmed locations and recorded source-bin labels. The type selector separates physical inventory from references that still need inventory decisions. Demonstration records are hidden by default and can be shown explicitly.

Each physical size variant remains a separate row with its own quantity. Reference size means the longest edge; measured width and height are separate fields. A source-bin label is displayed as recorded source information until its current location is confirmed. Missing information stays visible rather than receiving invented defaults.

Source references preserve unresolved sets, uncertain size variants, possible duplicates, unprinted files and items marked not purchased. They are shape metadata, not owned physical inventory. Their source namespace/key and review reason are retained in structured shape notes, and the full review remains separately versioned. Promoting a reference into physical inventory requires reconciling the saved review and explicitly reusing its shape so attachments remain linked.

Images use authenticated application routes. Inline display supports only byte-verified PNG, JPEG and WebP; downloadable originals retain their existing attachment response. Displaying an image does not certify its subject, size, scale reference or physical ownership. Files belong to the shape and may be shared across physical size variants.

## Reviewed batches

Editing users can import an explicit source-reference plan or image plan from the management section. Viewer accounts have browsing and private file reads only. Both batch tools stop on errors and can stop between records/files. Source-reference retries compare preserved identities, names and notes; image retries compare the planned SHA-256 with the selected file and skip a matching available attachment on the same shape. Neither tool deletes existing data. Keep other catalog edits idle while a batch runs. Concurrent writers are not coordinated by these client batch tools; the inventory importer retains its separate transactional plan/apply guards.

An image plan identifies a target shape, a selected image basename, an output filename and its SHA-256. Select all required images before starting. Originals remain private; labels such as source image or reference artwork must not be treated as actual cutter-photo verification. No STL/3MF ownership or original bytes are inferred from an image or PDF reference.

A source-reference plan contains bounded name/source URL/structured-note records. It cannot supply physical quantities or dimensions. Existing source identities are checked across the complete paginated shape list before creating new references. Download the result map after completion, preserve the source exports separately, and verify a complete catalog backup after either batch.
