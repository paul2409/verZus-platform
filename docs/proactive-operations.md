# Smart Platform Phase 5 — Proactive Operations

## Purpose

Proactive Operations converts confirmed server state into timely, idempotent in-app reminders. It does not authorize mutations, infer eligibility, change match state, issue rewards, or resolve disputes.

## Rules

The runner evaluates:

- match check-in opening and closing urgency;
- match lobby readiness;
- opponent-submitted results awaiting confirmation;
- interrupted competition entries approaching registration close;
- expiring Crew invitations;
- claimable or expiring rewards;
- profile fields currently blocking competition readiness.

Each reminder uses a stable reference derived from the rule and source record. Re-running the job updates the existing reminder rather than inserting duplicates. A read reminder is returned to unread only when its priority escalates to critical. Dismissed and actioned reminders are not reopened.

## Data flow

```text
PostgreSQL domain state
→ proactive signal repository
→ deterministic reminder policy
→ idempotent notification upsert
→ notification cache and Action Centre deep links
```

## Security

The internal scheduler endpoint is:

```text
POST /api/internal/proactive-operations
```

It requires:

```text
Authorization: Bearer $PROACTIVE_OPERATIONS_TOKEN
```

The token is server-only and must contain at least 32 characters in staging and production. Never expose it through a `NEXT_PUBLIC_` variable.

## Scheduling

Run every five minutes in staging and production using the platform scheduler. Promote the same immutable application artifact between environments; only the secret and schedule configuration differ.

Local manual run:

```bash
npm run ops:proactive
```

Scheduler request:

```bash
curl -X POST \
  -H "Authorization: Bearer $PROACTIVE_OPERATIONS_TOKEN" \
  -H "X-Request-Id: scheduler-$(date +%s)" \
  "$NEXT_PUBLIC_APP_URL/api/internal/proactive-operations"
```

## Concurrency and retry

A PostgreSQL advisory transaction lock prevents overlapping runs. If another runner owns the lock, the new run records `skipped` and exits successfully. Notification references and the existing unique `(user_id, reference)` constraint make retries safe.

## Observability

Every run records:

- request ID;
- trigger source;
- release SHA;
- status;
- candidates evaluated;
- reminders produced;
- notifications created or updated;
- stale reminders resolved;
- sanitized failure code.

Run records are stored in `proactive_operation_runs`.

## Failure behavior

A failed proactive run must not affect authentication, navigation, Play, match operations, or notification reads. Existing actions remain available because Action Centre continues to derive current work directly from domain state.

## Rollback

Disable without redeploying:

```text
PROACTIVE_OPERATIONS_ENABLED=false
```

Application rollback is safe because migration `0014` only adds a run-history table. After all older application versions are restored, the table may be removed manually if required.
