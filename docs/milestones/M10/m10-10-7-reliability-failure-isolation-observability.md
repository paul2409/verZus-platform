# M10.7 — Reliability, Failure Isolation and Observability

## Purpose

Keep the Rewards route usable when one resource, one claim request or one rendered widget fails. Preserve server authority and expose traceable request IDs without sending personal data.

## KEEP

- Approved 390px Rewards hierarchy.
- Independent progress, season, inventory, history and achievement resources.
- Server-authoritative, idempotent claiming.
- Auditable achievement and reward history.

## REUSE

- Zod response validation.
- TanStack Query cache retention and targeted refetch.
- Structured request IDs and retryable error codes.
- Existing route-level loading and error boundaries.

## REPLACE

- Implicit retry activity with an explicit `retrying` state.
- Route-wide rendering risk with one boundary per major reward widget.
- Generic error-only preview scenarios with authorization, not-found and maintenance scenarios.

## CREATE

- Independent widget boundaries for progress, claimable, inventory, season, achievements, recent history and audit history.
- Controlled `widget` and `widgetScenario=crash` failure injection.
- Resource scenarios for unauthorized, forbidden, not-found and maintenance.
- Privacy-safe telemetry for surface views, resource failures, resource retries, claim attempts, claim outcomes and widget failures.
- `GET /api/health/rewards` domain health endpoint.
- `POST /api/telemetry/rewards` telemetry intake endpoint.

## Failure-isolation contract

- A widget crash replaces only that widget with a local recovery card.
- A resource failure retains the deterministic fallback or last confirmed query snapshot.
- A claim failure does not alter inventory, progress or history optimistically.
- A telemetry failure is ignored by the product UI and cannot block claiming.
- Navigation and other platform domains remain available.

## Preview scenarios

```text
/rewards?resource=inventory&scenario=maintenance
/rewards?resource=history&scenario=unauthorized
/rewards?resource=achievements&scenario=forbidden
/rewards?resource=season&scenario=not-found
/rewards?widget=inventory&widgetScenario=crash
/rewards?widget=season&widgetScenario=crash
/rewards?claimScenario=response-lost
```

## Privacy boundary

Telemetry contains only event names, route, resource/widget names, reward IDs, operational states, structured error codes, request IDs and release SHA. It excludes names, email addresses, game handles, free-form descriptions and idempotency keys.

## Verification

The installation gate runs structural verification, focused ESLint and focused TypeScript only. Vitest and Playwright remain outside installation and are handled by later quality and release stages.

## Rollback

Use the M10.7 installer with `rollback`. The installer restores the newest timestamped pre-install archive and removes M10.7-owned files first.
