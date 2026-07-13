<!-- VERZUS M4 STEP 4.7 -->

# M4 Step 4.7 — Onboarding State Contract and Resumable Progress

## Purpose

Define onboarding as an isolated feature domain with validated progress,
deterministic step transitions, resumable mock persistence, server-side access
checks, and a production-compatible HTTP contract.

This step does not create final onboarding screen code.

## Required sequence

```text
welcome
→ games
→ location
→ identity
→ availability
→ crew
→ complete
```

Completed steps may be edited. Future steps cannot be skipped.

## Domain ownership

```text
src/features/onboarding/
├── api/
├── model/
├── server/
└── index.ts
```

The onboarding domain owns its schemas, state machine, API client, server mock,
tests, progress persistence, and error contract.

## API routes

| Method | Route                      | Purpose                    |
| ------ | -------------------------- | -------------------------- |
| GET    | `/api/onboarding/progress` | Resume the current draft   |
| PUT    | `/api/onboarding/progress` | Validate and save one step |
| POST   | `/api/onboarding/complete` | Complete onboarding        |

## Status values

```text
not_started
in_progress
ready_to_complete
completed
```

## Supported data

- selected games
- country, region, city, and timezone
- gamer tag, gaming platform, and platform handle
- weekly availability windows
- Crew join or skip decision
- started, updated, and completion timestamps

## Resumable mock persistence

The validated mock draft is stored in an HTTP-only cookie:

```text
verzus_mock_onboarding
```

The cookie is:

- HTTP-only
- same-site `lax`
- secure in production
- validated whenever it is read
- limited to non-sensitive onboarding draft data

This is a local mock persistence mechanism. Production must replace it with
server-side database persistence keyed to the authenticated user.

## Authorization

The API permits:

- `onboarding_incomplete`
- `authenticated`

It denies:

- anonymous
- email unverified
- suspended
- banned
- expired sessions

API authorization remains independent of page-level route protection.

## Completion effect

Successful completion:

1. marks the draft `completed`
2. records `completedAt`
3. changes the mock authentication session to `authenticated`
4. allows the Step 4.6 route guard to send the player to `/play`

## Failure states

- unauthorized
- forbidden
- validation failed
- step out of order
- onboarding incomplete
- already completed
- service unavailable
- invalid response

## Production replacement

Keep the same request and response schemas when replacing the mock.

Production flow:

```text
HTTP request
→ server authorization
→ request schema
→ onboarding application service
→ transaction
→ database persistence
→ response schema
→ client adapter
→ query cache
→ onboarding view model
→ UI
```

## Rollback

```bash
git clean -fd -- \
  src/features/onboarding \
  src/mocks/onboarding \
  src/app/api/onboarding \
  docs/milestones/M4/onboarding-state-and-resume.md
```
