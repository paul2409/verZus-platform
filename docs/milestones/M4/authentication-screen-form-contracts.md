<!-- VERZUS M4 STEP 4.2 -->

# M4 Step 4.2 — Authentication Screen and Form Contracts

## Purpose

Define the routes, fields, validation rules, submission states, error shape,
rate-limit behaviour, and accessibility requirements before implementing any
authentication screen.

## Screen inventory

| Screen             | Route              | Primary action  |
| ------------------ | ------------------ | --------------- |
| Login              | `/login`           | Sign in         |
| Register           | `/register`        | Create account  |
| Email verification | `/verify-email`    | Verify          |
| Forgot password    | `/forgot-password` | Send reset link |
| Reset password     | `/reset-password`  | Update password |
| Session expired    | `/session-expired` | Sign in again   |

## Shared form states

- `idle`
- `validating`
- `submitting`
- `success`
- `field_error`
- `submission_error`
- `rate_limited`
- `offline`

## Validation contract

### Identifier

Accept either:

- a valid email address
- an international phone number with 7 to 15 digits

### Gamer tag

- 3 to 16 characters
- letters, numbers, and underscores only

### Password

- 8 to 128 characters
- at least one lowercase letter
- at least one uppercase letter
- at least one number
- at least one special character

### Verification code

- exactly six digits
- server remains authoritative for expiry and attempt count

## Error contract

```ts
type AuthSubmissionError = {
  code: AuthSubmissionErrorCode;
  message: string;
  requestId: string | null;
  retryable: boolean;
  fieldErrors: AuthFieldErrors;
  retryAfterSeconds: number | null;
};
```

The UI must not infer field errors from human-readable messages. The adapter
will map structured server error codes to this contract.

## Form behaviour

Every mutation form must support:

- client validation
- server validation
- field-level errors
- form-level submission errors
- disabled submission while validating or submitting
- duplicate submission prevention
- retry for retryable failures
- password visibility where applicable
- rate-limit messaging with retry time
- keyboard submission
- focus movement to the error summary
- preserved field values after recoverable failures

## Accessibility

- every field has a visible label
- errors are associated using `aria-describedby`
- error summaries use a focusable alert region
- password visibility controls expose their current state
- verification code input accepts paste
- loading text is announced without replacing the primary action label
- touch targets remain at least 44 pixels

## Security boundary

These contracts do not authenticate a user. The server remains responsible for:

- validating credentials
- rotating sessions
- issuing secure HTTP-only cookies
- rate limiting
- verification-code expiry
- reset-token expiry
- suspension and ban enforcement
- route authorization

## Deferred

Static screens begin only after mobile and desktop references are approved.
Mock API handlers are added in M4 Step 4.5. Server-side route protection is
added in M4 Step 4.6.
