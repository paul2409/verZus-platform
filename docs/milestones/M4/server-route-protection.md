<!-- VERZUS M4 STEP 4.6 -->

# M4 Step 4.6 - Server-side Route Protection and Redirects

## Purpose

Enforce authentication state before protected screens render and route each
player to verification, onboarding, restriction, recovery, or the platform.

## Installed entrypoint

Next.js major: 16
Route guard: src/proxy.ts
Export: proxy

## State outcomes

| State                 | Protected-route result    |
| --------------------- | ------------------------- |
| anonymous             | /login?next=...           |
| authenticating        | /login?next=...           |
| email_unverified      | /verify-email             |
| onboarding_incomplete | /onboarding               |
| authenticated         | allow                     |
| suspended             | /account/suspended        |
| banned                | /account/banned           |
| session_expired       | /session-expired?next=... |

## Security boundary

Post-authentication destinations are limited to safe internal paths. External,
protocol-relative, authentication, onboarding, and restriction destinations
are rejected. Route protection does not replace authorization in route
handlers, server actions, or database queries.

## Rollback

Run git restore for the modified auth API and index files, then git clean the
Step 4.6 routing, policy, redirect, route-guard, and documentation files.
