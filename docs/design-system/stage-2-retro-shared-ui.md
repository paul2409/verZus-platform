# VERZUS Stage 2 Retro Shared-UI Contract

Status: implementation candidate pending visual approval

## Scope

Stage 2 converts only:

- App shell and shell overlays
- Desktop and mobile navigation presentation
- Route and widget boundaries
- Operational and system-state shared layouts
- Shared primitives

It does not change route composition, feature logic, APIs, hooks, schemas, mocks, adapters, queries, view models, authentication, onboarding state, check-in, or telemetry.

## Visual Source of Truth

`src/styles/verzus-retro-system.css`

## Shared Rules

- Sharp corners only; all component border radii resolve to zero.
- Notched surfaces use `--vz-retro-cut-sm`, `--vz-retro-cut-md`, or `--vz-retro-cut-lg`.
- Primary actions use neon green and black text.
- Secondary actions use cyan outlines.
- Danger uses red.
- War and rivalry use pink.
- Rewards and timers use gold.
- Structure and rare states use purple.
- Body copy remains neutral and readable.
- The global grid and scanlines are owned only by the retro theme.
- Keyboard focus remains a visible green ring.

## Mobile Dock

1. Play → `/play`
2. Crew → `/crews`
3. Watch → `/matches`
4. Rewards → `/rewards`
5. Profile → `/profile`

## Approval Widths

- 390px
- 768px
- 1440px

Stage 3 must not begin before shell and shared primitives are visually approved.
