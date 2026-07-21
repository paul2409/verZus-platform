# M12.8 - Release Readiness, Responsive Approval and Immutable Artifact Evidence

<!-- VERZUS M12.8 -->

## Intent

Close Milestone 12 as a release candidate without claiming production approval prematurely. Search,
Notifications, Activity and Notification Settings remain independently owned and independently recoverable.

## Release boundary

M12.8 does not redesign feature screens and does not merge domain resources. It adds release evidence,
responsive review gates, artifact traceability and rollback instructions around the M12 implementation.

## Responsive approval

Review these widths intentionally:

- 360px
- 390px
- 430px
- 768px
- 1024px
- 1440px

The review must cover Search discovery and results, partial Search failure, Notification Centre, unread state,
Notification Settings, Activity Feed and Activity partial-page failure. Approval is recorded only by running:

```bash
npm run approve:m12:responsive -- --by "Reviewer name"
```

Optional evidence references may be attached:

```bash
npm run approve:m12:responsive -- --by "Reviewer name" --evidence "preview-url-or-ticket"
```

## Full release gate

After responsive approval and a clean commit:

```bash
npm run release:gate:m12
```

The gate runs:

1. focused M12.8 verification;
2. repository lint;
3. repository TypeScript validation;
4. unit/component tests through `npm run test`;
5. production build;
6. optional E2E, accessibility and visual scripts when present;
7. immutable evidence packaging;
8. artifact integrity verification.

The installer itself does not run Vitest, Playwright or the production build.

## Immutable artifact evidence

`npm run package:m12:release` creates a content-addressed directory:

```text
.verzus-artifacts/m12/<sha256>/
```

The directory contains:

- the exact M12 release inputs;
- per-file SHA-256 hashes;
- Git commit and dirty-worktree state;
- Next.js `BUILD_ID` and selected build manifests;
- responsive approval metadata;
- promotion and rollback rules.

Preview, staging and production must reference the same digest. Do not rebuild between environments.

## Rollback

Feature installation rollback:

```bash
bash ./script.sh rollback
```

Deployment rollback:

1. identify the previous successful digest;
2. redeploy that retained digest without rebuilding;
3. verify Search, Notifications, Activity and shell navigation independently;
4. keep the failed digest for investigation.

## Completion rule

M12 is a release candidate after installation. It is release-ready only when responsive approval is recorded,
`npm run release:gate:m12` passes, the artifact digest is retained, and preview approval is documented.
