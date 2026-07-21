# M12.7 - Notification Settings and Delivery Preferences

<!-- VERZUS M12.7 -->

## Intent

Complete the Milestone 12 screen inventory with independently owned notification preferences. A settings failure must not remove the notification centre, unread badge, Search, Activity or shell navigation.

## Contract

`GET /api/notifications/settings`

`PATCH /api/notifications/settings`

The PATCH contract requires:

- an `Idempotency-Key` header matching the request body;
- `expected_version` for stale-write protection;
- mandatory in-app delivery;
- mandatory security-category delivery;
- Zod validation before data enters the query cache.

## Data flow

```text
HTTP response
-> Zod validation
-> notification settings adapter
-> independent TanStack Query cache
-> settings view model
-> notification settings UI
```

## Isolation

- The settings query key does not share the notification-centre read key.
- Failed settings reads retain unrelated notification resources.
- Failed optimistic saves restore the exact confirmed settings snapshot.
- Retry uses the original idempotency key.
- A version conflict requires refresh instead of blind overwrite.

## Verification

```bash
npm run verify:m12:12.7
```

This focused stage deliberately excludes Vitest and Playwright.
