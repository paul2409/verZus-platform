<!-- VERZUS M3 STEP 3.5 -->

# M3 Step 3.5 — Widget Boundary Contract

## Purpose

Prevent one major widget from crashing its page, the platform shell, global
navigation, or unrelated product actions.

## Required usage

Wrap every independently loaded major section:

```tsx
<WidgetBoundary name="next-match">
  <NextMatchWidget />
</WidgetBoundary>
```

Required Play widgets include:

- next match
- check-in
- current ranking
- Crew pulse
- recommended competitions
- recent activity
- quick actions

The same rule applies to major widgets in later feature domains.

## Ownership

`WidgetBoundary` is domain-neutral. It owns:

- render-error containment
- local retry
- reset-key handling
- accessible default fallback
- an observability event

It does not own:

- fetching
- query retries
- authorization
- feature-specific error copy
- API schemas
- mutation recovery

Feature domains remain responsible for converting query states into:

- `WidgetLoadingFallback`
- `WidgetUnavailableState`
- successful feature UI

## Observability

A caught render error dispatches:

```text
verzus:widget-error
```

Event detail includes:

- widget name
- error reference
- error message
- React component stack when available

A later telemetry adapter can subscribe without coupling the shared component
to a vendor.

## Reliability rules

- navigation must never be inside a feature widget boundary
- essential actions should use their own boundary
- a parent page must not replace all widgets with one oversized fallback
- cached data should remain visible during refresh failures
- retries must reset only the affected widget
- async errors must be represented through query or feature state because
  React error boundaries catch render-tree errors, not arbitrary asynchronous
  callback failures

## Responsive and accessibility contract

Verify at 360, 390, 430, 768, 1024, and 1440 pixels.

- no page-level horizontal overflow
- actions remain at least 44 pixels high
- compact fallbacks fit dense grids
- error copy wraps safely
- loading uses `role="status"` and `aria-busy`
- render failures use `role="alert"`
- reduced motion disables skeleton animation
- forced-colour mode retains borders and actions

## Rollback

```bash
git restore src/styles/tokens.css
git clean -fd -- \
  src/components/layout/widget-boundary \
  'src/app/(platform)/widget-boundaries-preview' \
  docs/milestones/M3/widget-boundary-contract.md
```
