<!-- VERZUS M5 STEPS 5.9-5.13 -->

# M5 Play Command Centre Rollback

## Immediate safe disable

Set the deployment variable:

```text
NEXT_PUBLIC_ENABLE_M5_PLAY_COMMAND_CENTER=false
```

Rebuild and promote the same release process. Authentication and navigation stay
available while Play displays a controlled unavailable state.

## Git rollback

Restore modified files:

```bash
git restore \
  package.json \
  package-lock.json \
  .env.example \
  .env.test \
  "src/app/(platform)/play/page.tsx" \
  src/app/api/check-ins/current/route.ts \
  src/features/play/api/index.ts \
  src/features/play/model/index.ts \
  src/features/play/server/index.ts \
  src/features/play/ui/index.ts \
  src/features/play/ui/CheckInControl.tsx \
  src/features/play/ui/PrimaryActionPanel.tsx \
  src/features/play/ui/PlayCommandCenter.tsx \
  src/features/play/ui/play-command-center.module.css \
  docs/milestones/M5/m5-foundation-manifest.json
```

Remove files owned by Steps 5.9-5.13:

```bash
git clean -fd -- \
  src/features/play/actions \
  src/features/play/config \
  src/features/play/telemetry \
  src/features/play/model/check-in.schema.ts \
  src/features/play/api/check-in-api.schema.ts \
  src/features/play/api/check-in-api.adapter.ts \
  src/features/play/api/check-in-api.adapter.test.ts \
  src/features/play/api/check-in-api.client.ts \
  src/features/play/server/mock-check-in.cookie.ts \
  src/features/play/server/mock-check-in.service.ts \
  src/features/play/server/mock-check-in.service.test.ts \
  src/features/play/server/mock-check-in.http.ts \
  src/features/play/ui/CheckInControl.test.tsx \
  src/features/play/ui/PlayDisabledState.tsx \
  "src/app/(preview)/m5-play-review" \
  tests/e2e/m5 \
  tests/visual/m5-play.visual.spec.ts \
  tests/visual/m5-play.visual.spec.ts-snapshots \
  playwright.m5.config.ts \
  scripts/verify-m5.mjs \
  docs/milestones/M5/step-5.9-responsive-layouts.md \
  docs/milestones/M5/step-5.10-play-actions.md \
  docs/milestones/M5/step-5.11-testing-failure-injection.md \
  docs/milestones/M5/step-5.12-observability-preview-rollback.md \
  docs/milestones/M5/step-5.13-completion-gate.md \
  docs/milestones/M5/m5-completion-manifest.json \
  docs/runbooks/m5-play-rollback.md \
  reports/m5-verification.json
```
