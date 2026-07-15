<!-- VERZUS M5 PLAY PREVIEW SESSION REPAIR -->

# M5 Play Hydration and Preview Session Repair

## Hydration failure

The Play hook read `navigator.onLine` during its first render. The server and
browser could therefore produce different HTML before React hydration.

The repair uses `useSyncExternalStore` with:

```text
server snapshot: online
browser snapshot: navigator.onLine
updates: online and offline browser events
```

The explicit `offline` scenario remains deterministic on server and client.

## Unauthorized Play API responses

All seven Play APIs correctly require an authenticated session.

Opening a scenario URL in a fresh browser did not include the existing
`verzus_mock_session` cookie, so each API returned HTTP 401.

A development-only bootstrap endpoint now:

1. validates the requested Play scenario
2. sets the existing authenticated HTTP-only mock cookie
3. redirects only to `/play`
4. returns HTTP 404 in production

No Play API authorization rule was removed or bypassed.

## Preview URL

```text
http://localhost:3110/play?scenario=check_in_open
```

The first request establishes the development preview session and redirects
back to the same scenario.
