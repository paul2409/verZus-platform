# VERZUS Engineering Contract

## Authority

1. Latest explicit project instruction
2. Approved visual reference
3. Latest rebuild plan
4. M0 documentation
5. Season Zero blueprint
6. Legacy repository as reference only
7. Clearly labelled assumptions

## Repository Boundary

The active repository is `verzus-platform`.
The previous repository is `verzus-legacy` and must never be imported, nested, or deployed with this repository.

## Feature Ownership

Each feature owns its UI, schemas, API functions, adapters, mocks, state, tests, and error states.
Shared components remain domain-neutral.

## Data Flow

HTTP response -> schema validation -> domain adapter -> query cache -> view model -> UI.

## Reliability

Major widgets fail independently. Navigation and essential actions survive unrelated failures. Do not create one oversized page API dependency.

## UI Workflow

Do not write final screen code before the mobile visual reference is approved. Generate and approve 390px first, then tablet when required, then desktop.

## Required States

Support applicable loading, success, empty, stale, error, offline, retrying, unauthorized, forbidden, not-found, maintenance, and partial-failure states.

## Verification

Run the narrowest relevant check after every file. Before completion run:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Change Discipline

No drive-by refactors. No whole-directory copies from legacy. Every reused legacy utility requires a new test and explicit ownership.
