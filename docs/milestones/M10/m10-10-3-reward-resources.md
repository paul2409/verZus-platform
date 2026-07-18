# M10.3 — Schemas, APIs, adapters and query resources

<!-- VERZUS M10.3 -->

## Intent

Replace the Rewards screen's direct fixture dependency with four independently cached resources while preserving the approved 390px composition and the M10.2 read-only mutation boundary.

## Resource boundaries

- `GET /api/rewards/progress`
- `GET /api/rewards/inventory`
- `GET /api/rewards/history`
- `GET /api/rewards/achievements`

There is no oversized Rewards dashboard endpoint.

## Data flow

`HTTP response -> Zod schema -> reward adapter -> TanStack Query cache -> reward view model -> UI`

## Query policy

| Resource     |  Freshness | Retained during refresh | Retry |
| ------------ | ---------: | ----------------------- | ----: |
| Progress     | 60 seconds | Yes                     |     2 |
| Inventory    | 30 seconds | Yes                     |     2 |
| History      |  2 minutes | Yes                     |     2 |
| Achievements |  5 minutes | Yes                     |     2 |

## Failure isolation

A failed resource displays its own status and request ID. Other reward resources continue rendering from confirmed API data or the last safe snapshot. Claim mutations remain unavailable until M10.4.

## Development scenarios

Use `resource=progress|inventory|history|achievements` with `scenario=stale|empty|error|malformed|slow|offline`.
