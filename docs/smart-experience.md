# VERZUS Smart Experience

## Phase 1 - Next Best Actions

Play derives up to four useful navigation actions from confirmed player state. It does not pad the list with irrelevant destinations.

## Phase 2 - Unified Action Centre

The Action Centre composes server-authoritative tasks from independent domains:

- email verification and onboarding prerequisites;
- incomplete player profile readiness;
- match check-in, lobby, result, confirmation and dispute actions;
- pending Crew invitations;
- claimable rewards;
- critical security and system notifications.

The read model does not copy domain state into another mutable store. Each action disappears automatically when its source domain transitions out of the actionable state.

Priority order is deterministic:

1. account and security blockers;
2. server-controlled match deadlines;
3. pending opponent/result decisions;
4. Crew invitations;
5. expiring rewards;
6. profile readiness.

The Action Centre is an independently failing Play widget. Failure does not block navigation, check-in, matches, Crew operations, rewards, or other Play modules.
