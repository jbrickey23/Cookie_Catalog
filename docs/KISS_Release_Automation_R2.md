# KISS release automation — approved operating design

**Owner approved 2026-10-20 Pacific. CC-TODO-020 / CC-TODO-022; backup dependency CC-TODO-019.**

**PREP → CLOSE SHOP → DRAIN → RELEASE → OPEN SHOP.** This is the current design. Exhaustive historical Worker census/provider retirement proof is superseded as a universal requirement for ordinary compatible releases. Earlier investigations remain factual/historical evidence, not the default critical path. Durable_CHATGPT v1.0.0 and the existing engineering/charter rules are unchanged. No duplicate task/decision ID: next unused CC-TODO-025 / CC-DEC-023.

## What the two users do

The owner selects GitHub **Run workflow**, with a default five-minute countdown (1–60 minutes). Neither user copies a commit SHA or operates Wrangler. Both open catalog pages receive the same notice on the next 15-second poll, with a locally updated countdown: save or finish editing. A failed status check disables writes rather than pretending the window is clear.

At the deadline the page explains that editing, uploads and scheduled work are paused. Existing draft values remain mounted. New edit/new-entry controls and management forms are disabled; catalog browsing remains available. The server independently rejects writes, including old tabs that have not polled. A known admitted save may finish; a failed/uncertain save is never blindly replayed.

After verified success or compatible rollback, clean pages refresh to the current version. Dirty pages retain their text and ask the user to copy/review it before explicit refresh; stale epoch/build credentials cannot be silently renewed on the old page. A fresh page says editing is available again. The dirty marker is intentionally conservative (any input/change); a saved page may still ask for review. No in-catalog release-launch button, user sign-out requirement or new notification service is introduced.

**Availability:** this describes the implemented cooperative R2/bridge UI. Today's production R1 lacks it. No production workflow or UI change has been deployed. See the separate first-transition exception below.

## Five stages and implemented boundaries

| Stage | Operation | Evidence / stop condition |
| --- | --- | --- |
| **PREP** | Validate reviewed immutable main candidate, exact-head CI, compatible class, artifact/config hashes, single writer, healthy gate-capable rollback SHA/UUID/package version, and current independent recovery receipt. Persist the small recovery plan outside the application in the original Actions run before publishing the durable countdown window | CC-TODO-019/readiness false, stale recovery evidence (over 24 hours), changed candidate, ambiguous artifact/version or pending/failed/unknown backup work stops PREP. An ordinary admitted save may finish. New scheduled work is paused already during PREP to avoid starting a long backup just before closing |
| **CLOSE SHOP** | The durable window closes new HTTP admissions when its deadline arrives, even if the runner disappears. The original authenticated workflow records its active gate/epoch and ownership | A timer may **close** admission; no timer may reopen it. Human UI and independent server guard both apply. Background cron still fires normally but its runtime entry returns without running backup/restore/retention/photo work; no cron configuration change is made for routine releases |
| **DRAIN** | Read existing HTTP/scheduled registrations and known restore/retention/backup records. Imports use the same HTTP registration. Expose completed, active, failed and unknown states | Two clean observations within at most 30 checks, two seconds apart (roughly a minute). This is a practical settling budget, not proof about every historical invocation. An unknown registration or pending/failed/unknown background job stops immediately. Ordinary active registrations may complete during the budget. No expiry-based deletion or forced lease clearing |
| **RELEASE** | Trusted transport uploads prebuilt bytes using native Worker versions, then deploys the exact reviewed UUID after DRAIN. Read back 100% version selection; verify runtime build SHA/UUID and read-only D1/R2 health before opening (at most ten read-only health observations, two seconds apart) | No candidate build scripts in the credentialed job. Recheck current main/CI and recovery freshness before actual traffic deployment. Unknown deployment/late completion produces Needs attention, not a retry. Known-settled failure permits only explicit compatible code rollback and matching runtime/health verification. No automatic D1/R2 restore |
| **OPEN SHOP** | Complete the matching window and conditionally reopen the matching verified gate. Scheduled work resumes through its normal cron entry. Publish completion and require stale pages to refresh/review | Runtime/owner/attempt/epoch and drain checks still apply at finalization. Failed acknowledgment is reconciled against durable state; it does not justify repeating writes. Unknown recovery remains closed |

Native **version upload** occurs during preparation of the immutable plan and does not itself select traffic; RELEASE selects the recorded UUID. No upload or deployment was executed in this batch. The independent plan contains only source/version/hash/run metadata, not private catalog content or credentials. Seven-day artifact retention in the inactive template is an operational bound: preserve the plan independently if a paused incident approaches expiration.

## Release classes

- **Routine compatible:** no schema migration, incompatible formats/bindings, storage migration, destructive operation or data restore. Use the five stages, known-operation checks and owner-accepted proportionate residual risk. Routine validation rejects database changes and Wrangler configuration changes instead of trying to automate exceptional recovery. Dependency/toolchain changes remain reviewed and locked; candidate builds receive no production credentials.
- **Breaking/destructive:** migration, incompatible storage/binding/format change, deletion plan or data restore. Stop routine execution. Require a separate owner-approved plan, stronger recovery evidence, tailored maintenance/rollback procedure and acceptance. A boolean “compatibility exception” no longer bypasses the routine boundary.

The package metadata is now **0.2.0 as the unreleased R2 candidate**, not a release announcement. The installed runtime reports its package version so an R1-derived bridge's real rollback version is used; do not infer a generated bridge's package version from another tree's package.json.

## 80/20 component review

| Classification | Component | Result |
| --- | --- | --- |
| **KEEP** | Durable R2 maintenance/CAS admission, non-expiring registrations, scheduled entry guard | Existing safety boundary reused, not replaced. Exceptions/5xx retain an explicitly unknown registration |
| **KEEP** | Separate Access machine principal plus independent GitHub OIDC; immutable engine; narrow status/control APIs | No human-owner impersonation. Restrict to owner-dispatched/re-run original workflow; no new credential type or service |
| **KEEP** | Epoch/build browser fencing; revision checks; draft preservation | Server protects old tabs; local notice protects normal user flow |
| **KEEP** | Native version upload/deploy, explicit rollback UUID, artifact/config hashes and independent recovery plan | Small composed transport; no data restore or release controller |
| **SIMPLIFY** | Release orchestration and operation reporting | One five-stage function, one countdown, one known-work status list and bounded drain. One original run and its attempt/sequence, not a global historical invocation census |
| **SIMPLIFY** | Recovery | Owner reviews the original failed run and uses **Re-run failed jobs**. Newer attempt may acquire the same release. A fresh process cannot assume an earlier deployment call settled; uncertain deploying/recovering state stays Needs attention |
| **DEFER** | Automatic cross-run workflow_run/scheduled takeover, stronger availability promises, universal old-Worker retirement, passive-only bootstrap variant, new cloud rehearsal resources | No longer ordinary-release prerequisites. Reconsider only for a demonstrated operational need, with a new bounded approval |
| **REMOVE** | Runtime GitHub completed-run observer and associated cross-run tests/permission requirement | Deleted `release-run-evidence.ts`; no runtime GitHub API call to decide takeover. Ordinary dispatched workflow identity/ownership checks remain |
| **REMOVE** | Routine compatibility-exception bypass | Breaking work cannot be quietly accepted by the routine path |
| **DO NOT ADD** | Proxy Workers, persistent controller, DO/queue, exhaustive invocation tracker or in-catalog launcher | No requirement justifies those additions for this two-person flow |

## Engineering entry points and workflow boundary

- `app/src/server/release-maintenance.ts`: current gate plus small durable countdown window, known operation status and scheduler pause; `release-machine.ts`: authenticated prepare/begin/verify/finish and original-run recovery.
- `ReleaseNotice.tsx`, `release-client.ts`, existing editors and management forms: countdown, disabled editing, stale-draft review and reopening.
- `tools/release-orchestrator.mjs`: bounded five stages; `release-runner.mjs`: compose the existing machine/native transports; `release-command.mjs`: trusted workflow plan/apply entry. No daemon or separate service.
- [Inactive engine template](templates/release-engine.yml.template) and [inactive native dispatch template](templates/release-dispatch.yml.template): two jobs. Build exact candidate without production environment/secrets/OIDC; credentialed job checks out the immutable engine using its GitHub-issued reusable-workflow claim, installs only that trusted locked toolchain with scripts disabled, consumes hash-verified prebuilt artifacts, retains the recovery plan, then runs plan/apply. The owner pins the reviewed engine SHA once in caller and machine configuration; routine releases select current reviewed main automatically.
- The existing credential-free [local rehearsal workflow](../.github/workflows/release-rehearsal.yml) remains active only as repository code/test rehearsal. **No production workflow/trigger is installed or activated in this batch.** Templates are outside `.github/workflows` and have `.template` suffixes. YAML/inline JS and safety boundaries are locally checked; actual cloud execution is unverified.

Required future private configuration is the already-approved scoped Access client/secret, one individual-Worker deployment token, nonsecret account/audience/workflow/environment identifiers and `CC_RELEASE_READINESS`. That readiness record must attest single writer, installed maintenance support, compatible scope, resolved backup readiness, and an independent recovery receipt hash/timestamp (no private catalog data). Missing/false/stale values stop before cloud upload. No fabricated success flag or credential is supplied here. Routine releases do not require Access-policy administration or direct production D1/R2 credentials.

Re-running failed jobs keeps the original immutable build/plan artifacts. If the runner stopped during PREP, re-running failed jobs cancels that original window only after matching baseline/health and known-work verification; unresolved work keeps it closed. Start a fresh Run workflow window after a successful cancellation, rather than reusing the old countdown. Do not re-run all jobs to rebuild an incident's candidate or start another release against an unknown deployment. If the original run's plan cannot be recovered, stay closed and review; no scheduled automatic rescuer is promised.

## First R1 transition remains a separate approval

See [current first-transition runbook](R1_Bridge_Production_Proposal.md). R1 cannot honor the cooperative gate or display this countdown. The owner coordinates both users directly, saves/copies drafts, externally restricts new writes, suspends actual cron continuation, and inspects known operations. Use a compatible R1 bridge and explicit R1 code rollback under the external restriction. A bounded operational window reduces risk but does not prove every legacy invocation terminated. The owner-approved residual risk does **not** allow an active restore/import, a known uncertain write, unverified recovery, or proceeding indefinitely when checks cannot finish.

Provider-backed global retirement proof, a disposable cloud environment and passive-only bridge installation are **not required next decisions** under this KISS approval. No such resource is created. Initial bootstrap still requires a concrete separate production execution approval after readiness, compatible artifact and recovery checks; this code is not deployed.

## Focused evidence and minimum remaining work

Tests cover countdown and closure, preserved drafts, disabled new edits, server rejection, admitted-save drain, scheduler pause, explicit failed/unknown operation status, immutable candidate/recovery checks, composed stage sequencing, compatible rollback on failed health, and no reopen or blind retry after uncertain deployment/runner loss. Full current counts and required exact-head sqlite CI are recorded in PR #12. Local/module tests do not establish effective cloud permissions, actual version promotion or production readiness.

Before a practical live release:

1. Resolve **CC-TODO-019** with root-cause/fix/recovery evidence in its own work item; record a real current independent recovery receipt. A later successful backup resume is not that fix. Managed-PC restrictions remain a separate issue.
2. Review the exact compatible R1 bridge artifact, external restriction/actual cron operations, known-operation checklist, finite window and code rollback baseline; obtain separate first-transition execution approval. Do not reopen the exhaustive-census research path by default.
3. Owner approves/configures the previously scoped machine trust and single production writer, installs the reviewed pinned workflow templates and approves their production activation. No bypass, paid resource or additional infrastructure is implied. That activation/live permission acceptance is unverified here.
4. Run the remaining effective authentication/version/health/two-user acceptance under the specifically approved target/window. Keep #12 draft and #7 unmerged until their outstanding acceptance is satisfied.

Scope preserved: existing R2 feature sequence, IDs, histories, framework pin, R1 production branch and main. Return to ordinary Chat with this concrete production-authorization packet; subsequent execution must name exact target/artifact/readiness and approved operations.

Official workflow references checked for template design: [reusable workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows), [workflow configurations](https://docs.github.com/en/actions/reference/workflows-and-actions/reusing-workflow-configurations), [immutable run artifacts](https://docs.github.com/en/actions/tutorials/store-and-share-data). Template validation is not remote execution evidence.
