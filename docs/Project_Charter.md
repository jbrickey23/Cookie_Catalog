# Cookie_Catalog — Project Charter: Execution Governance

## Feature prioritization and execution continuity

**Policy:** Design discussions, feature exploration, and architectural proposals do not alter approved priorities or the active execution sequence unless they materially block completion of the currently authorized feature or feature set. Only the project owner may explicitly reprioritize work.

1. **Execution continuity:** Continue the approved task or milestone until complete, blocked, or explicitly reprioritized.
2. **Discussion is not authorization:** Discussing, designing, or endorsing a future feature does not authorize implementation or priority promotion.
3. **Capture without interruption:** Record non-blocking ideas, requirements, dependencies, and rationale in the backlog; do not switch the active task.
4. **Blocking exception:** Interrupt only for a material blocker to authorized work or a significant security, data-integrity, or operational risk. State the blocker and minimum necessary response.
5. **Owner authorization:** Any priority change requires explicit owner approval.
6. **Infrastructure separation:** Platform/system infrastructure is distinct from application features and operational workflows. A desirable workflow enhancement is not automatically an infrastructure prerequisite.
7. **Resume automatically:** Following a tangent or design discussion, return to the previously active task without asking the owner to repeat the priority.
8. **Durable consistency:** Apply these rules across future conversations and keep context, TODO, and decision records consistent. Preserve existing task IDs and accepted evidence.

## Current application of this policy — 2026-10-14

- Eddie/Canva printing and artwork scaling are future operational workflow features, not platform-infrastructure blockers. Capture for later consideration; do not implement or reprioritize now.
- OneNote extraction is a one-time source migration concept, not a standing connector requirement.
- The durable infrastructure sequence remains authoritative: CC-TODO-006 isolated Cloudflare restore preparation and gated execution, followed by outstanding device, access, and real-sample acceptance as already documented in Cookie_Catalog_Context.md and Cookie_Catalog_TODO.md.
- OneNote export exploration may continue as an information-gathering conversation without promoting implementation over the active infrastructure sequence.
