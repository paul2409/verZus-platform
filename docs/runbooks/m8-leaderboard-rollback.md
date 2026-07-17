<!-- VERZUS M8.10 LEADERBOARD ROLLBACK RUNBOOK -->

# M8 Leaderboard Rollback

## Immediate containment

Disable only entity intel first when rankings are healthy:

```env
NEXT_PUBLIC_ENABLE_M8_ENTITY_INTEL=false
```

Disable the full M8 route only when the leaderboard itself is unsafe:

```env
NEXT_PUBLIC_ENABLE_M8_LEADERBOARDS=false
```

Redeploy the same previously verified artifact after changing the feature flag.

## Installer rollback

```bash
bash ./VERZUS_M8_8_10_Interaction_Reliability_Testing_Release.sh rollback
```

This restores the most recent timestamped pre-M8.10 archive.

## Artifact rollback

1. Select the previous `artifacts/m8-leaderboards/<release>/manifest.json`.
2. Verify the archive SHA-256.
3. Promote that exact archive; do not rebuild from source.
4. Run `/api/health/leaderboards` and the leaderboard smoke journey.
5. Confirm entity-intel failure does not affect rankings.

## Evidence

Record release SHA, artifact checksum, operator, reason, deployment time, health response and post-rollback smoke-test result.
