# Initial data model — proposal

2026-10-12. Conceptual starting point, not executable schema or completed design. Refine under CC-TODO-002.

| Entity | Candidate fields | Relationships |
| --- | --- | --- |
| Cutter shape | Stable ID, original name, outline/photo, creator/manufacturer, source | Many physical variants and files; many design mappings |
| Physical cutter | Stable ID, shape ID, actual width/height with units, quantity, purchased/printed, material, condition, location ID | One shape; one storage location; attachments |
| Printable asset | Stable ID, shape ID, original filename, format, source, purchased/self-created, file attachment, modeled dimensions, licensing notes | One shape; may cover one or several sizes |
| Decorating design | Stable ID, name, finished photo/sketch, source, theme/occasion tags, notes | Many cutter mappings and attachments |
| Design-to-cutter mapping | Design ID, shape or physical-variant target, intended/flip, rotation, mirror if applicable, trimming/combination instructions, tested/proposed, suitable size range | Connects designs and compatible cutters; combinations may require multiple components |
| Location | Stable ID, bin/shelf/drawer label, description | Many physical cutters |
| Attachment | Stable ID, storage key, original filename, MIME/format, size, checksum, thumbnail, source | Connected to catalog records |
| Tag | Stable ID, display label, category, optional aliases | Many cutters/designs |

## Questions for schema work

- What dimension denotes nominal cutter size versus actual cutting outline size?
- Should a design mapping target a shape, a size-specific cutter, or both?
- How are multi-cutter combinations modeled without losing component instructions?
- How are multiple copies and multiple locations represented?
- How do independent design tags find compatible cutters across Christmas/woodland/camping themes?
- How are deleted records, duplicate files, missing assets, and license/source details handled?

## Acceptance example

Search Christmas + tree should find tagged decorating designs and compatible cutters, including a known flip whose original cutter name does not contain tree. Show size, tested/proposed mapping, orientation/instructions, and physical location or printable file. Reverse browsing from a cutter should show all linked designs.

Availability must derive from actual physical/file records: ready to use, available to print, or inspiration only. Do not confuse a purchased STL with an already printed cutter.
