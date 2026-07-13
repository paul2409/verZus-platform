# M3 Step 3.3 — Production Route Integration

## Purpose

Connect VERZUS primary routes to one persistent application shell without coupling navigation to feature APIs.

## Route group

Production routes live inside `src/app/(platform)`. The route-group name does not appear in public URLs.

## Integrated routes

- `/play`
- `/compete`
- `/matches`
- `/leaderboards/weekly`
- `/crews`
- `/rewards`
- `/profile`
- `/notifications`
- `/search`
- `/settings`

`/leaderboards` redirects to `/leaderboards/weekly`.

## Ownership

The application layer owns route composition. The shared shell owns only:

- persistent navigation
- route metadata presentation
- content-width rules
- global profile and status placeholders
- safe responsive spacing

Feature domains will replace placeholder route content in their own milestones. The shell must not import from feature domains.

## Data independence

The shell uses a small local configuration contract during M3. It does not request Play, Match, Crew, Leaderboard, Reward, Search or Notification APIs. A feature-data failure cannot remove the shell or prevent safe navigation.

## Responsive behaviour

- 360–430px: compact top bar, drawer navigation, bottom navigation and one-column content.
- 768px: tablet top navigation with bounded content.
- 1024px and above: persistent desktop sidebar and wide content container.
- Page content reserves bottom-navigation clearance at mobile and tablet widths.

## Verification

- Every integrated route renders inside the same shell.
- Nested paths activate their parent navigation destination.
- Route metadata is deterministic and tested.
- No route group conflicts exist outside `src/app/(platform)`.
- Architecture boundaries remain intact.
