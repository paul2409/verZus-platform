# ADR-002: Validated Data Flow

## Status

Accepted.

## Decision

All remote data follows:

HTTP response → schema validation → domain adapter → query cache → view model → UI.

UI components do not consume raw backend responses.

## Consequences

Backend changes are contained in schemas and adapters. Malformed data fails at the feature boundary instead of corrupting unrelated components.
