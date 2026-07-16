# Stage 1 Retro Theme Rollback

## Backup location

The Stage 1 installer stores timestamped backups under:

`.verzus-backups/stage-1-retro/<timestamp>/`

The current installation backup is:

`.verzus-backups/stage-1-retro/20260716-131205/verzus-stage-1-before.tar.gz`

## Files changed or created

- `src/app/layout.tsx`
- `src/styles/globals.css`
- `src/styles/fonts.css`
- `src/styles/typography.css`
- `src/styles/verzus-retro-system.css`
- `package.json`
- `docs/design-system/retro-theme-ownership.md`
- `docs/design-system/stage-1-retro-audit.md`
- `docs/runbooks/stage-1-retro-rollback.md`
- `scripts/verify-stage-1-retro.mjs`

## Restore command

From the repository root:

```bash
bash ./VERZUS_Stage_1_Activate_Retro_Theme.sh rollback
```

The rollback command restores the latest archive and removes Stage 1 files that did not exist before installation.

## Verify restoration

1. Inspect the root import chain:

```bash
grep -n "verzus-.*system.css\|verzus-reference-lock.css\|verzus-font-reference.css" src/app/layout.tsx
```

2. Confirm the previous root theme state:

```bash
grep -n "data-theme" src/app/layout.tsx
```

3. Run focused checks:

```bash
npx eslint src/app/layout.tsx --max-warnings=0
npm run typecheck
```

Do not delete legacy stylesheets before final release approval. They remain part of the rollback trail until Stage 5 closes.
