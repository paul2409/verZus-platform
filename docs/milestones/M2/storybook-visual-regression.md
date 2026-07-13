# M2 Storybook and Visual Regression Baseline

## Purpose

Step 18 freezes the approved M2 visual language as isolated component stories and committed pixel baselines.

Storybook is not an application data layer. Stories must use deterministic props, shared mocks or pure view models. They must not call production APIs, read secrets or depend on authenticated browser state.

## Commands

```bash
npm run storybook
npm run build-storybook
npm run visual:test
npm run visual:update
npm run verify:m2
```

- `npm run storybook` starts the isolated component workshop on port 6006.
- `npm run build-storybook` creates the static `storybook-static` artifact.
- `npm run visual:test` compares the committed baselines with the current stories.
- `npm run visual:update` intentionally replaces baselines after visual approval.
- `npm run verify:m2` runs the complete application and visual-regression gates.

## Baseline coverage

The baseline renders five representative stories at six required widths:

- 360 px
- 390 px
- 430 px
- 768 px
- 1024 px
- 1440 px

The committed screenshots live under:

```text
tests/visual/__screenshots__/
```

## Approval rule

Do not update screenshots merely to make a failing test pass.

Before running `npm run visual:update`:

1. Open Storybook and inspect the changed story.
2. Confirm the change matches the approved reference or an explicitly approved extension.
3. Check all six widths.
4. Test keyboard focus, reduced motion and forced colours where relevant.
5. Review the generated image changes before committing them.

## Failure isolation

Stories import domain-neutral primitives directly. Feature stories must receive deterministic view models or mocks. A failed feature story must not prevent the rest of Storybook from building.

## CI

`.github/workflows/visual-regression.yml` builds Storybook and compares committed screenshots on pull requests that touch UI or visual-test files.

## Optional cloud review

Chromatic can be added later for hosted cross-browser review. The local Playwright baseline remains the required no-account fallback and rollback reference.

## Rollback

Before commit:

```bash
git restore package.json package-lock.json .gitignore
git clean -fd -- .storybook src/stories tests/visual scripts/serve-storybook.mjs playwright.visual.config.ts .github/workflows/visual-regression.yml docs/milestones/M2/storybook-visual-regression.md docs/milestones/M2/M2-COMPLETION-CHECKLIST.md
```

After commit:

```bash
git revert --no-edit <STEP_18_COMMIT_HASH>
```
