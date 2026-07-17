<!-- VERZUS M7.2 STATE MACHINE, TIMELINE AND SERVER TIME -->

# M7.2 — State Machine, Timeline and Server Time

## Intent

Make the server authoritative for match state, version and deadlines before any M7 mutation is enabled.

## Ownership

The `matches/operations` domain owns:

- the legal transition graph;
- expected-state and expected-version mutation guards;
- UTC match clock policy;
- lifecycle-derived timeline presentation;
- the mock server clock service;
- the independent clock endpoint;
- the display-only countdown component.

## State transition contract

Every mutation must provide:

- current expected state;
- current expected match version;
- requested next state.

A stale version or stale state is retryable only after refreshing the match. An illegal transition is non-retryable and must never be corrected client-side.

## Server-time contract

`GET /api/matches/[matchId]/clock` returns a request-scoped UTC clock snapshot with:

- `serverNow`;
- `matchVersion`;
- check-in open and close timestamps;
- lobby open timestamp;
- match start timestamp;
- result deadline;
- active deadline kind;
- countdown mode.

URL-selected states are accepted only for the deterministic `m7-preview` reference match. Ordinary match IDs resolve state inside the server service. The browser derives display time from the server anchor. The countdown never authorizes a transition.

## Failure boundary

Clock failure must not remove participants, navigation, support or the route shell. M7.3 adds cached API resources and controlled clock failure states.

## Verification

```bash
npm run verify:m7:7.2
```

## Rollback

```bash
bash ./VERZUS_M7_7_2_State_Machine_Server_Time_FIXED.sh rollback
```
