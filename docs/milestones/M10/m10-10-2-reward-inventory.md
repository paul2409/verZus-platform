# M10.2 — Reward inventory and complete state presentations

<!-- VERZUS M10.2 -->

## Purpose

Let a player inspect every reward state without introducing browser-authoritative inventory mutations.

## Presentation states

- `claimable`
- `eligible`
- `claiming`
- `locked`
- `claimed`
- `expired`
- `revoked`

## Composition

The approved 390px overview remains the primary hierarchy. M10.2 adds a mobile-first inventory panel with horizontally scrollable state filters, deterministic ordering, compact reward cards and expandable details.

No separate tablet or desktop dashboard is introduced. Larger widths keep the approved centered composition until those references are approved.

## Interaction boundary

Filtering and details are local presentation controls. The inventory is read-only. Claim execution remains disabled until M10.4 introduces:

- server-authoritative eligibility;
- expected inventory version checks;
- idempotency keys;
- retry-safe confirmation;
- auditable claim records.

## Data ownership

M10.2 uses deterministic feature-owned fixtures. M10.3 replaces those fixtures with independent progress, inventory, history and achievement resources through schema validation, adapters and TanStack Query without changing the UI contract.
