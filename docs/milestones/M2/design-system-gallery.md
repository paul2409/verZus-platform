# M2 Step 17 - Unified Design-System Gallery

## Purpose

`/design-system` is the single visual audit route for the M2 foundation completed in Steps 1-16.
It does not replace the dedicated preview routes. It links to them and renders a small set of
shared primitives together to reveal cross-component inconsistencies.

## Included areas

- Visual contract status
- Tokens and global atmosphere
- Fonts and typography
- Icons, buttons and forms
- Cards and panels
- Badges, ranking and status
- Player and Crew identity
- Tabs and segmented controls
- Leaderboard presentations
- Match, competition and overlay primitives
- Bottom navigation
- Feedback and system states

## Architecture rules

- The gallery may render shared primitives directly.
- Feature-domain previews remain isolated behind their dedicated routes.
- The gallery must not fetch production data.
- The gallery must not become a shared component dependency.
- A broken feature preview must not remove access to the rest of the gallery.

## Approval widths

- 360 px
- 390 px
- 430 px
- 768 px
- 1024 px
- 1440 px

## Approval checklist

- [ ] No horizontal page overflow
- [ ] Mobile layouts are not compressed desktop layouts
- [ ] All interactive targets are at least 44 px where applicable
- [ ] Keyboard order follows visual order
- [ ] Focus treatment is visible on every interactive element
- [ ] Long labels wrap or truncate without layout collapse
- [ ] Semantic colours remain consistent across components
- [ ] Reduced-motion behaviour is acceptable
- [ ] Forced-colour mode remains usable
- [ ] Navigation survives unrelated module failures
- [ ] Loading, empty, stale, error, offline and partial-failure states are explicit
- [ ] Dedicated preview links work

## Exit condition

Step 17 is complete only after the gallery passes automated checks and receives visual approval.
After approval, Step 18 establishes Storybook and the visual-regression baseline.
