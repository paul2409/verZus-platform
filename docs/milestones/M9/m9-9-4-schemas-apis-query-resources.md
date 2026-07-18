<!-- VERZUS M9.4 SCHEMAS APIS ADAPTERS QUERY RESOURCES -->

# M9.4 — Schemas, APIs, adapters and query resources

## Intent

Replace the Crew profile's single local dependency with independently validated and independently cached read resources while preserving the approved M9.1 presentation.

## Data flow

```text
HTTP response
→ raw Zod schema
→ Crew domain adapter
→ TanStack Query cache
→ CrewFoundationViewModel composition
→ existing Crew UI
```

## Independent endpoints

- `GET /api/crews/[crewId]/profile`
- `GET /api/crews/[crewId]/roster`
- `GET /api/crews/[crewId]/requests`
- `GET /api/crews/[crewId]/activity`
- `GET /api/crews/[crewId]/rankings`
- `GET /api/crews/[crewId]/achievements`
- `GET /api/crews/[crewId]/settings`

There is no oversized Crew dashboard endpoint.

## Reliability contract

Each query has its own key, retry policy and cached previous value. During initial mock/API transition, a missing slice uses the M9.1 local contract so navigation and unrelated Crew panels remain available. M9.7 adds the complete offline, stale and partial-failure presentation.

## Scenarios

Use `resource=<name>&scenario=<scenario>` on Crew profile routes.

Supported scenarios: `stale`, `empty`, `error`, `malformed`, `slow`.

## Verification

```bash
npm run verify:m9:9.4
```

## Rollback

```bash
bash ./VERZUS_M9_9_4_Schemas_APIs_Query_Resources.sh rollback
```
