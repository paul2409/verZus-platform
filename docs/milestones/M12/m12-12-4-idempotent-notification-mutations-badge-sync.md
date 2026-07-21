# M12.4 — Idempotent Notification Mutations and Shell Badge Synchronization

<!-- VERZUS M12.4 -->

## Purpose

Complete the mutation boundary intentionally deferred by M12.3. Notification reads, actions and dismissals
are server-authoritative, replay safe and independently recoverable. The domain-neutral application shell
receives only the confirmed unread count.

## Endpoints

```text
PATCH /api/notifications/[notificationId]
POST  /api/notifications/read-all
GET   /api/notifications/unread-count
```

Every write requires the same idempotency key in the JSON body and `Idempotency-Key` header.
Reusing a key for the same payload returns the prior result. Reusing a key for a different payload returns
`409 IDEMPOTENCY_KEY_REUSED`.

## State transitions

```text
unread -> read
unread -> actioned
unread -> dismissed
read   -> actioned
read   -> dismissed
```

`actioned`, `dismissed` and `expired` are terminal for conflicting operations. Repeating the already-applied
operation is a safe no-op. `expected_state` detects updates made by another client before submission.

## Data flow

```text
HTTP mutation
→ Zod request validation
→ idempotency and expected-state policy
→ server-authoritative notification store
→ Zod response validation
→ domain adapter
→ optimistic TanStack Query cache
→ confirmed cache invalidation
→ notification UI and shell badge
```

## Failure isolation

- A write failure rolls back only notification query snapshots.
- The original idempotency key is retained for local retry.
- The notification read resource remains usable when a mutation fails.
- The shell, navigation, Search and unrelated domains remain mounted.
- Badge-resource failure falls back to zero without moving API ownership into `PlatformShell`.

## Verification boundary

`npm run verify:m12:12.4` runs M12.3 prerequisite verification, structural verification, focused ESLint and
focused TypeScript. It does not run Vitest or Playwright.
