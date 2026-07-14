<!-- VERZUS M4 PRODUCTION ONBOARDING ROUTES -->

# M4 Production Onboarding Routes

## Purpose

Implement the seven production onboarding routes using the approved responsive
reference direction and the existing M4 contracts.

## Routes

```text
/onboarding
/onboarding/games
/onboarding/location
/onboarding/identity
/onboarding/availability
/onboarding/crew
/onboarding/complete
```

## Architecture

```text
HTTP response
→ Zod schema validation
→ domain adapter
→ TanStack Query cache
→ step view model
→ production UI
```

## Feature ownership

The onboarding domain owns:

```text
API clients and schemas
adapters
state machine
route contracts
security and failure policy
production UI
route-access rules
unit tests
```

The App Router pages remain thin and only select the required onboarding step.

## Supported behavior

```text
loading
success
empty
stale query data
error
offline
retrying
unauthorized
forbidden
maintenance
partial failure
```

Option widgets can fail independently while previous-step navigation and retry
controls remain available.

## Responsive behavior

```text
360px mobile
390px mobile reference
430px mobile
768px tablet
1024px compact desktop
1440px desktop reference
```

Mobile uses a focused single-column presentation. Desktop uses a persistent
step rail, broad content stage, isolated context panel, and sticky action footer.

## Local review

Start the application:

```bash
npm run m4:onboarding
```

Open:

```text
http://localhost:3108/login
```

Use the mock onboarding account:

```text
Email: onboarding@example.com
Password: StrongPass1!
```

The authenticated route sequence begins at:

```text
http://localhost:3108/onboarding
```

## Verification

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Rollback

Restore tracked files and remove generated files from this installer:

```bash
git restore src/features/onboarding/index.ts package.json
git clean -fd -- src/features/onboarding/ui "src/app/(onboarding)" docs/milestones/M4/onboarding-production-routes.md
```
