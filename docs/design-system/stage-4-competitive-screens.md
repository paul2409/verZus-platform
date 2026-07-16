# VERZUS Stage 4 — Retro Competitive Screens

Status: installed, pending visual approval

## Boundary

Stage 4 owns presentation for Leaderboards, Crews, Matches, Compete and Rewards. It does not modify routes, APIs, schemas, adapters, mocks, queries, authentication, check-in, telemetry or the Stage 3 Play command centre.

## Source of truth

`src/styles/verzus-retro-system.css` remains the only active visual theme.

## Screen signals

- Leaderboards: cyan structure, neon-green current-player state, gold rank points.
- Crews: purple structure, pink War Week signal, green readiness.
- Matches: cyan information, red urgency, green confirmation.
- Compete: cyan discovery, green eligibility, gold rewards, pink Crew War.
- Rewards: gold pools and timers, green confirmed credits, cyan informational balances.

## Responsive contract

Every Stage 4 route must be reviewed at 390px, 768px and 1440px. Ranking tables become mobile ranking cards; dialogs remain scrollable; no screen may create horizontal page overflow.

## Failure isolation

Stage 4 presentation does not create a combined dashboard endpoint. Domain data and failure handling remain feature-owned.
