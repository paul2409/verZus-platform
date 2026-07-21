#!/usr/bin/env bash
set -Eeuo pipefail

MODE="${1:-install}"
SCRIPT_NAME="$(basename "$0")"
STAGE_SLUG="m12-12-8-release-readiness"
BACKUP_ROOT=".verzus-backups/${STAGE_SLUG}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="${BACKUP_ROOT}/${TIMESTAMP}"
ARCHIVE="${BACKUP_DIR}/verzus-m12-12-8-before.tar.gz"
BACKUP_CREATED="false"
INSTALL_COMPLETE="false"

print_plan() {
  cat <<'PLAN'
VERZUS M12.8 - Release Readiness, Responsive Approval and Immutable Artifact Evidence

KEEP
  - M12.1 approved mobile Search hierarchy and URL-backed state
  - M12.2 debounce, cancellation and independent Search resources
  - M12.3 notification lifecycle read model
  - M12.4 idempotent notification mutations and shell badge synchronization
  - M12.5 viewer-safe Activity Feed and cursor pagination
  - M12.6 independent reliability and edge-state recovery
  - M12.7 versioned notification delivery preferences
  - Existing application shell, route boundaries, API contracts and feature ownership
  - Existing repository-wide lint, typecheck, test and build commands
  - No-tests installation policy, focused verification, timestamped backup and rollback

REUSE
  - Existing M12 structural verifiers and focused TypeScript configurations
  - Existing request IDs, Zod adapters, independent query keys and local recovery actions
  - Existing preview server and approved mobile information hierarchy
  - Existing immutable Git commit and Next.js BUILD_ID as release identity inputs
  - Existing CI quality scripts instead of creating a parallel test system

REPLACE
  - Informal milestone completion with a machine-readable release-readiness contract
  - Ad hoc viewport checking with an explicit 360/390/430/768/1024/1440 review matrix
  - Rebuild-per-environment release behavior with content-addressed artifact evidence
  - Ambiguous rollback guidance with previous-digest promotion and installer rollback instructions

DELETE
  - No Search, notification, Activity, settings or shell implementation
  - No healthy cached data or independent feature boundary
  - No visual approval claim without an explicit reviewer and timestamp
  - No release artifact overwrite in place
  - No production promotion from a dirty worktree unless explicitly overridden for local diagnostics
  - No Vitest, Playwright, full build or repository-wide verification during installation

CREATE
  - M12.8 release-readiness and responsive-review contracts
  - Explicit manual responsive approval command
  - Content-addressed M12 release evidence package using SHA-256
  - Artifact integrity verifier and source-drift detection
  - Full release gate that runs focused M12 verification, lint, typecheck, tests and build
  - Optional E2E, accessibility and visual checks when repository scripts exist
  - Same-artifact promotion policy across preview, staging and production
  - Previous-digest rollback contract with artifact retention
  - Focused M12.8 structural verifier, ESLint and TypeScript gate
  - Automatic failed-install recovery and explicit rollback
PLAN
}

require_root() {
  [[ -f package.json ]] || {
    echo "Error: run $SCRIPT_NAME from the VERZUS repository root." >&2
    exit 1
  }

  local required=(
    scripts/verify-m12-12-7.mjs
    docs/milestones/M12/m12-eight-stage-plan.md
    docs/milestones/M12/m12-12-7-notification-settings-delivery-preferences.md
    src/features/search
    src/features/notifications
    src/features/activity
    'src/app/(platform)/search'
    'src/app/(platform)/notifications'
    'src/app/(platform)/activity'
  )

  local path
  for path in "${required[@]}"; do
    [[ -e "$path" ]] || {
      echo "Error: M12.7 prerequisite is missing: $path" >&2
      exit 1
    }
  done
}

already_installed() {
  [[ -f scripts/verify-m12-12-8.mjs ]] && \
    [[ -f docs/milestones/M12/m12-12-8-release-readiness.md ]] && \
    grep -q 'VERZUS M12.8' scripts/verify-m12-12-8.mjs
}

stage_files() {
  cat <<'EOF_STAGE_FILES'
docs/milestones/M12/m12-12-8-release-readiness.md
docs/milestones/M12/m12-release-readiness.json
docs/milestones/M12/m12-responsive-review.json
scripts/approve-m12-responsive-review.mjs
scripts/package-m12-release.mjs
scripts/run-m12-release-gate.mjs
scripts/verify-m12-12-8.mjs
scripts/verify-m12-release-artifact.mjs
tsconfig.m12-12-8.json
EOF_STAGE_FILES
}

modified_files() {
  cat <<'EOF_MODIFIED_FILES'
package.json
EOF_MODIFIED_FILES
}

assert_stage_ownership() {
  local file
  while IFS= read -r file; do
    [[ -e "$file" ]] || continue
    grep -q 'M12.8\|m12-12-8\|"stage": "12.8"' "$file" || {
      echo "Error: refusing to overwrite unowned file: $file" >&2
      exit 1
    }
  done < <(stage_files)
}

backup_current_state() {
  mkdir -p "$BACKUP_DIR"

  local files=()
  local file
  while IFS= read -r file; do
    [[ -e "$file" ]] && files+=("$file")
  done < <(modified_files)
  while IFS= read -r file; do
    [[ -e "$file" ]] && files+=("$file")
  done < <(stage_files)

  tar -czf "$ARCHIVE" "${files[@]}"

  cat > "$BACKUP_DIR/manifest.txt" <<EOF_MANIFEST
VERZUS M12.8 backup
Created: $(date -Iseconds)
Branch: $(git branch --show-current 2>/dev/null || echo unavailable)
Commit: $(git rev-parse HEAD 2>/dev/null || echo unavailable)
Archive: $ARCHIVE
Rollback: bash ./$SCRIPT_NAME rollback
Release artifacts under .verzus-artifacts are retained intentionally.
EOF_MANIFEST

  BACKUP_CREATED="true"
  echo "Rollback archive created: $ARCHIVE"
}

remove_stage_files() {
  local file
  while IFS= read -r file; do
    rm -f "$file"
  done < <(stage_files)
}

restore_archive() {
  local archive="$1"
  remove_stage_files
  tar -xzf "$archive"
}

on_error() {
  local code=$?
  if [[ "$MODE" == "install" && "$BACKUP_CREATED" == "true" && "$INSTALL_COMPLETE" != "true" ]]; then
    echo
    echo "M12.8 installation failed. Restoring the pre-install archive..."
    restore_archive "$ARCHIVE"
    echo "Restored: $ARCHIVE"
  fi
  exit "$code"
}
trap on_error ERR

write_stage_files() {
  mkdir -p docs/milestones/M12 scripts

  cat > docs/milestones/M12/m12-12-8-release-readiness.md <<'EOF_M12_8_DOC'
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
EOF_M12_8_DOC

  cat > docs/milestones/M12/m12-release-readiness.json <<'EOF_M12_8_RELEASE_JSON'
{
  "milestone": "M12",
  "stage": "12.8",
  "title": "Release readiness, responsive approval and immutable artifact evidence",
  "status": "release-candidate",
  "featureDomains": ["search", "notifications", "activity"],
  "independentResources": [
    "GET /api/search/players",
    "GET /api/search/crews",
    "GET /api/search/competitions",
    "GET /api/search/matches",
    "GET /api/notifications",
    "GET /api/notifications/unread-count",
    "PATCH /api/notifications/[notificationId]",
    "POST /api/notifications/read-all",
    "GET /api/notifications/settings",
    "PATCH /api/notifications/settings",
    "GET /api/activity"
  ],
  "qualityGate": {
    "focused": "npm run verify:m12:12.8",
    "full": "npm run release:gate:m12",
    "required": ["lint", "typecheck", "test", "build"],
    "optionalWhenPresent": ["test:e2e", "test:a11y", "test:visual"]
  },
  "artifact": {
    "root": ".verzus-artifacts/m12",
    "identity": "sha256",
    "requiresCleanWorktree": true,
    "requiresNextBuildId": true,
    "overwriteAllowed": false,
    "promoteSameDigest": true
  },
  "environments": ["local", "development", "preview", "staging", "production"],
  "rollback": {
    "installer": "bash ./script.sh rollback",
    "deployment": "redeploy previous retained digest without rebuilding",
    "retainFailedArtifact": true
  },
  "productionReady": false,
  "productionReadyWhen": [
    "responsive review approved",
    "full release gate passed",
    "artifact integrity verified",
    "preview approved",
    "same digest selected for promotion"
  ],
  "testsExecutedByInstaller": []
}
EOF_M12_8_RELEASE_JSON

  cat > docs/milestones/M12/m12-responsive-review.json <<'EOF_M12_8_REVIEW_JSON'
{
  "milestone": "M12",
  "stage": "12.8",
  "status": "review-required",
  "viewports": [360, 390, 430, 768, 1024, 1440],
  "routes": [
    {
      "name": "Search discovery",
      "path": "/search",
      "owner": "search"
    },
    {
      "name": "Search results and long content",
      "path": "/search?q=Prismo",
      "owner": "search"
    },
    {
      "name": "Search partial-domain failure",
      "path": "/search?q=Xenon&resource=players&scenario=error",
      "owner": "search"
    },
    {
      "name": "Notification centre",
      "path": "/notifications",
      "owner": "notifications"
    },
    {
      "name": "Unread notifications",
      "path": "/notifications?state=unread",
      "owner": "notifications"
    },
    {
      "name": "Notification settings",
      "path": "/notifications/settings",
      "owner": "notifications"
    },
    {
      "name": "Activity feed",
      "path": "/activity",
      "owner": "activity"
    },
    {
      "name": "Activity partial-page failure",
      "path": "/activity?scenario=partial",
      "owner": "activity"
    }
  ],
  "checks": [
    "no horizontal page overflow",
    "navigation remains usable",
    "primary action remains visible",
    "long names truncate or wrap intentionally",
    "missing artwork does not collapse layout",
    "loading does not cause layout collapse",
    "local error recovery does not hide healthy resources",
    "keyboard focus is visible",
    "touch targets remain operable",
    "mobile is not a compressed desktop table"
  ],
  "approvedBy": null,
  "approvedAt": null,
  "evidence": []
}
EOF_M12_8_REVIEW_JSON

  cat > scripts/approve-m12-responsive-review.mjs <<'EOF_M12_8_APPROVE'
// VERZUS M12.8 RESPONSIVE REVIEW APPROVAL

import fs from "node:fs";

const reviewPath = "docs/milestones/M12/m12-responsive-review.json";

function readArgument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const approvedBy = readArgument("--by")?.trim();
const evidence = readArgument("--evidence")?.trim();

if (!approvedBy) {
  console.error('Usage: npm run approve:m12:responsive -- --by "Reviewer name" [--evidence "URL or ticket"]');
  process.exit(1);
}

const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));

if (review.milestone !== "M12" || review.stage !== "12.8") {
  throw new Error("M12.8 responsive-review contract was not recognized.");
}

review.status = "approved";
review.approvedBy = approvedBy;
review.approvedAt = new Date().toISOString();
review.evidence = evidence
  ? Array.from(new Set([...(Array.isArray(review.evidence) ? review.evidence : []), evidence]))
  : Array.isArray(review.evidence)
    ? review.evidence
    : [];

fs.writeFileSync(reviewPath, `${JSON.stringify(review, null, 2)}\n`);
console.log(`M12 responsive review approved by ${approvedBy}.`);
EOF_M12_8_APPROVE

  cat > scripts/package-m12-release.mjs <<'EOF_M12_8_PACKAGE'
// VERZUS M12.8 CONTENT-ADDRESSED RELEASE EVIDENCE PACKAGE

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const artifactRoot = ".verzus-artifacts/m12";
const reviewPath = "docs/milestones/M12/m12-responsive-review.json";
const releaseContractPath = "docs/milestones/M12/m12-release-readiness.json";

const explicitFiles = [
  "package.json",
  "package-lock.json",
  "npm-shrinkwrap.json",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "tsconfig.json",
  "docs/milestones/M12/m12-eight-stage-plan.md",
  reviewPath,
  releaseContractPath,
];

const roots = [
  "src/features/search",
  "src/features/notifications",
  "src/features/activity",
  "src/lib/reliability",
  "src/components/feedback/resource-state",
  "src/app/api/search",
  "src/app/api/notifications",
  "src/app/api/activity",
  "src/app/(platform)/search",
  "src/app/(platform)/notifications",
  "src/app/(platform)/activity",
  "docs/milestones/M12",
];

const buildEvidenceFiles = [
  ".next/BUILD_ID",
  ".next/routes-manifest.json",
  ".next/prerender-manifest.json",
  ".next/required-server-files.json",
  ".next/server/middleware-manifest.json",
];

function normalize(value) {
  return value.split(path.sep).join("/");
}

function hashBuffer(value) {
  return createHash("sha256").update(value).digest("hex");
}

function walk(target) {
  if (!fs.existsSync(target)) return [];
  const stat = fs.statSync(target);
  if (stat.isFile()) return [normalize(target)];
  if (!stat.isDirectory()) return [];

  return fs
    .readdirSync(target, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => walk(path.join(target, entry.name)));
}

function gitOutput(args, fallback) {
  try {
    return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return fallback;
  }
}

const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
if (review.status !== "approved" || !review.approvedBy || !review.approvedAt) {
  throw new Error(
    'Responsive review is not approved. Run: npm run approve:m12:responsive -- --by "Reviewer name"',
  );
}

if (!fs.existsSync(".next/BUILD_ID")) {
  throw new Error("Next.js BUILD_ID is missing. Run npm run build before packaging M12.");
}

const dirtyOutput = gitOutput(["status", "--porcelain"], "git-unavailable");
const dirty = dirtyOutput.length > 0;
if (dirty && process.env.VERZUS_ALLOW_DIRTY_RELEASE !== "1") {
  throw new Error(
    "Refusing to package an uncommitted release. Commit the release candidate or set VERZUS_ALLOW_DIRTY_RELEASE=1 for local diagnostics only.",
  );
}

const scriptFiles = fs.existsSync("scripts")
  ? fs
      .readdirSync("scripts")
      .filter((name) => /^verify-m12-12-[1-8]\.mjs$/.test(name))
      .map((name) => `scripts/${name}`)
  : [];
const configFiles = fs
  .readdirSync(".")
  .filter((name) => /^tsconfig\.m12-12-[1-8]\.json$/.test(name));

const sourceFiles = Array.from(
  new Set([
    ...explicitFiles.filter((file) => fs.existsSync(file)),
    ...roots.flatMap(walk),
    ...scriptFiles,
    ...configFiles,
  ]),
).sort();

if (sourceFiles.length === 0) {
  throw new Error("No M12 release inputs were found.");
}

const files = sourceFiles.map((file) => {
  const content = fs.readFileSync(file);
  return {
    path: file,
    sha256: hashBuffer(content),
    size: content.byteLength,
  };
});

const gitCommit = gitOutput(["rev-parse", "HEAD"], "unavailable");
const branch = gitOutput(["branch", "--show-current"], "unavailable");
const buildId = fs.readFileSync(".next/BUILD_ID", "utf8").trim();
const identity = {
  schemaVersion: 1,
  milestone: "M12",
  stage: "12.8",
  gitCommit,
  buildId,
  files,
};
const digest = hashBuffer(Buffer.from(JSON.stringify(identity)));
const artifactDir = path.join(artifactRoot, digest);
const manifestPath = path.join(artifactDir, "manifest.json");

if (fs.existsSync(artifactDir)) {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Artifact directory already exists without a manifest: ${artifactDir}`);
  }
  const existing = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (existing.digest !== digest) {
    throw new Error(`Refusing to overwrite immutable artifact directory: ${artifactDir}`);
  }
  console.log(`M12 artifact already exists: ${digest}`);
  process.exit(0);
}

for (const file of sourceFiles) {
  const destination = path.join(artifactDir, "inputs", file);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(file, destination);
}

const copiedBuildEvidence = [];
for (const file of buildEvidenceFiles) {
  if (!fs.existsSync(file)) continue;
  const destination = path.join(artifactDir, "build", file.replace(/^\.next\//, ""));
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(file, destination);
  const content = fs.readFileSync(file);
  copiedBuildEvidence.push({
    path: file,
    sha256: hashBuffer(content),
    size: content.byteLength,
  });
}

const manifest = {
  ...identity,
  digest,
  artifactType: "m12-release-evidence",
  createdAt: new Date().toISOString(),
  branch,
  dirty,
  dirtyOverride: process.env.VERZUS_ALLOW_DIRTY_RELEASE === "1",
  responsiveApproval: {
    status: review.status,
    approvedBy: review.approvedBy,
    approvedAt: review.approvedAt,
    evidence: review.evidence,
  },
  buildEvidence: copiedBuildEvidence,
  promotion: {
    environments: ["preview", "staging", "production"],
    rule: "promote-the-same-digest-without-rebuilding",
  },
  rollback: {
    rule: "redeploy-the-previous-retained-digest",
    retainFailedArtifact: true,
  },
};

fs.mkdirSync(artifactDir, { recursive: true });
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
fs.mkdirSync(artifactRoot, { recursive: true });
fs.writeFileSync(
  path.join(artifactRoot, "latest.json"),
  `${JSON.stringify({ milestone: "M12", digest, manifest: normalize(manifestPath) }, null, 2)}\n`,
);

console.log(`M12 immutable artifact evidence created: ${digest}`);
console.log(`Manifest: ${normalize(manifestPath)}`);
EOF_M12_8_PACKAGE

  cat > scripts/verify-m12-release-artifact.mjs <<'EOF_M12_8_ARTIFACT_VERIFY'
// VERZUS M12.8 RELEASE ARTIFACT INTEGRITY VERIFIER

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const artifactRoot = ".verzus-artifacts/m12";
const latestPath = path.join(artifactRoot, "latest.json");

function normalize(value) {
  return value.split(path.sep).join("/");
}

function hashBuffer(value) {
  return createHash("sha256").update(value).digest("hex");
}

function walk(target) {
  if (!fs.existsSync(target)) return [];
  const stat = fs.statSync(target);
  if (stat.isFile()) return [normalize(target)];
  if (!stat.isDirectory()) return [];
  return fs
    .readdirSync(target, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => walk(path.join(target, entry.name)));
}

if (!fs.existsSync(latestPath)) {
  throw new Error("M12 latest artifact pointer is missing. Run npm run package:m12:release.");
}

const latest = JSON.parse(fs.readFileSync(latestPath, "utf8"));
const artifactDir = path.join(artifactRoot, latest.digest);
const manifestPath = path.join(artifactDir, "manifest.json");
if (!fs.existsSync(manifestPath)) {
  throw new Error(`M12 artifact manifest is missing: ${manifestPath}`);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (manifest.digest !== latest.digest || path.basename(artifactDir) !== manifest.digest) {
  throw new Error("M12 artifact pointer, directory and manifest digests disagree.");
}

const identity = {
  schemaVersion: manifest.schemaVersion,
  milestone: manifest.milestone,
  stage: manifest.stage,
  gitCommit: manifest.gitCommit,
  buildId: manifest.buildId,
  files: manifest.files,
};
const computedDigest = hashBuffer(Buffer.from(JSON.stringify(identity)));
if (computedDigest !== manifest.digest) {
  throw new Error("M12 aggregate artifact digest is invalid.");
}

const expectedInputPaths = new Set();
for (const file of manifest.files) {
  const packagedPath = path.join(artifactDir, "inputs", file.path);
  expectedInputPaths.add(normalize(packagedPath));
  if (!fs.existsSync(packagedPath)) {
    throw new Error(`Packaged M12 input is missing: ${file.path}`);
  }
  const packaged = fs.readFileSync(packagedPath);
  if (packaged.byteLength !== file.size || hashBuffer(packaged) !== file.sha256) {
    throw new Error(`Packaged M12 input failed integrity verification: ${file.path}`);
  }
  if (!fs.existsSync(file.path)) {
    throw new Error(`Current source input is missing after packaging: ${file.path}`);
  }
  const current = fs.readFileSync(file.path);
  if (hashBuffer(current) !== file.sha256) {
    throw new Error(`Current source drifted after M12 packaging: ${file.path}`);
  }
}

const actualInputPaths = walk(path.join(artifactDir, "inputs"));
for (const inputPath of actualInputPaths) {
  if (!expectedInputPaths.has(inputPath)) {
    throw new Error(`Unlisted file exists inside immutable M12 inputs: ${inputPath}`);
  }
}

const packagedBuildIdPath = path.join(artifactDir, "build", "BUILD_ID");
if (!fs.existsSync(packagedBuildIdPath)) {
  throw new Error("Packaged Next.js BUILD_ID evidence is missing.");
}
if (fs.readFileSync(packagedBuildIdPath, "utf8").trim() !== manifest.buildId) {
  throw new Error("Packaged Next.js BUILD_ID does not match the M12 manifest.");
}

if (manifest.responsiveApproval?.status !== "approved") {
  throw new Error("M12 artifact does not contain an approved responsive review.");
}
if (manifest.promotion?.rule !== "promote-the-same-digest-without-rebuilding") {
  throw new Error("M12 same-artifact promotion rule is missing.");
}

console.log(`M12 artifact integrity verified: ${manifest.digest}`);
EOF_M12_8_ARTIFACT_VERIFY

  cat > scripts/run-m12-release-gate.mjs <<'EOF_M12_8_GATE'
// VERZUS M12.8 FULL RELEASE GATE

import { spawnSync } from "node:child_process";
import fs from "node:fs";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const scripts = packageJson.scripts ?? {};
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function run(scriptName) {
  if (!scripts[scriptName]) {
    throw new Error(`Required package script is missing: ${scriptName}`);
  }
  console.log(`\n[M12 release gate] npm run ${scriptName}`);
  const result = spawnSync(npmCommand, ["run", scriptName], { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

for (const required of ["verify:m12:12.8", "lint", "typecheck", "test", "build"]) {
  run(required);
}

for (const optional of ["test:e2e", "test:a11y", "test:visual"]) {
  if (scripts[optional]) run(optional);
}

run("package:m12:release");
run("verify:m12:artifact");
console.log("\nM12 full release gate passed.");
EOF_M12_8_GATE

  cat > scripts/verify-m12-12-8.mjs <<'EOF_M12_8_VERIFY'
// VERZUS M12.8 STRUCTURAL VERIFIER

import fs from "node:fs";

const requiredFiles = [
  "docs/milestones/M12/m12-12-8-release-readiness.md",
  "docs/milestones/M12/m12-release-readiness.json",
  "docs/milestones/M12/m12-responsive-review.json",
  "scripts/approve-m12-responsive-review.mjs",
  "scripts/package-m12-release.mjs",
  "scripts/run-m12-release-gate.mjs",
  "scripts/verify-m12-release-artifact.mjs",
  "tsconfig.m12-12-8.json",
];

for (let stage = 1; stage <= 7; stage += 1) {
  requiredFiles.push(`scripts/verify-m12-12-${stage}.mjs`);
}

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`M12.8 missing required file: ${file}`);
}

const plan = fs.readFileSync("docs/milestones/M12/m12-eight-stage-plan.md", "utf8");
for (const marker of ["M12.8", "Release readiness", "immutable packaging", "rollback"]) {
  if (!plan.toLowerCase().includes(marker.toLowerCase())) {
    throw new Error(`M12 eight-stage plan marker missing: ${marker}`);
  }
}

const release = JSON.parse(
  fs.readFileSync("docs/milestones/M12/m12-release-readiness.json", "utf8"),
);
if (release.milestone !== "M12" || release.stage !== "12.8") {
  throw new Error("M12.8 release-readiness contract is invalid.");
}
if (release.productionReady !== false) {
  throw new Error("M12.8 must not claim production readiness before the full gate and preview approval.");
}
if (release.artifact?.identity !== "sha256" || release.artifact?.promoteSameDigest !== true) {
  throw new Error("M12.8 immutable same-digest promotion contract is incomplete.");
}
for (const command of ["lint", "typecheck", "test", "build"]) {
  if (!release.qualityGate?.required?.includes(command)) {
    throw new Error(`M12.8 full quality gate is missing: ${command}`);
  }
}

const review = JSON.parse(
  fs.readFileSync("docs/milestones/M12/m12-responsive-review.json", "utf8"),
);
const requiredWidths = [360, 390, 430, 768, 1024, 1440];
if (JSON.stringify(review.viewports) !== JSON.stringify(requiredWidths)) {
  throw new Error("M12.8 responsive review does not contain the required viewport matrix.");
}
if (!["review-required", "approved"].includes(review.status)) {
  throw new Error("M12.8 responsive review has an invalid status.");
}
if (review.status === "approved" && (!review.approvedBy || !review.approvedAt)) {
  throw new Error("M12.8 responsive approval is missing reviewer metadata.");
}
for (const route of ["/search", "/notifications", "/notifications/settings", "/activity"]) {
  if (!review.routes?.some((entry) => entry.path === route)) {
    throw new Error(`M12.8 responsive route is missing: ${route}`);
  }
}

const packager = fs.readFileSync("scripts/package-m12-release.mjs", "utf8");
for (const marker of [
  ".verzus-artifacts/m12",
  ".next/BUILD_ID",
  "sha256",
  "promote-the-same-digest-without-rebuilding",
  "VERZUS_ALLOW_DIRTY_RELEASE",
]) {
  if (!packager.includes(marker)) throw new Error(`M12.8 packager marker missing: ${marker}`);
}

const artifactVerifier = fs.readFileSync("scripts/verify-m12-release-artifact.mjs", "utf8");
for (const marker of ["Current source drifted", "BUILD_ID", "aggregate artifact digest"]) {
  if (!artifactVerifier.includes(marker)) {
    throw new Error(`M12.8 artifact-verifier marker missing: ${marker}`);
  }
}

const gate = fs.readFileSync("scripts/run-m12-release-gate.mjs", "utf8");
for (const marker of [
  '"verify:m12:12.8"',
  '"lint"',
  '"typecheck"',
  '"test"',
  '"build"',
  '"package:m12:release"',
  '"verify:m12:artifact"',
]) {
  if (!gate.includes(marker)) throw new Error(`M12.8 release-gate marker missing: ${marker}`);
}

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
for (const name of [
  "typecheck:m12:12.8",
  "verify:m12:12.8",
  "approve:m12:responsive",
  "package:m12:release",
  "verify:m12:artifact",
  "release:gate:m12",
]) {
  if (!packageJson.scripts?.[name]) throw new Error(`M12.8 package script missing: ${name}`);
}

if (fs.existsSync("src/app/api/search-dashboard")) {
  throw new Error("M12.8 found a forbidden combined Search dashboard endpoint.");
}

console.log(
  "M12.8 responsive approval, full quality gate, content-addressed artifact evidence and rollback contract are installed.",
);
EOF_M12_8_VERIFY

  cat > tsconfig.m12-12-8.json <<'EOF_M12_8_TSCONFIG'
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "noEmit": true },
  "include": [
    "next-env.d.ts",
    "src/lib/reliability/**/*.ts",
    "src/components/feedback/resource-state/**/*.ts",
    "src/components/feedback/resource-state/**/*.tsx",
    "src/features/search/**/*.ts",
    "src/features/search/**/*.tsx",
    "src/features/notifications/**/*.ts",
    "src/features/notifications/**/*.tsx",
    "src/features/activity/**/*.ts",
    "src/features/activity/**/*.tsx",
    "src/app/api/search/**/*.ts",
    "src/app/api/notifications/**/*.ts",
    "src/app/api/activity/**/*.ts",
    "src/app/(platform)/search/**/*.ts",
    "src/app/(platform)/search/**/*.tsx",
    "src/app/(platform)/notifications/**/*.ts",
    "src/app/(platform)/notifications/**/*.tsx",
    "src/app/(platform)/activity/**/*.ts",
    "src/app/(platform)/activity/**/*.tsx"
  ],
  "exclude": ["node_modules", ".verzus-artifacts"]
}
EOF_M12_8_TSCONFIG
}

patch_package_json() {
  node <<'EOF_M12_8_PACKAGE_PATCH'
const fs = require("node:fs");

const packagePath = "package.json";
const pkg = JSON.parse(fs.readFileSync(packagePath, "utf8"));
pkg.scripts = pkg.scripts || {};
pkg.scripts["typecheck:m12:12.8"] = "tsc --noEmit -p tsconfig.m12-12-8.json";
pkg.scripts["verify:m12:12.8"] = "node scripts/verify-m12-12-7.mjs && node scripts/verify-m12-12-8.mjs && eslint scripts/approve-m12-responsive-review.mjs scripts/package-m12-release.mjs scripts/run-m12-release-gate.mjs scripts/verify-m12-12-8.mjs scripts/verify-m12-release-artifact.mjs --max-warnings=0 && npm run typecheck:m12:12.8";
pkg.scripts["approve:m12:responsive"] = "node scripts/approve-m12-responsive-review.mjs";
pkg.scripts["package:m12:release"] = "node scripts/package-m12-release.mjs";
pkg.scripts["verify:m12:artifact"] = "node scripts/verify-m12-release-artifact.mjs";
pkg.scripts["release:gate:m12"] = "node scripts/run-m12-release-gate.mjs";
fs.writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);
EOF_M12_8_PACKAGE_PATCH
}

run_verification() {
  echo "Running focused M12.8 verification..."
  npm run verify:m12:12.8
}

install_stage() {
  print_plan
  require_root

  echo "Running repaired M12.7 prerequisite verification..."
  npm run verify:m12:12.7

  if already_installed; then
    echo "M12.8 already appears to be installed. Running its focused verifier instead."
    run_verification
    INSTALL_COMPLETE="true"
    return
  fi

  assert_stage_ownership
  backup_current_state
  write_stage_files
  patch_package_json
  run_verification
  INSTALL_COMPLETE="true"

  cat <<'DONE'

M12.8 release-candidate installation complete.

Preview:
  npm run m12:preview

Review widths:
  360, 390, 430, 768, 1024, 1440

Review routes:
  http://127.0.0.1:3124/search
  http://127.0.0.1:3124/search?q=Prismo
  http://127.0.0.1:3124/search?q=Xenon&resource=players&scenario=error
  http://127.0.0.1:3124/notifications
  http://127.0.0.1:3124/notifications?state=unread
  http://127.0.0.1:3124/notifications/settings
  http://127.0.0.1:3124/activity
  http://127.0.0.1:3124/activity?scenario=partial

Record responsive approval only after manual review:
  npm run approve:m12:responsive -- --by "Reviewer name"

Run the full release gate after approval and commit:
  npm run release:gate:m12

Focused verification only:
  npm run verify:m12:12.8

Rollback installer changes:
  bash ./script.sh rollback

M12 is not production-ready merely because installation passed. Production promotion still requires the
responsive approval, full release gate, immutable digest retention and preview approval.
DONE
}

rollback_stage() {
  require_root
  local latest
  latest="$(find "$BACKUP_ROOT" -mindepth 2 -maxdepth 2 -type f -name 'verzus-m12-12-8-before.tar.gz' 2>/dev/null | sort | tail -n 1)"
  if [[ -z "$latest" ]]; then
    echo "Error: no M12.8 rollback archive was found." >&2
    exit 1
  fi
  restore_archive "$latest"
  echo "M12.8 rollback complete: $latest"
  echo "Retained release evidence under .verzus-artifacts was not deleted."
  echo "Run: npm run verify:m12:12.7"
}

case "$MODE" in
  install)
    install_stage
    ;;
  verify)
    require_root
    run_verification
    ;;
  rollback)
    rollback_stage
    ;;
  *)
    echo "Usage: bash ./$SCRIPT_NAME [install|verify|rollback]" >&2
    exit 1
    ;;
esac
