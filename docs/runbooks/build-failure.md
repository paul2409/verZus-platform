# Build Failure Runbook

## 1. Preserve evidence

```bash
node --version
npm --version
git status
git rev-parse HEAD
npm run build 2>&1 | tee build-failure.log
```

Do not delete the log until the failure is understood.

## 2. Reproduce from the lockfile

```bash
rm -rf node_modules .next
npm ci
npm run env:check:test
npm run build
```

## 3. Narrow the failure

```bash
npm run typecheck
npm run lint
npm run test
npm run check:boundaries
```

## 4. Common ownership

- dependency or lockfile error: `package.json` and `package-lock.json`
- missing environment: `src/lib/config/` and deployment configuration
- route compilation: `src/app/`
- boundary failure: import direction or feature ownership
- test failure: test owner and changed module

## 5. Recovery

Revert only the smallest failing commit. Do not bypass linting, type checks, tests, or environment validation to force a build.
