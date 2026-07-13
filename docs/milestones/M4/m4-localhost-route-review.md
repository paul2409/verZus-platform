<!-- VERZUS M4 VISUAL REVIEW DASHBOARD -->

# M4 Localhost Route Review

## Commands

Discover the real App Router files without starting a server:

```bash
npm run m4:routes
```

Start the application and browser dashboard:

```bash
npm run m4:visual-review
```

Default URLs:

```text
Dashboard:   http://localhost:3105
Application: http://localhost:3104
```

If either port is occupied, the script automatically selects the next free
localhost port and prints the exact URL.

## Route discovery

The route scanner walks `src/app` and correctly removes route groups such as:

```text
(auth)
(platform)
```

Therefore:

```text
src/app/(auth)/login/page.tsx
```

is correctly resolved as:

```text
/login
```

The dashboard also lists M4 API route handlers under `/api/auth`, `/api/me`,
and `/api/onboarding`.

## Current expected repository status

Built screen routes:

```text
/login
/register
/verify-email
/forgot-password
/reset-password
/session-expired
/account/suspended
/account/banned
```

Missing final onboarding screens remain visibly marked as not built until their
approved references are implemented.
