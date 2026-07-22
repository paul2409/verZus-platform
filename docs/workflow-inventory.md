# VERZUS Production Workflow Inventory

## Intent

Each task has one owner, one primary action, and one authoritative state source.

## Registration and onboarding

`Register -> verify email -> resume onboarding -> Play`

- Registration owns credentials and the VERZUS gamer tag.
- Onboarding reuses the gamer tag and only collects game identity, location, availability, and optional Crew choice.
- Completion does not promise fictional XP or progression.

## Play

The screen answers:

1. What must I do now?
2. When is it due?
3. What happens next?

The next-match/check-in panel is the only primary action surface. Supporting links remain unique.

## Competition entry

`Open competition -> eligibility preflight -> one confirmation -> persistent result`

Eligibility and capacity are server-authoritative. Repeated submissions reuse idempotency protection.

## Match operations

Only controls relevant to the current authoritative state are visible:

- scheduled/check-in states: check-in
- ready/lobby states: lobby
- in-progress/result states: result and permitted terminal actions
- disputed state: dispute and evidence
- terminal states: confirmed outcome

## Crews

Applications and invitations share one membership inbox. Role and ownership controls remain permission-scoped.

## Rewards

One server-authoritative claim action updates inventory, history, achievements, and progression through shared cache invalidation.

## Search and notifications

Search has one global entry point. Notification actions deep-link to their owned destination and become actioned/read atomically.

## Settings ownership

- identity: `/profile/edit`
- privacy: `/profile/settings`
- notifications: `/notifications/settings`
- password recovery: `/forgot-password`

The `/settings` route is a directory, not a duplicate state store.
