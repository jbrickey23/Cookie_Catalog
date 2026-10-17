# Cookie Catalog — current TODO

R1 v0.1.0 released; production is the sole editing catalog. [Release evidence](docs/R1_Release_Closeout.md).

| ID | Work | Status / next action |
| --- | --- | --- |
| CC-TODO-021 | Housekeeping and UX fast fixes | Authorized October 16, 17:34 Pacific; in progress. Current/history split, stale PR review, visible environment/sign-out/Undo and Slot help. |
| CC-TODO-019 | Backup/restore root cause and reliability | Open. Reproduce/diagnose cloud stall and verify a fix; later successful resume is not resolution. |
| CC-TODO-018 | Change Request ingestion | First vertical slice deployed to development (CI passed): private submit/review, owner export and revision-guarded release/TODO assignment; live dev acceptance and operational backup coverage pending. [Workflow](docs/Change_Request_Workflow.md). |
| CC-TODO-020 | E2E push-button release automation | R2 scenario: Release click is authorization; preflight, deploy, verify, safe rollback and clear result without another final approval. |
| CC-TODO-022 | Release maintenance gate | Under 020: durable server-side live-write gate, in-flight coordination, draft-preserving notice, safe success/rollback unlock and interrupted-release recovery. |
| CC-TODO-010 | Photo inbox and ingestion workers | Authorized R2; extraction, preview, approval, validated submit. Preserve originals/provenance and missing/confidence/scale distinctions. |
| CC-TODO-015 | Image standards / Canva and outlines | Deferred design input; no blanket upload rescaling/DPI restrictions approved. |
| CC-TODO-016 | Field help content | Slot authored Ready in current UX batch; owner wording feedback remains welcome. |
| CC-TODO-008/009 | Legacy source audit/migration | Source-specific follow-up; preserve completed imports and evidence. No standing OneNote connector implied. |
| CC-TODO-011 | Canva/artwork interoperability | Later integration; not automatically part of R2 photo inbox. |

[R2 scope and sequencing](docs/R2_Plan.md). Next unused ID: CC-TODO-024.

Operational follow-ups: cadence/retention/independent copies, account recovery arrangements and an isolated disaster-recovery rehearsal. Do not restore over live production just to test it. Preserve current roles, protected main, development separation and retained recovery evidence.

[Historical task details and checkpoints](Cookie_Catalog_TODO_History.md) preserve original IDs and acceptance. Old completion-pending text is historical; use the current table and release evidence first.

CC-TODO-023 — In progress: checksum-verified write-ahead request copies and owner-only revision-guarded recovery implemented; targeted recovery tests and production build passed. Portable checksum-verified export, owner-reviewed missing-key recovery and an isolated synthetic restore rehearsal implemented; live browser acceptance and owner retention of an independent copy remain open. Catalog backups currently do not include requests. Next unused ID: CC-TODO-024.

October 16, 2026, 18:28 Pacific: owner confirmed the R2 preview email was sent. R2 development head 7bb1967 passed both sqlite checks and the Cloudflare development build; live authenticated acceptance remains pending.
