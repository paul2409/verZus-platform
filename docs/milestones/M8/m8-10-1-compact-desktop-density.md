<!-- VERZUS M8.10.1 COMPACT DESKTOP DENSITY -->

# M8.10.1 — Compact Desktop Leaderboard Density

## Intent

Increase ranking visibility and comparison speed without removing color, identity intel, semantic table behavior, or the dedicated mobile presentation.

## Desktop contract

- Header: 44px target, 48px hard regression ceiling.
- Standard row: 68px.
- Champion and podium rows: 72px.
- Current-player row: 76px.
- Cell padding: 8px block and 12px inline.
- Identity anatomy: name on line one; affiliation, tier, and game on line two.
- Rank-zone color: 3px left accent and restrained uniform row tint.
- Player, Crew, and Match links remain explicit interaction targets.

## Scope

This change is desktop-only at widths of 1024px and above. Mobile ranking cards and intel drawers remain unchanged.

## Verification

```bash
npm run verify:m8:10.1
npm run test:m8:10.1
```

## Rollback

```bash
bash ./VERZUS_M8_10_1_Compact_Desktop_Leaderboard_Density.sh rollback
```
