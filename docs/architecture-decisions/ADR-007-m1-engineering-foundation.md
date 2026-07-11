# ADR-007: M1 Engineering Foundation

## Status

Accepted.

## Context

The legacy repository contains valuable product behaviour but distributes ownership across routes, components, hooks, libraries, styles, and custom scripts. The rebuild requires reproducible builds, domain ownership, failure isolation, and controlled visual implementation.

## Decision

Use:

- Next.js App Router
- React and TypeScript strict mode
- npm with a committed lockfile
- Node.js 24 LTS as the default runtime
- CSS Modules for feature presentation
- TanStack Query for server-state caching
- Zod for external and environment validation
- React Hook Form for forms
- Vitest and React Testing Library for unit and component tests
- Playwright for browser and visual tests
- ESLint, Prettier, Husky, and lint-staged for local quality gates
- GitHub Actions for CI

## Consequences

- no complete legacy directories are copied
- feature domains own implementation details
- the application layer composes features
- shared code remains domain-neutral
- M2 may build the design system without changing the repository foundation
- the repository has a larger initial setup cost but lower integration and operational risk
