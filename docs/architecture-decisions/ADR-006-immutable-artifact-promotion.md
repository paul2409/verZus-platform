# ADR-006: Immutable Artifact Promotion

## Status

Accepted.

## Decision

Build once in CI, identify the artifact by commit SHA, and promote the same artifact through preview, staging, and production.

## Consequences

Environment configuration must be externalized. Rollback becomes artifact selection rather than rebuild.
