# M12.3 — Notification Centre and Lifecycle States

<!-- VERZUS M12.3 -->

## Purpose

Replace the generic signal feed with a mobile-first notification centre that can display the complete
notification lifecycle without introducing mutations before the idempotency contract exists.

## Lifecycle

- `unread`
- `read`
- `actioned`
- `dismissed`
- `expired`

## Resource boundary

`GET /api/notifications`

The endpoint supports lifecycle, category, pagination and controlled reliability scenarios. Response data
passes through Zod validation, a domain adapter and a dedicated TanStack Query cache before rendering.

## Stage boundary

M12.3 is read-only. Idempotent read, dismiss and action mutations plus shell badge synchronization are
reserved for M12.4.
