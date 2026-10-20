# R1 bridge first transition — KISS proposal, execution not authorized

**Owner KISS decision 2026-10-20 supersedes the universal legacy-retirement prerequisite below.** CC-TODO-020 / CC-TODO-022; CC-TODO-019 remains unresolved. [Current routine design](KISS_Release_Automation_R2.md). This is a separate first-transition approval packet, not permission to execute production maintenance, deploy, configure Access/cron/credentials or alter live data.

## Proposed first-window checklist

1. **PREP:** owner names the exact release window (including a finite abort/review deadline), compatible R1 bridge SHA/artifact/config hashes and version, accepted R1 rollback UUID and healthy baseline. Verify actual independent recovery evidence and CC-TODO-019 readiness. Confirm no schema, format, binding or destructive data change. Coordinate both users directly: finish/save acknowledged work, copy any draft, keep unknown-save details for review. Existing R1 cannot display the new in-app countdown; do not promise that capability before installing the bridge. No human browser token goes into CI.
2. **CLOSE SHOP:** owner applies the separately reviewed external API restriction, checks both existing and fresh sessions/entry URLs, and suspends the **actual scheduled trigger**, including pending backup/restore/retention continuation. Turning off the in-app daily-backup preference is insufficient. Preserve reversible configuration snapshots and normal human authentication; do not delete a Worker, data or lock. Any propagation settling is an operational precaution, not a drain certificate.
3. **DRAIN:** inspect both users' known in-flight requests and acknowledgments, import/restore/retention/copy state, lease status and available logs/readback. Distinguish completed, active, failed and unknown. Let ordinary known work finish within the approved budget. Stop release for any active/uncertain high-risk operation, missing recovery evidence, conflicting deployment or inability to bound the review. Do not clear registrations/leases or claim an exhaustive historical Worker drain. Record the limited R1 visibility and residual unobserved legacy-request risk accepted for this compatible transition.
4. **RELEASE:** while external restrictions remain held, install only the exact reviewed R1-compatible bridge (not full R2 features/migrations). Verify runtime SHA/native UUID/package version, schema/format/binding compatibility, original human auth, narrow machine controls, maintenance/known-operation checks and health. If deployment outcome is uncertain, investigate; do not blindly issue rollback or retry. If failure is known settled and rollback is compatible, restore the exact recorded R1 code UUID while external restrictions and scheduling suspension remain held. Never automatically restore D1/R2 data.
5. **OPEN SHOP:** verify the chosen bridge or R1 baseline is healthy and known work is safe before owner-controlled reopening of external restrictions/scheduling. Old R1 cannot honor an R2 gate: successful rollback still requires external protection until verification. If the bridge succeeded, refresh both browsers into cooperative maintenance/epoch support and verify draft handling. Unknown state stays Needs attention; no elapsed-time unlock. Routine R2 feature release follows separately with its own acceptance.

## Required concrete owner approval

Approve the exact target/bridge artifact, window/abort budget, recovery receipt and rollback UUID, named external restriction/cron operations and their reversal, residual compatible-release risk, acceptance checks and explicit execution grant. Resource/route/access inventory informs that packet; it is not a mandate to build a new controller or obtain mathematical global quiescence proof. No new paid resources are proposed. Existing private credentials remain private and separately scoped; no production credential is provisioned here.

If a check fails, abort the **release**, preserve external protection while reconciling known risk, and reopen the verified baseline only after it is demonstrably safe. Do not keep experimenting past the agreed window or use its deadline as permission to reopen.

## Historical proposal — retained evidence, superseded prerequisites

The following records the earlier investigation-driven proposal. Its universal retirement-proof, passive-stage and disposable-target recommendations are superseded by the approved KISS decision where they conflict. Factual limitations and the prohibitions on unsafe reopening/data restore remain relevant.

# R1 bridge production transition — proposed, not authorized

Latest investigation: [R1 quiescence evidence and proposed staged bootstrap](R1_Quiescence_Investigation_20261019.md). Native legacy drain is unproven; passive installation versus gate arming is a proposed distinction, not an approved production change. Preserve historical evidence below.

Work: CC-TODO-020 / CC-TODO-022. This is a review checklist/runbook proposal, **not an executable production grant**. Production stays on accepted R1. [Phase 2 evidence and gaps](R2_Release_Automation_Phase2_20261019.md) govern readiness.

## Required approval packet

Before requesting an outage, identify exact reviewed bridge source/artifact hashes, accepted R1 rollback version UUID/build, production target, schema/data-format/binding compatibility evidence, both users' draft-handling plan, independent private recovery material and completed CC-TODO-019 reliability evidence. Include exact permissions and separately approved nonproduction rehearsal results. Do not publish credentials or catalog content.

The key unresolved precondition is **observable quiescence of pre-gate R1 writers**. Specify what enforces ingress restriction, how propagation is verified, how already-admitted HTTP and scheduled/background work is independently counted/terminated, and what evidence proves every old writer settled. No fixed waiting period suffices. If this proof cannot be obtained, stop and redesign the transition; do not experiment on production.

## Proposed owner-controlled sequence

1. Owner approves an exact maintenance window, possible full API outage, concrete ingress/scheduler operations, evidence collection and reversal. Both users save/copy/cancel drafts. Verify independent recovery artifacts privately.
2. Owner applies the approved external API restriction and suspends scheduled dispatch. Verify effective restrictions from an independent test identity. Keep routine deployment credentials unable to administer Access or schedules.
3. Collect the approved proof that all pre-gate R1 HTTP/background writes settled. Unknown outcomes halt here with restrictions retained and an explicit owner escalation.
4. Upload the reviewed R1-compatible bridge version without changing traffic. Verify artifact identity and bindings, then deploy that exact UUID under external restriction. No schema changes or data restore.
5. Verify runtime SHA/version, human auth and rejection of machine impersonation, constrained machine controls, binding health, gate/drain and stale-client behavior. Preserve exact evidence privately where sensitive. The bridge becomes the minimum gate-compatible rollback floor only after successful verification.
6. If the bridge fails, restore the exact accepted R1 code UUID **while ingress and scheduled restrictions remain in effect**. Verify baseline compatibility/health and quiescence before owner-controlled reopening. Old R1 cannot honor the new gate.
7. Owner reopens ingress and restores only reviewed scheduling after the selected version is verified. Users refresh/review drafts; never replay uncertain writes automatically. Routine R2 release remains blocked on backup readiness and full release/recovery acceptance.

If a native deploy call times out, do not issue a competing rollback merely because current traffic briefly appears unchanged. Reconcile whether the original operation can still complete; unresolved uncertainty is Needs attention with restrictions held. Do not automatically restore D1/R2 data.

## Future configuration, after separate authorization

- Dedicated machine-only Access path/application and service identity; human catalog policy unchanged.
- Independent GitHub OIDC trust for repository/owner IDs, protected-main caller, pinned reusable engine, dedicated environment and hosted runner. Validate actual signed claims in isolation first.
- One token scoped to the individual existing production Worker; no account admin, Access policy edit, D1/R2 direct data privileges or copied browser session.
- Owner disables the old production auto-deployment writer only when the reviewed replacement is ready and explicitly approved. This batch changes no production trigger.
- Reuse existing resources/standard runners. Obtain actual quota/entitlement evidence; do not create paid resources or assume unlimited storage. Bound artifact retention and keep logs/recovery metadata free of private catalog data.

No production step in this proposal has been executed or validated against live state.
