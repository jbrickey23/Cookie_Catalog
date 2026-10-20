# Usage Efficiency

Policy ID: DCHAT-POL-002  
Version: 1.0.0  
Approved: 2026-10-19  
Scope: global development workflow

## Execution batches

Group approved related tasks into coherent batches with a concrete outcome and acceptance checks. Continue productive, verified work without artificial task, turn, or time caps. A milestone checkpoint is a continuation aid, not a new approval gate. Stop when the batch is complete or a material decision, blocker, or unjustified further usage prevents useful progress.

After two unsuccessful attempts on the same blocker, change approach: inspect new evidence, narrow the problem, use a different supported method, or report the blocker. Do not repeat the same failing action indefinitely. If no useful alternative exists, checkpoint the attempts, error, and next needed input.

## Context and tool use

- Restore the durable checkpoint and read only the additional records needed for the task. Reuse evidence already retrieved while it remains current.
- Batch independent reads and searches; keep dependent operations and mutations ordered. Prefer targeted searches and concise outputs to whole-history replays.
- Refresh evidence when it may have changed, particularly before repository writes. Efficiency does not justify stale overwrites or skipping validation.
- Keep one concise durable account of state. Handoffs reference files, revisions, decisions, and evidence rather than repeating entire chats.
- Do not invent usage, token, cost, or quota measurements. When telemetry is unavailable, describe the actions taken to reduce redundant work.

## Model and reasoning selection

Choose the lowest model/reasoning capability that can reliably complete the work. Use Light/lite for straightforward, well-specified work; Medium is the usual starting point for technical decisions and implementation; High/Extra High is reserved for genuinely difficult problems. Escalate when ambiguity, risk, or failed reasoning warrants it, and reduce effort again when the difficult part is resolved.

These are routing guidelines, not fixed product/model names or a claim that a worker can change its own model. Use available interface controls and explain a user action only when required. Do not interrupt a productive approved batch merely to obtain a model change. Record material escalation reasons in the checkpoint when useful.

## Validation and reporting

Use targeted checks while changing a component and broader regression at meaningful integration milestones. Repeat or broaden checks when changes, failures, or unresolved concerns justify it. Match checks to risk and acceptance criteria; avoid redundant checks or tests that only restate an implementation.

Checkpoint decisions, completed tasks, validation evidence, commit state, remaining work, and the next action at meaningful milestones, before handoff, and when blocked. Report the outcome and material limitations concisely. Separate local validation, remote write verification, and unperformed downstream adoption.
