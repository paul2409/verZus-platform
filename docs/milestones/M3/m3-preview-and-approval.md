<!-- VERZUS M3 STEP 3.8 -->

# M3 Step 3.8 — Preview, Storybook, Visual Regression and Approval

## Purpose

Close Milestone 3 with one review centre, deterministic Storybook states,
responsive visual baselines, production-route navigation tests and the complete
repository verification gate.

## Review routes

- `/m3-preview`
- `/shell-preview`
- `/navigation-states-preview`
- `/route-boundaries-preview`
- `/widget-boundaries-preview`
- `/shell-overlays-preview`
- `/m3-shell-audit`
- `/play`

## Storybook states

The `M3/Application Shell` story group contains:

- operational
- degraded
- offline
- route loading
- isolated widget failure
- offline widget unavailable

## Visual baseline

Automated screenshots are captured at:

- 390px mobile
- 768px tablet
- 1440px desktop

Manual and Playwright responsive audits also cover:

- 360px
- 430px
- 1024px

Update screenshots only after intentional visual approval:

```bash
npm run visual:m3:update
```

Compare the implementation with committed baselines:

```bash
npm run visual:m3:test
```

## Production navigation test

`npm run test:m3:navigation` confirms:

- primary routes are reachable
- secondary shell routes are reachable
- desktop and mobile navigation persist
- active destinations use `aria-current`
- mobile navigation changes routes
- widget failure does not remove the shell
- route failure does not remove the shell
- no page-level horizontal overflow appears

## Final gate

```bash
npm run verify:m3
```

This runs:

1. the repository-wide verification gate
2. Storybook production build
3. M3 responsive/accessibility/failure audit
4. M3 production navigation E2E
5. M3 visual-regression comparison

## Rollback

```bash
git restore package.json package-lock.json .gitignore

git clean -fd -- \
  src/stories/ApplicationShell.stories.tsx \
  src/stories/ApplicationShell.module.css \
  'src/app/(platform)/m3-preview' \
  tests/visual/m3-shell.visual.spec.ts \
  tests/e2e/m3-shell-navigation.spec.ts \
  playwright.m3-final.config.ts \
  docs/milestones/M3/m3-preview-and-approval.md \
  docs/milestones/M3/M3-COMPLETION-CHECKLIST.md \
  .github/workflows/m3-shell-quality.yml
```
