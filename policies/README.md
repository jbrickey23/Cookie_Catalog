# Cookie_Catalog — Durable_CHATGPT policy pin

- Framework: `JBrickey23/Durable_CHATGPT`
- Adopted version: **1.0.0**; adoption date: **2026-10-19 Pacific**
- Source commit: `53aa39ccedce935a702f44072cc647231c8cc02e` ([immutable source](https://github.com/JBrickey23/Durable_CHATGPT/tree/53aa39ccedce935a702f44072cc647231c8cc02e))
- Adoption decision: **CC-DEC-022**; adoption task: **CC-TODO-024**
- Source manifest: [unaltered local copy](manifest.json), verified at that source commit.

| Policy | Local pinned copy | SHA-256 |
| --- | --- | --- |
| DCHAT-POL-001 | [Guided_Switching.md](v1.0.0/Guided_Switching.md) | `53d3bcc2efaf93b6a31dd6671734e5199801bed792e0c221beca5b1c103c411c` |
| DCHAT-POL-002 | [Usage_Efficiency.md](v1.0.0/Usage_Efficiency.md) | `ad00e2f52fc4a0a47aa36f75a13e1c999d7994927fecdcca1456396830477727` |

## Exceptions and local engineering conventions

**No policy exceptions.** The existing [development guidelines](../docs/Development_Guidelines.md), CC-DEC-010 architecture-by-exception governance, and [main safeguards](../docs/Main_Branch_Safeguards.md) remain in force. These complement the global policies. The [local workflow and audit](../docs/Durable_Workflow_Adoption_20261019.md) maps them to this project; it does not redefine the framework.

Core files retain their root names. Prior dated checkpoints remain historical evidence; the current top checkpoint plus specialized release records control continuation. An adoption branch is implemented/locally validated, not adopted on main until its protected PR merges. Use GitHub PR/commit evidence to establish publication status.

## Restore and upgrade

Read this pin and both local policies during initialization. Use verified local copies if the authority is unavailable and report that limitation; never silently follow moving main. For an upgrade, inspect the new release and manifest, compare changes and local conventions, obtain approval for material changes, verify the full source commit and digests, copy released files unchanged, update this pin and core records, validate, and commit through the protected-main PR workflow. Retain older pinned versions as needed for restoration.

[Source adoption instructions](https://github.com/JBrickey23/Durable_CHATGPT/blob/53aa39ccedce935a702f44072cc647231c8cc02e/policies/README.md) · [Project-specific procedures](../docs/Durable_Workflow_Adoption_20261019.md)
