# VERZUS Feature Boundaries

## Boundary rule
Each feature domain owns its UI, schemas, API functions, adapters, mock data, state, tests, error states, and telemetry. Shared code must remain domain-neutral.

## Authentication
**Owns:** registration, login, logout, password reset, email verification, sessions, route access bootstrap.

**Does not own:** public profile, Crew membership, ranking, trust calculation.

**Dependencies:** Identity service.

**Failure isolation:** Authentication failure may block protected routes but must not corrupt public routes or stored public assets.

## Identity
**Owns:** User account, game account linking, verification status, account state.

**Does not own:** player presentation, match result verification rules.

## Profiles
**Owns:** player profile view/edit, privacy, public identity, profile completion.

**Does not own:** authentication credentials, Crew roster, leaderboard calculation.

## Onboarding
**Owns:** orchestration of required first-use steps.

**Does not own:** underlying domain data. It calls Identity, Profiles, and Game Account APIs.

**Failure isolation:** Resume from last confirmed step.

## Play
**Owns:** composition of the player's command centre and widget layout.

**Does not own:** match, leaderboard, Crew, competition, or activity source data.

**Dependencies:** independent read models from Matches, Check-in, Rankings, Crews, Competitions, Activity.

**Rule:** No single Play endpoint is the only source for all widgets.

## Competitions
**Owns:** competition lifecycle, eligibility, registration, withdrawal, rules, entrants, schedule metadata.

**Does not own:** Match result verification, Crew membership, rewards ledger.

## Matches
**Owns:** Match lifecycle, participants, lobby metadata, result state, forfeits, cancellation.

**Does not own:** competition registration or ranking calculation.

## Check-in
**Owns:** check-in window, check-in command, no-show determination.

**Does not own:** overall Match lifecycle, though it emits events consumed by Matches.

## Evidence
**Owns:** upload policy, scanning, retention, secure access, evidence metadata.

**Does not own:** dispute decisions.

## Disputes
**Owns:** dispute case, evidence association, review workflow, resolution command.

**Does not own:** raw file storage or rank calculation.

## Leaderboards
**Owns:** ranking read models, filters, sorting, ranking snapshots, current-position queries, ruleset version references.

**Does not own:** official Match results or Trust source records.

## Crews
**Owns:** Crew identity, membership, roles, invites, applications, lane assignments, ownership transfer, disband workflow.

**Does not own:** Crew ranking calculation or competition fixtures.

## Rewards
**Owns:** reward definitions, grants, claims, history, progression display contracts.

**Does not own:** payment provider settlement or direct wallet writes.

## Trust
**Owns:** TrustScore, penalties, trust events, trust explanation.

**Does not own:** Match or Dispute source-of-truth records.

## Notifications
**Owns:** notification delivery, read state, action state, expiry.

**Does not own:** source domain events.

## Activity
**Owns:** user-facing activity projection.

**Does not own:** business truth. Activity is derived and disposable.

## Search
**Owns:** query orchestration, result grouping, ranking, cancellation, partial-domain fallback.

**Does not own:** source entities.

## Admin
**Owns:** operational interfaces, permission-gated commands, audit visibility, moderation queues, feature-flag control.

**Does not own:** direct database mutation.

## Platform
**Owns:** configuration, telemetry, request IDs, feature flags, environment validation, shared HTTP client, generic error boundaries.

**Does not own:** feature-specific business rules.

## Shared component rule
A shared component may own:

- presentation;
- accessibility behaviour;
- generic interaction patterns;
- no domain-specific API calls;
- no feature-specific schema;
- no hidden business rules.

## Cross-domain communication
Preferred order:

1. Domain command.
2. Domain event.
3. Read model projection.
4. Feature query.
5. UI adapter.

Avoid direct cross-domain database writes.

## Required feature folder contract
```text
features/<feature>/
├── api/
├── components/
├── adapters/
├── schemas/
├── hooks/
├── mocks/
├── state/
├── tests/
├── types.ts
└── index.ts
```

## Boundary verification checklist
- Can the feature be disabled without breaking navigation?
- Can its mock adapter replace the real API without UI changes?
- Does it own all feature-specific schemas?
- Does another domain write its tables directly?
- Are failures surfaced locally?
- Is telemetry labelled by feature?
