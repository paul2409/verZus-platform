# VERZUS Route Inventory

## Route conventions
- Protected routes require server-side session validation.
- Dynamic IDs are opaque.
- Every major route has loading and error handling.
- Primary navigation remains available during local widget failure.
- Route existence does not imply feature availability; feature flags may gate access.

## Public routes

### `/`
**Purpose:** Product entry and redirect decision.
**Auth:** Optional.
**Primary CTA:** Register or continue to Play.
**States:** public landing, authenticated redirect, maintenance.

### `/login`
**Purpose:** Authenticate an existing user.
**Auth:** Public.
**Primary CTA:** Log in.
**Failures:** invalid credentials, rate limited, suspended, session service unavailable.

### `/register`
**Purpose:** Create User account.
**Auth:** Public.
**Primary CTA:** Create account.

### `/verify-email`
**Purpose:** Complete email verification.

### `/forgot-password`
**Purpose:** Request reset token.

### `/reset-password`
**Purpose:** Set a new password from a valid token.

## Onboarding routes

### `/onboarding`
Redirect to first incomplete required step.

### `/onboarding/identity`
Create player handle and profile basics.

### `/onboarding/games`
Choose launch games and begin game account linking.

### `/onboarding/location`
Set city and country.

### `/onboarding/availability`
Set play windows.

### `/onboarding/crew`
Join later, browse, or skip Crew selection.

### `/onboarding/complete`
Confirm completion and enter Play.

## Main application routes

### `/play`
**Purpose:** Player command centre.
**Auth:** Required.
**Primary CTA:** Contextual: check in, view match, enter competition.
**Data dependencies:** independent widgets for next match, check-in, rank, Crew, opportunities, activity.
**Failures:** partial widget failure, offline, stale data.

### `/compete`
**Purpose:** Discover competitions.
**Primary CTA:** View or enter competition.

### `/compete/[competitionId]`
Competition summary and entry action.

### `/compete/[competitionId]/rules`
Versioned rules.

### `/compete/[competitionId]/entrants`
Authorized entrant list.

### `/compete/[competitionId]/bracket`
Bracket or fixture progression.

### `/matches`
Player's scheduled, active, and historical matches.

### `/matches/[matchId]`
Match operations summary.

### `/matches/[matchId]/check-in`
Check-in action and participant state.

### `/matches/[matchId]/lobby`
Lobby instructions and readiness state.

### `/matches/[matchId]/result`
Submit or confirm result.

### `/matches/[matchId]/dispute`
Open or review dispute where authorized.

### `/leaderboards`
Redirect to default leaderboard.

### `/leaderboards/weekly`
Weekly player or pool standings.

### `/leaderboards/game`
Game lane rankings.

### `/leaderboards/crew`
Crew championship standings.

### `/leaderboards/combine`
Cross-lane combine view if enabled.

### `/crews`
Crew discovery and current Crew entry point.

### `/crews/create`
Create Crew.

### `/crews/[crewId]`
Public Crew profile.

### `/crews/[crewId]/roster`
Roster and lane assignments.

### `/crews/[crewId]/activity`
Crew activity projection.

### `/crews/[crewId]/manage`
Role-gated Crew management.

### `/rewards`
Reward summary, progression, claims, and history.

### `/profile`
Current player's profile.

### `/profile/edit`
Edit allowed profile fields.

### `/profile/matches`
Match history.

### `/profile/achievements`
Achievements.

### `/profile/settings`
Privacy and account-adjacent settings.

### `/players/[playerId]`
Public player profile.

### `/notifications`
Notification centre.

### `/search`
Cross-domain search.

### `/settings`
Application preferences and session management.

## Admin routes

### `/admin`
Operational overview.

### `/admin/users`
User lookup and account state actions.

### `/admin/players/[playerId]`
Player moderation detail.

### `/admin/crews`
Crew moderation.

### `/admin/competitions`
Competition operations.

### `/admin/matches`
Match operations and correction workflows.

### `/admin/disputes`
Dispute queue.

### `/admin/rewards`
Reward grants and revocations.

### `/admin/audit`
Audit event search.

### `/admin/feature-flags`
Feature rollout controls.

### `/admin/system`
System health and dependency state.

## Required route states
Each applicable route must define:

- loading;
- success;
- empty;
- stale;
- error;
- offline;
- unauthorized;
- forbidden;
- not found;
- maintenance;
- partial failure.

## Route ownership
- Auth and onboarding: Identity team.
- Play: Play composition team.
- Compete: Competition team.
- Matches: Match operations team.
- Leaderboards: Rankings team.
- Crews: Crew team.
- Rewards: Rewards team.
- Profiles: Profiles team.
- Notifications and search: Platform experience team.
- Admin: Operations platform team.
