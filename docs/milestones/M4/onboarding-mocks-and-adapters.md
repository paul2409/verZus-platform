<!-- VERZUS M4 STEP 4.9 -->

# M4 Step 4.9 - Onboarding Mocks and Adapters

## Purpose

Provide shared, validated mock/API contracts for onboarding progress, game
selection, location, player identity, availability, and Crew preference.

This step does not implement final onboarding screens.

## Data flow

```text
HTTP response
-> Zod response validation
-> onboarding adapter
-> typed domain data
-> future query cache
-> future screen view model
-> UI
```

## Progress API

Existing endpoints remain:

```text
GET  /api/onboarding/progress
PUT  /api/onboarding/progress
POST /api/onboarding/complete
```

The progress client now delegates response validation and structured error
translation to `onboarding-progress.adapter.ts`.

## Options API

```text
GET /api/onboarding/options/games
GET /api/onboarding/options/locations
GET /api/onboarding/options/identity
GET /api/onboarding/options/availability
GET /api/onboarding/options/crews
```

## Query parameters

```text
locations: countryCode, regionId
availability: timezone
crews: gameId
```

## Mock scenarios

Every options endpoint supports:

```text
success
empty
partial_failure
maintenance
rate_limited
```

The scenario may be selected with `?scenario=partial_failure` or the
`x-verzus-mock-scenario` header. Unknown scenarios fall back to `success`.

## Failure isolation

- an empty game catalog does not corrupt onboarding progress
- location partial failure preserves available data and manual-entry fallbacks
- identity options fail independently from progress persistence
- availability options isolate timezone and slot rules
- Crew discovery failure never removes the `canSkip` path
- maintenance and rate limits use the shared structured error envelope

## Security

All options routes reuse the onboarding API access guard. Page-level route
protection is not treated as API authorization.

Mock scenario controls must not be exposed in production.
