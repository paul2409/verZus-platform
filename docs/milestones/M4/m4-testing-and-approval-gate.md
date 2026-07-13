<!-- VERZUS M4 STEP 4.11 -->

# M4 Step 4.11 — Testing and Approval Gate

## Purpose

Establish the final technical and approval gates for authentication and
onboarding without falsely marking M4 complete before visual references and
final screens are approved.

## Technical verification

The installer runs:

```text
Step 4.10 focused tests
Step 4.10 focused lint
TypeScript
Architecture boundaries
Production build
M4 integration tests
Full lint
Full TypeScript
Full test suite
Full production build
Repository verify command
```

## Integration coverage

```text
anonymous → login
unverified → email verification
onboarding incomplete → onboarding
completed onboarding → authenticated Play access
session expiry → recovery route with safe next path
401 refresh rejection → session_refresh_failed
maintenance response remains maintenance
invalid credentials
duplicate account
expired verification code
expired reset token
rate limiting with retry timing
suspended and banned account enforcement
partial onboarding failure with preserved draft
```

## Browser testing

When `@playwright/test` is installed, Step 4.11 creates:

```text
tests/e2e/m4/auth-accessibility.spec.ts
tests/e2e/m4/auth-responsive.spec.ts
tests/e2e/m4/register-to-play.spec.ts
tests/visual/m4/auth.visual.spec.ts
```

The authentication accessibility and overflow checks can run against existing
routes.

The register-to-Play and visual regression suites remain explicitly skipped
until:

```text
M4_REFERENCES_APPROVED=true
```

That environment variable must not be set merely to bypass the gate. Set it
only after the approval manifest accurately records approved references.

## Approval manifest

The approval source is:

```text
docs/milestones/M4/m4-approval-manifest.json
```

Allowed reference outcomes:

```text
approved
not_required
pending_review
generated_unapproved
missing
undecided
blocked
```

Final acceptance requires:

```text
mobile390 = approved
tablet768 = approved or not_required
desktop1440 = approved
```

for every required screen.

It also requires product, design, engineering, accessibility, and security
signoff.

## Verification commands

Technical-only gate:

```bash
npm run m4:verify:technical
```

Approval gate:

```bash
npm run m4:verify
```

Current blocker report without failing the shell:

```bash
node scripts/verify-m4.mjs --report-only
```

Machine-readable report:

```text
reports/m4-verification.json
```

## Final M4 gate

Run only after references, final screens, browser suites, and signoffs are
complete:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run verify
npm run m4:verify
```

M4 is complete only when every command passes and `m4:verify` reports:

```text
Technical gate: PASS
Approval gate: PASS
```

## Current expected status

Technical infrastructure may pass.

The approval gate remains blocked because required mobile and desktop
references are not fully approved, some onboarding mobile references remain
missing, and final onboarding screens have not been implemented.

This is an intentional safety gate, not a test failure.
