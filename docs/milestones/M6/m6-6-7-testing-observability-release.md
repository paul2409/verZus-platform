<!-- VERZUS M6.7 COMPETITION RELEASE GATE -->

# M6.7 — Testing, Observability and Release

## Scope

M6.7 closes Milestone 6 without changing the approved competition composition.
It adds the completion gate around discovery, details, entry and lifecycle work.

## Quality layers

- unit tests for release configuration and telemetry validation
- existing M6.1–M6.6 component and domain tests through the full repository suite
- lifecycle integration tests
- Playwright discovery/detail/health smoke tests
- failure injection for lifecycle and transport states
- keyboard, landmark, touch-target and overflow checks
- visual baselines at 390px, 768px and 1440px

## Observability

Allowlisted client events are posted to `POST /api/telemetry/competitions`.
The endpoint logs structured JSON with request ID, environment and release. It
rejects oversized, malformed and unknown payload fields.

Health is exposed through `GET /api/health/competitions`.

## Safe disable

Set:

```text
NEXT_PUBLIC_ENABLE_M6_COMPETITIONS=false
```

The competition domain renders a controlled unavailable state while the App
Shell and primary navigation remain available.

## Completion order

```bash
npm run m6:visual:update
VERZUS_M6_VISUAL_APPROVAL=APPROVED VERZUS_M6_APPROVED_BY="reviewer" npm run m6:approve
npm run verify:m6:6.7
npm run m6:release
```

`m6:release` packages the already verified `.next` output as an immutable tar
artifact with a SHA-256 manifest. Promote that same artifact through preview,
staging and production.
