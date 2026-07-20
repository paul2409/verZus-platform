# M11.5 — Complete match history and detailed player statistics

## Purpose

Replace the own-profile match preview with a complete, paginated and independently recoverable player record.

## Ownership

The `profiles/history` feature owns match-history schemas, adapters, clients, query keys, mock read models, responsive UI and resource errors.

## Data boundaries

- `GET /api/profile/matches`
- `GET /api/profile/statistics`

The two resources are cached independently. Statistics failure does not remove match history, and match-history failure does not remove confirmed statistics.

## URL state

- `game`
- `result`
- `page`
- `statsGame`
- `statsWindow`
- `resource`
- `scenario`

## Responsive presentation

- Mobile and tablet: match cards with explicit result, score, rank, trust and evidence metadata.
- Desktop: semantic full-width table.
- Both presentations consume the same validated domain model.

## Reliability

Previous page data remains visible during a filter or pagination refresh. Structured errors include a request ID and local retry. Empty filters render an intentional state without collapsing the statistics resource.
