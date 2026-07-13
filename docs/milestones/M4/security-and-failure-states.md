<!-- VERZUS M4 STEP 4.10 -->

# M4 Step 4.10 — Security and Failure States

## Purpose

Create explicit, typed behavior for authentication and onboarding failures
without coupling feature domains or relying on client-only security.

This step does not implement final visual screens.

## Required failure coverage

```text
invalid credentials
duplicate account
expired verification code
expired reset token
rate limited
offline
maintenance
session refresh failure
suspended account
banned account
partial onboarding failure
```

## Shared failure contract

Every normalized application failure contains:

```text
code
source
message
HTTP status
retryable flag
field errors
retry-after seconds
request ID
```

Feature domains may convert the shared failure into their own display and state
models. The shared layer remains UI-neutral.

## Authentication recovery policy

| Failure                   | Recovery                                            |
| ------------------------- | --------------------------------------------------- |
| Invalid credentials       | Keep entered values and show field/submission error |
| Duplicate account         | Keep entered values and offer login                 |
| Expired verification code | Offer resend                                        |
| Expired reset token       | Request a new reset link                            |
| Rate limited              | Disable immediate retry and expose retry timing     |
| Offline                   | Preserve form values and retry                      |
| Maintenance               | Preserve form values and retry later                |
| Session refresh failed    | Move to session-expired recovery                    |
| Suspended                 | Move to the suspended account route                 |
| Banned                    | Move to the banned account route                    |

## Onboarding isolation policy

Onboarding failures preserve the validated draft.

```text
offline
→ preserve draft
→ keep previous-step navigation
→ retry when online

maintenance
→ preserve draft
→ keep previous-step navigation
→ retry later

partial failure
→ keep available data
→ fail only the affected widget
→ preserve essential actions

session expiry
→ preserve server-side draft
→ require authentication recovery

suspended or banned
→ deny onboarding API access
→ route to account restriction
```

Crew discovery failure must never remove the skip path.

## Session refresh

`refreshSessionSafely()`:

1. checks online state
2. calls the server refresh route
3. validates the response
4. converts 401 into `session_refresh_failed`
5. preserves 429 and 503 behavior
6. returns a typed result instead of throwing into the UI

The server remains authoritative for authentication and account status.

## Failure injection safety

Known mock scenarios can be selected in local, development, preview, staging,
and test environments.

Production always resolves mock failure injection to `null`.

Do not expose query- or header-driven mock scenario selection in production.

## Security rules

- authentication and authorization remain server-side
- suspended and banned accounts cannot bypass restriction routes
- session refresh cannot promote an account to a stronger state
- retry timing is parsed defensively
- unknown server payloads become safe generic failures
- form field errors are accepted only as arrays of strings
- no secrets or credential values are written into failure objects
- onboarding progress survives unrelated widget failures
- API authorization remains independent from page route protection

## Next step

M4 Step 4.11 runs unit, component, integration, E2E, accessibility, visual,
failure-injection, and responsive approval checks.

Visual and responsive approval cannot pass until all required authentication
and onboarding references have been approved.
