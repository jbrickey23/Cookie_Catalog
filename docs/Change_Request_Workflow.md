# Inline Change Requests — after R1

CC-TODO-018. Owner accepted deferral October 16, 2026, 12:22 Pacific. Target R1.1; not a release blocker.

User opens Change Request from the catalog. Capture available focused record identity, view/search and application version automatically. Required fields: summary, requested change and reason. Optional screenshot and additional context. Capture submission identity and timestamp from the authenticated session. Provide quick help, field type/length/allowed-value checks and accessible validation feedback. Show a review step and explicit Save request confirmation; retain the draft on validation/save failure.

Persist a durable request ID, created time, status and context. Requests must be discoverable in the next reconciliation/TODO review rather than existing only in browser memory. Submission creates a request, not a catalog edit. Acknowledge the request ID and keep the catalog position. Decide the private durable storage and review integration before implementation; do not silently publish user screenshots, catalog context or identities to the public GitHub repository. Suggested statuses: New, Triaged, Planned, Done, Declined. Do not promise a delivery date from submission.

R1 continues to use the existing conversation for feedback. Future request capture does not expand current production/release scope.
