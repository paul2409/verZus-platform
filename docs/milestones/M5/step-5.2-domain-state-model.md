<!-- VERZUS M5 STEPS 5.1-5.4 -->

# Step 5.2 — Play Domain Schemas and State Model

## Action

Define validated domain contracts for every independent Play resource and a
pure state-derivation function for the ten required screen variants.

## Data flow boundary

```text
HTTP response
→ raw response schema
→ domain adapter
→ domain schema
→ query cache
→ Play view model
→ UI
```

## Domain contracts

```text
PlayerStatus
NextMatch
CurrentCheckIn
CurrentPosition
CrewSummary
RecommendedCompetition
RecentActivityItem
```

## Time rule

All timestamps are ISO 8601 UTC/offset timestamps. Countdown rendering is
client-side display only; server time remains authoritative.

## State priority

```text
offline
→ partial API failure
→ starting soon
→ checked in
→ check-in open
→ no match
→ live Crew activity
→ no Crew
→ featured opportunity
→ normal
```

## Safety rule

Malformed rows or envelopes are rejected before they enter the query cache.
A schema failure becomes an observable `invalid_response` client error.
