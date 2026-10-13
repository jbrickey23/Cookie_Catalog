# CC-TODO-002 — Owner catalog operations

Catalog continuation, 2026-10-13: owner-only create/full-update/read/literal-search routes and browser controls now cover shapes, designs, flat locations, physical cutters (millimeters/quantity/origin/location) and design/shape links (tested/proposed, standard/flip/combination, instructions/rotation/mirror/width range). Existing schema reused; no migration or provisioning. Generated stable IDs, parameterized queries, bounded JSON/field validation and same-origin mutations; 200-row search pagination. Local 32 Node tests and TypeScript/Vite frontend/Worker build passed. Live catalog deployment and create/edit/search across refresh still need owner acceptance. Record deletion, tags/visual search, full import and collaborator editing remain unimplemented.

## Routes and validation

GET /api/catalog/{shapes|designs|locations|physical_cutters|design_shape_links} supports literal q search (120 characters) and offset pagination (200 records/page). Search covers names/notes, cutter location names, and mapping instructions; it is not tag/visual search. GET /api/catalog/:kind/:id retrieves one record. POST creates a generated stable ID; PUT /:id is a complete field replacement, so omitted optional values become null. Unknown fields, invalid links, malformed/oversized JSON (>16 KiB), enum/number/URL/range errors fail before writing. Dimensions positive and <=10000 mm; quantity integer 0..10000; mirror 0/1; min/max compatibility ordered. Foreign keys and unique location/mapping constraints remain enforced. Linked-record selectors currently show the first 200 choices; large-catalog selection needs searchable pickers.

All routes require verified owner identity; POST/PUT additionally require exact Origin and X-Cookie-Catalog-Check: catalog. SQL identifiers come only from fixed server definitions and values are bound. Record deletion is deliberately unavailable until linked-data lifecycle safeguards are designed. No collaborator authorization exists yet. Refresh before retrying an uncertain create request; automatic retries could create duplicates.

## Browser workflow

Choose Cutter shapes; create TEST tree with notes Christmas. Search for Christmas, edit its name/notes, then reload and search again. Create a design and optional storage location. Add a physical cutter by choosing its shape, location, dimensions, quantity and origin. In Design/cutter mappings choose design and shape, record proposed/tested compatibility and standard/flip/combination instructions. Photo/original links are managed separately under Private files and target choices refresh after a record save.

Keep development examples distinct from real inventory. The temporary backup permits only 4 MiB of originals total/25 objects; scalable backup and larger uploads remain required before importing real assets.

## Evidence and remaining acceptance

32 Node tests passed, including actual Miniflare D1 create/link/edit/retrieve/search, FK checks, missing/duplicate links, invalid enums/dimensions/URLs/body/fields, auth/origin enforcement, literal SQL-safe search and 201-row pagination; TypeScript/Vite frontend/Worker build passed. No migration changes; earlier SQLite schema/import validation remains applicable.

Owner live creation/edit/search across refresh is pending. Remaining: deletion, tags/visual browse/search, multiple-component/sizing UX, representative real samples, import, collaborator roles, usable large-catalog selectors, concurrency/version conflict handling and production acceptance.
