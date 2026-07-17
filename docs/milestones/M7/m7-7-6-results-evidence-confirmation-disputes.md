<!-- VERZUS M7.6 RESULTS, EVIDENCE, CONFIRMATION AND DISPUTES -->

# M7.6 — Results, Evidence, Confirmation and Disputes

## Intent

Complete the non-terminal match result workflow without allowing the browser to authoritatively change match state or silently overwrite conflicting scores.

## Data flow

```text
POST mutation
→ request validation
→ expected-state and expected-version guard
→ idempotency replay check
→ result/evidence/dispute service
→ persistent mock store
→ query invalidation
→ independent panel refresh
```

## Result rules

- Result submission is valid only from `submit-result`.
- Submission transitions to `awaiting-opponent-confirmation`.
- Matching confirmation transitions to `result-confirmed`.
- A different confirmation score creates a persisted conflict while preserving the original submitted score.
- Every state-changing result operation requires the current match version.
- Reusing the same idempotency key replays the original operation.

## Evidence rules

Evidence upload is independent from result submission.

- Allowed states: `submit-result`, `awaiting-opponent-confirmation`, `disputed`.
- Allowed MIME types: PNG, JPEG, MP4.
- Maximum size: 25 MB per file.
- Maximum count: five files per match.
- Files receive a server-computed SHA-256 checksum.
- Upload does not transition match state or increment match version.

The M7.6 mock store retains file metadata and checksums only. M14 replaces it with the production object-storage adapter without changing the UI contract.

## Dispute rules

- Creation is valid from `submit-result`, `awaiting-opponent-confirmation`, or `result-confirmed`.
- Creation transitions the match to `disputed`.
- Every dispute records a reason, summary, claimed score, creator, timestamp and audit event ID.
- Repeated requests are idempotent.

## Independent endpoints

```text
GET|POST /api/matches/[matchId]/result
GET|POST /api/matches/[matchId]/evidence
GET|POST /api/matches/[matchId]/dispute
```

Failure in evidence or dispute operations must not remove result state, participants, support, navigation or the route shell.

## Verification

```bash
npm run verify:m7:7.6
```

## Rollback

```bash
bash ./VERZUS_M7_7_6_Results_Evidence_Confirmation_Disputes.sh rollback
```
