<!-- VERZUS M8.9 ENTITY INTEL API AND CARD SYSTEM -->

# M8.9 — Entity Intel API and Card-System Integration

## Intent

Replace M8.8 leaderboard-local snapshots with independently cached Player, Crew and Match resources while preserving the approved desktop table, mobile ranking list and deep-link interaction contract.

## Ownership

- `profiles/intel-card/resource` owns Player intel schemas, adapter, API client, query policy and mock service.
- `crews/intel-card/resource` owns Crew intel schemas, adapter, API client, query policy and mock service.
- `matches/intel-card/resource` owns Match intel schemas, adapter, API client, query policy and mock service.
- `leaderboards/interactions` owns only entity selection, drawer/sheet composition and trigger behavior.
- Shared intel-card primitives remain domain-neutral.

## Data flow

```text
GET /api/{players|crews|matches}/:entityId/intel
→ raw Zod envelope
→ owning-domain adapter
→ independent TanStack Query cache
→ PlayerIntelCard | CrewIntelCard | MatchIntelCard
→ leaderboard drawer / mobile sheet
```

## Independent endpoints

```text
GET /api/players/[playerId]/intel
GET /api/crews/[crewId]/intel
GET /api/matches/[matchId]/intel
```

Each endpoint returns a request ID, fetch timestamp, freshness state and domain-owned payload. No leaderboard dashboard endpoint is introduced.

## URL state

```text
?intel=player&entityId=player-prismo
?intel=crew&entityId=crew-xenon
?intel=match&entityId=match-player-prismo
```

Reliability review scenarios use:

```text
&intelScenario=stale
&intelScenario=partial
&intelScenario=error
&intelScenario=not-found
&intelScenario=malformed
&intelScenario=slow
```

## Reliability

- Each entity kind has an independent query key and retry policy.
- Closing and reopening a card reuses validated cached data within its stale window.
- A card error renders inside the drawer/sheet and exposes a retry plus request ID.
- A deep link remains valid even when the entity is not present on the current leaderboard page.
- Leaderboard navigation, filters, pagination and ranking rows remain available during card failure.

## Extended card intelligence

Player cards add recent verified matches and achievement preview. Crew cards add owner, captains, active roster and recent form. Match cards add final score, competition, round, confirmation and dispute state.

## Verification

```bash
npm run verify:m8:8.9
```

## Rollback

```bash
bash ./VERZUS_M8_8_9_Entity_Intel_API_Card_System.sh rollback
```
