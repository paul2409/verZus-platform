# M10.6 — Achievement detail and auditable reward history

<!-- VERZUS M10.6 -->

## Intent

Add verified achievement detail and a paginated reward ledger without coupling either read model to reward claiming, inventory or season progression.

## KEEP

- Approved 390px Rewards hierarchy.
- M10.2 inventory state presentations.
- M10.3 independent resource contracts.
- M10.4 idempotent, server-authoritative claims.
- M10.5 season and progression resources.

## REUSE

- Existing achievement summary resource.
- Claim audit events and claim references.
- TanStack Query, Zod, request IDs and previous-data retention patterns.
- Existing reward artwork and design tokens.

## REPLACE

- Achievement summaries with summaries plus separately fetched detail.
- Three-item recent history as the only history surface with a complete paginated audit ledger.

## DELETE

- No existing reward, claim, inventory, season or history contract.
- No browser-authoritative audit data.
- No combined Rewards dashboard endpoint.
- No Vitest or Playwright execution during installation.

## CREATE

### Independent endpoints

- `GET /api/rewards/achievements/[achievementId]`
- `GET /api/rewards/history/audit?page=1&pageSize=4`

### Achievement detail

- URL state: `?achievement=<achievementId>`.
- Category, rarity, requirement, progress and unlock state.
- Linked reward state.
- Verified source provenance.
- Independent request ID and retry.

### Auditable reward history

- URL state: `?historyPage=<number>`.
- Server-bounded pagination.
- Issued, claimed, expired and revoked events.
- Event reference, actor, claim reference and inventory version.
- Expiration and revocation reasons.
- Previous confirmed page retained while another page loads.

## Data flow

```text
HTTP response
→ Zod schema
→ domain adapter
→ TanStack Query cache
→ achievement/history view model
→ UI
```

## Safety boundary

M10.6 is read-only. It does not issue, claim, revoke or expire rewards. Claiming remains exclusively owned by M10.4.

## Verification

```bash
npm run verify:m10:10.6
```

## Rollback

```bash
bash ./VERZUS_M10_10_6_Achievement_Detail_Auditable_History_NO_TESTS.sh rollback
```
