# M10 Rewards rollback runbook

## Scope

Use this runbook when Rewards claiming, progression, inventory, achievements or history creates unacceptable production risk.

## Fast isolation

Set:

```env
NEXT_PUBLIC_ENABLE_M10_REWARDS=false
```

Redeploy the same approved application configuration. Confirm that `/rewards` shows the controlled unavailable state while Play, competitions, matches, leaderboards, Crews and navigation remain operational.

This feature flag does not reverse confirmed reward grants.

## Application rollback

1. Identify the previously promoted immutable M10 or pre-M10 artifact and its SHA-256 manifest.
2. Verify the archive checksum before deployment.
3. Promote the exact prior artifact. Do not rebuild source during rollback.
4. Keep database or reward-ledger migrations separate from application startup.
5. Run the Rewards health check:

```text
GET /api/health/rewards
```

6. Confirm the claim endpoint does not create duplicate grants when the same idempotency key is replayed.
7. Confirm Play and navigation remain available.

## Local installer rollback

```bash
bash ./VERZUS_M10_10_8_Release_Readiness_Feature_Isolation_Packaging_NO_TESTS.sh rollback
```

The command restores the latest timestamped archive under:

```text
.verzus-backups/m10-10-8-release-readiness-feature-isolation-packaging/
```

## Reward integrity warning

Never compensate for a failed UI deployment by deleting confirmed reward audit events. Reward grants, expirations and revocations require explicit server-side operations and new audit records.
