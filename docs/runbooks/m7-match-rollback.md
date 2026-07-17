<!-- VERZUS M7.8 MATCH OPERATIONS ROLLBACK RUNBOOK -->

# M7 Match Operations Rollback

## Fast containment

1. Set `NEXT_PUBLIC_ENABLE_M7_MATCH_OPERATIONS=false`.
2. Confirm `/api/health/matches` reports `enabled: false`.
3. Confirm `/play`, `/compete` and global navigation remain reachable.

## Application rollback

Promote the previously verified immutable archive. Do not rebuild the previous commit during an incident.

Verify:

- release identifier is visible in `/api/health/matches`;
- check-in and result mutations are disabled or served by the intended version;
- no mixed application artifacts remain across instances.

## Installer rollback

```bash
bash ./VERZUS_M7_7_8_Testing_Observability_Release.sh rollback
```

This restores the most recent timestamped pre-M7.8 archive under `.verzus-backups/m7-7-8-testing-observability-release/`.

## Data safety

M7 mock stores are process-local. Production rollback must preserve server-side check-in, result, evidence, dispute and audit records. Never roll back data by deleting audit events.
