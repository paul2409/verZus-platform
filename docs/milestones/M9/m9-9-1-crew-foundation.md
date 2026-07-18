<!-- VERZUS M9.1 CREW FOUNDATION CONTRACT -->

# M9.1 — Crew foundation and approved responsive profile

## Purpose

Give a player an immediate, readable understanding of Crew identity, performance, membership and operational status without enabling unsafe membership mutations prematurely.

## Route ownership

- `/crews` renders the authenticated player's current Crew foundation.
- `/crews/[crewId]` renders a shareable Crew profile foundation.
- Existing cross-feature Crew intel cards remain lightweight previews and are not replaced.

## Component map

```text
CrewFoundationScreen
├── CrewProfileHero
├── CrewIdentitySummary
├── CrewStatGrid
├── CrewTabs
├── CrewOverview
│   ├── AboutPanel
│   ├── RecentActivity
│   └── TopMembers
├── RosterPreview
├── RequestPreview
├── RankingsPreview
├── AchievementPreview
├── SettingsSummary
└── CrewMetricStrip
```

## State boundary

M9.1 is read-only. Manage, invite, application, member-role, ownership-transfer and disband commands are not visually implied as available. The Manage Crew control is disabled with an explicit stage description.

## Responsive contract

- 390px: stacked identity, two-column statistics, horizontally scrollable tabs and single-column panels.
- 768px: two-column statistics and content composition.
- 1024px: desktop identity and multi-panel overview.
- 1440px: full profile overview with three primary columns.

## Verification

```bash
npm run verify:m9:9.1
```
