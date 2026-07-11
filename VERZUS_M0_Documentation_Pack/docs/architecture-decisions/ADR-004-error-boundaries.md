# ADR-004: Widget-Level Failure Boundaries

## Status
Accepted.

## Decision
Every major page widget has an independent query boundary, error boundary, fallback, retry policy, and telemetry label.

## Consequences
Pages remain partially usable during dependency failures. More explicit state design and test coverage are required.
