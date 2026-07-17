<!-- VERZUS M8.7 PERFORMANCE, ACCESSIBILITY AND FAILURE ISOLATION -->

# M8.7 — Performance, Accessibility and Failure Isolation

## Intent

Keep the leaderboard usable on large source collections, operable without a pointer, and resilient when one presentation widget throws.

## Performance contract

- The server and explorer continue to paginate ranking collections.
- At most ten ranking rows are passed to each responsive presentation.
- No client virtualization dependency is added for a ten-row page.
- Ranking, current-position and rewards panels use containment to limit layout and paint work.
- Live revisions preserve prior data and stable row ordering from M8.5.

## Accessibility contract

- Leaderboard modes use a single-tab-stop ARIA tablist.
- Arrow keys, Home and End move and activate tabs.
- A skip link moves keyboard users directly to the ranking region.
- The desktop table exposes a caption, column scopes and current `aria-sort` state.
- The mobile presentation remains an ordered ranking list.
- Live revision text uses a polite live region.
- Reduced-motion and forced-colour behavior remain explicit.

## Failure-isolation contract

The following widgets have independent React boundaries:

- leaderboard status;
- ranking entries;
- current position;
- placement rewards.

Controlled review scenarios:

```text
?crash=status
?crash=ranking
?crash=current-position
?crash=rewards
```

Removing or recovering the crashed widget must not reset filters, remove navigation, or hide unrelated resources.

## Verification

```bash
npm run verify:m8:8.7
```

## Rollback

```bash
bash ./VERZUS_M8_8_7_Performance_Accessibility_Failure_Isolation.sh rollback
```
