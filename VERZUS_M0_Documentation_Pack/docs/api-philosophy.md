# VERZUS API Philosophy

## Contract
HTTP response → schema validation → domain adapter → query cache → view model → UI.

## Design rules
- Version public contracts.
- Use UTC timestamps in ISO 8601.
- Return opaque IDs.
- Use structured errors.
- Include `requestId` in responses.
- Make retried mutations idempotent.
- Paginate collections.
- Avoid exposing database models.
- Prefer feature-owned endpoints.
- Separate commands from read models where useful.

## Endpoint shape
Preferred:

```text
GET /v1/me/status
GET /v1/matches/next
GET /v1/check-ins/current
GET /v1/leaderboards/me
GET /v1/crews/me/summary
GET /v1/competitions/recommended
```

Avoid making this the only path:

```text
GET /v1/dashboard
```

An aggregated endpoint may exist as an optimization, but every section must tolerate missing data and have a stable independent contract.

## Error contract
```ts
type ApiError = {
  code: string;
  message: string;
  requestId: string;
  retryable: boolean;
  fieldErrors?: Record<string, string[]>;
  details?: Record<string, unknown>;
};
```

## Mutation requirements
- Authorization checked server-side.
- Idempotency key for check-in, registration, result submission, reward claim, and financial commands.
- Expected resource version for stateful updates.
- Structured audit event for high-risk actions.
- Clear retryable versus terminal failure classification.

## Caching
Each resource documents:

- freshness window;
- stale window;
- retry count;
- background refetch policy;
- offline behaviour;
- optimistic-update policy;
- invalidation events.

## Third-party adapters
Each game integration is hidden behind a domain adapter. The rest of the platform consumes a normalized verification result.

```text
Riot adapter
Supercell adapter
EA FC evidence adapter
COD Mobile evidence adapter
```

Third-party failure must not corrupt Match state. Use pending verification and retry queues.

## Observability
Every request includes:

- request ID;
- release version;
- environment;
- route name;
- actor ID where safe;
- duration;
- outcome code.
