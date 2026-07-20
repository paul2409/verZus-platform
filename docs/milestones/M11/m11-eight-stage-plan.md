# M11 — Player Profile and Identity

<!-- VERZUS M11.1 -->

## Stage sequence

1. **M11.1 — Own-profile foundation**
   - Approved mobile identity hierarchy
   - Profile overview, statistics, Crew, games, recent form and achievements
2. **M11.2 — Public player profile and permissions**
   - `/players/[playerId]`
   - Own-versus-public data visibility policy
   - Blocked and unavailable public profiles
3. **M11.3 — Profile editing and validation**
   - Identity, bio, location, availability and avatar editing
   - Validation, upload controls and duplicate-submission protection
4. **M11.4 — Schemas, APIs, adapters and query resources**
   - Independent profile, stats, games, Crew, availability and privacy resources
5. **M11.5 — Match history and statistics**
   - Paginated history, filters, lifetime/season scopes and deterministic summaries
6. **M11.6 — Achievements, game identities and trust history**
   - Linked-platform management, achievement detail and auditable trust events
7. **M11.7 — Privacy, edge states and failure isolation**
   - Empty, suspended, blocked, offline, stale, unauthorized and partial-failure states
8. **M11.8 — Release readiness**
   - Observability, feature isolation, responsive review, immutable packaging and rollback

## Core architecture

Each profile resource owns its schema, adapter, API client, cache key, view model, UI, fallback and error state.

```text
HTTP response
→ Zod validation
→ domain adapter
→ TanStack Query cache
→ profile view model
→ independently recoverable UI
```
