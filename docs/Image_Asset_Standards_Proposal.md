# Image asset standards — proposed, not activated

October 16, 2026. Owner raised standards for incoming catalog images and later Canva/outline generation while the read-only image viewer was being implemented. No automatic conversion, DPI requirement, crop, new upload format or image-editing feature is approved or implemented by this note.

**Tracking: CC-TODO-015. Owner explicitly deferred this to Canva workflow integration; outside R1.** No implementation or upload enforcement is activated.

## Proposed handling

| Asset | Proposed rule |
| --- | --- |
| Uploaded original | Preserve exact bytes, filename, source and checksum; retain existing supported-format/size validation. Capture pixel dimensions/orientation/color metadata when available; flag low quality instead of silently upscaling or discarding it. |
| Browse thumbnail | Generate a separate bounded display derivative on demand or import, preserving aspect ratio and orientation; use a common background/padding without cropping away cutter edges. Final pixel budget requires a measured performance choice. |
| Read-only viewer | A consistently requested 500 × 500-pixel window; fit the entire original to its viewport. Window size is not physical cutter scale, DPI validation or a saved transformation. |
| Canva artwork | Separate derived PNG (transparency when needed) or compatible SVG for vector artwork. Keep an association to the original and record the transformation/export parameters. Current catalog image upload support remains PNG/JPEG/WebP; this proposal does not enable SVG uploads. |
| Raster print output | Proposed target: 300 pixels/inch at the requested physical output size. Four inches requires 1,200 pixels. Changing a DPI metadata tag or enlarging a small bitmap does not create detail or establish actual cutter size. |
| Cutter outline | Prefer vector paths with explicit width/height in millimeters and a consistent viewBox. Tie geometry to a measured physical size or documented calibration reference, and review trace quality/perspective/closed paths before treating it as fabrication-ready. Keep unknown scale explicitly unknown. |

Reference artwork, decorated-cookie photos, actual-cutter photos and calibrated outline sources should remain distinct asset roles. A photograph may need perspective correction and tracing; its pixel dimensions/DPI alone cannot establish shape or physical scale. Existing slicer remains the v1 geometry-scaling workflow. Generated files are derivatives rather than replacements of the original; applying a replacement stays an explicit website edit/update operation with provenance/recovery.

Proposed export profiles and pixel budgets should be reviewed when the Canva/outline work is scheduled (existing 010/011 scope). No additional first-release upload gate, resource or automatic image processing is introduced here.

## References checked October 16

- [W3C SVG 1.1 specification](https://www.w3.org/TR/SVG11/single-page.html): physical width/height and viewBox coordinate mapping.
- [Canva upload formats](https://www.canva.com/help/upload-formats-requirements/): supported import formats and requirements.
- [Canva download file types](https://www.canva.com/help/download-file-types/): output choices and plan-dependent options. Validate an exported file's dimensions in the actual downstream tool before relying on its scale.
