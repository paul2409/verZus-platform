<!-- VERZUS M8.6 RELIABILITY AND EDGE STATES -->

# M8.6 — Reliability and Edge States

## Intent

Keep the leaderboard useful when data is slow, empty, stale, malformed, unavailable, offline or unauthorized. One invalid row must never crash the complete ranking surface.

## Reliability model

Each resource is evaluated independently:

- composition;
- summary;
- entries;
- current position;
- rewards;
- status.

Resource states are `loading`, `ready`, `empty`, `stale`, `degraded`, `error`, `offline` and `unauthorized`.

## URL-driven review states

Use `reliability` and optional `resource` query parameters:

```text
/leaderboards/weekly?reliability=loading
/leaderboards/weekly?reliability=empty
/leaderboards/weekly?reliability=stale
/leaderboards/weekly?reliability=error&resource=rewards
/leaderboards/weekly?reliability=offline
/leaderboards/weekly?reliability=unauthorized
/leaderboards/weekly?reliability=malformed-row
```

Valid resource targets are `all`, `composition`, `summary`, `entries`, `current-position`, `rewards`, and `status`.

## Cache behavior

Validated data remains visible when a retryable refresh fails. The UI marks that snapshot stale and preserves its request ID for support. Unauthorized states never rely on cached protected content.

## Malformed-row policy

The entries envelope is validated first. Each row is then validated independently. Invalid rows are omitted and recorded through `isolatedRowCount` and `isolatedRowIds`; valid rows continue to render.

## Verification

```bash
npm run verify:m8:8.6
```

## Rollback

```bash
bash ./VERZUS_M8_8_6_Reliability_Edge_States.sh rollback
```
