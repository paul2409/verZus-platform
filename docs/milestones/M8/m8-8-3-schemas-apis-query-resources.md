<!-- VERZUS M8.3 SCHEMAS, APIS, ADAPTERS AND QUERY RESOURCES -->

# M8.3 — Schemas, Independent APIs, Adapters and Query Resources

## Intent

Move leaderboard reads behind validated, independently cacheable resources without changing the approved M8.1 anatomy or M8.2 URL contract.

## Data flow

```text
HTTP response
→ raw Zod schema
→ leaderboard domain adapter
→ domain Zod schema
→ TanStack Query cache
→ responsive leaderboard view model
→ mobile list or desktop table
```

## Independent resources

```text
GET /api/leaderboards/[mode]/summary
GET /api/leaderboards/[mode]/entries
GET /api/leaderboards/[mode]/current-position
GET /api/leaderboards/[mode]/rewards
GET /api/leaderboards/[mode]/status
```

There is deliberately no single `/leaderboard-dashboard` dependency. Entry refresh can fail without removing the current-player panel or rewards. Status can refresh without reloading rows.

## Cache policy

- Summary: 5 minutes
- Entries: 30 seconds with previous data preserved
- Current position: 20 seconds
- Rewards: 10 minutes
- Status: 15 seconds with a 30-second refresh interval

## Mock/API parity

The mock service emits the same snake-case HTTP contracts expected from a production API. Adapters validate and convert those payloads into the existing camel-case leaderboard domain model.

## Controlled scenarios

Each resource accepts `scenario=normal|empty|stale|error|malformed`. M8.6 will expose intentional UI states for these scenarios.

## Verification

```bash
npm run verify:m8:8.3
```

## Rollback

```bash
bash ./VERZUS_M8_8_3_Schemas_APIs_Query_Resources.sh rollback
```
