<!-- VERZUS M7.8 TESTING, OBSERVABILITY AND RELEASE -->

# M7.8 — Testing, Observability and Release

## Intent

Close Milestone 7 only after lifecycle, mutations, failure isolation, visual references and rollback are executable and reviewable.

## Technical gate

```bash
npm run verify:m7:7.8:technical
```

This runs structural verification, focused linting, M7.8 unit/integration tests, repository typecheck, production build and M7 E2E/accessibility/failure-injection tests.

## Visual gate

Generate or update all 45 baselines:

```bash
npm run m7:visual:update
```

Review every state at 390px, 768px and 1440px through `/m7-match-review`, then record approval:

```bash
VERZUS_M7_VISUAL_APPROVAL=APPROVED \
VERZUS_M7_APPROVED_BY="Prismo" \
npm run m7:approve
```

## Full release gate

```bash
npm run verify:m7:7.8
```

## Immutable artifact

```bash
npm run m7:release
```

The artifact is written under `artifacts/m7-match-operations/<release>/` with a SHA-256 manifest. Promote the same archive through preview, staging and production.

## Feature disable

Set `NEXT_PUBLIC_ENABLE_M7_MATCH_OPERATIONS=false` and deploy the same application version. Match routes display a controlled degradation screen while the App Shell remains available.

## Rollback

See `docs/runbooks/m7-match-rollback.md`.
