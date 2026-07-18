<!-- VERZUS M9.3 CREW CREATION AND IDENTITY ASSETS -->

# M9.3 — Crew creation and identity assets

## Intent

Create a recoverable five-step Crew foundation without prematurely enabling membership, role or destructive lifecycle mutations.

## Route

`/crews/create?membership=none&step=basics`

## Flow

1. Basics — name, tag, description, primary game and region.
2. Identity — original crest and banner presets.
3. Settings — visibility, recruiting, language and minimum rank.
4. Review — creation invariants and final confirmation.
5. Created — persisted record, owner assignment and forming lifecycle.

## Invariants

- The creator is assigned the `owner` role.
- The new Crew starts in `forming`.
- Initial member count is one.
- Repeated submission of the same draft returns the same local record.
- Custom uploads remain disabled until upload restrictions, scanning and moderation exist.
- Existing Crew members are blocked from creating another primary Crew.

## Persistence boundary

M9.3 uses a versioned local repository so drafts and success survive refresh during mock development. M9.4 replaces this repository with schema-validated API resources without changing the screen contract.

## Verification

```bash
npm run verify:m9:9.3
```

## Rollback

```bash
bash ./VERZUS_M9_9_3_Crew_Creation_Identity_Assets.sh rollback
```
