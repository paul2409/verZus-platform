<!-- VERZUS M5 STEPS 5.5-5.8 -->

# Step 5.8 — Query and Widget Integration

## Data flow

```text
HTTP response
→ raw Zod response schema
→ domain adapter
→ independent TanStack Query cache
→ Play resource state
→ Play view model
→ isolated widget UI
```

## Independent resources

```text
GET /api/me/status
GET /api/matches/next
GET /api/check-ins/current
GET /api/leaderboards/me
GET /api/crews/me/summary
GET /api/competitions/recommended
GET /api/activity/recent
```

## Failure isolation

```text
next match failure
→ next-match retry state only

check-in failure
→ check-in retry state only

rank failure
→ weekly-position fallback only

Crew failure
→ Crew fallback only

opportunity failure
→ recommendation fallback only

activity failure
→ activity fallback only
```

Navigation and static quick actions remain available.

## Scenario inspection

Development builds expose:

```text
/play?scenario=normal
/play?scenario=check_in_open
/play?scenario=checked_in
/play?scenario=match_starting_soon
/play?scenario=no_match_scheduled
/play?scenario=crew_activity_present
/play?scenario=no_crew
/play?scenario=opportunities_available
/play?scenario=partial_api_failure
/play?scenario=offline
```
