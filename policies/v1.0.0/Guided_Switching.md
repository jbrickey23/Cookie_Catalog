# Guided Switching

Policy ID: DCHAT-POL-001  
Version: 1.0.0  
Approved: 2026-10-19  
Scope: global development workflow

## Ownership and hierarchy

One `Durable_CHATGPT` repository maintains the shared framework. Each project repository remains independent and owns its code, decisions, tasks, evidence, releases, and authorization records. Projects inherit an explicitly recorded policy version and local copies; they do not become subprojects of this repository.

A project can have many planning chats and replaceable Work/Codex execution sessions (workers). Chats and workers restore the same project records. A worker is an execution role, not another durable project, repository, or mandatory sub-agent. A new chat is needed only when the interface or capability requires it; do not claim that saying “go” automatically launches a different mode or session.

## Guided Switching (Option B)

1. Start in ordinary Chat for discovery, ideation, decisions, and planning. Do not turn ideation into implementation or reconciliation without authorization.
2. Proactively recognize when the decisions are sufficient for a concrete implementation batch. State “design is ready” with the remaining uncertainties, if any, and recommend Work/Codex execution when its execution capabilities serve the approved work. Prepare the handoff before asking the user to launch it. Complexity or conversation length alone is not a reason to switch.
3. The handoff names the target repository, current checkpoint, scope, exclusions, acceptance checks, execution authority, and stop conditions. Explain any manual interface step the user actually must perform. Do not promise unavailable automatic switching.
4. The user authorizes launch. “Go” authorizes the clearly presented batch in context; it does not grant unrelated repository writes, paid resources, deployments, or scope expansion. An explicit implementation request can itself authorize execution, as in this framework implementation batch.
5. The worker restores current repository state, confirms the batch against that state, then implements, validates, commits, and reconciles autonomously within the approved scope. Do not request repeated confirmation for routine steps already authorized.
6. At meaningful milestones, checkpoint durable state and continue the next approved related task. Stop only for completion, a material decision outside the batch, a blocker, or unjustified further usage. Report a concrete question or blocker with evidence and the preserved continuation point.
7. Return results and unresolved decisions to planning. A fresh worker uses the reconciliation checkpoint rather than replaying the conversation.

## Authority and continuity

Use current primary evidence, then specialized authoritative project records, then Context/TODO/Decision Log, then Bootstrap, then older documents, then old conversations/memory. Evidence of implementation or validation does not itself approve new scope. Current user instructions govern authorization; record material decisions durably.

Read current files and their SHAs before editing. Preserve unrelated changes, canonical names, stable task IDs, newest-first decisions, and existing project conventions. Reconcile from the current version, never from an old chat copy. Distinguish proposed, approved, implemented, executed, and validated states.

The required durable records remain Context, TODO, Decision Log, and New Chat Bootstrap. A checkpoint records completed work and validation, pending work, exclusions/do-not-repeat guidance, and an immediate continuation. Verify repository writes and cross-file consistency. If access fails, report the limitation and retain a recovery patch/checkpoint; never describe local-only work as remotely committed.

## Adoption and exceptions

Follow the version pin and upgrade procedure in [the policy index](../README.md). A local exception must state its reason, scope, approval, and review condition in that project's Decision Log and policy pin. Never silently override the shared policy or update other projects merely because this repository changes.
