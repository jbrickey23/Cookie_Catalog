# R2 release automation — implementation checkpoint

Latest investigation: [R1 quiescence evidence and proposed staged bootstrap](R1_Quiescence_Investigation_20261019.md). Native legacy drain is unproven; passive installation versus gate arming is a proposed distinction, not an approved production change. Preserve historical evidence below.

Latest: [Phase 2 engineering checkpoint](R2_Release_Automation_Phase2_20261019.md), owner approvals, local evidence and unresolved integration/bootstrap acceptance. Historical statements below remain dated evidence.

CC-TODO-020 / CC-TODO-022. Pressing Release authorizes the routine release; a second final approval is not part of the intended flow. Production stays R1 until R2 acceptance/promotion.

## Durable editing gate

The Worker entry point wraps every authenticated mutable HTTP request in a short write registration and gates scheduled backup/restore/retention work through the same boundary. Normal changes use bounded small control-object reads/writes, not a catalog scan. A durable gate in the private bucket survives a deployment. Registration followed by a second gate/generation read closes the admission race; release readiness waits for admitted HTTP/scheduled work to finish. New mutations return 423 and keep client drafts. Read-only requests remain available subject to existing restore restrictions.

GET /api/release-maintenance returns only active status to members; owners also see the release identity, in-flight registrations, background work and readiness. The UI polls status, displays the editing pause and disables inline Save/Delete while retaining the draft. Other write paths are enforced server-side even before the next poll.

Owner-only same-origin POST with X-Cookie-Catalog-Check: release-maintenance starts a gate using action: begin and exact targetSha. An existing active gate is a conflict. Readiness also checks unfinished managed backup, restore and retention jobs; cancel a drained gate to let such work finish before trying again. No deployment may begin until ready is true.

Owner control action: finish requires the matching id/targetSha, confirmed: true and outcome verified, rolled-back or canceled. It records a durable receipt and conditionally reopens writes. Verification/rollback are owner assertions at this stage, not automated evidence. A drained cancellation is allowed when background jobs are pending. This is an operational recovery boundary, not a new user-facing Release button or a claim of push-button deployment completion.

There is no automatic timeout unlock or forced deletion of unknown active registrations. An interrupted request can leave a registration; release remains Needs attention until its execution is reviewed. Automatically clearing an old registration could allow a still-running write during deployment. A safe revocation/fencing and reviewed interrupted-worker recovery path remains open before CC-TODO-022 is complete. Do not manually delete these keys to force a release.

## Automation blockers and next work

The current Access verifier deliberately accepts signed-in human app identities and rejects service tokens. GitHub Actions cannot safely call the owner-only gate with a Cloudflare service token today. Do not weaken ordinary membership or copy a human session token into CI. Design a narrowly scoped verified machine release principal and provision its private credentials/policy before enabling production automation. Credential provisioning and a live authenticated acceptance session require owner participation; no secrets belong in Git.

The production R1 Worker does not yet implement this gate. Its first promotion needs an explicitly coordinated bootstrap editing pause; deploying R2 code first and pretending it already protected that deployment would be false.

The remaining controller must pin the exact commit/tree/configuration, require tests and recovery readiness, serialize release jobs, close/drain the live gate, promote only the production release branch with an expected-head lease, observe the Cloudflare build and authenticated version/health evidence, then reopen only after verified success or verified code rollback. Code rollback must not roll back newer catalog data. Destructive migrations remain outside this routine path. Needs attention must leave writes closed and expose reviewed recovery instructions.

## Validation

Automated tests cover admitted work draining, new HTTP mutation rejection, browse/session availability, registration races, invalid/unauthorized controls, corrupt state failing closed, persistent interrupted registrations, unfinished background work, explicit cancellation and durable unlock receipts. Live browser acceptance and a production rehearsal remain pending.

## Read-only preflight foundation

The manual Release preflight (no deployment) workflow pins a full target SHA and current production release-branch baseline, validates the production configuration, requires a newer stable package version, rejects tracked dirty work and any SQL change in the routine path, runs candidate application tests and a production build/dry-run, and preserves a release-plan artifact. Concurrency is serialized and permissions are read-only. Build provenance uses the selected candidate SHA, not the workflow dispatch branch. The plan deliberately leaves remote recovery, maintenance and deployment verification false. Passing local planning never means Released.

The current R2 development package remains 0.1.0 and must be versioned for an actual candidate; the routine preflight correctly blocks releasing it again as v0.1.0. The workflow becomes dispatchable through the repository after its definition reaches the default branch. No production ref is moved, no cloud credentials are introduced and no deployment runs from this workflow.
