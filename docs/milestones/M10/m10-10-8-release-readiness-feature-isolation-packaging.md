# M10.8 — Release Readiness, Feature Isolation and Immutable Packaging

## Purpose

Close the Rewards and progression milestone without weakening the claim-safety controls introduced in M10.4 or forcing unstable browser workers during installation.

## Final M10 capability map

- M10.1: approved 390px Rewards foundation
- M10.2: complete reward-state inventory
- M10.3: independent validated read resources
- M10.4: server-authoritative idempotent claiming
- M10.5: season progression, objectives and milestones
- M10.6: achievement detail and auditable history
- M10.7: widget isolation, edge states and telemetry
- M10.8: feature isolation, release review, explicit approval and immutable packaging

## Feature isolation

`NEXT_PUBLIC_ENABLE_M10_REWARDS=false` disables only the Rewards route content. The application shell, Play, competitions, matches, leaderboards, Crews and navigation remain available.

The feature flag is a recovery control, not an authorization mechanism. Reward eligibility and claim permissions remain server-authoritative.

## Release review

Use `/m10-rewards-review` to inspect:

- normal Rewards overview;
- empty inventory;
- response-loss retry safety;
- claim failure;
- independent season failure;
- achievement detail;
- paginated audit history;
- isolated widget failure.

The 390px layout follows the approved M10 reference. The 768px and 1440px layouts intentionally preserve safe centered containment until dedicated tablet and desktop compositions are generated and approved.

## Verification policy

`npm run verify:m10:10.8` runs only:

1. structural marker verification;
2. focused ESLint;
3. focused TypeScript validation.

It does not run Vitest or Playwright.

Browser and visual commands are opt-in:

```bash
npm run test:m10:10.8:e2e
npm run m10:visual:update
npm run test:m10:10.8:visual
```

## Approval and release

After manual review:

```bash
VERZUS_M10_VISUAL_APPROVAL=APPROVED \
VERZUS_M10_APPROVED_BY="<reviewer>" \
npm run m10:approve
```

Then create the immutable production artifact:

```bash
npm run m10:release
```

The release command performs lean verification, a production build, approval validation and checksum-addressed packaging. It does not run Vitest or Playwright.

## Rollback

The installer creates a timestamped pre-M10.8 archive. Use the installer `rollback` command to restore M10.7. Production rollback uses the previously promoted immutable artifact or the M10 feature flag as documented in the runbook.
