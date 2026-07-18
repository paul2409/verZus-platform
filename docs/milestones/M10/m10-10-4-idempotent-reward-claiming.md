# M10.4 — Server-authoritative, idempotent reward claiming

## Purpose

M10.4 changes reward claiming from a disclosure-only control into a real mutation while keeping the server authoritative. The browser can request a claim, but it cannot grant inventory, change eligibility, or create history directly.

## Contract

`POST /api/rewards/[rewardId]/claim`

Required header:

```text
Idempotency-Key: <stable key for this attempt>
```

Body:

```json
{
  "expected_version": 1
}
```

The command is rejected when the inventory version is stale, the reward is not claimable, or the idempotency key was reused for a different command.

## Safety properties

- Eligibility and current reward state are checked on the server.
- Inventory version is checked before mutation.
- One idempotency key maps to one immutable result.
- Retrying the same interrupted request replays the prior result.
- A new key cannot claim an already claimed reward.
- Inventory, reward track and history are refreshed from the same confirmed store.
- Every successful grant creates a claim reference and audit event.
- Claim errors do not remove the existing reward inventory.

## Development scenarios

Use `claimScenario` on `/rewards`:

- `normal`
- `slow`
- `error`
- `conflict`
- `response-lost`
- `unavailable`

The `response-lost` scenario commits the claim once, returns a simulated gateway timeout, and then safely replays the same result when the user selects **Retry safely**.

## Production boundary

The M10.4 store is an in-process mock implementation that preserves state across hot reloads in the running development server. M14 must replace it with a transactional persistent reward ledger without changing the UI contract.
