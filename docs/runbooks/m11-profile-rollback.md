# M11 Player Profile rollback runbook

## Fast isolation

Set `NEXT_PUBLIC_ENABLE_M11_PROFILES=false` and redeploy the existing artifact configuration. Confirm that `/profile` and `/players/*` show the controlled disabled state while Play and navigation remain available.

## Application rollback

1. Identify the previous approved M11 or M10 artifact and verify its SHA-256 manifest.
2. Promote that exact artifact without rebuilding.
3. Confirm `/play`, `/profile`, `/players/player-prismo` and `/api/health/profiles`.
4. Verify that profile editing and privacy mutations are not replayed automatically.
5. Retain request IDs and error IDs for incident review.

## Installer rollback

Run:

```bash
bash ./VERZUS_M11_11_8_Release_Readiness_Feature_Isolation_Packaging_NO_TESTS.sh rollback
```

The installer restores the latest timestamped M11.7 archive.

## Data considerations

M11.8 introduces no destructive migration. Profile and privacy source records remain server-authoritative. Do not manually edit production data as a rollback method.
