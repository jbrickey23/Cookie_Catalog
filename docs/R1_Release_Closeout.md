# R1 v0.1.0 release closeout

Owner approved production-only editing, main merge and v0.1.0 tag on October 16, 2026 at 17:17 Pacific.

## Accepted production baseline

- Production: https://cookie-catalog-prod.j-brickey.workers.dev/ . Development remains isolated for testing.
- Accepted deployment: release/r1-production source 48e8b0adefb2966d7433fdeb8a79873c755d81b5; version 7c996412-f342-4aa4-aa67-a265564ddf57, deployed October 16 at 16:31 Pacific. Final 0.1.0 metadata promotion is separate from this earlier accepted deployment.
- Independent database export matched complete schema and all 4048 rows across 22 tables; no foreign-key violations. All 592 originals uploaded then independently downloaded with matching sizes/SHA256 by owner CLI.
- Both users can access production. Owner reports successful browsing/image opening, Save/refresh and Undo/refresh restoring original Notes. Signed-out catalog and direct original image URL require authentication.
- Owner confirmed production managed baseline backup complete and automatically checked: 592 originals at 17:16 Pacific. Pre-cutover recovery copy, production SQL export and independently downloaded originals retained privately.
- Evidence distinctions and identifiers: [production deployment evidence](evidence/Production_Deployment_20261016.json). No private catalog content or credentials in this repository.

## Release execution

Final package version is 0.1.0. Required CI must pass before merge. Main merge/tag and production release-branch promotion are authorized; execution evidence will be recorded after remote confirmation. Preserve development and recovery branches; no deletion or data reimport is part of closeout.

## Known limitation and follow-up

CC-TODO-019: one production managed backup paused at 332/592, displayed storage busy and did not immediately advance after Resume; later resumed and passed all 592 checks. Investigate lease contention, interruption and progress/resume UX using sanitized logs. Root cause unconfirmed. Preserve recovery safeguards and fast routine CRUD.

CC-TODO-018 Change Requests is R1.1. CC-TODO-015 Canva/image standards remains deferred, CC-TODO-016 Slot quick help remains optional Missing. Next unused CC-TODO-020.

## Operations

Production is the sole editing site. Jay owns release/recovery operations; both existing user permissions stay intact. Retain private recovery material independently. A full disaster recovery rehearsal should use isolated targets; do not restore over live production merely to test it. Managed backups are private same-provider recovery points and do not replace independent copies. Any future change to account recovery credentials is handled privately by the owner.
