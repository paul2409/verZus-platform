# Stage 2 Retro Shared-UI Rollback

## Backup Location

\`.verzus-backups/stage-2-retro-shared-ui/<timestamp>/verzus-stage-2-before.tar.gz\`

## Rollback Command

\`bash ./VERZUS_Stage_2_Retro_Shared_UI.sh rollback\`

## What Is Restored

- Shared shell and navigation files
- Route and widget boundaries
- Shared primitives
- Stage 2 documentation and verifier when they previously existed
- `package.json`

## Verification After Rollback

1. Run `npm run verify:stage1:retro`.
2. Confirm the root still uses `data-theme="retro-competitive"`.
3. Open `/login`, `/play`, `/leaderboards`, and `/design-system`.
4. Confirm no route or feature behaviour changed.
