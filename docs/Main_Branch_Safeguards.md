# CC-TODO-004 — Main-branch safeguards

Prepared 2026-10-14. NOT applied: repository main/development both report protected=false and repository rulesets are empty. The connected GitHub integration supports source/PR work but exposes no administration write action. The browser reached GitHub sign-in; passkey sign-in did not complete and the subsequent password sign-in was rejected. Owner browser sign-in is the current prerequisite. Never store credentials or sign-in details in project files.

## Concrete intended policy

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

## Apply and verify after owner sign-in

1. Open the repository Settings -> Branches page and add a classic branch protection rule for the exact main branch. Inspect the actual current settings before saving; do not stack an overlapping rule over a new existing rule.
2. Enter the table above. Choose the actual recently reported sqlite check and GitHub Actions source when GitHub offers source selection. Do not merely type an unreported check name.
3. Save and read back the rule from both GitHub UI and the branch/rule API where permitted. Confirm main protected=true, required status name/source and up-to-date policy, PR requirement with zero mandatory approvals, administrator enforcement and no force-push/deletion allowance. Record unavailable readback fields honestly.
4. Inspect draft application PR #1 for the required check and review state; do not merge or enable auto-merge. A draft remains intentionally unmergeable even after passing checks.
5. From this point, update main notes through a small documentation-only PR with passing checks. Keep application work on the existing feature branch/draft PR. Do not bypass protection to keep the old direct-main documentation habit.

A configuration readback verifies the saved policy. Actual passing/blocked PR acceptance should be recorded separately when exercised; do not deliberately push destructive history changes to test it. No rule is active until positive readback proves it.

Official references: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches and https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule .
