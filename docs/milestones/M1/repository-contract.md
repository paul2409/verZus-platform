# M1 Repository Contract

## Import direction

```text
src/app -> src/features -> src/components -> src/lib -> src/types
```

Application composition may import multiple features. Feature internals may not import another feature directly. Shared components and platform libraries may not import feature implementations.

## Environment contract

- local and test may use mocks
- staging and production must reject mock mode
- staging and production require database and authentication secrets
- secrets are server-only
- no environment secret may be logged

## Build contract

A clean checkout must support:

```bash
npm ci
npm run verify
npm run build
```

CI builds a standalone artifact identified by the commit SHA.

## Failure contract

- route errors render controlled fallbacks
- future major widgets receive local error boundaries
- navigation must never depend on page data
- API responses will be schema-validated before reaching UI
- mutations are not automatically retried

## Legacy contract

No active code imports from or references the filesystem location of the legacy repository.
