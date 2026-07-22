# Production Route Surface

This file is the allowlist enforced by `scripts/check-production-routes.mjs`.

## Anonymous

- `/`
- `/login`
- `/register`
- `/verify-email`
- `/forgot-password`
- `/reset-password`
- `/session-expired`

## Controlled account states

- `/account/suspended`
- `/account/banned`

## Onboarding

- `/onboarding`
- `/onboarding/identity`
- `/onboarding/games`
- `/onboarding/location`
- `/onboarding/availability`
- `/onboarding/crew`
- `/onboarding/complete`

## Authenticated product

- `/play`
- `/compete`
- `/compete/[competitionId]`
- `/matches`
- `/matches/[matchId]`
- `/leaderboards`
- `/leaderboards/weekly`
- `/crews`
- `/crews/create`
- `/crews/[crewId]`
- `/rewards`
- `/profile`
- `/profile/edit`
- `/profile/matches`
- `/profile/achievements`
- `/profile/settings`
- `/players/[playerId]`
- `/notifications`
- `/notifications/settings`
- `/search`
- `/activity`
- `/settings`

Any new page route requires an explicit product decision and an update to this allowlist in the same pull request.
