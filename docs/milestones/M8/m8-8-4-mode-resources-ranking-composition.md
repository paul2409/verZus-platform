<!-- VERZUS M8.4 MODE RESOURCES AND RANKING COMPOSITION -->

# M8.4 — Mode Resources and Ranking Composition

## Intent

Give each leaderboard mode an explicit read model, ranking basis, query policy and responsive presentation rather than forcing weekly players, pools, game lanes, Crews and combine rankings through one generic table contract.

## Owned read models

- `weekly` — verified weekly player points;
- `pools` — pool points before advancement lock;
- `game` — verified points inside one selected game lane;
- `crew` — Crew championship points;
- `combine` — normalized cross-game combine score.

Each mode defines:

- expected entity type;
- default and allowed game filters;
- default and allowed scopes;
- ranking basis;
- desktop columns;
- compact mobile metrics;
- current-position language;
- points label.

## API boundary

`GET /api/leaderboards/[mode]/composition` returns the mode contract independently from summary, entries, current position, rewards and status.

The composition response follows the existing M8.3 boundary:

```text
HTTP response
→ Zod raw schema
→ domain adapter
→ TanStack Query cache
→ mode composition
→ mobile list / desktop table
```

## Reliability

The UI has a local composition registry as initial and degraded-mode fallback. Invalid mode/filter combinations are normalized before reads. The server validates that every read model contains the entity type owned by that mode.

## Verification

```bash
npm run verify:m8:8.4
```

## Rollback

```bash
bash ./VERZUS_M8_8_4_Mode_Resources_Ranking_Composition.sh rollback
```
