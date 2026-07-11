# M1 Legacy Repository Audit

## Status

The previous VERZUS repository is reference-only. It must remain outside the active repository.

## Observed structure

The legacy repository contains:

- Next.js App Router routes under `app/`
- shared and domain UI mixed under `components/`
- feature hooks under `hooks/`
- domain, mock, service, filter, ranking, and state-machine logic mixed under `lib/`
- large shared styles under `styles/`
- custom QA and development-shell scripts under `scripts/`

## KEEP as reference

- product terminology
- route discovery
- state-machine intent
- ranking examples
- check-in behaviour
- mock record shapes
- responsive viewport inventory
- approved copy and visual screenshots

## REUSE after isolation and tests

Potential candidates include pure modules under:

- `lib/rankings/`
- `lib/state-machines/`
- `lib/countdown/`
- `lib/filters/`
- `lib/status/`
- `lib/player-labels/`
- `lib/crew-verification/`

Each candidate must be reviewed against M0, copied manually, assigned to one feature or platform owner, and covered by new tests.

## REPLACE

- root-level application ownership
- feature logic distributed across components, hooks, and libraries
- feature styling in global CSS
- page-wide data dependencies
- custom development modes that alter build directories
- one-off QA scripts without one unified test runner

## DO NOT COPY

- `styles/globals.css`
- `styles/play-command.css`
- `styles/verzus-responsive.css`
- `scripts/dev-shell.mjs`
- `.next*` output
- `node_modules`
- generated screenshots
- legacy lockfile
- complete route or component directories

## Extraction workflow

1. Identify one legacy behaviour required by V1.
2. Confirm the behaviour against M0.
3. Identify its new feature owner.
4. Extract the smallest pure unit.
5. Remove UI, CSS, route, and environment coupling.
6. Add unit tests.
7. Record the source and changes in this document.
8. Delete the duplicate implementation from the new branch before merge.
