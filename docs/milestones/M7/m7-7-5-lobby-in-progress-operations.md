<!-- VERZUS M7.5 LOBBY AND IN-PROGRESS OPERATIONS -->

# M7.5 — Lobby and In-Progress Operations

## Intent

Move the match safely from server-confirmed readiness into the lobby and then into active play without giving the browser authority over deadlines or lifecycle transitions.

## Commands

`POST /api/matches/[matchId]/lobby` supports:

- `enter_lobby`
- `confirm_ready`
- `start_match`
- `report_issue`

Every request requires:

- an `Idempotency-Key` header;
- `expected_state`;
- `expected_version`;
- a server-authorized action.

## State policy

- `both-ready → lobby-open` only after the server lobby-open timestamp.
- Lobby readiness updates versioned participant readiness without inventing a lifecycle state.
- `lobby-open → in-progress` only when both participants are in the lobby, both are ready, and server time has reached match start.
- Operational issue reporting is auditable and independent of match progression.

## Persistence

The M7 mock lobby store is attached to `globalThis` and synchronizes from the M7.4 check-in store. Refreshing the preview retains lobby entry, readiness, match-start and issue state within the running process.

## Controlled previews

Lobby entry window already open:

```text
/matches/m7-preview-lobby-now?state=both-ready
```

Both players ready and scheduled start reached:

```text
/matches/m7-preview-start-ready?state=lobby-open
```

Live match operations:

```text
/matches/m7-preview?state=in-progress
```

## Failure isolation

Lobby failure must not remove participants, timeline, result resources, support or navigation. Issue reporting remains inside the lobby boundary and does not modify result data.

## Verification

```bash
npm run verify:m7:7.5
```

## Rollback

```bash
bash ./VERZUS_M7_7_5_Lobby_In_Progress_Operations_FIXED.sh rollback
```
