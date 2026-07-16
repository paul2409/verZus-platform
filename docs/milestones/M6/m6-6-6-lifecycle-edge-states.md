# M6.6 — Competition Lifecycle and Edge States

## Intent

M6.6 makes competition entry state explicit, server-authoritative, and independently recoverable without changing the approved M6.1 discovery composition or collapsing M6.3–M6.5 resources into one page dependency.

## Lifecycle model

The domain supports:

- `draft`
- `scheduled`
- `registration_open`
- `registration_closed`
- `check_in_open`
- `in_progress`
- `completed`
- `cancelled`
- `archived`

Only `registration_open` can permit a new entry, and only when authorization, eligibility, capacity, and service availability all allow it.

## Edge-state matrix

| Scenario              | UI behavior                                 | Entry mutation behavior                       |
| --------------------- | ------------------------------------------- | --------------------------------------------- |
| `registration_closed` | Keeps details visible and links to schedule | Rejected with `409`                           |
| `waitlist`            | Shows a distinct waitlist outcome           | Direct entry rejected with `409`              |
| `not_eligible`        | Explains the eligibility block              | Rejected with `403`                           |
| `full_capacity`       | Keeps existing details visible              | Rejected with `409`                           |
| `cancelled`           | Shows a blocking cancellation state         | Rejected with `409`                           |
| `offline`             | Keeps loaded content and exposes retry      | Rejected with `503`                           |
| `partial_failure`     | Preserves unaffected panels and navigation  | Allowed when core entry policy is still valid |
| `unauthorized`        | Offers sign-in                              | Rejected with `401`                           |
| `forbidden`           | Offers return to discovery                  | Rejected with `403`                           |
| `not_found`           | Offers return to discovery                  | Rejected with `404`                           |
| `maintenance`         | Shows retryable maintenance state           | Rejected with `503`                           |

## Data flow

`HTTP response -> Zod schema -> lifecycle adapter -> TanStack Query cache -> lifecycle resource -> UI`

The lifecycle resource is independent from summary, eligibility, rules, rewards, participants, bracket, and entry persistence.

## API resources

- `GET /api/competitions/:competitionId/lifecycle`
- Existing `POST /api/competitions/:competitionId/entry`, wrapped by the M6.6 lifecycle guard

The M6.5 entry handler is preserved as `route.m6-5.ts` and remains the mutation implementation after the guard allows the request.

## Failure injection

Preview scenarios use `?scenario=<name>`. The lifecycle GET stores the selected test scenario in a short-lived HTTP-only cookie scoped to competition API routes so the entry POST receives the same server-side decision.

Failure injection is disabled in production unless `VERZUS_ENABLE_FAILURE_INJECTION=true` is explicitly set. This switch is for controlled preview/staging environments only and must remain false in production.

## Reliability boundary

- A lifecycle failure does not remove the App Shell or competition navigation.
- Partial failure does not blank healthy detail panels.
- Server policy, not the client countdown or button state, controls entry acceptance.
- Errors preserve a request ID for support.
- Normal mode renders no new banner, preserving the approved screen composition.

## M6.6 boundary

M6.6 adds focused unit, adapter, guard-contract, and component coverage. Complete E2E, accessibility, visual regression, telemetry, preview promotion, and release rollback evidence remain the M6.7 release gate.
