# R2.2 — Cookie Sets specification (proposed)

**CC-TODO-025. October 20, 2026 Pacific.** Specification and persistence recommendation only; not feature implementation, schema approval, resource provisioning or a release authorization. See [phased roadmap and release dependencies](R2_Plan.md). The owner asked for persistent, named, editable collections of producer designs. Internal producer-reference identity remains `shapes.id`; the existing table named `designs` has a different decorating-design meaning.

## User contract

A Cookie Set is a saved container of explicitly chosen producer designs, for example an occasion or theme. It is not physical stock and does not imply an order, customer, production schedule, reservation, required count, purchase, printing job or assembled physical kit. A search suggests candidates; it never silently changes saved membership. Proposed Sets are shared within the existing authenticated catalog: current editors/owners may curate, viewers may read, and server permissions/maintenance guards remain authoritative. No new sharing, per-user ACL or identity system is proposed.

- Name a set, search and explicitly select designs, review the selection and Save. Empty saved sets are allowed so a named collection can be started or all members removed; show an understandable empty state.
- Reopen a saved set after refresh/sign-in, rename it, add/remove members and save changes. Removing a member changes only the membership; it never deletes a reference, cutter, attachment or tag. Whole-set deletion is outside this first slice.
- Show producer/name/reference photograph with links to the existing reference Focus Card and its inventory. Descriptions and producer names remain editable in the catalog; membership follows the stable reference ID, not a frozen name or content hash. Renaming a reference must not lose membership.
- Search both reference and physical result paths, including references that already have stock. Reuse current name/producer/BIN/tag search, phrases, filters and pagination. Current Browse 'all' is physical rows plus references without inventory; it is **not** one row per producer design. The Sets picker must normalize each candidate to `shape_id`, show its producer and avoid duplicate logical selections across pages/filters or multiple physical sizes.
- Select two identical-looking Christmas Trees from different producers as two different references. Selecting Medium and Large physical rows for the same reference selects that producer design once, not two Set members. Highlight already-selected references consistently across result representations.
- Inventory availability is separate and current: display recorded positive quantity and size/location breakdown from `physical_cutters`, zero quantity explicitly, and 'No physical inventory recorded' where there is none. Preserve review/unknown information. A printable original means a file exists, not that a usable cutter has been printed. A photo or Set membership never establishes possession, dimensions, compatibility or purchase.
- Opening a Set derives current availability; stock changes do not automatically add/remove designs. Names/tags/search edits likewise do not alter membership. Selection is not a standing saved query.

## Schema reuse assessment

Inspected actual migrations 0001/0002 and `Catalog.tsx`, `server/catalog.ts`, `server/browse.ts`, `Browse.tsx`, `EntryEditor.tsx`, `FieldHelp.tsx`, request UI and the current UX checkpoint at R2 `ffe35a67cbf275f3b74f0d62a292963eb2e69f66`; no schema change performed. The original [data model](Initial_Data_Model.md) is conceptual history; executable schema and current interfaces control the facts below.

| Existing entity | Verified meaning | Reuse / limit |
| --- | --- | --- |
| `shapes` | Producer reference: stable ID, name, maker, source, notes; shared images/printable assets and available sizes. | **Reuse as member target.** No universal category parent or cloned references. |
| `physical_cutters` | Actual inventory linked by `shape_id`, quantity, origin, size, location/Slot, notes. | **Reuse for availability only.** Never make ownership necessary for membership or use a physical ID as the canonical member. |
| `designs`, `design_attachments`, `design_tags` | Decorating designs, sources, finished art/photos, notes and tags. Catalog labels this 'Decorating designs'. | Preserve existing rows and assets. A named decorating design is not evidence that it is a curated Cookie Set. |
| `design_shape_links` | Compatibility mapping: proposed/tested, standard/flip/combination, instructions, rotation, mirrored, min/max width. Unique by design + shape + use type. | **Do not repurpose as simple Set membership.** Doing so would invent compatibility claims and can admit multiple rows for the same reference. |
| `design_components` | Ordered multi-cutter roles with required counts and instructions for a decorating design. | Not a generic collection: role/count semantics and a decorating-design parent would introduce irrelevant workflow. |
| `tags`, `shape_tags`, current search | Many-to-many discovery, substring/phrase matching, producer/BIN filters. | **Reuse discovery.** Tags must not automatically enroll/remove Set members; tag rename/removal cannot rewrite a saved Set. |
| Existing guarded edits, Undo, archives | Reference/cutter conditional writes and record protection; exact-table recovery profiles. | Reuse their security/concurrency patterns. New Set mutations are not automatically supported by current reference/cutter Undo or archive validators. Extend and test coverage before activating a migration. |

| Persistence option | Assessment |
| --- | --- |
| Reuse `designs` + `design_shape_links` unchanged | Rejected recommendation: overwrites decorating/compatibility semantics, introduces false default tested/use claims and exposes unrelated record interfaces. |
| Add a kind/discriminator to existing designs and adapt mappings | Feasible but not recommended for this small slice: mixes two entities and changes existing CRUD, links, assets, filters and recovery behavior. Revisit only if a concrete shared workflow justifies it. |
| Tags or a stored search string alone | Insufficient: mutable discovery is not independent, explicitly curated persistent membership. |
| JSON membership hidden in notes or a new parallel object store | Avoid: loses relational integrity/clear mutation boundaries and adds a second persistence pattern without a need. |
| **Two small relational entities for Sets and Set members** | **Recommended, pending owner approval.** Keep existing model untouched, reuse `shapes.id`, tags/search and inventory reads. No new service/controller. |

Logical candidate, **not executable DDL or an approved migration**:

- Set: stable ID, editable nonempty name, created/updated metadata and a revision contract compatible with existing conditional edits. Names are labels, not membership identity; prevent accidental duplicate submissions through the normal explicit Save/retry design. Notes, ordering, tag automation and Set nesting are not required for this slice.
- Set member: stable Set ID + existing reference (`shape_id`); unique pair, enforced foreign keys. Default member display can sort by current name/producer; no ordering column is required without a demonstrated user need.
- A referenced design cannot be hard-deleted silently while in a Set. Use explicit membership reconciliation/referential restriction; do not cascade a reference deletion into unnoticed membership loss. Removing the membership is permitted and does not delete the design.

No existing decorating designs, mappings, components, references, tags or originals are migrated/reclassified. No physical ownership requirement. Before schema selection becomes execution: owner approves the approach, candidate schema/rollback is reviewed, archive/restore/managed recovery profiles cover the new entities and original bytes, foreign-key tests and old-profile compatibility pass, and a verified pre-change recovery point/authorized target exists. An additive table is still a migration requiring a tailored release plan.

## Interaction and safety acceptance (future implementation)

- [ ] Save and reopen a named Set containing a stocked reference, reference-only design and a printable-file-only design; show stock/file availability separately.
- [ ] Include two producers' similarly named designs as separate members; selecting two physical sizes of one producer design yields one membership.
- [ ] Rename Set and a referenced design; reopening keeps the same Set and reference IDs, with updated descriptions.
- [ ] Add/remove one member without touching inventory, shared tags, decorating mappings or originals. Remove all members and save a clear empty Set.
- [ ] Reference/physical/tag/producer search and paging preserve draft selection; search never writes membership. No duplicate members after changing filters or reopening.
- [ ] Change inventory quantity/location: displayed availability updates without changing Set membership. No stock reservation or fabricated count.
- [ ] Guard writes with existing role/origin/maintenance controls. Conflicting edits preserve both users' drafts for review; retries cannot duplicate memberships or replace another user's choices. Unknown write outcomes require readback/review, not blind replay.
- [ ] Prove new records survive backup/export and isolated restore with exact membership/FKs and originals. Corruption, stale revisions and unsafe deletion are rejected. Retain legacy archive compatibility.
- [ ] Independent Cris walkthrough: find a theme, choose physical and reference-only designs, save, later reopen/rename and change membership without coaching on database entities. Record observed friction and owner acceptance separately from tests.

Explicit exclusions: orders, customer details, deadlines, production scheduling, automatic unreviewed membership, nested Sets, stock reservation/consumption, physical kit tracking, extraction/Canva integration, paid services and destructive migrations. No delivery date or production approval is implied.
