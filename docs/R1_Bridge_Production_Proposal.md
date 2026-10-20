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
