# CC-TODO-003 — Controlled missing-original recovery

## Current acceptance — 2026-10-14, 19:35 UTC

The controlled missing-original live gate now passed on deployed commit ec8f8640799bbdb2f3df4153f8fe4fca582443df. A unique synthetic photo returned 200 initially, 409 after only its R2 bytes were removed, and 200 after trusted bytes were restored. Listing marked it unavailable during loss; attachment metadata, checksum and shape link survived. Its record, metadata/link and object were then removed and cleanup verified. Existing catalog records and originals were preserved.

Post-test authenticated verification: both migrations, 16 tables, zero foreign-key violations; original catalog counts stayed 2 shapes/2 designs/2 physical cutters/2 mappings; one original remained in R2. The retained 5400084-byte test STL downloaded with its unchanged SHA-256 44f1d7d5617d5611da7832a8c3e7fd512d970b3e6f80a61775cbf981a18892f7. The earlier approved two attachment identities remain deleted; no new missing-test fixture remains.

49 Node tests, TypeScript/frontend/Worker build, GitHub Actions 38624720682/38624732060 and Workers Builds passed for ec8f864. Live result, scope and cleanup behavior: docs/Missing_File_Recovery_Check.md; sanitized runtime evidence: docs/evidence/Infrastructure_20261014_missing_recovery.json.

Current next prerequisite is CC-TODO-004 development code-rollback acceptance and intended-device checks. A development-only rollback checklist is prepared in docs/Development_Rollback_Acceptance.md; no rollback or production release has run. CC-TODO-006 isolated Cloudflare restore/operational durability, 005 intended-user access and 007 representative samples remain open. OneNote 008/009, photo extraction 010 and Canva 011 remain deferred. No new resources/cost/security changes; preserve the deferred alternate-email test.

## Scope and procedure

The owner-only POST /api/dev/missing-file-check requires exact same-origin Origin plus X-Cookie-Catalog-Check: missing-file, existing development D1/R2 bindings and verified server identity. The browser button Test missing-file recovery accepts no record/object parameters. Every invocation creates unique server-generated identities, one tiny synthetic PNG, one shape and one attachment link. Existing user records and stored keys cannot be selected as targets.

The check calls the same attachment listing/download service used by the catalog: initial 200 and checksum, confirmed object-only deletion, 409 missing-original message, listing unavailable and retained metadata/link; then restores retained trusted bytes to the same identity and verifies 200, exact length/hash, availability and metadata/link. Finally it removes only the invocation's keys/rows and verifies absence, including failure paths. Success requires every stage and cleanup. Error responses are generic and no-store; cleanup failure tells the owner to stop and review fixtures. Any generated orphan is compatible with the existing manual audit/age protection; no automatic broad cleanup is added.

Keep edits/exports idle while this temporary inconsistent fixture exists. This is an explicit development diagnostic, not a general-purpose fault injector or production file-restoration API. Retained fixture bytes test the recovery path; the separate real TAR restoration proves archive recovery. Do not infer live collaborator denial, corruption cases or provider disaster recovery from this test.

## Local validation

49 tests passed. Four new real Miniflare D1/R2 cases cover simultaneous unique checks and complete cleanup, existing-owner data preservation, failed initial reads, failed object cleanup with no false success, and owner/auth/method/origin/resource guards. Existing missing/corrupt/download/backup tests remain passing. TypeScript and frontend/Worker build passed. The live failure simulation was run once after deployment and succeeded; failed-cleanup behavior is locally tested, not deliberately induced live.
