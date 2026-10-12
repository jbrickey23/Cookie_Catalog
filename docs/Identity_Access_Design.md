# CC-TODO-005 — Identity and access

Status: architecture design only. No identity provider provisioned or authenticated production access.

## Proposed direction
Cloudflare Access protects the private application at the edge, with an allowlist of the wife's and any approved collaborators' identities. The Worker must independently verify signed Access JWTs against the configured team's JWKS and audience; merely trusting identity headers, email text, or network location is insufficient. An application-level membership/role record maps a verified stable subject to owner/editor/viewer permissions. No self-service signup or public registration in v1.

## Authorization
- Viewer: browse authorized catalog records and download linked private attachments.
- Editor: viewer plus create/edit cutters, designs, locations, tags, and upload files.
- Owner: editor plus membership administration, export, and destructive operations.
- Unauthenticated, unknown subject, expired/invalid token: deny.
- No client-supplied object key grants access. Validate attachment ownership/association before R2 operations.
- Apply checks to every API operation, including searches, direct-ID lookups and exports.

## Implementation gates
1. Obtain explicit approval before creating Cloudflare Access applications or adding identity users.
2. Confirm supported login provider(s), intended users, recovery path, domain and account prerequisites.
3. Configure Access app/audience and verify JWT signature, issuer, audience, expiry and key rotation.
4. Implement role lookup in D1 and deny-by-default middleware; use synthetic identity fixtures for tests.
5. Test owner/editor/viewer and unauthorized paths, expired/forged JWT, and direct attachment URL denial.
6. Keep recovery owner and second-factor setup documented outside public repository; no credentials in Git.

## Current safe state
The API remains disabled in `app/src/worker.ts`. `DenyAllIdentityVerifier` is a safe placeholder; it is not a production authenticator. No real user identity has been collected.
