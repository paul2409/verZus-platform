# M3 Step 3.4 - Route-Level Boundaries

## Purpose

Keep the VERZUS application shell, global navigation, and safe destinations
available when an individual route is loading, missing, restricted, offline,
under maintenance, or has thrown an exception.

## Boundary hierarchy

1. The platform route group provides a final route-level fallback.
2. Each primary route owns local `loading.tsx`, `error.tsx`, and
   `not-found.tsx` files.
3. A route retry calls the Next.js `reset` function for that route only.
4. M3 Step 3.5 adds widget-level isolation inside successful routes.

## Supported states

- loading
- error
- not found
- offline
- maintenance
- unauthorized
- forbidden

## Observability contract

`RouteError` dispatches a browser event named `verzus:route-error` with:

- route name
- error reference or Next.js digest
- error message

A telemetry adapter can subscribe to this event without coupling the shared
boundary component to a specific monitoring vendor.

## Responsive contract

The route state must:

- fit at 360, 390, 430, 768, 1024, and 1440 pixel widths
- avoid page-level horizontal overflow
- keep actions at least 44 pixels high
- stack actions on small mobile screens
- preserve reduced-motion preferences
- remain legible in forced-colour mode

## Rollback

Before commit:

```bash
git restore src/styles/tokens.css
git clean -fd -- \
  src/components/layout/route-boundary \
  'src/app/(platform)/route-boundaries-preview'
```

Restore route files from Git when Step 3.4 replaced an earlier committed
boundary.
