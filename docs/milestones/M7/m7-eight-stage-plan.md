<!-- VERZUS M7 EIGHT-STAGE PLAN -->

# M7 — Match Operations and Check-In

## Intent

Deliver a server-authoritative match control surface where check-in, readiness, lobby entry, result submission, evidence, disputes and terminal outcomes remain reliable across refreshes and isolated panel failures.

## Eight controlled stages

1. **M7.1 — Match Operations Foundation and Approved Screen**
   - Dynamic match route, responsive composition, all 15 visual states, typed static view model, original team artwork and route boundaries.
2. **M7.2 — State Machine, Timeline and Server Time**
   - Legal transitions, state/version metadata, server clock resource, deadline policy, drift-aware display countdown and stale-state refresh rules.
3. **M7.3 — Schemas, APIs, Adapters and Query Resources**
   - Zod schemas, domain adapters, TanStack Query resources and independent summary, participant, timeline, check-in, lobby, result, evidence, dispute and support reads.
4. **M7.4 — Idempotent Check-In and Readiness**
   - Server-authoritative eligibility/deadline checks, duplicate-click lock, idempotency key, persisted check-in and opponent readiness updates.
5. **M7.5 — Lobby and In-Progress Operations**
   - Lobby code, ready confirmation, match-start transition, issue reporting and independent chat/support availability.
6. **M7.6 — Results, Evidence, Confirmation and Disputes**
   - Version-checked result submission, independent evidence upload, opponent confirmation, auditable disputes and conflict recovery.
7. **M7.7 — Terminal, Authorization and Failure States**
   - Forfeit, cancelled, completed, offline, stale, partial failure, unauthorized, forbidden, not found and maintenance handling with local panel boundaries.
8. **M7.8 — Testing, Observability and Release**
   - Unit, component, integration, E2E, visual regression at 390/768/1440, accessibility, failure injection, telemetry, preview approval, immutable artifact and rollback.

## Completion boundary

M7 is not complete until every transition is tested, invalid transitions are blocked, refresh preserves state, countdown drift is controlled, each panel can fail independently, and the M7.8 release gate passes.
