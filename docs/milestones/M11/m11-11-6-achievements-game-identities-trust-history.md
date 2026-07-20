# M11.6 — Achievements, Game Identities and Trust History

## Purpose

Complete the owner-only player identity record with independently loaded achievements, connected game identities and auditable trust history.

## Routes

- `/profile/achievements`

## Independent reads

- `GET /api/profile/achievements`
- `GET /api/profile/game-identities`
- `GET /api/profile/trust-history`

No combined profile-progress endpoint is required.

## Data flow

`HTTP response -> Zod schema -> adapter -> TanStack Query -> owner view model -> UI`

## Privacy boundary

The complete trust event ledger, private game identities and achievement evidence are owner-only. Public profile projections remain controlled by the M11.2 server permission policy.

## States

Each resource supports loading, success, empty, stale, retrying, error, offline, unauthorized, forbidden, not found, maintenance, slow and malformed-response scenarios.

## Pagination

Achievements and trust history paginate independently. Changing one page never invalidates or hides the other resource.

## Verification

```bash
npm run verify:m11:11.6
```

The lean M11.6 gate runs structural verification, focused ESLint and focused TypeScript. It does not execute Vitest or Playwright.
