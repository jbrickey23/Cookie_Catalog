# Cookie Catalog — current context

R1 v0.1.0 is released. Production is the sole real-catalog editing site: https://cookie-catalog-prod.j-brickey.workers.dev/ . Development is for testing: https://cookie-catalog-dev.j-brickey.workers.dev/ . The edit freeze is lifted.

[Release closeout](docs/R1_Release_Closeout.md) records accepted data/deployment/access/Save/Undo/backup evidence. PR #1 merged at c0cb3efa8915d88d95efa28e9dfaec3b4ebd0cda; tag v0.1.0 points there. Production promotion 62e92a16a1e32975ee6bc7f15679183120315411 passed Workers build c4a066ba-fb0b-45f9-aa15-d2ed1920478c. Completion notes merged through PR #6. Preserve release and recovery branches and private independent backups.

## Active work

Owner authorized housekeeping and small UX fixes October 16 at 17:34 Pacific (CC-TODO-021): streamline accumulated status history, review stale PRs/branches, clarify environment links, add sign-out and discoverable saved-change Undo, modest CSS refinement and Slot help. Changes must pass checks before publication; do not mark pending development acceptance as live production success.

[R2 fast-follow plan](docs/R2_Plan.md): UX, Change Request ingestion, E2E release automation, photo inbox/workers with preview and approval. R2 implementation was authorized at 18:05 Pacific. Finish housekeeping/UX, then implement private Change Request ingestion; progress the other tracks as concrete tested slices.

CC-TODO-019 backup/restore stall remains unresolved: root cause and a verified fix are required. Cloud in-app backup is separate from the managed-PC npm block. Preserve safe locks and fast bounded Save/Delete. No real catalog data, images, credentials, private emails or signed links belong in Git. Remote Cloudflare dashboard login remains blocked; owner dashboard and wife's unmanaged-PC Wrangler worked. Do not bypass managed Windows protections or repeat the transfer.

[Current TODO](Cookie_Catalog_TODO.md) · [Project charter](docs/Project_Charter.md) · [Historical context](Cookie_Catalog_Context_History.md). Historical checkpoints preserve evidence; their old pending instructions do not override this page.
