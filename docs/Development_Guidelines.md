# Application development guidelines

These are project engineering conventions, approved for autonomous work on October 14, 2026. They are not a claim of complete accessibility/security certification. Where a larger improvement would dominate the batch, record the gap, its impact and a concrete follow-up instead of silently expanding the release scope.

## Working rules

- Read current source, durable state and applicable AGENTS.md before changes. Preserve user work; use a dependency lockfile. No AGENTS.md was found in the current tree.
- Use small functional slices with explicit input/output contracts. Share deterministic business rules between the UI and offline tools. Keep platform-specific I/O separate.
- Validate untrusted inputs at the boundary. Bound payloads, pages, counts and source sizes; parameterize SQL; avoid executing imported HTML or following source URLs automatically.
- Enforce permissions on the server before touching data/storage. Hiding a control is usability, not authorization. Keep private identities, source content and credentials out of public GitHub.
- Protect saved work. Conditional catalog updates must use the revision returned by the latest record read; stale edits fail without overwriting another user's changes. Keep the user's draft visible on conflict.
- Preserve provenance and unknowns. File presence does not establish physical ownership, dimensions, photo purpose, scale or verification. Never auto-merge possible duplicates. A page may describe multiple distinct entities.
- Verify the exact behavior changed: real local D1/R2 tests for persistence/security, deterministic staging tests for paths/hashes/reruns, and DOM interactions for review/edit/download workflows. Static rendering alone does not establish interactive success.
- Run type-check/build and the existing schema/recovery/backup checks before publishing. Update the plain-language companion and durable handoff with user-visible changes.
- Treat schema, importer and backup/restore versioning as one change. Do not activate a new migration while the exact-table archive validators still expect the old schema. Prepare data reconciliation and a compatible rollback/recovery plan first.
- Use existing development deployment only. Production release, paid resources, destructive/bulk source migration, external messages and security-policy bypass remain outside this batch. Preserve parked device/security/access tests.

## Critical engineering judgment

Apply existing CC-DEC-010 architecture-by-exception governance with independent technical judgment: check assumptions against current evidence, explain material risks and tradeoffs, and recommend a better approach when a request conflicts with maintainability, correctness, recoverability or the approved architecture. State disagreement and uncertainty plainly; do not treat agreement or a proposal as proof. Record rationale and verification once in the appropriate project record. Make routine reversible decisions autonomously within the approved batch; return material functionality/cost, hard-to-reverse or out-of-scope decisions to the owner. Respect an informed owner decision within the authorized boundaries.

Session routing and usage behavior inherit the [pinned global policies](../policies/README.md); use [the local handoff/reconciliation procedure](Durable_Workflow_Adoption_20261019.md). Do not copy or redefine those policies here. The historical development-only batch limits above do not reopen accepted R1 release approvals; current release evidence and the current batch's explicit authorization govern.

## Source-verified choices (checked October 15, 2026 UTC)

| Source | Verified platform guidance | Project application |
| --- | --- | --- |
| [Cloudflare D1 foreign keys](https://developers.cloudflare.com/d1/sql-api/foreign-keys/) | D1 enforces relationships and uses implicit transactions; foreign-key deferral is transaction-scoped. | Keep foreign keys and parameterized conditional writes; do not disable constraints for import. |
| [Cloudflare D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/) | Migration files are versioned and tracked in d1_migrations. | No ad hoc schema mutation; upgrade restore formats/tools alongside future review/import migrations. |
| [RFC 9110 If-Match](https://www.rfc-editor.org/rfc/rfc9110.html#name-if-match) and [RFC 6585 section 3](https://www.rfc-editor.org/rfc/rfc6585.html#section-3) | Conditional writes prevent lost updates; 428 can require a precondition. | API edits require the exact opened revision; missing precondition returns 428, a conflict returns 412. |
| [SQLite RETURNING](https://www.sqlite.org/lang_returning.html) and [D1 prepared statements](https://developers.cloudflare.com/d1/worker-api/prepared-statements/) | DML can return the rows it changed; bound statements retrieve query results. | Return the saved row atomically, rather than pairing a revision with a later read that could see another edit. Local D1 exercises this path. |
| [React act](https://react.dev/reference/react/act) and [Testing Library](https://testing-library.com/docs/react-testing-library/intro/) | Flush UI updates and test controls through user-facing DOM interactions. | Use React Testing Library/jsdom for import-review interactions and conflict-draft retention. These are development dependencies, not shipped runtime libraries. |
| [W3C labels/instructions](https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html) and [status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) | Forms need labels/instructions and accessible status feedback. | Label review fields, distinguish unknown/verification states and announce results. Narrow-screen CSS is preparation, not an actual Safari/Edge pass. |
| [OWASP CSV injection](https://owasp.org/www-community/attacks/CSV_Injection) | Spreadsheet formula interpretation complicates untrusted CSV export. | Initial review interchange is JSON with an escaped, script-free HTML report, rather than a spreadsheet/CSV workflow. |
| [Microsoft notebook export](https://support.microsoft.com/en-us/onenote/export-and-import-onenote-notebooks) | Web notebook export is limited to personal OneDrive notebooks; native exported files need compatible handling. | Establish account/export type before selecting extraction. Do not claim that the HTML scanner decodes native OneNote files. |
| [Microsoft Graph get page](https://learn.microsoft.com/en-us/graph/api/page-get?view=graph-rest-1.0) and [get content](https://learn.microsoft.com/en-us/graph/onenote-get-content) | Page HTML/resources are available through supported APIs, with read-only delegated Notes.Read for personal/work-school page retrieval. Page collections are paginated. | A future authenticated reader must follow pagination, retain identifiers/resources and use minimum permissions. No Graph client, credentials or notebook access was configured by this batch. |

## Deliberately deferred engineering

| Work | Why not activate now | Next evidence needed |
| --- | --- | --- |
| Durable per-record review decisions and immutable review history | Requires schema and archive-version changes; prototype drafts do not justify breaking validated recovery. | Actual source mapping, review fields/actors and backward/forward archive fixtures. |
| Live idempotent bulk importer | Source shape, identity rules, duplicates and conflict behavior must be proven with representative pages first. | Export/audit, approved staged plan, pre-change backup and authorized sample import. |
| Native OneNote decoder or authenticated Graph reader | A native export and Graph HTML/resources need different adapters. | Notebook account type and representative export. |
| Full real-browser/accessibility/device coverage | Local Chromium download returned invalid/truncated archives; DOM tests cannot evaluate layout or actual browser download behavior. | Available browser runner plus actual owner Edge/iPhone checks. Do not claim these passed. |
| Searchable dropdowns above 10,000 linked choices | Current client now follows API pages and fails visibly at that bound. | Real catalog counts and selector usability. |
| General file-format validation, thumbnails and large-catalog consistency | Existing header checks and sampled storage checks are not full file validation or cross-service snapshots. | Real samples and representative scale/failure fixtures. |

See [catalog completion workflow](Catalog_Completion_Workflow.md), [import staging](Import_Staging.md) and [batch review](Batch_Review_20261015.md).
