# R2 release automation — Phase 2 engineering checkpoint

Latest investigation: [R1 quiescence evidence and proposed staged bootstrap](R1_Quiescence_Investigation_20261019.md). Native legacy drain is unproven; passive installation versus gate arming is a proposed distinction, not an approved production change. Preserve historical evidence below.

Work: **CC-TODO-020 / CC-TODO-022**, dependency **CC-TODO-019**. Framework: Durable_CHATGPT v1.0.0, unchanged [pin](../policies/README.md). This checkpoint is implemented engineering for review, **not completion of the full Phase 2 acceptance matrix or production readiness**. No new task/decision ID; next unused CC-TODO-025 / CC-DEC-023.

## Restored state and owner approvals

Baseline: merged Phase 1 PR #11, main `539ec6275c21eb72a70d6d1a41b34b53585f55f6`; active R2 PR #7 `912e0981c9ec4a1c2b7e8ce954561f29fd9433c8`; retained R1 production source `62e92a16a1e32975ee6bc7f15679183120315411`. Verify current remote state before continuing. The isolated implementation branch incorporates main's documentation while preserving R2's current/history split. It does not push or merge the automatically deploying R2 branch.

The owner explicitly approved native GitHub **Run workflow**, deferring an in-catalog button; dedicated scoped Access machine identity plus independent GitHub OIDC and a single production deployment writer; and R1 bridge engineering with isolated synthetic rehearsal. Phase 2 implementation/testing is authorized. Production credentials, Access changes, production trigger changes, maintenance, deployment, real-data operations and merging PR #7 remain unauthorized. Architecture approval is not operational configuration approval.

## Implementation and evidence boundaries

| Area | Implemented | Verification / remaining gap |
| --- | --- | --- |
| Gate | Existing R2 admission registration and generation recheck preserved; unknown exceptions and 5xx keep registrations instead of silently forgetting potentially committed writes | Local Miniflare race/drain/orphan tests; retained registrations can require manual investigation and are never expired automatically |
| Machine auth | Separate signed Access service JWT and GitHub OIDC verification; pinned reusable engine, protected-main caller, immutable repository/owner IDs, environment, event, hosted runner and run/attempt | Signed synthetic JWT positives/negatives. Effective Cloudflare Access policy and actual GitHub claims not provisioned or verified |
| Machine controls | Only status/control paths; CAS epoch/owner/attempt/sequence, exact-byte idempotent retry, explicit phase events, bounded evidence, runtime-bound verify/finish, no human finish of machine-owned gate | Local R2 bucket tests; production version binding not active |
| Recovery ownership | Newer attempt of same run, or trusted recovery event plus independent completed prior-run metadata and matching plan digest; API outage denies takeover | Public run-evidence adapter negative tests; cross-run end-to-end cloud recovery remains unverified |
| Deployment | Native Cloudflare version-upload wrapper with prebuilt assets, explicit trusted config and no candidate build hooks; native deployment/readback/explicit-compatible-version rollback transport | Mocked transport tests and inspected Wrangler 4.149.0 command/output implementation; no native cloud upload/deployment executed |
| Orchestration | Immutable-intent validator, artifact/config hash checks, independent-plan persistence port before maintenance, bounded release/recovery sequence, no blind retry of unknown deployment; undrained/unknown outcomes stay paused | Failure-injection unit tests. These are reusable components, **not yet a wired credentialed production Actions workflow** |
| Browser | Central fetch fencing for every same-origin mutable API request; page-lifetime epoch/build pin; no write retry; network/5xx uncertainty blocks later writes; clean page refresh and dirty-page review notice | Editor draft/epoch interaction tests and attachment/Undo transport tests. Full authenticated two-browser/device matrix and retained old asset availability remain unverified |
| R1 overlay | Exact accepted source extracted into fresh temporary workspace; minimal bridge wraps existing API/scheduling and adds machine/gate/client protocol without R2 feature routes or schema edits | Exact-source worker overlay compiles; synthetic ingress/gate/rollback model passes. Full R1 UI/regression and cloud bridge rehearsal not passed |
| Workflow | Credential-free native Run workflow rehearsal, serialized, immutable checkout, standard hosted runner; existing PR CI also checks bridge compilation | No production workflow, schedule, workflow_run handler or production deployment writer activated |

Gate phase evidence contains no tokens, originals or catalog rows. The machine health check reads schema names, foreign-key validity and release-control storage availability; it does **not** prove backup completeness, all application semantics or independent disaster recovery. Old human auth remains unchanged; machine JWTs cannot become catalog owners or use ordinary catalog/export/restore paths.

The release-engine OIDC pin uses `job_workflow_ref` / `job_workflow_sha`, with the caller's `workflow_ref` constrained to protected main and `sha == workflow_sha`. This avoids repinning an engine for every new application commit. A future reusable engine must run credentialed machine jobs itself under the dedicated environment. `RELEASE_WORKFLOW_SHA` denotes that immutable engine commit; it is not the candidate commit. No such production workflow or trust configuration is provisioned here.

## Four approved scenarios

1. **Success:** record independent immutable plan; confirm current baseline; close admissions; verify drain/background state; record deployment intent; deploy one exact version; read back 100% selection and runtime identity/health; verify through machine control and finish. Generic ports enforce this ordering. Workflow artifact publication/download provenance and live adapter integration remain open.
2. **Failure:** only when the deployment request is known settled, reconcile actual current version, require drain, deploy the explicit compatible baseline if necessary, then verify runtime/health and reopen. No D1/R2 restore. Unexpected third-party version or undrained work produces Needs attention.
3. **Interruption:** durable gate and registrations survive; takeover requires run evidence/attempt fencing. Replacement automation must load the independent plan and reconcile actual outcomes. A timeout never proves an external request stopped. Recovery makes one bounded attempt per invocation; unresolved uncertainty stays paused. Automatic cleanup, trusted workflow_run/schedule/manual recovery integration is still open.
4. **Concurrent editing:** the server refuses missing/stale epoch/build for every ordinary mutation. A page cannot obtain a fresh token and silently reuse an old UI. Untouched pages refresh when safe; any input/change conservatively marks the page dirty, including file inputs. Dirty drafts remain in place for copy/review before explicit refresh. Successful saves do not currently clear that conservative dirty marker. No uncertain POST is replayed. Keyboard/file selection, multi-tab races and actual version transitions need full browser acceptance before release.

## R1 rehearsal and stopping condition

The local rehearsal uses **only synthetic bytes**, a local R2 emulator and an external ingress model that counts handler promises. It admits a held R1-like write, restricts new API writes, suppresses scheduled dispatch, proves the held promise completes and active count reaches zero, exercises bridge gate/epoch denial, and models rollback while the restriction remains held. There is no fixed sleep. The bridge compiler separately builds an overlay over the exact accepted R1 source; the model does not prove all original R1 functionality.

**Blocked path:** production R1 has no admission registry. No available account evidence or separately approved nonproduction cloud target establishes how Cloudflare can observe or terminate every pre-gate R1 HTTP/background write. A counted local proxy is not evidence that production's current ingress has that capability. Stop the real bridge-transition path. Do not deploy a bridge and then infer quiescence from elapsed time, a healthy page, an R2 object, or a successful build.

Owner decision for that path: provide/approve a defensible Cloudflare observation/termination procedure and an isolated target on which to prove it, or approve a revised ingress/bootstrap architecture after reviewing its permission/routing/cost implications. A permanent independent controller remains rejected by default; this batch creates none. See the [proposed production runbook](R1_Bridge_Production_Proposal.md).

## Remaining work before complete Phase 2 acceptance

- Wire a pinned reusable production engine, immutable candidate preparation/approval evidence, GitHub artifact publication and recovery-plan retrieval, and shared release/recovery concurrency. Candidate builds receive no production environment/secrets/OIDC. Credentialed jobs must use only the trusted engine/toolchain and hash-verified prebuilt artifact, not candidate scripts/config.
- Complete cancellation, runner-disappearance and acknowledgment-loss integration tests across the real machine and deployment adapters, including cross-run takeover and repeated recovery. The present generic ports and transport tests do not prove their composition.
- Rehearse upload, deployment/readback/rollback, strict config compatibility and permissions on a separately approved nonproduction target with synthetic data and test identities. No target or credential was created.
- Complete original R1 frontend/behavior regression, scheduled-writer failure paths, real ingress quiescence, two-browser stale-session acceptance, and retained historical asset handling.
- Resolve **CC-TODO-019** in its own batch with root-cause/fix/recovery evidence. No release readiness claim while this dependency remains open; a resumed backup is not a fix. Managed-PC tooling restrictions are separate.

This implementation stops short of activating a release surface that could reach production with incomplete prerequisites. The active R2 execution sequence and existing feature priorities remain unchanged.

## Checks and continuation

Local verification: **183 application tests, 46 tooling tests, TypeScript/Vite build, SQLite schema smoke, 10 Cloudflare restore tests, 3 source-audit tests, synthetic import/reverse lookup, 68 Markdown files/documentation JSON, policy digests and diff whitespace passed**. Exact accepted R1 worker overlay compiled. Required exact-head PR CI is reported in the PR and final handoff; it was not assumed from these local results. Local results establish only the tested scope above. The rehearsal workflow has no production credentials, environment, Cloudflare calls or deployment command. It does not itself grant production authorization.

Resume design discussion in ordinary Chat for the R1 quiescence/isolated-target decision and review of the production proposal. Return to Work/Codex with a bounded handoff for the remaining integration/acceptance batch. Preserve 020/022 as in progress and 019 as unresolved; do not allocate duplicate policy or feature IDs.

## Implementation references

[Phase 1](R2_Release_Automation_Phase1_20261019.md) · [Release checkpoint](Release_Automation_R2.md) · [Backup investigation](Backup_Reliability_R2.md) · [Gate](../app/src/server/release-maintenance.ts) · [Machine control](../app/src/server/release-machine.ts) · [Machine auth](../app/src/server/release-machine-identity.ts) · [Orchestrator](../tools/release-orchestrator.mjs) · [Native upload](../tools/release-version-upload.mjs) · [Rehearsal workflow](../.github/workflows/release-rehearsal.yml).

Official references rechecked for implementation: [GitHub OIDC claims](https://docs.github.com/en/actions/reference/security/oidc), [Cloudflare service application token](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/application-token/), [Wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/). Exact installed Wrangler upload output was inspected; mocked tests do not establish effective remote permissions.
