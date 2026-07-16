<!-- VERZUS M6.7 COMPETITION RELEASE GATE -->

# M6 Competition Rollback

## Immediate degradation control

Set `NEXT_PUBLIC_ENABLE_M6_COMPETITIONS=false`, rebuild through the normal
pipeline and promote the resulting controlled-disable artifact. Do not remove
authentication or global navigation.

## Artifact rollback

1. Select the previously approved artifact from `artifacts/m6-competitions/`.
2. Verify its `manifest.json` checksums and source commit.
3. Promote the exact retained artifact to the affected environment.
4. Verify `/api/health/competitions` and `/compete`.
5. Confirm competition entry failures and frontend exceptions return to baseline.

## Installer rollback

```bash
bash ./VERZUS_M6_6_7_Competition_Testing_Observability_Release.sh rollback
```

This restores the latest timestamped pre-M6.7 archive. Run `npm run typecheck`
and the M6.6 verifier after restoration.

## Rollback signals

Rollback or disable M6 when any of these exceed the agreed release threshold:

- competition route crash rate
- entry mutation failure rate
- schema validation failures
- lifecycle API latency or availability
- severe accessibility regression
- visual approval mismatch
