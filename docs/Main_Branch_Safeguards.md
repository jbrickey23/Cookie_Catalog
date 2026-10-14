# CC-TODO-004 — Main-branch safeguards

Applied and verified 2026-10-14. Main protected=true; the development branch remains unprotected. Persisted rule options and GitHub Actions source were read back through the signed-in settings UI. Detailed protection API access returns 403 for the integration; basic branch API independently confirms protection. No repository access or Cloudflare setting changed.

## Active policy

| Setting | Target state | Reason |
| --- | --- | --- |
| Branch name/pattern | main only | Preserve feature-branch development and the existing GitHub deployment path |
| Require pull request before merging | On | Reviewable source/doc changes before main updates |
| Required approving reviews | Off / zero | The current single-owner workflow must not require another person to approve their own work |
| Require status checks | On; sqlite from GitHub Actions | Existing Schema smoke tests workflow covers SQLite schema/import, Node tests, type-check and build |
| Require branch up to date | On | Validate the proposed merge against the current main branch |
| Require conversation resolution | On | Resolve review threads before merging |
| Do not allow bypassing protections / include administrators | On | Owner/apps follow the same PR and check path |
| Allow force pushes | Off | Preserve main history |
| Allow deletions | Off | Protect the release branch |

Do not enable signed-commit, code-owner/second-reviewer, merge-queue, deployment or linear-history requirements as part of this step. Current connector-created commits and normal merge-based history must remain usable. Do not grant bypass actors, change repository visibility/access, provision services, upgrade a plan, alter Cloudflare deployment settings or merge application PR #1.

## Maintenance and verification

1. Open repository Settings -> Branches and inspect/edit the existing exact-main classic rule. Do not create an overlapping rule.
2. Enter the table above. Choose the actual recently reported sqlite check and GitHub Actions source when GitHub offers source selection. Do not merely type an unreported check name.
3. Save and read back the rule from both GitHub UI and the branch/rule API where permitted. Confirm main protected=true, required status name/source and up-to-date policy, PR requirement with zero mandatory approvals, administrator enforcement and no force-push/deletion allowance. Record unavailable readback fields honestly.
4. Inspect draft application PR #1 for the required check and review state; do not merge or enable auto-merge. A draft remains intentionally unmergeable even after passing checks.
5. From this point, update main notes through a small documentation-only PR with passing checks. Keep application work on the existing feature branch/draft PR. Do not bypass protection to keep the old direct-main documentation habit.

Configuration readback verified the saved policy. This documentation/CI-only pull request is the first normal protected-main update. Record its check/merge outcome separately; do not deliberately push destructive history changes to test enforcement. Positive UI readback and protected=true confirmed this rule is active.

Official references: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches and https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule .

## CI bootstrap for notes-only main

Before application merge, main contains durable notes but no app/database/tests or workflow. The existing Schema smoke tests/sqlite check is now introduced on main with documentation/link/JSON and complete-source-layout validation. When app source exists, it also runs the same schema/import, npm ci, Node tests, TypeScript and build commands as the development branch. Partial source layout or a missing committed app lockfile fails instead of skipping application validation. This is validated through a documentation/CI-only PR; app source and operational data are excluded.
