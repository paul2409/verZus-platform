# Rollback Runbook

## Application rollback

Deploy the previously approved immutable artifact. Do not rebuild old source during an incident.

Required identifiers:

- release SHA
- artifact name
- deployment environment
- deployment timestamp
- rollback operator

## Source rollback

For an unreleased branch:

```bash
git log --oneline --decorate -10
git revert <bad-commit-sha>
npm ci
npm run verify
```

Prefer `git revert` after code has been shared. Do not rewrite shared production history.

## Local uncommitted rollback

Inspect before deleting work:

```bash
git status
git diff
git diff --staged
```

Restore one tracked file:

```bash
git restore path/to/file
```

Remove generated untracked files only after review:

```bash
git clean -nd
git clean -fd
```

## Data migrations

M1 has no application database migrations. Future migrations must use expand, migrate, contract and remain separate from application startup.
