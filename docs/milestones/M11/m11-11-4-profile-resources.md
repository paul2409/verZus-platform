# M11.4 — Independent Profile Resources

## Purpose

Move the own-profile screen from direct fixture consumption to independently cached, schema-validated profile resources without changing the approved M11 visual hierarchy.

## Data flow

HTTP response → Zod schema → domain adapter → TanStack Query cache → merged profile view model → UI.

## Independent resources

- `GET /api/profile/identity`
- `GET /api/profile/competitive-summary`
- `GET /api/profile/crew`
- `GET /api/profile/availability`

No oversized `/api/profile-dashboard` endpoint is introduced.

## Failure isolation

Each resource owns its cache, request ID, stale state, error state and retry control. Confirmed data remains rendered while another resource is slow or unavailable. The profile editor's M11.3 confirmed local development override remains applied after server resources are merged.

## Development scenarios

Use `?resource=<name>&scenario=<scenario>` on `/profile`.

Resources: `identity`, `competitive-summary`, `crew`, `availability`.

Scenarios: `stale`, `empty`, `error`, `offline`, `slow`, `malformed`, `unauthorized`, `forbidden`, `not-found`, `maintenance`.

## Deferred work

- Detailed match history and statistics: M11.5
- Achievements, game identities and trust history: M11.6
- Privacy mutations and final edge states: M11.7
