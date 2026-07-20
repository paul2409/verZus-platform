# M11.2 — Public Player Profile and Permission Boundaries

<!-- VERZUS M11.2 -->

## Purpose

Add a public player route without reusing the own-profile permission surface. The server projects only the fields permitted for the resolved viewer relationship and profile policy.

## Route

```text
/players/[playerId]
```

Preview-only viewer modes:

```text
?viewer=anonymous
?viewer=member
?viewer=friend
?viewer=owner
?viewer=blocked
```

The query parameter is interpreted on the server for deterministic review. It does not grant browser authority and must be replaced by authenticated server context when production identity integration arrives.

## Visibility policy

Profile visibility:

- `public`: authorized public fields may be shown.
- `friends`: full profile is available only to a server-confirmed friend or owner.
- `private`: only a restricted identity state is returned to non-owners.

Field audiences:

- `public`
- `friends`
- `private`

Controlled fields:

- location
- Crew membership
- competitive statistics
- trust score
- match history
- game handles
- achievements
- exact availability

## Security boundary

The UI receives a projected `PublicPlayerProfileViewModel`; it never receives the source privacy record. Hidden fields are removed or replaced with null before rendering.

No public route contains profile editing or privacy mutations. Unknown player IDs use the route not-found boundary.

## Deterministic previews

```text
/players/player-prismo
/players/player-prismo?viewer=friend
/players/player-prismo?viewer=owner
/players/player-rivalking
/players/player-ghosty
/players/player-ghosty?viewer=friend
/players/player-private
/players/player-private?viewer=owner
/players/player-long-name
/players/player-prismo?viewer=blocked
```

## Deferred

- authenticated viewer resolution
- friend-request mutations
- Crew invite mutations from the public profile
- production profile API resources
- profile editing
- suspended and platform-blocked account states
