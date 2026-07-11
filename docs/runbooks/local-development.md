# Local Development Runbook

## First setup

```bash
nvm use
cp .env.example .env.local
npm ci
npm run env:check
npm run dev
```

## Daily start

```bash
git pull --ff-only
npm ci
npm run dev
```

Use `npm install` only when intentionally changing dependencies. Use `npm ci` when reproducing the committed lockfile.

## Before commit

```bash
npm run format
npm run verify
```

## Clean rebuild

```bash
rm -rf node_modules .next coverage playwright-report test-results
npm ci
npm run verify
```

## Expected endpoints

- application: `http://localhost:3000`
- health: `http://localhost:3000/api/health`
