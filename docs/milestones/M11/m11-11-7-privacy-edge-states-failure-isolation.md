# M11.7 — Privacy, Edge States and Failure Isolation

## Purpose

Complete the Player Profile safety boundary before release packaging. Privacy is server-authoritative, profile access states fail closed, and public projections never receive fields denied by policy.

## KEEP

- M11.1 approved own-profile hierarchy and artwork
- M11.2 public-profile projection and viewer permissions
- M11.3 validated profile editing
- M11.4 independent core profile resources
- M11.5 paginated match history and detailed statistics
- M11.6 achievements, game identities and trust history

## Resource boundaries

- `GET /api/profile/account-state`
- `GET /api/profile/privacy`
- `PATCH /api/profile/privacy`

Profile account status is checked independently from profile content. Privacy settings are independently cached and do not block Play, matches, leaderboards, Crews or Rewards.

## Privacy update contract

Every update requires:

- an `Idempotency-Key` header;
- an expected privacy version;
- Zod-validated field audiences;
- server-side version conflict handling;
- replay of a completed command after response loss.

The browser does not decide public permissions. The public route reads the server-confirmed privacy snapshot and removes denied fields before rendering.

## Supported states

Own profile:

- active
- empty
- suspended
- blocked
- access-check loading
- access-check error
- access-check offline
- access-check maintenance

Public profile:

- full
- limited
- blocked viewer
- suspended account
- blocked account
- not found

## Failure isolation

- Core identity, competitive summary, Crew and availability remain independent M11.4 resources.
- Match history and statistics remain independent M11.5 resources.
- Achievements, game identities and trust history remain independent M11.6 resources.
- Privacy settings failure affects only `/profile/settings`.
- Account-state uncertainty fails closed without crashing the shell or navigation.

## Manual scenarios

- `/profile?accountScenario=empty`
- `/profile?accountScenario=suspended`
- `/profile?accountScenario=blocked`
- `/profile?accountScenario=error`
- `/profile/settings?privacyScenario=offline`
- `/profile/settings?privacySaveScenario=response-lost`
- `/players/player-suspended`
- `/players/player-blocked`

## Rollback

Run the M11.7 installer with `rollback`. The most recent pre-install archive restores M11.6.
