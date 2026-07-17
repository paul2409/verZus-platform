<!-- VERZUS M7.4 IDEMPOTENT CHECK-IN AND READINESS -->

# M7.4 — Idempotent Check-In and Readiness

## Intent

Enable the first production-shaped M7 mutation without moving authority into the browser.

## Mutation boundary

`POST /api/matches/[matchId]/check-in?state=<preview-seed>` requires:

- `Idempotency-Key` header;
- expected match state;
- expected match version.

The server owns:

- check-in eligibility;
- server deadline evaluation;
- current match state and version;
- participant identity;
- event creation;
- checked-in versus both-ready outcome.

The `state` query remains a deterministic mock seed for M7 visual review. It is not a production authorization input.

## Idempotency

- The same key replays the original event result.
- A different key after a completed check-in returns `already_checked_in`.
- Neither path creates a second check-in event.
- The UI also applies a synchronous click lock, but server idempotency remains authoritative.

## Persistence

The M7 mock server store is attached to `globalThis`, so state survives route refreshes within the running preview process. A production adapter will replace this store with durable backend persistence without changing the UI contract.

## Readiness transition

- Current player checks in while opponent is absent → `checked-in`.
- Current player checks in while opponent is already present → `both-ready`.

Use this preview to verify the second transition:

```text
/matches/m7-preview-opponent-ready?state=check-in-open
```

## Verification

```bash
npm run verify:m7:7.4
```

## Rollback

```bash
bash ./VERZUS_M7_7_4_Idempotent_Check_In_Readiness.sh rollback
```
