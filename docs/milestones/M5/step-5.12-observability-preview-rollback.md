<!-- VERZUS M5 STEPS 5.9-5.13 -->

# Step 5.12 — Observability, Preview, and Rollback

Client telemetry records:

- Play screen views
- widget failures
- widget retries
- check-in start, success, and failure
- request ID and structured error code
- deployment release and environment

Server check-in logs include route, status, request ID, error code, and release.

Preview route:

```text
/m5-play-review
```

Feature flag:

```text
NEXT_PUBLIC_ENABLE_M5_PLAY_COMMAND_CENTER=false
```

The flag disables the Play feature without removing authentication or global
navigation.
