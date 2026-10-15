# CC-TODO-005 — Development identity and access

## Reconciled activation status — October 14 Pacific

Owner reported saving the exact-email Access allow list and deploying CATALOG_MEMBERS Secret. Existing-owner Admin / Owner and separate viewer read-only/search/details/original download acceptance passed. The second configured admin's own sign-in is pending. Role code and full tests/build/development Workers Build passed. Earlier sections describing activation as entirely pending are historical. Account emails/secrets remain private; account recovery, intended-device specificity and the parked alternate-email denial test are not closed by these passes.

## 2026-10-15, 01:17 UTC — Owner and viewer live acceptance passed

After the configured role deployment and owner-reported Access/secret saves, owner confirmed their live session displays Admin / Owner. In the guided separate private-browser viewer workflow, owner confirmed read-only and then passed search for tree, View details and existing-original download. The requested acceptance checklist also required absence of create/edit/upload/remove/backup controls; the owner reported pass. Record these as owner-mediated live acceptance, not assistant browser/API observations. Real account emails remain private. The second intended admin account has not yet had its own sign-in verified; do not infer its pass from the existing owner or viewer. Local signed-membership and role/denial tests remain passed.

CC-TODO-005 now has configured owner-equivalent admin/viewer roles with observed existing-owner and viewer acceptance. It remains open for the second admin sign-in, account recovery/admin operations readiness and the separately deferred live alternate-email denial test (do not restart automatically). No in-app membership editor exists; authorized Cloudflare configuration is the current administration path. CC-TODO-012 Windows backup acceptance remains complete. Next useful device check is Windows Edge and iPhone Safari if not already observed; do not repeat passed behavior solely to collect screenshots. Then continue authorized representative real samples (007) and remaining recovery/release readiness. Preserve current development resources/data, parked Windows security remediation, deferred OneNote/photo/Canva, and draft/unreleased application PR #1.

## Private configured membership — October 15

Admin and owner are equivalent at the owner's request: both use role `owner`. The two intended admin identities and one viewer identity are held privately; never commit real emails. Server authorization applies on every request, independently of hidden UI controls.

### Activate on existing development Worker

1. Deploy this tested development code through the existing feature-branch Workers Build. Keep application PR #1 draft; no main/production release is required.
2. Workers & Pages → cookie-catalog-dev → Settings → Variables and Secrets → Add. Select Secret, name `CATALOG_MEMBERS`, value a JSON array such as `[{"email":"admin@example.test","role":"owner"},{"email":"read-only@example.test","role":"viewer"}]`. Replace synthetic identities privately with the owner-authorized list. Save/Deploy. Preserve `OWNER_EMAIL`, Access team domain and audience. The optional secret is intentionally not required for existing owner-only deployment.
3. In Zero Trust, edit the existing Cookie Catalog Dev application's Allow policy. Preserve the bootstrap owner's exact email and allow only the authorized additional emails. Keep the existing email-code identity provider, application audience, hostname and private storage protections. Do not add Everyone, domain-wide rules or bypass policies.
4. Owner-confirm deployed source and normal login before testing additional users in their own browser sessions. Session endpoint returns owner for admins and viewer for read-only membership. Check viewer search/detail/download and absence of create/upload/delete/maintenance/export controls; server guards independently reject forbidden API requests. Confirm admin retains existing owner controls. Record observed results; never request or log sign-in codes.

A private role map is the membership store for this small fixed list, avoiding a schema change and preserving current TAR compatibility. It is not editable in the app. An owner catalog role does not itself grant Cloudflare dashboard permissions. A future self-service membership UI/D1 store is separate work.

### Revoke, recover and verify

Remove the account from CATALOG_MEMBERS and deploy the changed secret, then remove its Access allow entry. The app checks membership on every request even with an existing signed token. A role change likewise takes effect after the configuration deployment. OWNER_EMAIL is a separate bootstrap recovery path: deleting its membership entry cannot revoke it; deliberately rotate that secret/Access policy if the bootstrap account itself must change.

Malformed JSON, invalid role/email, duplicate case-insensitive email, unexpected fields, over 100 entries or a value over 16 KiB denies configured members. The bootstrap owner remains available for repair. An absent secret preserves the existing owner-only runtime. No role comes from JWT custom claims, client headers or request parameters.

Catalog TAR exports intentionally do not contain Access policy, OWNER_EMAIL or CATALOG_MEMBERS. Retain these private settings in the owner's existing secure recovery records and recreate them separately when recovering the Worker. Do not embed membership secrets in catalog backups or public evidence. There is no membership D1 table/migration to restore. Removing the optional secret rolls back to bootstrap-owner-only access without changing catalog data; preserve Access protection.

Validation: 56 application tests and TypeScript/frontend/Worker build passed locally. Configured memberships include signed admin/viewer tokens, ignored claimed roles, wrong audience/signature, revocation and malformed/duplicate maps. Existing real D1/R2 permission tests verify reads/downloads and viewer write/deletion/maintenance denial. Rendered controls verify viewer browsing without create/upload/cleanup. Actual owner device/access-policy/secret/live collaborator acceptance remains pending.

## 2026-10-15, 00:59 UTC — Owner specified intended administrator

Owner supplied one intended collaborator account privately and requested admin access. Do not commit the real email to this public repository; retrieve it from the owner conversation or private runtime configuration when implementing enrollment. This satisfies the account/desired-role input for CC-TODO-005. Admin is a requested role, not an active grant: current code only supports owner/editor/viewer and the optional membership adapter accepts editor/viewer. Do not silently downgrade the request to editor or map the account to the bootstrap owner. Define and implement admin permissions, durable membership, revocation, client controls and backup/restore compatibility with tests before changing Cloudflare Access or activating the account. Jay remains the project owner. No invitation, account grant, secret, policy or membership mutation has occurred.

## October 14 — Tested role foundation, activation remains pending

The backend now enforces a shared-catalog permission matrix: owners retain all current controls; authenticated editors may read/create/update catalog records and upload/download files; viewers may search/read/download. Deleting originals, orphan cleanup, all `/api/dev/` diagnostics and full exports remain owner-only. Origin/method/input guards are retained. These roles refer to one shared business catalog, not separate per-user inventories.

`AccessIdentityVerifier` supports an optional trusted server-side membership resolver after JWT signature/issuer/audience/subject/email verification. The adapter receives verified subject and normalized email; it may return editor/viewer only, never owner. It is called on each request, so no stale membership cache survives revocation. JWT custom role claims do not grant permissions; resolver errors, unknown members and invalid roles fail closed. The configured bootstrap owner's path remains available during a membership-store outage.

**No resolver is wired into the deployed Worker.** The default verifier still accepts only the existing owner. No new email, user, D1 table/migration, secret, Access policy or permission was added. Role-aware client controls, durable membership/admin/recovery and membership export/restore must be implemented before enabling collaborators. Never grant access merely to test this foundation. Activation requires owner identification of intended accounts/roles and the existing permission review. Preserve the separately deferred alternate-email test.

Signed-token membership/revocation/outage tests plus real local D1/R2 role workflows cover editor record creation/upload, viewer read/download, denied viewer writes/editor deletes and denied non-owner maintenance before resource access. Earlier owner-only statements below describe the historical setup; current owner runtime remains unchanged.

## Verified setup (2026-10-12)
The owner created the Zero Trust Free organization, email one-time PIN provider, and Access application `Cookie Catalog Dev`. A screenshot confirms the destination `cookie-catalog-dev` and attached owner allow policy. The owner reported reaching the foundation home page after the emailed-code login test. The team domain and application audience are recorded as non-secret Wrangler variables.

## Server-side boundary
`AccessIdentityVerifier` uses jose to verify RS256 JWTs from `Cf-Access-Jwt-Assertion`. It fetches keys only from the configured team's HTTPS JWKS endpoint, caches them with bounded refresh/cooldown, and validates signature, issuer, audience, subject, expiry, issued-at and any not-before claim. Unknown keys, forged tokens and JWKS failures fail closed. Email headers alone never establish identity.

Initial development bootstrap additionally requires the signed email to match the private `OWNER_EMAIL` configuration. This grants only access to the read-only `GET /api/session` smoke test. It does not implement durable D1 membership or enable catalog/file operations. Owner/editor/viewer membership by verified stable subject remains a required follow-up before CRUD.

## Owner configuration and deployed check
1. Open **Workers & Pages → cookie-catalog-dev → Settings → Variables and Secrets**.
2. Add a **Secret** named `OWNER_EMAIL`, containing the exact email allowed by the Access policy. Save/apply it to this development Worker only. Never commit real user email or credentials to public GitHub.
3. After the development build completes, open `/api/session` on the development hostname in the authenticated browser.
4. Expected: status 200 with `authenticated: true` and `role: "owner"`. Missing configuration returns 503; missing, invalid or unapproved identity returns 401. Responses are not cached.
5. Test an unapproved identity separately before claiming negative edge-policy acceptance. Preview URLs must remain covered by Access. Do not change the team domain or recreate the application without updating issuer/audience configuration.

The home page remains the foundation screen. All other API routes remain disabled after authentication. No production environment, real asset uploads or database mutations are introduced.

## Validation
`npm run test:auth` uses synthetic signing keys and identities: signed owner success, spoofed headers, wrong audience/issuer, expired and future tokens, missing claims, unknown owner/service tokens, forged signatures, unknown keys, JWKS failure, key rotation, read-only session and disabled catalog routes.
TypeScript and Vite build passed locally. Live session verification after secret setup is pending. Recovery, D1 membership, collaborators, negative edge tests and authenticated attachment retrieval remain open.

Reference: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/
