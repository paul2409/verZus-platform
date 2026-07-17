<!-- VERZUS M8.10 INTERACTION RELIABILITY, TESTING, OBSERVABILITY AND RELEASE -->

# M8.10 — Interaction Reliability, Testing, Observability and Release

## Intent

Close M8 with production-grade interaction guarantees for colorful leaderboards and API-backed Player, Crew and Match intel cards.

## Interaction contract

- Entity names and match references are explicit links; rows are not click targets.
- Enter and Space open the same shareable URL state.
- Escape, close buttons and browser Back remove intel state without resetting filters.
- Focus enters the dialog and returns to the originating trigger.
- Mobile uses a bottom sheet; desktop uses a side drawer without collapsing the table.
- Intel API failure remains isolated from rankings, navigation, filters, current position and rewards.

## Observability

Allowlisted events:

- `intel_opened`
- `intel_closed`
- `intel_load_succeeded`
- `intel_load_failed`
- `intel_retry_requested`

Each event includes entity kind, stable entity ID, route, scenario, request ID, timestamp and release SHA. No display name, free-form text or private profile field is sent.

## Release gates

```bash
npm run verify:m8:8.10:technical
npm run m8:visual:update
VERZUS_M8_VISUAL_APPROVAL=APPROVED VERZUS_M8_APPROVED_BY="Prismo" npm run m8:approve
npm run verify:m8:8.10
npm run m8:release
```

## Controlled disablement

```env
NEXT_PUBLIC_ENABLE_M8_LEADERBOARDS=false
NEXT_PUBLIC_ENABLE_M8_ENTITY_INTEL=false
```

Disabling entity intel must not remove the ranking surface. Disabling leaderboards must preserve the App Shell, Play, competitions and Match Operations.
