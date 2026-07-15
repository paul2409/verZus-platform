<!-- VERZUS M5 STEPS 5.1-5.4 -->

# Step 5.3 — Independent Mock APIs

## Action

Create seven isolated mock read endpoints using the same envelopes and raw
schemas expected from future production APIs.

## Endpoints

```text
GET /api/me/status
GET /api/matches/next
GET /api/check-ins/current
GET /api/leaderboards/me
GET /api/crews/me/summary
GET /api/competitions/recommended
GET /api/activity/recent
```

## Scenario injection

Each endpoint accepts a development-only `scenario` query parameter:

```text
?scenario=normal
?scenario=check_in_open
?scenario=checked_in
?scenario=match_starting_soon
?scenario=no_match_scheduled
?scenario=crew_activity_present
?scenario=no_crew
?scenario=opportunities_available
?scenario=partial_api_failure
?scenario=offline
```

## Partial failure contract

For `partial_api_failure`, Crew summary and recent activity fail with structured
retryable errors while match, check-in, position, and opportunities continue to
respond successfully.

## Authorization

The APIs require an authenticated mock session. Anonymous requests receive 401.
Incomplete or restricted account states receive 403. Authorization is enforced
in the route handler layer, not only in the client.

## Mock/real parity

The UI will consume only adapters and domain models. Replacing mock handlers with
production handlers must not change component contracts.
