# M10.1 — Rewards foundation and approved mobile overview

<!-- VERZUS M10.1 -->

## Purpose

Answer the player's first Rewards questions at 390px:

1. What level am I?
2. How close am I to the next level?
3. What can I claim now?
4. What rewards are coming next?
5. What did I claim recently?

## Approved hierarchy

1. Rewards heading and claimable count
2. Level progress
3. Claimable reward
4. Season reward track
5. Recently claimed history

## Scope

M10.1 is a typed, read-only foundation. The Claim control opens an implementation note rather than mutating inventory. Server-authoritative eligibility and idempotent claim execution arrive in M10.4.

## Responsive decision

The 390px composition is approved. Larger widths retain the same centered hierarchy to prevent horizontal overflow. A materially different desktop composition is not introduced until its reference is approved.

## Domain states

`locked`, `eligible`, `claimable`, `claiming`, `claimed`, `expired`, `revoked`
