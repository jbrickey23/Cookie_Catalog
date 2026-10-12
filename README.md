# Cookie_Catalog

A visual catalog for a cookie decorating business: find decorating designs, the compatible cutters already owned or available to print, and where those cutters or files live. Preserve known alternate uses (cutter flips).

## Current checkpoint

2026-10-12: Durable bootstrap initialized in `jbrickey23/Cookie_Catalog`, default branch `main`. The repository was empty before initialization; no existing work was replaced. Repository metadata confirms read/write permissions.

Current phase: establish infrastructure, one durable task per component. GitHub is the approved canonical application code source (CC-DEC-005); feature branches are for development/review and `main` is the release branch (CC-DEC-006); hosting deployment integration is pending verification. No site, database, file store, or sample catalog has been provisioned.

GitHub-first fresh-chat restoration is approved (CC-DEC-007). In-session remote-file recovery has been checked; an independent new-conversation test is still needed before closing CC-TODO-001. Next infrastructure design work: CC-TODO-002 database and schema.

## Restore order

1. This README
2. [Context](Cookie_Catalog_Context.md)
3. [TODO](Cookie_Catalog_TODO.md)
4. [Decision Log](Cookie_Catalog_Decision_Log.md)
5. [New Chat Bootstrap Prompt](Cookie_Catalog_New_Chat_Bootstrap_Prompt.md)
6. [Initial Data Model](docs/Initial_Data_Model.md) and [Research](docs/Research.md), when needed

After remote initialization, GitHub is authoritative for code and project state. The selected operational database and file store will be authoritative for catalog records and attachments. Chat is a working session.
