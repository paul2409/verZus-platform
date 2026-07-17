<!-- VERZUS M7.1 MATCH OPERATIONS FOUNDATION -->

# M7.1 — Match Operations Foundation

## Screen purpose

Give a player one authoritative place to understand the current match state, required action, opponent readiness, timeline, lobby/result context and support path.

## Primary action

The state-dependent command in the centre panel. M7.1 renders actions intentionally disabled because mutations belong to later controlled stages.

## Route

- `/matches/[matchId]`
- Review route: `/matches/m7-preview?state=check-in-open`

## Supported visual states

Scheduled, check-in unavailable, check-in open, checked in, opponent not checked in, both ready, lobby open, match in progress, submit result, awaiting opponent confirmation, result confirmed, disputed, forfeit, cancelled and completed.

## Component map

- `MatchHeader`
- `ParticipantPanel`
- `MatchTimeline`
- `CheckInPanel`
- `LobbyPanel`
- `ResultSubmissionPanel`
- `EvidenceUploader`
- `DisputePanel`
- `MatchSupportPanel`

## Responsive contract

- 390px: primary action first, participant identities compact, timeline and support follow.
- 768px: timeline plus command surface, support spans the lower row.
- 1440px: three-column timeline, command and support composition.

## M7.1 boundary

This stage is presentational and deterministic. It does not claim server time, check-in persistence, lobby mutation, result mutation, upload or dispute behavior. Those are added in M7.2 through M7.7.
