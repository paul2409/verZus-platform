# ADR-001: Domain-Oriented Project Structure

## Status
Accepted.

## Context
VERZUS contains several independently evolving domains and must avoid a large shared component and API layer.

## Decision
Use feature-domain folders. Each feature owns its contracts, adapters, UI, mocks, tests, and error states. Shared folders contain only domain-neutral primitives and infrastructure.

## Consequences
Positive: clear ownership, easier isolation, safer deletion, better testing.

Negative: some duplication is accepted until a genuinely reusable pattern is proven.
