# VERZUS Stage 4 Competitive Screens

Status: implementation candidate pending visual approval.

## Scope

Stage 4 converts the following production routes from placeholders into feature-owned competitive screens:

- `/leaderboards/weekly`
- `/crews`
- `/matches`
- `/compete`
- `/rewards`

The stage does not modify APIs, schemas, adapters, data hooks, authentication, check-in behavior, or the Play screen.

## Visual language

- Green: active navigation, confirmed actions, positive movement and wins.
- Cyan: information, filters, links and focus.
- Gold: ranks, timers, reward pools and championship totals.
- Magenta: rivalry and War Week.
- Red: losses, errors and destructive states.
- Near-black and elevated dark surfaces remain dominant.

## Responsive contract

- 390px: stacked feature cards and mobile ranking rows.
- 768px: two-column opportunities and schedule cards.
- 1440px: wide ranking rows, split match control and dense Crew data.
- No desktop table is compressed into a mobile viewport.

## Domain ownership

Each feature owns its screen, CSS Module and smoke test. Shared primitives remain domain-neutral.

## Data note

These screens use existing typed feature mocks while the domain API milestones are developed. VS Points are competitive scores. Cash and Bonus VS Credits remain separate reward balances.

## Approval gate

Review each route at 390px, 768px and 1440px before Stage 5 begins.
