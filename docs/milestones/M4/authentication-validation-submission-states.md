<!-- VERZUS M4 STEP 4.4 -->

# M4 Step 4.4 — Validation and Submission States

## Purpose

Upgrade the approved static authentication screens into accessible client
forms with deterministic validation, duplicate-submit protection, structured
server-error rendering, retry support, password visibility, and rate-limit
messaging.

This step does not create a real session. M4 Step 4.5 replaces the preview
submitters with shared mock HTTP handlers and adapters.

## Components

```text
forms/
├── auth-form.controller.ts
├── auth-form.submitter.ts
├── AuthErrorSummary.tsx
├── InteractiveAuthField.tsx
├── PasswordField.tsx
├── VerificationCodeField.tsx
├── LoginForm.tsx
├── RegisterForm.tsx
├── EmailVerificationForm.tsx
├── ForgotPasswordForm.tsx
└── ResetPasswordForm.tsx
```

## Submission flow

```text
submit
→ duplicate-submit guard
→ validating
→ Zod schema
→ field errors or validated input
→ injected submitter
→ success, submission error, rate limited, or offline
→ accessible live state
```

## Supported states

- idle
- validating
- submitting
- success
- field error
- submission error
- rate limited
- offline

## Behaviour

### Client validation

- uses the schemas defined in M4 Step 4.2
- preserves entered values after validation failure
- clears a field error when that field changes
- moves focus to the form error summary
- associates field errors with their input

### Submission protection

- one request may run at a time
- the submit action is disabled during validation and submission
- repeated clicks do not create duplicate requests
- the primary action label remains stable
- progress is announced through an `aria-live` status region

### Password visibility

- password fields begin masked
- visibility is controlled by a real button
- the button exposes `aria-pressed`
- toggling visibility does not submit the form

### Retry and rate limits

- structured retryable errors expose a retry action
- the last validated input is retained for retry
- rate-limited submissions expose a countdown
- retry remains disabled until the countdown reaches zero

### Verification code

- six individually labelled digit inputs
- numeric input mode
- automatic movement to the next digit
- backspace movement to the previous digit
- six-digit paste support

## Preview submitters

Step 4.4 includes deterministic local submitters only to exercise UI states.
They return a visible message explaining that API integration begins in M4
Step 4.5.

They do not:

- create accounts
- validate real credentials
- issue cookies
- create sessions
- verify email ownership
- send recovery messages
- change passwords

## Security boundary

The future HTTP layer remains responsible for:

- generic invalid-credential responses
- account-enumeration protection
- rate limits
- verification-code attempt limits
- reset-token validity
- session rotation
- HTTP-only secure cookies
- suspension and ban enforcement

## Rollback

```bash
git restore \
  src/features/auth/index.ts \
  src/features/auth/ui/index.ts \
  'src/app/(auth)/login/page.tsx' \
  'src/app/(auth)/register/page.tsx' \
  'src/app/(auth)/verify-email/page.tsx' \
  'src/app/(auth)/forgot-password/page.tsx' \
  'src/app/(auth)/reset-password/page.tsx'

git clean -fd -- \
  src/features/auth/forms \
  src/features/auth/ui/InteractiveAuthScreens.tsx \
  docs/milestones/M4/authentication-validation-submission-states.md
```
