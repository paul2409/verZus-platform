# VERZUS Failure Isolation Strategy

## Objective
No single component, API, adapter, queue, or third-party integration should disable unrelated player actions.

## Frontend isolation unit
One major widget = one query boundary = one error boundary = one fallback.

Examples:

- Next Match failure does not disable Check-in if Check-in is available.
- Leaderboard failure does not disable navigation or competition entry.
- Crew summary failure does not disable Match operations.
- Notifications failure does not disable the rest of the shell.

## Route shell rule
Top navigation, bottom navigation, session controls, offline indicator, and route-level fallback must not depend on feature-page data.

## Data strategy
- Independent queries for independently useful widgets.
- Cached data remains visible during background refresh failure.
- Stale data is labelled instead of blanked.
- Retry is local to the failing feature.
- Timeouts prevent one slow dependency from blocking the full page.

## Service strategy
- Domain services own their data and commands.
- Cross-domain communication uses APIs and events, not direct table writes.
- Queue consumers are idempotent.
- Dead-letter queues capture terminal processing failures.
- Circuit breakers protect unstable third-party dependencies where appropriate.

## Game adapter failures
If Riot or Supercell verification is unavailable:

1. Match result enters pending verification.
2. Player sees an explicit delayed state.
3. Retry job continues.
4. Support receives an operational signal after threshold breach.
5. Unrelated games remain operational.

## Storage failures
Evidence upload failure must not erase submitted score input. The UI preserves local progress where safe and allows retry.

## Ranking failure
If ranking calculation fails:

- previous finalized snapshot remains available;
- leaderboard is marked stale;
- Match completion remains valid;
- recalculation can replay from authoritative results.

## Notification failure
Domain commands still complete even if notification delivery fails. Notifications are retried asynchronously.

## Feature flags
Unstable or incomplete modules can be disabled by environment, cohort, or user without redeploying the application.

## Required fallback states
- loading;
- retrying;
- stale;
- partial failure;
- offline;
- maintenance;
- unavailable with request ID.

## Failure injection tests
- one endpoint returns 500;
- one endpoint times out;
- malformed response;
- expired session;
- third-party adapter down;
- queue delayed;
- evidence storage unavailable;
- duplicate mutation;
- stale version conflict;
- leaderboard projection delayed.

## Recovery objectives
Exact RTO and RPO are defined later, but M0 establishes:

- authoritative relational data requires backups;
- derived read models must be rebuildable;
- ranking projections must be replayable;
- audit records are append-only;
- deployments retain prior artifacts for rollback.
