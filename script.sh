#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-install}"
SCRIPT_NAME="VERZUS_M6_6_7_Competition_Testing_Observability_Release.sh"
BACKUP_ROOT=".verzus-backups/m6-6-7-testing-observability-release"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="${BACKUP_ROOT}/${STAMP}"
ARCHIVE="${BACKUP_DIR}/verzus-m6-6-7-before.tar.gz"
PAYLOAD_FILE="${TMPDIR:-/tmp}/verzus-m6-6-7-payload-${STAMP}.tar.gz"

print_plan() {
  cat <<'PLAN'
VERZUS M6.7 - Competition Testing, Observability and Release

KEEP
  - Approved M6.1 discovery composition and original competition artwork
  - M6.2 search, filters, sorting, pagination and URL state
  - M6.3 Zod contracts, adapters, query resources and independent APIs
  - M6.4 details, rules, participants and bracket resources
  - M6.5 server-authoritative, idempotent and refresh-persistent entry
  - M6.6 lifecycle policy, edge states and guarded entry mutation
  - Existing App Shell, navigation, authentication and retro-competitive tokens

REUSE
  - Existing M6 unit and component tests through the repository test suite
  - Existing M6 preview server on port 3118
  - Existing request-ID, structured-error and failure-injection conventions
  - Existing lint, typecheck, test, build and Playwright tooling
  - Existing immutable release SHA and application environment variables

REPLACE
  - Competition detail stage marker from M6.6 to M6.7
  - Informal milestone completion with an executable technical and approval gate
  - Untraceable preview output with release, health and checksum evidence

DELETE
  - No approved screen composition
  - No competition API, entry persistence or lifecycle policy
  - No shared primitive, shell route, navigation or artwork
  - No historical test or release evidence

CREATE
  - Competition feature flag and controlled degradation boundary
  - Allowlisted client telemetry and structured server ingestion
  - Competition health endpoint with stage, environment and release metadata
  - Unit, integration, E2E, accessibility and failure-injection coverage
  - Visual regression baselines at 390px, 768px and 1440px
  - Explicit visual approval manifest and review hub
  - Full M6 completion verifier and immutable artifact packager
  - Rollback runbook and timestamped pre-install archive
PLAN
}

require_repo_root() {
  [[ -f package.json && -d src/app && -d src/features ]] || {
    echo "Error: run $SCRIPT_NAME from the VERZUS repository root."
    exit 1
  }
}

require_repo() {
  require_repo_root

  local required=(
    package.json
    .env.example
    src/app/layout.tsx
    'src/app/(platform)/compete/page.tsx'
    'src/app/(platform)/compete/[competitionId]/page.tsx'
    src/features/competitions/index.ts
    src/features/competitions/details/ui/CompetitionDetailScreen.tsx
    src/features/competitions/lifecycle/model/competition-lifecycle.types.ts
    src/features/competitions/lifecycle/server/competition-entry-lifecycle.guard.ts
    'src/app/api/competitions/[competitionId]/lifecycle/route.ts'
    'src/app/api/competitions/[competitionId]/entry/route.ts'
    scripts/verify-m6-6-6.mjs
  )

  local file
  for file in "${required[@]}"; do
    [[ -f "$file" ]] || {
      echo "Error: missing M6.6 prerequisite: $file"
      echo "Apply and verify M6.6 before running M6.7."
      exit 1
    }
  done

  grep -q 'data-theme="retro-competitive"' src/app/layout.tsx || {
    echo "Error: the approved retro-competitive theme is not active."
    exit 1
  }

  grep -Eq 'data-m6-stage="6\.(6|7)"' \
    src/features/competitions/details/ui/CompetitionDetailScreen.tsx || {
      echo "Error: M6.7 requires the M6.6 competition detail screen."
      exit 1
    }

  if [[ -f 'src/app/(platform)/compete/layout.tsx' ]] && \
    ! grep -q 'VERZUS M6.7 COMPETITION RELEASE GATE' \
      'src/app/(platform)/compete/layout.tsx'; then
    echo "Error: refusing to overwrite an unowned /compete layout."
    echo "Wrap that layout manually with CompetitionFeatureGate, then rerun."
    exit 1
  fi

  if [[ -d src/features/competitions/release ]] && \
    ! grep -q 'VERZUS M6.7 COMPETITION RELEASE GATE' \
      src/features/competitions/release/competition-release.config.ts 2>/dev/null; then
    echo "Error: refusing to overwrite an unowned competitions/release domain."
    exit 1
  fi

  if [[ -d src/features/competitions/telemetry ]] && \
    ! grep -q 'VERZUS M6.7 COMPETITION TELEMETRY' \
      src/features/competitions/telemetry/competition-telemetry.schema.ts 2>/dev/null; then
    echo "Error: refusing to overwrite an unowned competitions/telemetry domain."
    exit 1
  fi

  if [[ "${VERZUS_SKIP_M6_PREREQ_VERIFY:-0}" != "1" ]] && \
    grep -q 'data-m6-stage="6.6"' \
      src/features/competitions/details/ui/CompetitionDetailScreen.tsx; then
    echo "Running M6.6 prerequisite marker verification..."
    node scripts/verify-m6-6-6.mjs
  fi
}

backup_current_state() {
  mkdir -p "$BACKUP_DIR"

  local paths=(
    package.json
    .env.example
    src/features/competitions/index.ts
    src/features/competitions/details/ui/CompetitionDetailScreen.tsx
    docs/milestones/M6
    scripts/verify-m6-6-6.mjs
  )

  local optional=(
    'src/app/(platform)/compete/layout.tsx'
    'src/app/(preview)/m6-competition-review'
    'src/app/api/telemetry/competitions'
    'src/app/api/health/competitions'
    src/features/competitions/release
    src/features/competitions/telemetry
    tests/e2e/m6
    tests/visual/m6-competitions.visual.spec.ts
    tests/visual/m6-competitions.visual.spec.ts-snapshots
    tests/integration/m6-competition-release.integration.test.ts
    playwright.m6.config.ts
    docs/runbooks/m6-competition-rollback.md
    scripts/approve-m6-visuals.mjs
    scripts/package-m6-release.mjs
    scripts/verify-m6-6-7.mjs
    reports/m6-verification.json
  )

  local candidate
  for candidate in "${optional[@]}"; do
    [[ -e "$candidate" ]] && paths+=("$candidate")
  done

  tar -czf "$ARCHIVE" "${paths[@]}"

  cat > "$BACKUP_DIR/manifest.txt" <<MANIFEST
VERZUS M6.7 backup
Created: $(date -Iseconds)
Branch: $(git branch --show-current 2>/dev/null || echo unavailable)
Commit: $(git rev-parse HEAD 2>/dev/null || echo unavailable)
Archive: $ARCHIVE
Rollback: bash ./$SCRIPT_NAME rollback
MANIFEST

  echo "Rollback archive created: $ARCHIVE"
}

extract_payload() {
  cat > "${PAYLOAD_FILE}.b64" <<'PAYLOAD'
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
RSpSkYpUpCIVqUhFKlKRivQbT/8DkUu38wAYAQA=
PAYLOAD

  base64 --decode "${PAYLOAD_FILE}.b64" > "$PAYLOAD_FILE"
  tar -xzf "$PAYLOAD_FILE"
  rm -f "$PAYLOAD_FILE" "${PAYLOAD_FILE}.b64"
}

patch_repository() {
  node <<'NODE'
const fs = require("node:fs");
const path = require("node:path");

const read = (file) => fs.readFileSync(file, "utf8");
const write = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value.endsWith("\n") ? value : `${value}\n`, "utf8");
};

const layoutFile = "src/app/(platform)/compete/layout.tsx";
if (!fs.existsSync(layoutFile)) {
  write(
    layoutFile,
    `// VERZUS M6.7 COMPETITION RELEASE GATE

import type { ReactNode } from "react";

import { CompetitionFeatureGate } from "@/features/competitions/release";

export default function CompeteLayout({ children }: { children: ReactNode }) {
  return <CompetitionFeatureGate>{children}</CompetitionFeatureGate>;
}
`,
  );
}

const detailFile =
  "src/features/competitions/details/ui/CompetitionDetailScreen.tsx";
let detail = read(detailFile);
if (detail.includes('data-m6-stage="6.6"')) {
  detail = detail.replace('data-m6-stage="6.6"', 'data-m6-stage="6.7"');
}
if (!detail.includes('data-m6-stage="6.7"')) {
  throw new Error("CompetitionDetailScreen is missing the expected M6 stage marker.");
}
write(detailFile, detail);

const featureIndex = "src/features/competitions/index.ts";
let featureSource = read(featureIndex);
for (const line of ['export * from "./release";', 'export * from "./telemetry";']) {
  if (!featureSource.includes(line)) featureSource += `\n${line}`;
}
write(featureIndex, featureSource);

const envFile = ".env.example";
let env = fs.existsSync(envFile) ? read(envFile) : "";
if (!/^NEXT_PUBLIC_ENABLE_M6_COMPETITIONS=/m.test(env)) {
  env += `${env.endsWith("\n") || env.length === 0 ? "" : "\n"}NEXT_PUBLIC_ENABLE_M6_COMPETITIONS=true\n`;
}
write(envFile, env);

const approvalFile = "docs/milestones/M6/m6-reference-approval.json";
if (!fs.existsSync(approvalFile)) {
  write(
    approvalFile,
    `${JSON.stringify(
      {
        marker: "VERZUS M6.7 VISUAL APPROVAL",
        status: "pending",
        requiredViewports: [390, 768, 1440],
        requiredScenarios: [
          "discovery-normal",
          "discovery-empty",
          "detail-normal",
          "entry-closed",
          "waitlist",
          "partial-failure",
          "offline",
          "maintenance",
        ],
        approvedAt: null,
        approvedBy: null,
      },
      null,
      2,
    )}\n`,
  );
}

const packageFile = "package.json";
const packageJson = JSON.parse(read(packageFile));
packageJson.scripts ??= {};
const scripts = {
  "test:m6:6.7:unit":
    "vitest run src/features/competitions/release/competition-release.config.test.ts src/features/competitions/telemetry/competition-telemetry.schema.test.ts tests/integration/m6-competition-release.integration.test.ts",
  "test:m6:6.7:e2e":
    "playwright test --config=playwright.m6.config.ts tests/e2e/m6",
  "test:m6:6.7:visual":
    "playwright test --config=playwright.m6.config.ts tests/visual/m6-competitions.visual.spec.ts",
  "m6:visual:update":
    "playwright test --config=playwright.m6.config.ts tests/visual/m6-competitions.visual.spec.ts --update-snapshots",
  "m6:approve": "node scripts/approve-m6-visuals.mjs",
  "verify:m6:6.7:technical":
    "node scripts/verify-m6-6-7.mjs --technical-only && eslint src/features/competitions src/app/api/competitions src/app/api/telemetry/competitions src/app/api/health/competitions 'src/app/(platform)/compete' 'src/app/(preview)/m6-competition-review' tests/e2e/m6 tests/integration/m6-competition-release.integration.test.ts tests/visual/m6-competitions.visual.spec.ts playwright.m6.config.ts --max-warnings=0 && npm run test:m6:6.7:unit && npm run typecheck && npm run test:m6:6.7:e2e",
  "verify:m6:6.7":
    "node scripts/verify-m6-6-7.mjs && npm run lint && npm run typecheck && npm run test && npm run build && npm run test:m6:6.7:e2e && npm run test:m6:6.7:visual",
  "m6:artifact": "node scripts/package-m6-release.mjs",
  "m6:release": "npm run verify:m6:6.7 && npm run m6:artifact",
};
for (const [name, command] of Object.entries(scripts)) {
  packageJson.scripts[name] = command;
}
write(packageFile, `${JSON.stringify(packageJson, null, 2)}\n`);
NODE
}

format_changed_files() {
  if [[ "${VERZUS_SKIP_FORMAT:-0}" == "1" ]]; then
    echo "Skipping Prettier because VERZUS_SKIP_FORMAT=1."
    return
  fi

  npx prettier --write \
    package.json \
    'src/app/(platform)/compete/layout.tsx' \
    'src/app/(preview)/m6-competition-review' \
    src/app/api/telemetry/competitions \
    src/app/api/health/competitions \
    src/features/competitions/release \
    src/features/competitions/telemetry \
    src/features/competitions/index.ts \
    src/features/competitions/details/ui/CompetitionDetailScreen.tsx \
    tests/e2e/m6 \
    tests/integration/m6-competition-release.integration.test.ts \
    tests/visual/m6-competitions.visual.spec.ts \
    playwright.m6.config.ts \
    docs/milestones/M6/m6-6-7-testing-observability-release.md \
    docs/milestones/M6/m6-reference-approval.json \
    docs/runbooks/m6-competition-rollback.md \
    scripts/approve-m6-visuals.mjs \
    scripts/package-m6-release.mjs \
    scripts/verify-m6-6-7.mjs
}

install_stage() {
  print_plan
  echo
  require_repo
  backup_current_state
  extract_payload
  patch_repository
  format_changed_files

  echo
  echo "Running lightweight M6.7 marker verification..."
  node scripts/verify-m6-6-7.mjs --technical-only --markers-only

  echo
  echo "M6.7 release-gate assets installed."
  echo "Review hub: http://127.0.0.1:3118/m6-competition-review"
  echo "Technical gate: npm run verify:m6:6.7:technical"
  echo "Visual baseline: npm run m6:visual:update"
  echo "Full gate: npm run verify:m6:6.7"
  echo "Immutable release: npm run m6:release"
  echo "Rollback archive: $ARCHIVE"
  echo
  echo "Install mode does not run the full repository suite or approve visuals."
}

baseline_stage() {
  require_repo
  npm run m6:visual:update
}

approve_stage() {
  require_repo
  npm run m6:approve
}

technical_stage() {
  require_repo
  npm run verify:m6:6.7:technical
}

verify_stage() {
  require_repo
  npm run verify:m6:6.7
}

release_stage() {
  require_repo
  npm run m6:release
}

preview_stage() {
  require_repo
  echo "Starting M6 review at http://127.0.0.1:3118/m6-competition-review"
  npm run m6:preview
}

rollback_stage() {
  require_repo_root

  local latest
  latest="$(find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | sort | tail -n 1)"
  [[ -n "$latest" ]] || {
    echo "Error: no M6.7 backup found."
    exit 1
  }

  local archive="$latest/verzus-m6-6-7-before.tar.gz"
  [[ -f "$archive" ]] || {
    echo "Error: backup archive missing: $archive"
    exit 1
  }

  rm -rf \
    src/features/competitions/release \
    src/features/competitions/telemetry \
    'src/app/api/telemetry/competitions' \
    'src/app/api/health/competitions' \
    'src/app/(preview)/m6-competition-review' \
    tests/e2e/m6 \
    tests/visual/m6-competitions.visual.spec.ts-snapshots

  rm -f \
    'src/app/(platform)/compete/layout.tsx' \
    tests/visual/m6-competitions.visual.spec.ts \
    tests/integration/m6-competition-release.integration.test.ts \
    playwright.m6.config.ts \
    docs/milestones/M6/m6-6-7-testing-observability-release.md \
    docs/milestones/M6/m6-reference-approval.json \
    docs/runbooks/m6-competition-rollback.md \
    scripts/approve-m6-visuals.mjs \
    scripts/package-m6-release.mjs \
    scripts/verify-m6-6-7.mjs \
    reports/m6-verification.json

  tar -xzf "$archive"
  echo "M6.7 rollback completed from: $archive"
  echo "Retained release artifacts under artifacts/m6-competitions for auditability."
}

case "$MODE" in
  install)
    install_stage
    ;;
  baseline)
    baseline_stage
    ;;
  approve)
    approve_stage
    ;;
  technical)
    technical_stage
    ;;
  verify)
    verify_stage
    ;;
  release)
    release_stage
    ;;
  preview)
    preview_stage
    ;;
  all)
    install_stage
    technical_stage
    ;;
  rollback)
    rollback_stage
    ;;
  *)
    echo "Unknown mode: $MODE"
    echo "Valid modes: install, baseline, approve, technical, verify, release, preview, all, rollback"
    exit 1
    ;;
esac

echo
echo "Completed mode: $MODE"
