<!-- VERZUS M3 STEP 3.8 -->

# M3 Completion Checklist

## Approved visual reference

- [ ] The implemented shell matches the approved M3 visual reference.
- [ ] Neon emphasis is restrained and semantic.
- [ ] Mechanical framing remains consistent with M2.
- [ ] Mobile is an intentional layout, not a compressed desktop shell.

## Responsive approval

- [ ] 360px
- [ ] 390px
- [ ] 430px
- [ ] 768px
- [ ] 1024px
- [ ] 1440px
- [ ] No page-level horizontal overflow.
- [ ] Safe-area padding works.
- [ ] Fixed navigation does not cover content.

## Navigation

- [ ] Every primary route is reachable.
- [ ] Active route identification is correct.
- [ ] Nested leaderboard routes activate Leaderboards.
- [ ] Disabled destinations cannot navigate.
- [ ] Feature-flagged destinations remain controlled.
- [ ] Offline-safe destinations remain available.
- [ ] Notification badges have accessible labels.

## Boundaries and resilience

- [ ] Route loading preserves the shell.
- [ ] Route errors preserve the shell.
- [ ] Missing routes provide safe recovery.
- [ ] One widget crash does not crash the route.
- [ ] Sidebar supplement failure does not remove navigation.
- [ ] Notification failure does not remove page content.
- [ ] Profile-control failure does not remove the top bar.
- [ ] Cached content remains visible during route progress.

## Overlays and accessibility

- [ ] Search modal traps and restores focus.
- [ ] Notification drawer traps and restores focus.
- [ ] Profile menu closes on route change.
- [ ] Escape dismisses overlays.
- [ ] Focus order follows visual order.
- [ ] Touch targets meet the 44px minimum.
- [ ] Reduced motion is respected.
- [ ] Serious and critical Axe violations are zero.

## Storybook and visual regression

- [ ] Operational shell reviewed.
- [ ] Degraded shell reviewed.
- [ ] Offline shell reviewed.
- [ ] Route-loading shell reviewed.
- [ ] Isolated widget failure reviewed.
- [ ] 390px visual baseline approved.
- [ ] 768px visual baseline approved.
- [ ] 1440px visual baseline approved.
- [ ] Visual snapshots are committed.

## Verification

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] `npm run build-storybook`
- [ ] `npm run test:m3:shell-audit`
- [ ] `npm run test:m3:navigation`
- [ ] `npm run visual:m3:test`
- [ ] `npm run verify:m3`

## Exit decision

- [ ] M3 is approved.
- [ ] Rollback commands are documented.
- [ ] M4 authentication and onboarding references may now be generated.
