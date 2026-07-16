# M6.4 — Competition Details

## Purpose

Provide a responsive, API-backed competition inspection surface that continues the approved M6 discovery visual language.

## Route

`/compete/[competitionId]`

## Independent resources

- summary
- eligibility
- schedule
- rewards
- rules
- participants
- bracket

Each resource validates its response, adapts raw API data, uses an independent query key and renders an isolated fallback.

## M6.5 boundary

M6.4 displays eligibility and entry readiness. It does not submit an entry. Confirmation, idempotency and success persistence belong to M6.5.
