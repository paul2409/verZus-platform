# M11.8 — Release readiness, feature isolation and immutable packaging

## Purpose

Close the Player Profile and Identity milestone with a controlled release boundary rather than treating a visually complete profile as production-ready.

## Release controls

- `NEXT_PUBLIC_ENABLE_M11_PROFILES` disables only the Profile and public-player domains.
- `/api/health/profiles` reports the deployed stage and capability readiness.
- `/api/telemetry/profiles` accepts only allowlisted, privacy-safe operational events.
- `/m11-profile-review` collects deterministic owner, public, edit, history, insight, privacy and account-state review routes.
- Responsive review is recorded at 390px, 768px and 1440px.
- Artifact packaging requires an approved visual manifest and a completed standalone build.

## Telemetry boundary

Allowed telemetry contains surface, outcome, resource, request ID and user-visible error ID. It must not contain names, locations, biographies, game handles, match opponents, privacy selections, avatar bytes, tokens or idempotency keys.

## Promotion

Build once, calculate SHA-256, then promote the exact archive through preview, staging and production. Do not rebuild per environment.

## Rollback

Use the profile feature flag first for rapid isolation. Use the prior immutable artifact for application rollback. Database rollback is not required because M11.8 adds no destructive schema migration.
