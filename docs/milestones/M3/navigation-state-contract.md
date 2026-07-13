# M3 Step 3.2 — Navigation State Contract

## Purpose

Provide deterministic shell navigation that remains usable and understandable while routes, features, connectivity, and notification data change independently.

## Supported states

- available
- active
- partial
- disabled
- loading
- error
- feature flagged
- notification count
- notification dot
- offline safe
- offline unavailable

## Resolution order

1. A disabled feature flag resolves to `feature-flagged`.
2. Offline mode disables destinations that are not explicitly offline safe.
3. Runtime availability overrides the static item state.
4. The static item state applies when no runtime state exists.
5. The default state is `available`.

## Route matching

- Exact matching is available for destinations that should only activate on one pathname.
- Prefix matching is the default for route families.
- `activePrefixes` support related route families such as `/players/:id` activating Profile.
- Query strings, fragments, and trailing slashes do not affect current-route detection.

## Interaction rules

- Disabled, loading, and feature-flagged destinations are not keyboard actions.
- Partial and error destinations remain links so users can reach available fallback content.
- The current destination uses `aria-current="page"`.
- Status explanations remain available to assistive technology.
- Notification indicators expose accessible labels.

## Failure isolation

Navigation state is resolved entirely from shell configuration. It does not require Play, Match, Crew, Leaderboard, or Reward page data. A feature API failure can degrade one destination without removing the shell.

## Approval widths

- 360px
- 390px
- 430px
- 768px
- 1024px
- 1440px
