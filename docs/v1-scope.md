# VERZUS V1 Scope

## Scope objective

Ship the smallest complete platform that supports a trustworthy competitive loop from identity creation to verified result, ranking update, Crew participation, and basic reward visibility.

## In scope

### Authentication and account access

- Register with email and password.
- Login and logout.
- Email verification.
- Forgot and reset password.
- Session expiry handling.
- Suspended and banned account states.

### Onboarding

- Create player identity.
- Select supported games.
- Set location.
- Add game account identifiers.
- Set availability.
- Join a Crew later or skip.
- Resume interrupted onboarding.

### Play command centre

- Next match.
- Check-in status and action.
- Current rank summary.
- Crew summary.
- Recommended competitions.
- Recent activity.
- Independent widget loading and failure states.

### Competitions

- Competition discovery.
- Search and filters.
- Competition detail.
- Rules.
- Eligibility.
- Registration and withdrawal where allowed.
- Entrants list.
- Basic bracket or fixture view.
- Registration closed, full, cancelled, and ineligible states.

### Match operations

- Match detail.
- Check-in.
- Lobby information.
- Opponent status.
- Result submission.
- Dual confirmation where required.
- Evidence upload.
- Dispute creation.
- Result pending, confirmed, disputed, forfeited, cancelled, and completed states.

### Leaderboards

- Weekly player standings.
- Weekly pool standings.
- Game lane rankings.
- Crew championship rankings.
- Current-player pinned position.
- Search, filters, sorting, stale data indicator, and update timestamp.

### Crews

- Crew discovery.
- Crew profile.
- Create Crew.
- Invite and apply.
- Accept or reject membership.
- Roles: owner, captain, member, trial.
- Roster and game-lane assignments.
- Crew activity and ranking summary.
- Leave Crew.
- Transfer ownership.
- Disband with guardrails.

### Player profiles

- Public player profile.
- Own profile.
- Edit identity and game handles.
- Rank, trust, match history, Crew, and achievements summary.
- Privacy controls for sensitive fields.

### Rewards

- Reward overview.
- Progress summary.
- Claimable, claimed, locked, expired, and revoked states.
- Idempotent claim flow.
- Reward history.

### Notifications

- Notification centre.
- Unread badge.
- Mark read.
- Action links.
- Expired notifications.

### Search

- Search players.
- Search Crews.
- Search competitions.
- Search matches where authorized.
- Partial-domain failure handling.

### Trust and moderation

- Trust score display.
- Penalty summary.
- Reports.
- Basic dispute queue.
- Basic user, Crew, competition, and match moderation.
- Audit log access for authorized roles.

### Operational baseline

- Feature flags.
- Health status view.
- Structured logs.
- Request IDs.
- Error monitoring.
- CI pipeline.
- Preview, staging, and production environments.
- Rollback documentation.

## Launch games

- EA FC.
- League of Legends.
- Clash Royale.
- COD Mobile.

## Supported result verification in V1

- League of Legends: API-backed result retrieval when integration access is available.
- Clash Royale: API-backed battle-log verification when integration access is available.
- EA FC: dual confirmation plus evidence workflow.
- COD Mobile: dual confirmation plus evidence; stronger review requirements for high-stakes fixtures.

## Explicitly out of scope

See `deferred-features.md`.

## Scope freeze rule

A feature can enter V1 only if:

1. it is required for a complete critical journey;
2. it has a named owner;
3. its states and permissions are documented;
4. it has test and rollback requirements;
5. adding it does not delay the critical launch loop without explicit approval.

## V1 critical journey

Register → complete onboarding → discover competition → register → check in → play match → submit or verify result → leaderboard updates → player sees progression → Crew and reward summaries remain available.

## V1 exit criteria

- All critical journeys pass E2E tests.
- All primary screens have approved mobile references.
- Desktop references exist where layout materially changes.
- All high-risk mutations are server-authorized and audited.
- Widget failure isolation is verified.
- Rollback is tested.
