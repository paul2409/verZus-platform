# Production Guardrails

The production guard gate is `npm run check:production-guards`.

It enforces:

1. Runtime application code cannot import mock, fixture, or seed modules.
2. Public page routes must exist in `docs/production-route-surface.md` and the executable allowlist.
3. Preview, review, reference, audit, Storybook, mock, fixture, and test pages are forbidden.
4. `/api/dev/*` routes are forbidden.
5. Public pages and API routes cannot consume internal scenario controls.
6. Production domain state cannot live in `globalThis` or process-local `Map`/`Set` stores.
7. Staging and production builds cannot enable `NEXT_PUBLIC_ENABLE_MOCKS`.
8. Database migrations cannot run as part of application build or startup.
9. Shared components and feature domains must pass the existing architecture-boundary check.

Mocks remain permitted only in tests, Storybook stories, and explicit local seed tooling outside runtime source paths.
