# Infrastructure foundation — CC-DEC-011

Status: initial design on feature branch, not deployed or production validated.

## Approved boundaries
- Cloudflare Workers: API and server-side authorization; frontend deploys from GitHub.
- Cloudflare D1: SQLite-compatible relational catalog records and migrations.
- Private Cloudflare R2: original images, STL/3MF files and future derived assets.
- Slicer: performs cutter geometry scaling and printer configuration in v1.
- GitHub main: release source; feature branches reviewed before merge.

## Portability contracts
- Catalog repositories expose operations without leaking D1 bindings into domain logic.
- Attachment service stores opaque attachment IDs and keys; never persist signed download URLs.
- IDs are application-generated opaque strings, independent of providers.
- Millimeters are canonical dimension units; preserve original filename and provenance.
- Store original files immutable; derived printable assets refer to their original.
- Data export must include SQL records, relationships, attachment manifest and original object bytes; restore into clean test resources before claiming backup readiness.

## Privacy and access
Public GitHub contains only schema, application code and synthetic fixtures. Purchased assets, personal catalog data, credentials and tokens never enter Git. Private R2 access and all writes require server-side authorization. Authentication provider and authorized users require a separate decision before provisioning.

## Schema assumptions requiring sample validation
Initial migration is a draft: shapes, physical cutters, designs, proposed/tested mappings, locations, tags, attachments and printable assets. Multiple physical copies at different locations are separate rows. A mapping is to a shape, not necessarily every size; size constraints are optional. Complex multi-cutter combinations and explicit per-cutter size variants need validation with real samples before production migrations. Do not use destructive schema changes without backup/migration planning.

## Release and validation gates
1. Run migration against local SQLite with foreign keys enabled; validate insert/link/search and invalid references.
2. Confirm D1 compatibility, migration behavior and limitations in development.
3. Validate authorized private R2 upload/download and orphan detection.
4. Validate GitHub deployment, secrets, development/production isolation, and rollback.
5. Verify full export and clean-environment restore including attachment bytes.
6. Obtain explicit approval before creating external resources, purchasing plans or deploying production.
