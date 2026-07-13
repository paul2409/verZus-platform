<!-- VERZUS M3 STEP 3.6 -->

# M3 Step 3.6 — Global Drawers, Overlays and Status Contract

## Purpose

Provide shell-wide search, notification, profile, navigation, service-status
and route-loading behaviour without coupling the shell to a feature API.

## Components

- `ShellSearchModal`
- `ShellNotificationsDrawer`
- `ShellProfileMenu`
- `ShellStatusRegion`
- existing M2 `Drawer`, `Modal` and `Popover`
- existing M3 `GlobalStatusBar` and `RouteProgress`

## Behaviour

### Mobile navigation drawer

- opens from the top-bar menu control
- traps focus
- closes on Escape or backdrop interaction
- restores focus to its trigger
- closes after a route change

### Search modal

- uses a real GET form targeting `/search`
- provides direct domain shortcuts
- owns no search API
- closes after form submission or shortcut selection
- remains keyboard operable

### Notification drawer

- accepts feature-owned notification content
- provides a controlled fallback when content is absent
- exposes the unread count in its accessible description
- does not fetch notifications itself

### Profile menu

- exposes profile and settings routes
- displays shell-safe identity data only
- closes on route changes and Escape
- does not expose a fake sign-out action

### Status and loading

Supported global states:

- operational
- degraded
- offline
- maintenance
- route loading

Route loading:

- is non-blocking
- sets `aria-busy` on the route content
- keeps current content visible
- shows a top progress indicator and loading notice
- begins when an internal shell link is activated
- ends when the pathname changes

## Failure isolation

- navigation does not depend on search or notification data
- missing notification content does not remove the drawer
- search remains available during unrelated widget failures
- route loading does not blank cached content
- service banners remain independent of page modules

## Responsive verification

Verify at:

- 360
- 390
- 430
- 768
- 1024
- 1440 pixels

Confirm:

- drawers fit the viewport
- modal content scrolls when necessary
- search shortcuts become one column on small screens
- the profile popover remains within the viewport
- the loading notice does not cover navigation
- no page-level horizontal overflow appears
- touch targets remain at least 44 pixels
- reduced motion disables loading animation

## Rollback

```bash
git restore \
  src/styles/tokens.css \
  src/components/layout/app-shell/AppShell.tsx \
  src/components/layout/app-shell/TopBar.tsx \
  src/components/layout/app-shell/index.ts

git clean -fd -- \
  src/components/layout/app-shell/ShellSearchModal.tsx \
  src/components/layout/app-shell/ShellNotificationsDrawer.tsx \
  src/components/layout/app-shell/ShellProfileMenu.tsx \
  src/components/layout/app-shell/ShellStatusRegion.tsx \
  src/components/layout/app-shell/ShellOverlays.module.css \
  src/components/layout/app-shell/ShellSearchModal.test.tsx \
  src/components/layout/app-shell/ShellProfileMenu.test.tsx \
  src/components/layout/app-shell/AppShellOverlays.test.tsx \
  'src/app/(platform)/shell-overlays-preview' \
  docs/milestones/M3/global-overlays-status-contract.md
```
