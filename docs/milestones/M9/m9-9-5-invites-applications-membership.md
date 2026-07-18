<!-- VERZUS M9.5 INVITES, APPLICATIONS AND MEMBERSHIP -->

# M9.5 — Invites, applications and membership

## Intent

Enable safe Crew membership changes without allowing the browser to control capacity, permissions, expiry, ownership or duplicate-event behavior.

## Data flow

```text
HTTP response
-> Zod validation
-> membership adapter
-> TanStack Query cache
-> membership snapshot
-> discovery / requests / settings UI
```

## Server-owned invariants

- Every mutation requires a 16–128 character idempotency key.
- Every mutation includes the expected membership version.
- Capacity is checked at the server immediately before a join.
- Duplicate pending applications and invites become safe no-ops.
- Only owner, captain or manager may accept applications or create invites.
- Owners cannot leave until M9.6 ownership transfer completes.
- Expiry uses server time.
- Every accepted, declined, invited, joined or left operation creates an audit event.

## Endpoints

```text
GET  /api/crews/[crewId]/membership
POST /api/crews/[crewId]/applications
POST /api/crews/[crewId]/applications/[applicationId]/decision
POST /api/crews/[crewId]/invites
POST /api/crews/[crewId]/invites/[inviteId]/decision
POST /api/crews/[crewId]/membership/leave
POST /api/crews/[crewId]/membership/expire
```

## Verification

```bash
npm run verify:m9:9.5
```

## Rollback

```bash
bash ./VERZUS_M9_9_5_Invites_Applications_Membership.sh rollback
```
