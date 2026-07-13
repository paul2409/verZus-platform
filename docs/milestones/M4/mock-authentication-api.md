<!-- VERZUS M4 STEP 4.5 -->

# M4 Step 4.5 — Shared Mock Authentication API and Adapters

## Purpose

Replace preview-only form submitters with a shared HTTP contract that can be
used by both mock routes and a future production authentication provider.

## Data flow

```text
form input
→ client Zod validation
→ auth submitter
→ HTTP request
→ route request validation
→ mock authentication service
→ structured response
→ response schema validation
→ auth error adapter
→ form view state
```

## Routes

| Method | Route                           | Purpose                                       |
| ------ | ------------------------------- | --------------------------------------------- |
| POST   | `/api/auth/login`               | Create a mock session                         |
| POST   | `/api/auth/register`            | Create a mock unverified account              |
| POST   | `/api/auth/verify-email`        | Verify the deterministic mock code            |
| POST   | `/api/auth/resend-verification` | Request another mock code                     |
| POST   | `/api/auth/forgot-password`     | Return an enumeration-safe response           |
| POST   | `/api/auth/reset-password`      | Validate a mock reset token                   |
| POST   | `/api/auth/logout`              | Clear the mock session                        |
| POST   | `/api/auth/session/refresh`     | Refresh an existing mock session              |
| GET    | `/api/me`                       | Return the current validated session contract |

## Deterministic development scenarios

| Scenario                  | Input                                     |
| ------------------------- | ----------------------------------------- |
| Authenticated             | `player@example.com` / `StrongPass1!`     |
| Email unverified          | `unverified@example.com` / `StrongPass1!` |
| Onboarding incomplete     | `onboarding@example.com` / `StrongPass1!` |
| Suspended                 | `suspended@example.com` / `StrongPass1!`  |
| Banned                    | `banned@example.com` / `StrongPass1!`     |
| Invalid credentials       | any valid identifier / `WrongPass1!`      |
| Login rate limit          | `rate-limit@example.com` / `StrongPass1!` |
| Duplicate registration    | `existing@example.com`                    |
| Valid verification code   | `123456`                                  |
| Expired verification code | `000000`                                  |
| Verification rate limit   | `999999`                                  |
| Expired reset token       | `expired-reset-token-value`               |

## Mock session cookie

Name:

```text
verzus_mock_session
```

Properties:

- HTTP-only
- same-site `lax`
- secure in production
- one-hour mock lifetime
- inaccessible to browser JavaScript

This is a deterministic development session, not production authentication.

## Production boundary

The mock service is enabled when:

```text
NEXT_PUBLIC_ENABLE_MOCKS=true
```

It is also available outside production to support local development and
preview testing. In production, it remains disabled unless explicitly enabled.

The future real adapter must preserve the same request schemas, response
schemas, error contract, and session view model.

## Security characteristics

Implemented now:

- server-side request validation
- generic invalid-credential response
- account-enumeration-safe password recovery
- structured rate-limit response
- HTTP-only mock cookie
- response-schema validation
- request IDs
- deterministic session states
- separate suspended and banned outcomes

Deferred:

- real password hashing
- real user storage
- provider-backed email delivery
- cryptographic session signing
- session rotation
- CSRF enforcement where required
- distributed rate limiting
- audit persistence
- real device and identity risk checks
- production authorization

## Failure isolation

A malformed authentication response produces a controlled retryable error.
Network failure becomes either `offline` or `service_unavailable`. The forms do
not trust unvalidated response payloads.

## Rollback

```bash
git restore \
  src/features/auth/index.ts \
  src/features/auth/forms/LoginForm.tsx \
  src/features/auth/forms/RegisterForm.tsx \
  src/features/auth/forms/EmailVerificationForm.tsx \
  src/features/auth/forms/ForgotPasswordForm.tsx \
  src/features/auth/forms/ResetPasswordForm.tsx

git clean -fd -- \
  src/features/auth/api \
  src/features/auth/server \
  src/mocks/auth/auth-scenarios.ts \
  src/app/api/auth \
  src/app/api/me \
  docs/milestones/M4/mock-authentication-api.md
```
