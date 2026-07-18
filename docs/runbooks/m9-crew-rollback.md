# M9 Crew rollback

## Fast isolation

Set `NEXT_PUBLIC_ENABLE_M9_CREWS=false`, redeploy the current immutable artifact and verify `/api/health/crews` reports `disabled`. The platform shell, Play, competitions, matches and leaderboards remain available.

## Application rollback

1. Select the last known-good M9 artifact and verify its SHA-256 against `manifest.json`.
2. Promote that exact artifact through the normal environment path.
3. Do not rebuild during rollback.
4. Confirm `/api/health/crews`, `/crews`, `/crews/crew-xenon-esports` and primary navigation.

## Installer rollback

Run the M9.8 installer with `rollback`. It restores the timestamped pre-install archive and reruns the M9.7 structural verifier.

## Data warning

M9 mock stores are development-only. In production, lifecycle, ownership and membership rollback must not reverse audit history or recreate removed members without an explicit compensating command.
