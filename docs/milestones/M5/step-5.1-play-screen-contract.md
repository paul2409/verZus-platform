<!-- VERZUS M5 STEPS 5.1-5.4 -->

# Step 5.1 — Play Screen Contract and Scope Freeze

## Action

Freeze the Play Command Centre purpose, state inventory, component ownership,
endpoint ownership, and failure behavior before final screen implementation.

## Screen purpose

The first mobile viewport must answer:

1. What do I need to do now?
2. Who am I playing next?
3. Have I checked in?
4. Where do I currently rank?
5. What is happening with my Crew?
6. What opportunities can I enter?

The page is a live player command centre. It is not a marketing introduction.

## Required reference states

```text
normal
check_in_open
checked_in
match_starting_soon
no_match_scheduled
crew_activity_present
no_crew
opportunities_available
partial_api_failure
offline
```

Each important state requires 390px, 768px, and 1440px approval references.
This installer does not approve references and does not replace the production
Play route.

## Component map

```text
PlayCommandCenter
├── PlayerStatusStrip
├── PrimaryActionPanel
│   ├── NextMatchCard
│   └── CheckInControl
├── CurrentPositionWidget
├── CrewPulseWidget
├── OpportunityRail
├── RecentActivityWidget
└── QuickActions
```

## Independent data dependencies

```text
GET /api/me/status
GET /api/matches/next
GET /api/check-ins/current
GET /api/leaderboards/me
GET /api/crews/me/summary
GET /api/competitions/recommended
GET /api/activity/recent
```

There is deliberately no mandatory `/api/play-dashboard` dependency.

## Failure behavior

- Next-match failure shows an isolated retry card.
- Check-in remains visible and fails safely.
- Leaderboard failure does not remove the match action.
- Crew failure does not affect opportunities or navigation.
- Opportunity failure does not affect check-in.
- Recent-activity failure does not collapse the page.
- Quick actions remain static and domain-safe.
