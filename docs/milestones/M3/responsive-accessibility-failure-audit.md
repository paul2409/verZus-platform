<!-- VERZUS M3 STEP 3.7 -->

# M3 Step 3.7 — Responsive, Accessibility and Failure Audit

## Purpose

Verify that the VERZUS application shell remains usable across supported
viewports, keyboard and screen-reader interaction, reduced motion, offline
operation, feature flags, delayed routes, route crashes and isolated shell
children.

## Automated viewports

- 360 × 800
- 390 × 844
- 430 × 932
- 768 × 1024
- 1024 × 900
- 1440 × 1000

## Automated checks

### Responsive

- no page-level horizontal overflow
- audit controls meet a 44-pixel minimum touch target
- mobile navigation is visible below 1024 pixels
- desktop sidebar navigation is visible from 1024 pixels
- route-loading content remains visible

### Accessibility

- WCAG 2.0 and 2.1 A/AA automated Axe scan
- serious and critical violations fail the audit
- modal and drawer Escape dismissal
- focus restoration to overlay triggers
- active route semantics
- disabled navigation semantics
- loading uses `aria-busy`
- reduced motion is requested in the Playwright context

### Failure injection

- Crew widget render failure
- sidebar supplement render failure
- profile-control render failure
- notification-content render failure
- route-level render failure
- route-loading delay
- offline navigation
- disabled feature flag

## Failure-isolation changes

Step 3.7 strengthens the shell by adding boundaries around:

- optional desktop-sidebar intelligence
- profile control
- notification drawer content

These slots remain domain-neutral and own no feature API.

## Commands

Run the focused browser audit:

```bash
npm run test:m3:shell-audit
```

Run the combined Step 3.7 verification:

```bash
npm run verify:m3:shell-audit
```

## Manual audit

At every supported width confirm:

- no content is hidden by fixed navigation
- long player and Crew names truncate without removing meaning
- drawers remain scrollable
- profile popover remains inside the viewport
- offline-safe destinations remain usable
- feature-disabled destinations cannot be activated
- route and widget fallback copy remains readable
- keyboard focus follows visual order
- no focus trap remains after an overlay closes

## Artifacts

Playwright failures are written to:

```text
artifacts/m3-shell-audit-results
artifacts/m3-shell-audit-report
```

## Rollback

```bash
git restore \
  package.json \
  package-lock.json \
  src/styles/tokens.css \
  src/components/layout/app-shell/AppShell.tsx \
  src/components/layout/app-shell/AppShell.module.css \
  src/components/layout/app-shell/DesktopSidebar.tsx \
  src/components/layout/app-shell/TopBar.tsx \
  src/components/layout/app-shell/ShellNotificationsDrawer.tsx \
  src/components/layout/app-shell/ShellProfileMenu.tsx \
  src/components/layout/app-shell/ShellOverlays.module.css

git clean -fd -- \
  src/components/layout/app-shell/ShellFailureIsolation.test.tsx \
  src/app/m3-shell-audit \
  'src/app/(platform)/shell-audit-route-crash' \
  'src/app/(platform)/shell-audit-route-delay' \
  playwright.m3-shell.config.ts \
  tests/e2e/m3-shell-audit.spec.ts \
  docs/milestones/M3/responsive-accessibility-failure-audit.md
```
