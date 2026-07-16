# M6.3 — Competition Data Contracts and Reliability

## Scope

M6.3 replaces direct UI mock imports with four independent competition resources:

- `GET /api/competitions/discovery/featured`
- `GET /api/competitions/discovery`
- `GET /api/competitions/discovery/metadata`
- `GET /api/competitions/entries/me`

## Data flow

HTTP response → Zod raw schema → domain adapter → TanStack Query cache → resource state → UI.

## Reliability

- Featured, list, metadata and current entry fail independently.
- Previous list data remains visible during filter refreshes.
- Stale responses render with a stale label rather than blanking the screen.
- Invalid raw responses are rejected before reaching components.
- Mock and future production APIs share the same client-facing contracts.
- No `/api/compete-dashboard` aggregate is introduced.

## Scenarios

`normal`, `empty`, `stale`, `partial_failure`, `offline`, `maintenance`, `unauthorized`, `forbidden`, and `malformed` are available through `?scenario=` for focused preview and failure injection.

## Stage boundary

M6.3 does not implement competition details or entry mutations. Those remain M6.4 and M6.5.
