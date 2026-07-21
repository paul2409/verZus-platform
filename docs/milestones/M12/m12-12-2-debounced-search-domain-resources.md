# M12.2 — Debounced Search and Independent Domain Resources

<!-- VERZUS M12.2 -->

## Purpose

Replace deterministic client-side filtering with independently validated Search resources while preserving
the approved M12.1 mobile composition.

## Resource boundaries

- `GET /api/search/players`
- `GET /api/search/crews`
- `GET /api/search/competitions`
- `GET /api/search/matches`

There is no combined Search dashboard endpoint. Each domain owns its response validation, adapter, query
key, cache state, error state and retry operation.

## Interaction rules

- Suggestions begin after two characters.
- Draft input debounces for 300 ms.
- A changed query produces a new query key and aborts the stale request using TanStack Query's signal.
- Submitting commits the query to the URL.
- A failed domain renders a local recovery card while healthy domains remain interactive.
- Previous confirmed results remain visible during refetch.
- Empty, stale, slow, malformed, offline and error scenarios are independently injectable.

## Data flow

```text
HTTP response
→ Zod validation
→ domain adapter
→ TanStack Query cache
→ Search resource view model
→ suggestion and result UI
```
