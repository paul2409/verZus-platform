<!-- VERZUS M5 STEPS 5.1-5.4 -->

# Step 5.4 — Query Cache and View-Model Foundation

## Action

Create typed API clients, independent TanStack Query options, retry rules, query
keys, and a framework-neutral Play Command Centre view model.

## Cache policy

| Resource                 |  Freshness |  Automatic refresh |
| ------------------------ | ---------: | -----------------: |
| Player status            | 60 seconds | route/focus policy |
| Next match               | 15 seconds |         30 seconds |
| Current check-in         |  5 seconds |         10 seconds |
| Current position         | 60 seconds | route/focus policy |
| Crew summary             | 45 seconds | route/focus policy |
| Recommended competitions |  2 minutes | route/focus policy |
| Recent activity          | 60 seconds | route/focus policy |

## Retry policy

- Maximum two read retries.
- Structured non-retryable API errors do not retry.
- Retryable transport, maintenance, and upstream errors may retry.
- Mutations are not introduced in Steps 5.1–5.4.

## View-model rules

- Every widget retains its own state, data, error code, and request ID.
- Stale data remains available and receives a stale marker.
- Secondary widget failure creates `partial_api_failure` without disabling the
  essential match and check-in actions.
- Offline mode disables network-dependent essential actions while static
  navigation remains outside the data view model.

## Implementation gate

The final `/play` presentation is not replaced in this installer. Final screen
code begins only after the reference set is approved under the project workflow.
