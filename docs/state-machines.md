# VERZUS State Machines

## State-machine rules

- Transitions occur through named commands.
- Invalid transitions return structured errors.
- Server time is authoritative.
- Commands include expected version where concurrent modification is possible.
- Important transitions emit domain events and audit records.

## User

`pending_verification → active → suspended → active`

`active → banned`

`active → deactivated`

Banned and deactivated states require explicit recovery workflows.

## Onboarding

`not_started → identity → games → location → availability → crew_optional → completed`

Any incomplete state may resume from the last confirmed step.

## Game account verification

`unverified → pending → verified`

`pending → rejected`

`verified → revoked`

## Crew

`forming → active → inactive → archived`

`active → suspended → active`

`active → disbanded → archived`

## Crew membership

`invited → active`

`application_submitted → trial → active`

`active → left`

`active → removed`

## Competition

`draft → scheduled → registration_open → registration_closed → check_in_open → in_progress → completed → archived`

Alternative exits:

- `scheduled|registration_open|registration_closed|check_in_open → cancelled`
- `cancelled → archived`

## Registration

`pending → confirmed`

`pending → waitlisted`

`pending → rejected`

`confirmed → withdrawn` when policy allows.

`waitlisted → confirmed` when a slot opens.

## Match

`scheduled → check_in_open → ready → in_progress → result_pending → completed`

Alternative transitions:

- `check_in_open → forfeited`
- `scheduled|check_in_open|ready → cancelled`
- `result_pending → disputed`
- `disputed → completed`
- `disputed → cancelled`

## Check-in

`not_open → open → checked_in`

`open → missed`

`checked_in → revoked` only by authorized operation.

## Result

`submitted → awaiting_confirmation → confirmed`

`submitted → confirmed` for system-verified adapters.

`awaiting_confirmation → rejected`

`confirmed → superseded` through correction workflow.

`submitted|awaiting_confirmation|confirmed → voided` through authorized resolution.

## Evidence

`pending_upload → uploaded → scanning → accepted`

`scanning → rejected`

`accepted|rejected → expired` based on retention policy.

## Dispute

`opened → awaiting_evidence → under_review → resolved → closed`

`opened|awaiting_evidence|under_review → rejected → closed`

## Week

`scheduled → active → scoring → finalized → archived`

A finalized Week may only change through a correction event and new ranking snapshot.

## Leaderboard

`building → live → stale → live`

`live|stale → finalized → archived`

## Reward grant

`locked → eligible → claimable → claimed`

`claimable → expired`

`eligible|claimable|claimed → revoked` through authorized command.

## Notification

`unread → read → actioned`

`unread|read → dismissed`

`unread|read → expired`

## Penalty

`proposed → active → expired`

`active → appealed → active`

`appealed → overturned`

## Transition error codes

- `INVALID_STATE_TRANSITION`
- `STATE_VERSION_CONFLICT`
- `DEADLINE_PASSED`
- `NOT_AUTHORIZED`
- `RESOURCE_LOCKED`
- `ALREADY_COMPLETED`
- `IDEMPOTENCY_CONFLICT`
