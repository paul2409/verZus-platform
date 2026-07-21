# M12 — Search, Notifications and Activity

<!-- VERZUS M12.1 -->

## Stage sequence

1. **M12.1 — Global Search foundation**
   - Approved mobile Search hierarchy
   - URL-backed query/domain state, discovery and deterministic foundation results
2. **M12.2 — Debounced suggestions and independent domain resources**
   - Players, Crews, competitions and matches resources
   - Debounce, cancellation and one-domain failure isolation
3. **M12.3 — Notification centre and lifecycle states**
   - Unread, read, actioned, dismissed and expired states
   - Grouping, filters, deep links and empty state
4. **M12.4 — Idempotent reads, badges and preferences**
   - Safe mark-read commands, badge reconciliation and notification settings
5. **M12.5 — Activity feed**
   - Personalized feed, domain filters, pagination and contextual links
6. **M12.6 — Reliability and edge states**
   - Offline, stale, unauthorized, forbidden, not-found, maintenance and partial failure
7. **M12.7 — Observability and delivery resilience**
   - Health, privacy-safe telemetry, delivery fallback and independent widget boundaries
8. **M12.8 — Release readiness**
   - Feature isolation, responsive review, immutable packaging and rollback

## Core architecture

Each domain resource owns its schema, adapter, API client, query key, view model, UI and fallback.

```text
HTTP response
→ Zod validation
→ domain adapter
→ TanStack Query cache
→ Search / Notification / Activity view model
→ independently recoverable UI
```
