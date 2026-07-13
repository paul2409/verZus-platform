# M3 Application Shell Contract

## Approved reference

The approved M3 direction is the dark, competitive, electric VERZUS shell with restrained green glow, violet Crew accents, red notification signals, mechanical borders, dense but readable data, and persistent navigation.

## Purpose

The shell keeps primary navigation and safe global actions available while feature widgets load, fail, retry, or operate offline.

## Responsive anatomy

- 360–430px: compact top bar, bottom navigation, one-column content, overlay navigation drawer.
- 768px: horizontal top navigation, bottom navigation, two-column content where pressure permits.
- 1024px and above: fixed desktop sidebar, top action bar, persistent content container.
- 1440px and above: expanded dashboard grid without stretching readable content beyond its maximum width.

## Components

- `AppShell`
- `TopBar`
- `DesktopSidebar`
- `MobileShellNavigation`
- `PageContainer`
- `PageHeader`
- `ContentGrid`
- `GlobalStatusBar`
- `RouteProgress`

## States

- operational
- degraded
- offline
- maintenance
- route loading
- active navigation
- partial navigation
- disabled navigation
- notification count

## Failure isolation

The shell accepts page content as children and notification content as a slot. It does not import feature domains or require a page-level API response. A failed feature widget must not remove navigation, profile access, route status, or the page container.

## Approval route

`/shell-preview`
