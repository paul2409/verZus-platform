# VERZUS UI Rollback

Each visual stage creates an independent backup:

- `.verzus-backups/stage-1-foundation/`
- `.verzus-backups/stage-2-primitives/`
- `.verzus-backups/stage-3-play/`
- `.verzus-backups/stage-4-competitive/`
- `.verzus-backups/stage-5-platform/`

To roll back Stage 5, run:

```bash
bash ./VERZUS_Stage_5_Platform_Completion.sh rollback
```

After rollback, run:

```bash
npm run typecheck
npm run dev
```

Review `/play`, `/profile`, `/notifications`, `/search`, `/settings`, `/login`, and `/onboarding` before continuing.
