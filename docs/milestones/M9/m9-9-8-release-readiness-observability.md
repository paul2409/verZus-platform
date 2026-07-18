# M9.8 — Crew release readiness and observability

## Intent

Close M9 with feature isolation, safe telemetry, health reporting, a deterministic review route, optional browser evidence, immutable release packaging and documented rollback.

## Default verification

`npm run verify:m9:9.8` runs only the structural verifier, focused ESLint and focused TypeScript. It does not start Vitest or Playwright workers.

`npm run verify:m9:9.8:build` adds the production build.

## Optional browser evidence

- `npm run test:m9:9.8:e2e`
- `npm run m9:visual:update`
- `npm run test:m9:9.8:visual`

These commands use one Playwright worker and are never executed by the installer or default release command.

## Feature flag

Set `NEXT_PUBLIC_ENABLE_M9_CREWS=false` to isolate Crew routes while keeping the application shell and unrelated domains available.

## Observability

- `GET /api/health/crews`
- `POST /api/telemetry/crews`

Telemetry contains feature state, resource or authority category, request ID, route and release SHA. It must not contain private Crew application messages or other sensitive user content.

## Artifact

`npm run m9:artifact` writes a checksum-addressed archive under `artifacts/m9-crews/<release-id>/`.
