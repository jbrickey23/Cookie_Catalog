# R1 quiescence investigation — decision checkpoint

**2026-10-20 owner supersession:** exhaustive legacy invocation/retirement proof is no longer a universal gate for routine compatible releases. The approved five-stage KISS process governs continuation; factual limitations and historical results below remain evidence. Known high-risk uncertainty and unverified recovery still stop release. See current Context/Decision Log.

Date: **2026-10-19 Pacific**. CC-TODO-020 / CC-TODO-022; dependency CC-TODO-019. Investigation and documentation only. **No defensible unconditional production drain procedure has been established for the currently evidenced architecture.** Do not begin the production bridge transition. The recommendation below is conditional, with explicit stopping predicates, not production readiness.

## Recommendation

Prefer existing Access/Worker controls and independently evidenced completion over a new controller. First obtain the missing **provider-backed legacy-invocation retirement and storage-operation settlement evidence**. Existing public documentation does not provide an operator-triggered, globally acknowledged “stop this Worker's old invocations and settle their D1/R2 writes” primitive. This is a bounded evidence gap, not a claim that Cloudflare has no internal capability. Owner/provider confirmation could change the recommendation.

Do **not** add a temporary production proxy merely to count future traffic: it cannot retrospectively account for already-running direct R1 requests or cron. Do not replace that gap with a timer.

Challenge the original “drain before installing any bridge code” premise: a separately reviewed, **strictly additive R1-compatible instrumentation stage** could be installed without claiming maintenance exclusivity, just as a compatible R1 code update. However, its first gate must remain **unarmed** until every legacy unregistered writer is accounted for or provably retired. This does not solve legacy retirement; it separates compatible installation from the first exclusive operation. The current PR #12 overlay is not that passive stage: it enforces epochs and exposes gate controls immediately, so it requires further engineering/acceptance before this alternative is usable. No application change is made in this investigation.

The smallest justified next step is a provider-evidence review and a separately approved, disposable **native-capability/compatible-bridge rehearsal**, not persistent ingress infrastructure. If neither supplies a defensible legacy retirement boundary, keep bootstrap blocked and return a narrowly scoped storage-authority/fencing design for approval; do not silently adopt a controller, clone live data or migrate storage.

## Restored authoritative baseline

| Item | Verified remote/source state |
| --- | --- |
| Working PR | #12 open **draft**, `work/r2-release-phase2-20261019`, head `77c306e8445f41d3179fda251dfec79560cd1f5f`; targets `feature/cc-infrastructure-foundation` |
| Active R2 | PR #7 open/unmerged, head `912e0981c9ec4a1c2b7e8ce954561f29fd9433c8`; targets main |
| Main / Phase 1 | `539ec6275c21eb72a70d6d1a41b34b53585f55f6`; PR #11 merged |
| R1 release branch | `62e92a16a1e32975ee6bc7f15679183120315411`; repository/source evidence, **not a new authenticated inventory of the deployed Cloudflare version** |
| Ancestry | Both the R2 head and merged Phase 1 main are ancestors of PR #12 |
| Framework | Durable_CHATGPT v1.0.0, source `53aa39ccedce935a702f44072cc647231c8cc02e`; both policy files match the pinned release manifest; no exceptions |

Read bootstrap, Context, TODO, current Decision Log checkpoints, charter, R2 plan, both release reports, bridge proposal and backup investigation. Existing current/history split and IDs remain intact; next unused **CC-TODO-025 / CC-DEC-023**. Research conclusions are proposed; this assignment does not reauthorize earlier implementation or cloud execution.

## Evidence ledger: platform guarantees and their limits

Sources below are current official Cloudflare documentation, checked on this date. Inferences are labeled; no production platform experiment was performed.

| Capability | Documented fact | What this does not prove |
| --- | --- | --- |
| HTTP duration [S1] | HTTP-triggered Workers have no hard wall-time limit while the connection remains active; CPU limits are different | Any finite waiting interval exhausts all old HTTP writers |
| Runtime replacement [S1] | Routine **runtime** updates allow old processes up to 20 minutes to drain before remaining requests/connections terminate | A customer code/version deployment initiates that process, exposes its start/end globally, or settles already-submitted storage operations. Do not reuse an older 30-second runtime claim or a 20-minute wait as a release barrier |
| Post-response work [S2] | HTTP `waitUntil` extends work up to 30 seconds after response/disconnect; unfinished promises are then canceled; a streaming response can keep an invocation active | Client disconnect or cancellation rolls back a database/object request already submitted to a backend |
| Cron [S1, S3] | Cron invocations have a documented 15-minute duration limit for applicable plans; cron edits/deletions can take up to 15 minutes to propagate | Deleting a trigger cancels an admitted invocation, or a 15+15-minute sleep is a completion receipt. Effective plan and last admission must be known; legacy plan exceptions also matter |
| Access admission [S4] | Block policies deny matching new access. Bypass/Service Auth and ordered Allow/Block evaluation must be inspected | A new Block rule necessarily overrides every existing policy, covers every hostname, invalidates every existing session immediately, or terminates admitted Worker work |
| URL exposure [S5, S6] | `workers.dev` can be disabled; doing so does not disable Version/Preview/Deployment URLs. Version URLs use that version's existing resources | A production Version URL is an isolated test target, or one disabled hostname closes every ingress path |
| Version deployment [S7] | Upload and traffic deployment are separate; routes/domains/cron are separately managed triggers | A 100% traffic readback or healthy new-version response is a globally acknowledged drain/termination receipt for the previous version |
| Logs/metrics [S8, S9] | Invocation records provide request/response metadata; sampling/truncation and retention exist; live tail may drop messages and is not durable | An empty log interval/zero recent errors proves no invocation is still active. There is no established complete admission census with matched terminal records for existing R1 |
| Tail Worker [S10] | Tail runs after a producer invocation finishes; paid/Enterprise availability and CPU billing apply | Completion events enumerate unseen/uncompleted admissions. Adding Tail now retroactively inventories old writers; a new paid observer is unjustified here |
| Resource authority [S11, S12] | Worker bindings provide resource APIs independently of an operator's direct resource token permissions; R2 bucket locks prevent overwrite/deletion of covered objects | Revoking a human/API deployment token revokes old Worker binding authority. R2 retention prevents all new object creation or fences D1 writes. No cross-store read-only/atomic fence is established |

Historic Wrangler-v1 documentation explicitly describes in-flight requests continuing on the old code after publishing [S13]. It is corroboration only, **not a current termination contract**. Current deployment documentation supplies no stronger operator-observable drain guarantee in the reviewed material. Absence of a documented primitive is recorded as uncertainty rather than fabricated provider behavior.

## Exact R1 implementation facts

All source facts in this section refer to [accepted R1](https://github.com/JBrickey23/Cookie_Catalog/tree/62e92a16a1e32975ee6bc7f15679183120315411), not PR #12's modified runtime.

- Production config names Worker `cookie-catalog-prod`, D1 `cookie-catalog-prod` (`9428a5b4-4675-4f45-9ec8-aba243848e27`) and bucket `cookie-catalog-prod-private`; `workers_dev: true`, `preview_urls: false`, `run_worker_first` for `/api` and `/api/*`, cron `* * * * *`. These are committed intentions; effective routes, historical Version URLs, Access policies, external callers and other resource writers still require private account inventory.
- `app/src/worker.ts` authenticates humans and awaits HTTP API handlers. Static search found its `waitUntil` in the scheduled handler, which passes `scheduledBackups(...)`; no R1 queue/DO/workflow consumer binding/handler was found. That does not establish absence of other account-level workers or administrators writing the same stores.
- Ordinary workspace CRUD/Undo, catalog/import/review changes and attachments are HTTP write paths. Their awaited success responses are useful per-operation evidence. They are not a complete global historical request inventory; network failure/error responses can leave ambiguous outcomes. Method-only ingress filtering is insufficient: classify every route, including owner exports using POST. A brief full `/api` outage is simpler to audit than preserving read-only browsing during this one-time transition.
- `app/src/server/managed-backups.ts:scheduledBackups` first continues retention, restore, or pending copy work, and only **then** reads the daily schedule's `enabled` flag. Turning off the in-app daily schedule does **not** suspend these existing jobs. Restore can replace D1 rows and R2 originals; retention can delete backup objects; copies update backup storage/control records. Cron removal must accompany a drain/inventory, not replace it.
- `backup-storage-lock.ts` explicitly excludes routine catalog edits, uses a 15-minute expiring lease and periodically renews around selected R2 operations. Import apply and managed backup/restore/retention use it; ordinary edits do not. Neither inactive nor expired lease proves global quiescence. A guard read before an operation is not an atomic fence on a previously submitted D1/R2 request.
- R1 has no release admission ledger, release epoch or reliable all-writer completion counter. New PR #12 registrations cannot count earlier R1 invocations. Backup-job offsets, no pending job, or a complete receipt concern specific jobs, not all HTTP/scheduled execution.
- CC-TODO-019's observed 332/592 stall root cause remains unknown. A later successful 592-object backup is not a reliability fix. Managed Windows/npm restrictions are unrelated to evidence that cloud writes have settled.

## Conditional native operational procedure and stopping predicates

**Not executable until later owner approval and the missing proof is supplied.** Recommend this sequence only if the legacy-retirement predicate can be satisfied; otherwise stop at step 4.

1. Privately inventory all HTTP names/Version URLs/routes/service bindings, Access ordering and valid sessions, cron and other writers, account plan, current deployment UUID and bound-resource identities. Record the exact R1 rollback code UUID and reversible configuration differences. Owner freezes both users' work, preserves drafts and confirms no manual restore/import/CLI operation will start. Do not treat owner coordination alone as platform proof.
2. Establish an externally enforced **full API admission block**, covering all applicable entry paths, without deleting the Worker or data. Prefer a separately reviewable Access restriction on the existing entry surface; test with already-authenticated and fresh test sessions and inspect Bypass/Service Auth rules. If using hostname disabling, explicitly cover the other URL classes. Do not grant routine CI Access-administration rights.
3. Suspend actual cron dispatch using reviewed trigger controls; in-app daily-backup disable alone is insufficient. Read back configuration and preserve invocation evidence across propagation. Inventory pending restore/retention/copy state and any already-submitted backend operation. No job deletion, lease reaping or data restore to manufacture a clean state.
4. Require **both** an effective admission boundary and a complete set of pre-boundary invocations with terminal evidence, including post-response/scheduled work and reconciliation of uncertain storage outcomes; alternatively obtain a provider-backed equivalent that retires every legacy invocation and resolves backend side effects. Missing entries, logging loss, unknown mutations, or merely quiet metrics mean **STOP / Needs attention**. This predicate is currently unmet.
5. Only after that proof, install the exact reviewed bridge and verify its SHA/version, same schema/formats/authentication, resource identities, gate, draft behavior and rollback compatibility. Keep external restrictions and scheduling suspension in force during verification. No ordinary R2 release or data restore is included.
6. On bridge failure, restore the recorded compatible R1 code while external restrictions stay enforced. Independently reconcile any uncertain deployment before another operation. Verify baseline and writer settlement before owner-controlled reopening; old R1 cannot honor the R2 gate. Code rollback must not implicitly recreate cron or reopen an Access path.
7. Reopen approved entry paths/scheduling only after the chosen version and safety predicates are verified. Require clients to refresh/review uncertain saves. Keep CC-TODO-019 and full Phase 2 acceptance as separate release gates.

This is an evidence-based **conditional** procedure, not a claim that step 4 can be fulfilled today. Do not start a production outage in the hope of discovering a drain primitive after users are blocked.

## Approach comparison

| Option | Safety / assumptions | Permissions | Resources / cost | Complexity / interruption | Rollback | Rehearsal / long-term burden |
| --- | --- | --- | --- | --- | --- | --- |
| **A. Native Cloudflare-only** | Existing controls can close admissions and scheduling; legacy completion/global storage settlement remains unproven. Preferred if provider-backed proof closes that gap | Owner Access Apps/Policies administration; Worker edit for triggers/version operations; metadata/log read. Direct store read only if required for private reconciliation | No new production component; existing usage/log quotas apply | Lowest operational footprint; full API outage from restriction through verification, duration not guaranteed | Restore exact R1 UUID while independent restrictions stay held; restore original settings only after verification | Dedicated synthetic target required. Low ongoing burden; conditional, not approved safe today |
| **B. Temporary independent ingress** | Can durably count **future** forwarded work if every path is fenced and failures retain registrations. Misses pre-install direct R1 invocations and cron, and cannot infer commit from proxy disconnect | A's permissions plus routing/domain or service-binding edits and independent gate state; no production D1/R2 authority should be given to proxy | At least extra ingress Worker plus durable state; request/storage metering, possible domain/plan costs; none approved | More trust/configuration changes; still needs A's legacy drain, plus cut-in/cut-out outage and bypass checks | Keep ingress closed through code rollback; removing it too early reopens old R1 | Must inject proxy loss and prove no bypass/counter loss. Adds lifecycle/cleanup burden; **reject as bootstrap fix by itself** |
| **C. Revised staged bridge** | Compatible passive instrumentation first, legacy-retirement proof second, maintenance arming third. Avoids claiming that a bridge's installation itself is an exclusive release. Does not solve missing legacy proof | Worker-scoped editor for later compatible code stage; A's owner-only controls for eventual arming; no new routine administrator grant | Reuses existing production Worker/data; no persistent new service; temporary rehearsal resources only | Moderate compatibility/passive-mode engineering. Installation could be ordinary compatible update; first exclusive gate still needs an outage and proof | Unarmed stage may return to exact R1 under demonstrated compatibility; after arming, retain external restrictions for pre-gate R1 rollback | Rehearse mixed old/new behavior and forbid early arming. Small compatibility surface, no controller. **Recommended bounded design alternative if A's pre-install proof remains unavailable**, not a proven production procedure |

A temporary same-Worker maintenance endpoint is also new code: it cannot affect an old invocation that never checks it. A global variable/counter is not durable or global. Removing a binding in a new version, deleting/recreating the Worker, or killing a client is not a documented revocation/rollback of already-issued storage writes. Data cloning/blue-green stores would introduce migration/reconciliation and cost decisions without proving preservation of uncertain old writes; not the smallest justified next step.

## Guarantees not currently established

1. Effective coverage and propagation of every production entry path, session, scheduled source and external store writer.
2. A complete admission census for uninstrumented historical R1 HTTP invocations; matching terminal records without sampling, loss or retention gaps.
3. An operator-triggered global old-version termination barrier, or proof code deployment triggers the documented runtime-update retirement process.
4. Backend completion/cancellation/rollback guarantees for already-submitted D1 and R2 writes when an invocation disconnects, is canceled or is replaced; no atomic cross-store fence.
5. A safe arming predicate for the first bridge gate. A newly empty PR #12 ledger proves none of items 1–4.
6. Exact deployed UUID/bindings, private recovery readiness and CC-TODO-019's fix. Repository and synthetic test evidence do not supply these facts.

### Prepared provider questions — owner may raise privately; none sent

Ask whether the existing plan has an operator-observable way to stop all new fetch/cron admissions to an individual Worker, enumerate all previously admitted invocations across versions/locations including `waitUntil`, obtain terminal outcomes, and confirm no outstanding D1/R2 mutation can later commit. Ask specifically whether customer code deployment retires old isolates, what acknowledged evidence establishes a global boundary, how trigger/Access propagation is proven, and what cancellation means for backend side effects. Request a documented contract and an isolated reproducible procedure, not a recommended waiting period. Do not upgrade support/plan or contact anyone automatically.

## Specific isolated target proposal — owner approval required before creation

**Do not reuse `cookie-catalog-dev`, its D1 or its bucket.** It is the active R2 target, has preview URLs enabled and may hold retained catalog material. No synthetic-only/noninterference inventory was supplied. A different version URL alone still uses its bound resources [S6].

Proposed temporary resources, all in the owner's existing Cloudflare account and none created here:

| Resource | Exact proposed name / configuration |
| --- | --- |
| Worker | `cookie-catalog-r1-quiescence-test`; proposed URL `https://cookie-catalog-r1-quiescence-test.j-brickey.workers.dev`; name/availability/account subdomain must be confirmed privately |
| D1 | `cookie-catalog-r1-quiescence-test`; **new isolated ID**, never production/dev IDs. Accepted R1 schema only, no migration design changes |
| Private R2 | `cookie-catalog-r1-quiescence-test-private`; no public bucket domain; no source catalog copy |
| Access | Separate test-only application on that hostname, its own audience and explicit test membership. No production policy edit or reused production machine secret. Existing test users only if owner approves; no human session copied into CI |
| Bindings | Only those new test IDs/names, `CATALOG_ENVIRONMENT=development`, previews disabled; no production routes, Builds trigger or production credential reference |

Minimum initial target is one Worker, one database and one bucket (plus test Access configuration), **not** a proxy/DO/queue/Tail Worker. Use accepted R1 code for baseline behavior, then reviewed test-only fault hooks/telemetry and separately the proposed bridge; label instrumented variants. A harness with a complete known synthetic request list validates only that list, not historical production coverage.

**Data bounds:** generated `TEST` names only, at most 20 schema-valid linked fixture rows and four tiny originals (at most 64 KiB total), no real images/emails/backups, no production export/import. Exercise a held ordinary save, attachment write, import/Undo and pending backup/restore/retention paths using fixture data. Keep fixture fingerprints, invocation IDs, entry/finish events, backend acknowledgment/readback and version UUIDs; no auth headers in logs.

**Permissions and costs:** owner may create/configure/delete these resources using existing account administration only after approval. A subsequent test executor gets Editor on the **individual test Worker**, log/metadata read and only the isolated fixture setup/read privileges needed for D1/R2; no production data/Access-admin credential in a routine runner [S11]. Access configuration stays owner-controlled. Actual creation/scoping capabilities and entitlement must be read back before a token is provisioned. Existing Free/included quotas may cover this tiny workload; actual plan, current usage, limits and any billing exposure are unverified [S14]. Approval must prohibit paid-plan upgrades, paid add-ons and billable overages; if quota cannot be confirmed, stop rather than assuming zero cost. No recurring resource is intended.

### Proposed rehearsal and acceptance packet

1. Confirm names, account, quotas, all isolated IDs and absence of auto-deploy/production references; retain readback. Owner approves exact test configuration and fault hooks before any execution.
2. Deploy accepted R1 to the isolated target, initialize only fixtures and validate R1 auth/CRUD/attachments. Establish a closed harness census **before** starting test invocations. Include one deliberately outstanding writer that would make an empty completed-log interval misleading.
3. Exercise externally blocked new requests using fresh and already-valid test sessions and every available test URL. Verify underlying write-entry counters/fixture state as well as HTTP denial. Observe controlled held old requests; do not infer they stopped from denied new requests.
4. Create pending synthetic restore/retention/copy work. Show that daily schedule disable alone does not suspend continuation. Separately remove the actual test cron, retain trigger readback and any late invocation records. Match each known admitted scheduled invocation to terminal and backend evidence; no lease-based reaping.
5. Deploy a test version while a synthetic old request is held; record whether the old writer completes after the new version serves traffic. This falsifies deployment-as-drain if observed. Failure to reproduce does not establish a universal termination guarantee. Stop at the approved harness deadline with Needs attention if any request/outcome is unknown; deadline is a test budget, not an unlock condition.
6. Test the proposed passive R1-compatible stage with old/new overlapping. Verify no schema/format/auth/CRUD regression. **Arming must be rejected while any legacy census entry or mutation is unresolved.** The present overlay needs a future bounded implementation batch before this test can pass.
7. A real quiescence pass requires complete known admissions, effective block/scheduler boundary, every invocation's terminal outcome, and independently confirmed/read-back backend outcomes. Separately require provider documentation/evidence for extrapolating that mechanism to uninstrumented production R1. If that contract/census is absent, report **capability investigation completed; production quiescence NOT proven** even if all fixture tests pass.
8. Under held external test restrictions, verify exact bridge or roll back to the recorded R1 test UUID. Show old R1 remains blocked until baseline verification. Do not restore D1/R2 as code rollback. Preserve unknown registrations rather than force-unlocking.
9. Owner/executor reviews evidence; remove only the disposable test Access app/credentials, cron and three named test resources after confirming their isolated IDs. Retain sanitized report/hashes; no production/dev cleanup. On uncertainty, keep the test isolated and report before deletion. Destroying a test target is not evidence that production could be safely terminated.

## Independent Phase 2 continuation — separate implementation handoff

This assignment does **not** begin the following engineering. The R1 question need not block these bounded, credential-free batches under 020/022; preserve the approved R2 feature sequence and 019 dependency.

| Order | Independent engineering batch | Acceptance / boundary |
| --- | --- | --- |
| 1 | Immutable artifact packaging and provenance | Pin reviewed candidate + trusted engine, reproducible hash/size/file inventory, refuse symlinks/tampering/stale intent, separate artifact run/hash and approved config, no secrets in candidate build |
| 2 | Compose release/recovery ports with independent evidence | Hash-verified immutable recovery plan persisted before gate; acknowledgment-loss/retry tests, exact baseline/candidate identity, distinguish request-known-settled from process-local flags after runner loss |
| 3 | Trusted Actions workflow design and offline validation | Shared concurrency, immutable source checkout, build/credential separation, native Run workflow, bounded cleanup/manual/independent recovery entry points. Keep credentialed execution/production triggers inactive until separate approval; no new credentialed workflow in this investigation |
| 4 | Integrated local failure injection | Failure before/after begin/upload/deploy/verify/finish, lost acknowledgment, cancellation, disappearance, stale/out-of-order takeover, unexpected external version, orphan write and late backend completion. No timeout unlock or data rollback |
| 5 | Local multi-browser stale-session acceptance | Clean/dirty forms, attachment/Undo/import, concurrent saves, uncertain network, epoch/build changes and retained assets. Local evidence only; live acceptance separately approved |
| 6 | Bootstrap-dependent work | Passive-stage compatibility engineering if chosen, provider retirement proof, isolated target/identities/permissions and cloud rehearsal. Full R2 promotion follows its own approval and unresolved 019 release gates |

Do not mark generic port tests as composed workflow recovery, or mock JWT tests as effective Access permission acceptance. Keep the production runbook conditional. No change to Actions-as-orchestrator, ordinary auth, storage formats or the no-separate-controller recommendation is required merely to continue batches 1–5.

## Exact next owner decision and status

**Proposed next approval:** authorize a bounded follow-up to validate native capabilities and the staged/passive R1 bridge on the named disposable synthetic target, with the resource/Access changes, permissions, quota restrictions and acceptance packet above; owner obtains the prepared provider evidence using existing access/support if available. This grants **no production transition**, does not merge #7/#12 and does not approve persistent ingress. If the owner wants zero new cloud resources, choose provider-evidence plus local engineering only and leave cloud rehearsal/bootstrap blocked.

This report is documentation reconciled through draft PR #12; required exact-head CI is recorded on that PR. No new cloud target, credential, deployment, data/schema/application-code change or paid service was created. Policy copies, numbering, histories, main, active R2 and R1 release refs are preserved. Return to ordinary Chat for that specific decision; use a new bounded Work/Codex handoff for subsequent implementation or approved cloud rehearsal.

## Official source index

[S1]: https://developers.cloudflare.com/workers/platform/limits/
[S2]: https://developers.cloudflare.com/workers/runtime-apis/context/
[S3]: https://developers.cloudflare.com/workers/configuration/cron-triggers/
[S4]: https://developers.cloudflare.com/cloudflare-one/access-controls/policies/
[S5]: https://developers.cloudflare.com/workers/configuration/routing/workers-dev/
[S6]: https://developers.cloudflare.com/workers/versions-and-deployments/version-urls/
[S7]: https://developers.cloudflare.com/workers/versions-and-deployments/deployment-management/
[S8]: https://developers.cloudflare.com/workers/observability/logs/workers-logs/
[S9]: https://developers.cloudflare.com/workers/observability/logs/real-time-logs/
[S10]: https://developers.cloudflare.com/workers/observability/logs/tail-workers/
[S11]: https://developers.cloudflare.com/workers/authorization/workers/
[S12]: https://developers.cloudflare.com/r2/buckets/bucket-locks/
[S13]: https://developers.cloudflare.com/workers/wrangler/migration/v1-to-v2/wrangler-legacy/commands/
[S14]: https://developers.cloudflare.com/workers/platform/pricing/

[S1] Execution limits/runtime updates · [S2] Context/HTTP post-response work · [S3] Cron propagation · [S4] Access order/actions · [S5] Entry URLs · [S6] Version resources · [S7] Deployment versus triggers · [S8] Invocation logs/limits · [S9] Live-tail loss · [S10] Tail completion/cost · [S11] Roles/binding permissions · [S12] R2 retention · [S13] Historic deployment behavior (non-normative) · [S14] Usage/pricing; account entitlement unverified.
