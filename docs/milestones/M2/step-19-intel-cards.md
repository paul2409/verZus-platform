# M2 Step 19 - Intel Cards

## Purpose

Step 19 adds four compact command-centre read-model cards:

- Player Intel Card
- Match Intel Card
- Crew Intel Card
- War Match Intel Card

The cards are not API owners. Each feature domain receives a validated view model after the normal flow:

```text
HTTP response
-> schema validation
-> domain adapter
-> query cache
-> view model
-> Intel card
```

## Ownership

- Profiles owns Player Intel.
- Matches owns Match Intel and War Match Intel.
- Crews owns Crew Intel.
- `components/primitives/intel-card` owns only domain-neutral framing, metrics, status treatment and action layout.

## Supported states

- default
- loading
- partial
- error
- offline
- stale

A failed card remains locally contained and must not remove navigation or sibling cards.

## Responsive contract

- 360-430 px: stacked information, one-column actions, primary action visible.
- 768 px: expanded identity and metrics, two-column actions.
- 1024-1440 px: full card information without page-level horizontal scrolling.

## Approval routes

- Application preview: `/intel-cards-preview`
- Storybook story: `Design System / Intel Cards / Intel Cards Baseline`

## Completion gate

```bash
npm run verify
npm run build-storybook
npm run visual:update -- --grep intel-cards
npm run visual:test -- --grep intel-cards
npm run verify:m2
```
