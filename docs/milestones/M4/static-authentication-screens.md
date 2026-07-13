<!-- VERZUS M4 STEP 4.3 -->

# M4 Step 4.3 — Static Authentication Screens

## Purpose

Implement the approved authentication references as real, responsive HTML and
CSS before adding submission, API, session, or validation behaviour.

## Routes

| Screen             | Route                |
| ------------------ | -------------------- |
| Login              | `/login`             |
| Register           | `/register`          |
| Email verification | `/verify-email`      |
| Forgot password    | `/forgot-password`   |
| Reset password     | `/reset-password`    |
| Session expired    | `/session-expired`   |
| Suspended account  | `/account/suspended` |
| Banned account     | `/account/banned`    |
| Review centre      | `/auth-preview`      |

## Responsive presentation

### Mobile

At 360, 390, and 430 pixels:

- one-column presentation
- compact centred brand
- full-width actions
- readable form labels
- safe-area padding
- no application navigation
- no horizontal overflow

### Tablet

At 768 pixels:

- centred authentication column
- expanded spacing
- larger mechanical frame
- six verification inputs remain on one row

### Desktop

At 1024 and 1440 pixels:

- two-column authentication presentation
- left atmosphere and trust context
- right form or state content
- no compressed mobile layout
- form width remains readable

## Components

```text
AuthFrame
├── AuthBrand
├── status strip
├── responsive atmosphere
├── screen introduction
├── route content
└── AuthSecurityPanel
```

Feature UI:

```text
AuthField
AuthCodeFields
AuthLoadingState
AuthRouteError
AuthNotFound
LoginStaticScreen
RegisterStaticScreen
EmailVerificationStaticScreen
ForgotPasswordStaticScreen
ResetPasswordStaticScreen
SessionExpiredStaticScreen
SuspendedAccountStaticScreen
BannedAccountStaticScreen
```

## Static-only boundary

Step 4.3 intentionally does not include:

- credential submission
- client validation
- server validation
- password visibility behaviour
- verification countdown logic
- reset-link requests
- secure cookies
- session creation
- rate-limit responses
- route authorization

Primary form buttons use `type="button"` so the static build cannot submit or
create false authentication state.

## Accessibility

- visible labels are associated with inputs
- verification digits have individual accessible names
- route errors use `role="alert"`
- loading uses `role="status"` and `aria-busy`
- keyboard focus remains visible
- reduced motion disables skeleton animation
- forced-colour mode keeps borders and actions visible

## Verification widths

- 360
- 390
- 430
- 768
- 1024
- 1440 pixels

## Rollback

```bash
git restore src/features/auth/index.ts

git clean -fd -- \
  src/features/auth/ui \
  'src/app/(auth)' \
  docs/milestones/M4/static-authentication-screens.md
```
