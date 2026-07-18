# M10.5 — Progression track and season progress

<!-- VERZUS M10.5 -->

## Purpose

Make progression legible without coupling reward claiming, inventory, history, achievements and season state into one dashboard response.

## Component map

```text
RewardsFoundationScreen
├── LevelProgressCard
├── ClaimableRewardCard
├── RewardInventoryPanel
├── RewardProgressionPanel
│   ├── SeasonSummary
│   ├── WeeklyXpCapacity
│   ├── WeeklyObjectiveList
│   ├── SeasonMilestoneRail
│   └── LevelRewardPath
└── RecentRewardHistory
```

## Independent data dependency

```text
GET /api/rewards/season
```

The existing progress, inventory, history and achievements endpoints remain independent. A season response can be stale, empty, unavailable, offline or malformed without removing claim controls or confirmed inventory.

## Data flow

```text
HTTP response
→ Zod envelope validation
→ season adapter
→ TanStack Query cache
→ reward resource view model
→ RewardProgressionPanel
```

## States

Season: `upcoming`, `active`, `completed`, `ended`.

Milestone: `completed`, `current`, `upcoming`, `locked`.

Reward lifecycle remains unchanged: `locked`, `eligible`, `claimable`, `claiming`, `claimed`, `expired`, `revoked`.

## Reliability boundary

- Season data is read-only in M10.5.
- The server remains authoritative for level XP, season XP, tier, weekly capacity and objectives.
- Empty season data renders an intentional no-active-season state.
- Stale season data remains visible with the existing stale indicator.
- Season failure does not disable claiming or blank confirmed reward inventory.
- Claim completion invalidates reward resources and safely refreshes progression without granting browser-authoritative XP.

## Responsive intent

The approved 390px hierarchy is preserved. Objective rows and horizontal milestone rails are touch-friendly on mobile. At tablet widths, objectives can use two columns while the page remains deliberately contained until a separate desktop Rewards reference is approved.
