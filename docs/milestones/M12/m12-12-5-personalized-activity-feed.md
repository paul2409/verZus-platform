# M12.5 - Personalized Activity Feed

<!-- VERZUS M12.5 -->

## Purpose

Provide a viewer-safe competitive activity stream without coupling Search, notifications or the application shell to one aggregate response.

## Screen contract

- Primary action: filter and open a contextual competitive record.
- Mobile first: one chronological stream with horizontal domain filters.
- Tablet: two-column activity cards where space supports them.
- Desktop: activity stream plus an explanatory resource-boundary rail.
- Required review widths: 360, 390, 430, 768, 1024 and 1440 pixels.

## Resource contract

```text
GET /api/activity?domain=all&pageSize=6&cursor=<opaque>
```

The server applies viewer and Crew visibility before serialization. Private records for other players never reach the client.

## Data flow

```text
HTTP response
-> Zod validation
-> activity adapter
-> TanStack Query infinite cache
-> activity feed view model
-> grouped contextual UI
```

## Pagination

Cursor pagination is opaque, deterministic and server-generated. Loading an older page cannot blank confirmed pages. A failed next-page request exposes a local retry while retained items remain usable.

## Domain filters

- matches
- competitions
- Crews
- rewards
- rankings
- profile

Filter state is URL-backed. Each filter has its own query cache key.

## Reliability boundary

M12.5 owns activity loading, success, empty, refresh, page-error, offline-shaped and malformed-response handling. M12.6 performs the cross-feature reliability matrix for Search, notifications and activity, including stale, unauthorized, forbidden, maintenance and partial-failure review.

## Security

The mock service demonstrates server-side visibility filtering for public, Crew and private events. Browser filters are presentation only and are never the authorization boundary.

## Verification

```bash
npm run verify:m12:12.5
```

This stage deliberately excludes Vitest and Playwright.
