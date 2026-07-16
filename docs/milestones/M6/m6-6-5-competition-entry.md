# M6.5 — Competition Entry

## Goal

Provide a safe competition-entry flow without changing the approved M6.1 discovery screen or M6.4 detail composition.

## User journey

1. Open a competition detail page.
2. Load entry control independently from summary, rules, rewards and bracket resources.
3. Review server-authoritative eligibility, current lifecycle state, entry fee and check-in schedule.
4. Open a confirmation dialog.
5. Explicitly accept the entry terms.
6. Submit one idempotent entry command.
7. Receive a persistent confirmed registration and management view.

## Independent resource

- `GET /api/competitions/[competitionId]/entry`
- `POST /api/competitions/[competitionId]/entry`

The POST command requires matching body and header idempotency keys.

## Data flow

HTTP response → Zod validation → entry adapter → TanStack Query cache → entry view model → UI.

## Server-authoritative checks

The mock service rechecks:

- competition identity
- lifecycle state
- expected state version
- current eligibility
- current capacity
- existing entry
- accepted terms
- idempotency key integrity

The client cannot make itself eligible by changing local state.

## Persistence

Confirmed entries are stored in a secure, HTTP-only mock cookie. Reloading the detail page restores the confirmed entry. The discovery sidebar reads the latest persistent entry while retaining the seeded League entry before a new registration is created.

## Manage entry boundary

M6.5 provides a read-only management dialog with registration code, status, entrant, entry type, fee and check-in schedule. Withdrawal, waitlist and closed-registration operations remain part of M6.6 and are not shown as fake actions.

## Failure isolation

A failed entry resource does not remove:

- competition summary
- eligibility panel
- schedule
- rewards
- rules
- participants
- bracket
- navigation

## Responsive behavior

The entry panel remains in the right rail on desktop and follows the detail content on mobile. Dialog actions collapse to one column on narrow phones.
