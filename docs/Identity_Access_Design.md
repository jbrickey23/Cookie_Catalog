# CC-TODO-005 — Development identity and access

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
