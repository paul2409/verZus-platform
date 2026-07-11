# ADR-003: Explicit Feature Ownership

## Status
Accepted.

## Decision
Every route, entity, command, event, query, table, and operational runbook has one named owning domain. Cross-domain writes are prohibited.

## Consequences
Ownership disputes must be resolved before implementation. Events or APIs replace direct database coupling.
