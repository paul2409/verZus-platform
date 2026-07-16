# VERZUS Stage 3 Play Contract

Status: implementation candidate for visual approval

## Purpose

The Play route is the player command centre. Its first mobile viewport must answer:

1. What is live?
2. What do I need to do next?
3. Who is my next opponent?
4. Is check-in open or confirmed?
5. Where do I rank this week?
6. What competition or Crew action is available?

## Data ownership

Stage 3 preserves the existing independent data flow:

HTTP response → schema validation → adapter → query cache → view model → UI

No combined dashboard endpoint is introduced.

## Mobile order

1. Page identity and live status
2. Player status
3. Hero and weekly VS Points
4. Next match and check-in
5. Quick actions
6. Weekly position
7. Four game lanes
8. Featured competitions
9. Recent activity
10. Crew signal

## Desktop composition

- Hero and match/check-in share the first command row.
- Quick actions remain full width and stable.
- Weekly position and game lanes share the next row.
- Competitions, activity, and Crew widgets retain independent boundaries.

## Signal colours

- Green: primary action, confirmed status, wins, active navigation
- Cyan: information, focus, links, secondary actions
- Red: live urgency, losses, errors
- Gold: VS Points, rewards, ranks, countdowns
- Magenta: rivalry and Crew War signals
- Muted violet-grey: inactive controls and secondary text

## State requirements

Every API-owned widget retains loading, success, empty, stale, error, offline, retrying, unauthorised, forbidden, not-found, maintenance, and partial-failure behaviour where supported by its contract.

## Non-goals

- No new route
- No new API
- No new mock data contract
- No change to check-in mutation semantics
- No leaderboard, Crew, competition, or match feature rebuild
