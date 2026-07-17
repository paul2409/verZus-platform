<!-- VERZUS M7.7 TERMINAL, AUTHORIZATION AND FAILURE STATES -->

# M7.7 — Terminal, Authorization and Failure States

## Intent

Close the Match Operations lifecycle safely while preserving the App Shell, support and unrelated panels during access, network, resource or render failures.

## Terminal ownership

`POST /api/matches/[matchId]/terminal` owns:

- player forfeit;
- authorized operations cancellation;
- admin or system completion;
- expected-state and expected-version validation;
- idempotency replay;
- role enforcement;
- terminal audit events.

Once terminal state is stored, check-in, lobby, result, evidence and dispute mutations return `MATCH_TERMINAL_STATE`.

## Access states

Controlled route references:

- `?access=unauthorized`
- `?access=forbidden`
- `?access=not_found`
- `?access=maintenance`

These screens do not expose participant or match operation data.

## Availability states

- `?availability=offline` preserves the last server-rendered snapshot and disables mutation controls.
- `?availability=stale` labels the snapshot and requires refresh before mutation.

## Failure isolation

- `?resource=timeline&scenario=partial_failure` tests a resource failure.
- `?crash=timeline` tests a real React render failure.
- Each major resource is wrapped by `MatchWidgetBoundary`.
- Navigation, support and unrelated panels remain available.

## Preview roles

For deterministic local review only:

- default `current_user` may forfeit;
- `?role=support` may cancel;
- `?role=admin` may cancel or complete when the lifecycle permits.

Production must derive roles from the authenticated server session, never from a query string or client header.

## Verification

```bash
npm run verify:m7:7.7
```

## Rollback

```bash
bash ./VERZUS_M7_7_7_Terminal_Authorization_Failure_States.sh rollback
```
