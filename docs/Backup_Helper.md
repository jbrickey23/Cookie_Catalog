# Cookie Catalog backup helper

Status: implemented and automatically tested; owner Windows acceptance pending. This is a manual backup assistant, not a scheduled backup service. It makes no network requests and never deletes old backups.

## Run on Windows

1. Extract the backup-helper ZIP into a private folder. Keep `backup-helper.mjs`, `Backup-CookieCatalog.ps1` and this guide together.
2. Open that folder, click File Explorer's address bar, type `powershell`, and press Enter.
3. Run:

```powershell
node .\backup-helper.mjs
```

4. Choose **1**. Use a trusted complete TAR exported by Cookie Catalog. Supply its full path and your existing private OneDrive `Cookie_Catalog\Backups` folder. Paths containing spaces or Unicode are supported; surrounding double quotes are accepted. Press Enter to accept the suggested OneDrive folder only if it is correct.
5. Answer **y** if this is a pre-change backup before import/bulk edits; otherwise use **n**. The helper validates the archive, checks all original hashes and archive completion, reconstructs the database in memory, checks integrity/relationships/migrations, copies to a new UTC-named file and verifies the copy. It writes a `.tar.receipt.json` beside the TAR.
6. A successful local copy displays `cloudCopy: pending`. Wait for OneDrive sync, locate the saved TAR in OneDrive **web** and download it independently. Run the helper again and choose **2**, providing the saved receipt path and newly downloaded TAR. `cloudCopyMatch: true` confirms byte identity. It writes a separate cloud-copy verification receipt; it does not pretend to have inspected your cloud account or prove the origin of a selected local file.
7. Option **3** prints retention review only: keep the latest seven normal backups, preserve pre-change snapshots and exclude unverified/changed backups from candidates. Review is advisory; no command deletes or prunes. Keep pre-change backups until the changes and recoverability are verified.

The tool requires Node **24.10 or newer** with built-in SQLite; the owner's previously verified Node 24.21.0 meets this requirement. It requires no npm packages, Wrangler or Python on Windows. Python is used only by the repository's synthetic test-fixture generator. The optional `.ps1` launcher runs the same helper, but is not necessary. If PowerShell policy blocks `.ps1`, use the documented `node` command; do not change execution policy or Defender settings. If security blocks `node` itself, stop and report the message.

The backup destination must already exist and be outside every Git checkout. The helper never overwrites old backups. Private archive contents, model files and receipts must stay out of public GitHub. Keep edits/uploads/deletions idle while exporting. Direct-save archives beyond the 32 MiB fallback limit still require a compatible desktop Chrome/Edge save operation in the app.

## Focused Windows acceptance

Use the already validated 22:44 backup; a new catalog export is unnecessary for this tool check.

1. Choose **1**, select that TAR and the existing private OneDrive backup folder; answer **n** for normal backup.
2. Confirm the result says `tables: 16`, `records: 14`, `objects: 1`, `integrity: ok`, `complete: true`, and `cloudCopy: pending`. Confirm the new TAR and receipt exist. Older backups should remain unchanged.
3. Choose **3** against the same folder. Confirm `mode: review-only` and `deletesNothing: true`.
4. For end-to-end helper cloud receipt acceptance, use OneDrive web to download the newly saved filename and choose **2** with its receipt. This validates the helper's receipt workflow; the earlier independent cloud-copy pass remains valid regardless.

Report any error text. A screenshot is only needed when the output is unclear. A local test result does not establish actual Windows or cloud sync success.

## Noninteractive use

```powershell
node .\backup-helper.mjs validate 'C:\private\catalog.tar'
node .\backup-helper.mjs save 'C:\private\catalog.tar' 'C:\private\OneDrive\Cookie_Catalog\Backups' normal
node .\backup-helper.mjs verify-cloud 'C:\private\saved.tar.receipt.json' 'C:\Downloads\cloud-copy.tar'
node .\backup-helper.mjs review 'C:\private\OneDrive\Cookie_Catalog\Backups'
```

Each saved archive receives a unique timestamped name. The default program never schedules tasks, opens sign-in pages, imports into Cloudflare, changes app bindings, stores credentials or activates retention deletion. The source TAR is never removed.

## Automated verification

`node --test tools/tests/*.test.mjs` covers linked schema/original validation, quotes/Unicode/NUL values, forward references, corrupt/truncated/extra archive bytes, missing destinations, Git checkout rejection, source links, duplicate names, independent-cloud-copy comparison, changed local backups, protected snapshots and non-destructive latest-seven review. The large-original app integration also invokes this validator. Node 24 CI runs these tests alongside existing schema/Python/app checks.
