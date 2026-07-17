<!-- VERZUS M7.3 SCHEMAS, APIS, ADAPTERS AND QUERY RESOURCES -->

# M7.3 — Schemas, Independent APIs, Adapters and Query Resources

## Intent

Move Match Operations from one static presentation object to independently validated, cached and recoverable resources without changing the approved composition.

## Data flow

```text
HTTP response
→ raw Zod schema
→ domain adapter
→ TanStack Query cache
→ panel view model
→ isolated UI boundary
```

## Independent resources

- `GET /api/matches/[matchId]/summary`
- `GET /api/matches/[matchId]/participants`
- `GET /api/matches/[matchId]/timeline`
- `GET /api/matches/[matchId]/clock`
- `GET /api/matches/[matchId]/check-in`
- `GET /api/matches/[matchId]/lobby`
- `GET /api/matches/[matchId]/result`
- `GET /api/matches/[matchId]/evidence`
- `GET /api/matches/[matchId]/dispute`
- `GET /api/matches/[matchId]/support`

No single response is required to render the entire route. A failed timeline, evidence or support resource does not remove participants or the active match action.

## Controlled failure review

Use one target resource and one scenario:

```text
/matches/m7-preview?state=check-in-open&resource=timeline&scenario=partial_failure
/matches/m7-preview?state=submit-result&resource=evidence&scenario=malformed
/matches/m7-preview?state=lobby-open&resource=support&scenario=stale
```

Supported scenarios:

- `normal`
- `stale`
- `malformed`
- `offline`
- `unauthorized`
- `forbidden`
- `not_found`
- `maintenance`
- `partial_failure`

## Cache policy

Fast-changing state resources use 5–15 second freshness windows. Support metadata uses a 60-second window. Cached data remains visible during refresh failure and is labelled stale.

## Verification

```bash
npm run verify:m7:7.3
```

## Rollback

```bash
bash ./VERZUS_M7_7_3_Schemas_APIs_Query_Resources.sh rollback
```
