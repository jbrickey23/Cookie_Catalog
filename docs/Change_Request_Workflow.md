# Private Change Requests — R2 first slice

CC-TODO-018. R2 scenario accepted October 16, 2026. A signed-in user opens Request a change from the header. Available focused record identity/name and current search are captured at opening. Required fields: type, title (120 characters), requested change (4000) and reason (1000). Context is an advisory snapshot, not verified record provenance. Server records authenticated subject, source environment and timestamp; no private email is copied to GitHub. Inline explanations and validation precede a review step and explicit Confirm and save request.

Submission retains the catalog position/draft and creates no catalog mutation. Validation/save failure preserves the request draft. Closing a populated unsaved request asks before discard; leaving the page uses the browser unsaved-change warning. The request is not saved locally across a browser restart; explicit save is needed for durable persistence. A stable per-form UUID and payload fingerprint make response-loss retries idempotent; changed payloads cannot overwrite an existing request.

Private storage is the existing FILES bucket under catalog-requests/v1/, separate from originals and snapshots. No schema migration, new membership, external service, paid resource or public GitHub issue is introduced. The API requires authenticated membership; submission is available to existing owner/editor/viewer users. GET/export and release/TODO assignment are owner-only. State-changing requests require exact same-origin and the change-request header; JSON is streamed with a 16 KiB bound. R2 conditional writes prevent overwrite races.

## Reconciliation without a new tracking dashboard

Owner expands Request reconciliation and downloads the private JSON export. Pagination is bounded to 20 records per request; exports stop without partial download if their cap is exceeded. The next reconcile reads this export along with current TODOs, sanitizes any public work item and maps request IDs to planned work. Private data is never automatically published. The owner-only PATCH /api/change-requests API assigns release (R2 or v0.2.0) and TODO (CC-TODO-018), using the exported revision in If-Match. It rejects stale writes. No broad user status, reply or planning interface is built yet; those are deferred until requested.

**Recovery coverage:** each new submission and planning update first writes and reads back a checksum-addressed private recovery copy under catalog-request-recovery/v1/. Planning protects both previous and proposed values; failure to verify protection blocks the live write. These small per-request copies do not run a catalog-wide check. A recovery copy can represent an attempted write that did not commit.

Owner-only GET /api/change-requests?history=REQUEST_ID returns up to 20 verified versions plus a pagination cursor. Owner-only PATCH accepts id, restoreSha256 and approved: true with the current If-Match revision. It verifies checksum/identity, protects the current value and conditionally restores only that request. Stale writes and corrupt copies are rejected. No catalog records are restored or deleted by this operation. Recovery currently requires an existing request and an operator/API workflow; a recovery UI and disaster recovery for missing live keys remain open.

These copies share the live bucket and are not independent disaster-recovery backups. The catalog TAR/managed backup still covers catalog tables and originals, not request data. Keep downloaded request exports privately. Independent operational backup/export verification and an isolated restore rehearsal remain CC-TODO-023 release requirements.

## Still pending

Live authenticated development acceptance, production promotion and operational export/reconcile trial remain pending. Screenshot attachments and full application-version capture are not in this first slice. Add request-prefix recovery/export verification before calling the entire ingestion feature release-complete. Follow-up UI only on demonstrated need. No delivery date is promised by submission.
