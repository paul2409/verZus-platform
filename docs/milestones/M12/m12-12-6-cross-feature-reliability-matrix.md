# M12.6 - Cross-Feature Reliability and Edge-State Matrix

<!-- VERZUS M12.6 -->

## Intent

Make Search, Notifications and Activity fail independently while keeping navigation, confirmed cache data and unrelated routes usable.

## State contract

- loading
- success
- empty
- stale
- retrying
- error
- offline
- unauthorized
- forbidden
- not found
- maintenance
- partial failure
- schema-invalid response

## Ownership

The shared `ResourceStatePanel` owns only domain-neutral presentation. Search, Notifications and Activity retain ownership of scenario parsing, API status codes, query behavior, recovery actions and domain copy.

## Isolation rules

- A failed Search domain cannot hide healthy domains.
- A notification read failure cannot remove mutation-safe cached records, navigation or Search.
- A notification mutation failure restores the exact optimistic snapshot and retries with the original idempotency key.
- An Activity next-page failure leaves confirmed pages visible.
- Unauthorized and forbidden failures never automatically retry.
- Maintenance and offline states provide local retry without reloading the application shell.
- Schema-invalid responses are rejected before entering the query cache.

## Verification

```bash
npm run verify:m12:12.6
```

This stage deliberately excludes Vitest and Playwright. M12.7 adds observability and delivery resilience.
