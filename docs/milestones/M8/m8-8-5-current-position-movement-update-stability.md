<!-- VERZUS M8.5 CURRENT POSITION, MOVEMENT AND UPDATE STABILITY -->

# M8.5 — Current Position, Movement and Update Stability

## Intent

Make the current-user position independently available and ensure incoming ranking snapshots cannot produce inconsistent movement labels or unpredictable equal-rank reshuffling.

## Ownership

The `leaderboards/live` subdomain owns:

- previous-rank comparison;
- movement and delta derivation;
- stable update merging;
- revision polling;
- current-position insight;
- changed-entry markers;
- the independent update endpoint.

## Ordering policy

Incoming rows are ordered by:

1. authoritative rank;
2. prior snapshot order when ranks are equal;
3. immutable entry ID as the final deterministic tie-break.

The client does not calculate authoritative rank. It only verifies and presents movement from server-provided current and previous rank values.

## Resource

```text
GET /api/leaderboards/[mode]/updates
```

Optional deterministic review scenarios:

```text
?live=advance
?live=tie
```

The query polls every 30 seconds, retains previous data during refresh, and never blanks the current leaderboard while checking for a new revision.

## Verification

```bash
npm run verify:m8:8.5
```

## Rollback

```bash
bash ./VERZUS_M8_8_5_Current_Position_Movement_Update_Stability.sh rollback
```
