<!-- VERZUS M4 STEP 4.1 -->

# M4 Step 4.1 — Authentication State and Session Contract

## Purpose

Create one explicit source of truth for authentication state before building
forms, route guards, or onboarding screens.

## States

| State                   | Meaning                                                    | Default destination  |
| ----------------------- | ---------------------------------------------------------- | -------------------- |
| `anonymous`             | No trusted session exists                                  | `/login`             |
| `authenticating`        | Credentials or verification are being processed            | `/login`             |
| `authenticated`         | Session is valid and onboarding is complete                | `/play`              |
| `email_unverified`      | Account exists but email verification is incomplete        | `/verify-email`      |
| `onboarding_incomplete` | Identity is verified but required onboarding is unfinished | `/onboarding`        |
| `suspended`             | Access is temporarily restricted                           | `/account/suspended` |
| `banned`                | Access is blocked by an administrative decision            | `/account/banned`    |
| `session_expired`       | A previous session is no longer valid                      | `/session-expired`   |

## Required transition order

```text
anonymous
→ authenticating
→ email_unverified
→ onboarding_incomplete
→ authenticated
```

Authentication may also resolve directly to `onboarding_incomplete` or
`authenticated` for returning users.

The server may move a user to `suspended`, `banned`, or `session_expired` at
any time.

## Contract rules

- The client never invents an authenticated state.
- The HTTP response is validated with Zod before use.
- Authenticated, unverified, and onboarding states require a trusted session.
- Suspended and banned states require an operator-visible reason.
- Route protection will be implemented server-side in M4 Step 4.6.
- Session identifiers must be stored in secure, HTTP-only cookies in the real
  implementation.
- Device metadata is a risk signal, not an authorization decision by itself.
- Mock and real API adapters must return the same `AuthSessionViewModel`.

## Data flow

```text
HTTP response
→ authSessionResponseSchema
→ adaptAuthSession
→ session state
→ route decision
→ UI
```

## Deferred to later M4 steps

- login and registration forms
- email verification form
- password recovery
- secure cookie implementation
- server-side route guards
- session rotation
- rate limiting
- onboarding persistence
- account restriction screens
