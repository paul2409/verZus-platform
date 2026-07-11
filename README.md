# VERZUS Platform

Clean production-grade rebuild of the VERZUS competitive gaming platform.

## Current milestone

M1 — Repository and engineering foundation.

No production screen work is permitted until the M1 exit gate passes and M2 visual foundations are approved.

## Requirements

- Git
- Node.js 24 LTS recommended
- npm 10 or newer

## Start locally

```bash
cp .env.example .env.local
npm ci
npm run env:check
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run verify
```

Browser smoke test:

```bash
npx playwright install chromium
npm run build
npm run test:e2e
```

## Architecture

- `src/app`: routing and application composition
- `src/features`: domain-owned implementations
- `src/components`: domain-neutral UI
- `src/lib`: platform services and shared logic
- `src/mocks`: shared mock infrastructure
- `tests/e2e`: browser journeys
- `docs`: product, architecture, and operations contracts

## Legacy repository

The previous repository must remain outside this repository as a sibling directory named `verzus-legacy`.
