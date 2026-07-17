<!-- VERZUS M8.2 SEARCH FILTERS SORTING PAGINATION URL STATE -->

# M8.2 — Search, Filters, Sorting, Pagination and URL State

## Intent

Make every leaderboard exploration state deterministic, shareable and recoverable without introducing an API dependency before M8.3.

## URL contract

The weekly leaderboard route supports:

- `mode`: weekly, pools, game, crew or combine;
- `game`: all, ea-fc, cod-mobile, clash-royale or league;
- `scope`: global or friends;
- `sort`: rank, points, wins or win-rate;
- `direction`: asc or desc;
- `q`: normalized search text, limited to 80 characters;
- `page`: positive one-based page number;
- `size`: 3, 5 or 10 rows.

Invalid values fall back to explicit defaults. Default values are omitted from the URL.

## Search policy

Search is debounced by 300 ms and matches:

- player or Crew name;
- handle;
- Crew membership;
- country code;
- game identifier;
- entity type.

Typing replaces the current history entry. Deliberate mode, filter, sort and page actions create a new history entry.

## Deterministic ordering

Rows sort by the selected metric and direction, then by current rank, then by stable record ID. Identical server snapshots therefore produce identical client ordering.

## Pagination policy

Filtering and sorting occur before pagination. Invalid or stale page numbers are clamped to the final available page and rewritten into the URL.

## Empty-state policy

A no-result state preserves the current-player position and offers one reset action. M8.6 adds loading, stale, offline and resource-error states.

## Verification

```bash
npm run verify:m8:8.2
```

## Rollback

```bash
bash ./VERZUS_M8_8_2_Search_Filters_URL_State.sh rollback
```
