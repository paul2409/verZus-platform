# Contributing to VERZUS

## Branches

- `main`: production-ready history
- `develop`: optional shared integration branch
- `feature/<scope>`: product work
- `fix/<scope>`: corrective work
- `chore/<scope>`: platform and maintenance work

Prefer short-lived branches and small pull requests.

## Local gate

Before opening a pull request:

```bash
npm ci
npm run env:check:test
npm run verify
npm run build
```

Run browser tests when a route, shell, interaction, or rendering contract changes:

```bash
npx playwright install chromium
npm run test:e2e
```

## Commit discipline

Use focused commits. Examples:

```text
chore: establish environment validation
feat(play): add next-match view model
fix(leaderboards): preserve stale rows during refresh failure
```

## Legacy reuse

The legacy repository is reference-only. Never copy a full directory. Extract one pure unit at a time, adapt it to the current domain contract, add tests, and record the decision in the legacy audit.

## Visual work

A full screen requires an approved visual reference before implementation. Mobile at 390px is approved first. Responsive verification later includes 360, 390, 430, 768, 1024, and 1440 where applicable.
