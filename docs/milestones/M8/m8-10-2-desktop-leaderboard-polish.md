<!-- VERZUS M8.10.2 DESKTOP LEADERBOARD POLISH -->

# M8.10.2 — Desktop Leaderboard Rebalance and Premium Polish

## Intent

Make the desktop leaderboard readable, colorful and information-dense without horizontal scrolling or duplicate current-player content.

## Desktop contract

- Default result window: 10 rows.
- Header target: 42px.
- Ranking row target: 58px; hard browser-test ceiling: 64px.
- No horizontal table scrollbar at 1440px.
- Player identity: name plus handle/country metadata.
- Crew affiliation: explicit Crew intel link in its own column.
- Match reference: explicit Match intel link.
- Current position: side-rail card on desktop and pinned mobile card on mobile.
- Single-page results do not render inactive pagination controls.
- At 1024–1279px, lower-priority Streak and Trust columns are hidden while their values remain available in intel cards.

## Verification

```bash
npm run verify:m8:10.2
npm run test:m8:10.2:e2e
```

## Rollback

```bash
bash ./VERZUS_M8_10_2_Desktop_Leaderboard_Polish.sh rollback
```
