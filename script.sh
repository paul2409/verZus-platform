#!/usr/bin/env bash
set -Eeuo pipefail

MODE="${1:-install}"
SCRIPT_NAME="VERZUS_M10_10_8_Release_Readiness_Feature_Isolation_Packaging_NO_TESTS.sh"
BACKUP_ROOT=".verzus-backups/m10-10-8-release-readiness-feature-isolation-packaging"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="${BACKUP_ROOT}/${STAMP}"
ARCHIVE="${BACKUP_DIR}/verzus-m10-10-8-before.tar.gz"
PAYLOAD_SHA256="922d24df023255fe949bb3d8ccfccecef35612eeb3c08f72e4cf5c6328d21523"
BACKUP_CREATED="false"
INSTALL_COMPLETE="false"
TEMP_PAYLOAD=""

print_plan() {
  cat <<'PLAN'
VERZUS M10.8 - Release Readiness, Feature Isolation and Immutable Packaging

KEEP
  - M10.1 approved 390px Rewards hierarchy and original artwork
  - M10.2 complete reward inventory and all reward lifecycle presentations
  - M10.3 independent Zod-validated APIs, adapters and query caches
  - M10.4 server-authoritative idempotent reward claiming
  - M10.5 season progression, objectives, milestones and reward path
  - M10.6 achievement detail and auditable reward history
  - M10.7 widget isolation, controlled edge states, health and telemetry
  - Existing shell, navigation, request IDs, backup and rollback conventions

REUSE
  - Existing Rewards routes, resources, claim ledger and audit references
  - Existing application environment and release SHA values
  - Existing Next.js standalone build configuration
  - Existing M10 preview port 3122 and failure-injection routes
  - Existing Zod, TanStack Query, CSS Module and telemetry patterns

REPLACE
  - Ungated Rewards content with domain-level feature isolation
  - Informal final review with one deterministic M10 review hub
  - Unrecorded visual sign-off with an explicit approval manifest
  - Manual source copying with checksum-addressed immutable packaging

DELETE
  - No M10.1-M10.7 reward, progression, claim, history or reliability behavior
  - No browser-authoritative reward granting
  - No combined Rewards dashboard endpoint
  - No Vitest execution during installation
  - No Playwright execution during installation
  - No automatic production promotion without explicit visual approval

CREATE
  - NEXT_PUBLIC_ENABLE_M10_REWARDS feature flag
  - Reward feature gate preserving shell and unrelated domains
  - M10 review hub covering normal, empty, failure, audit and isolation cases
  - Explicit 390px, 768px and 1440px responsive review record
  - Optional single-worker browser and visual checks
  - Lean structural, ESLint and TypeScript verification
  - Production build and approval-gated release command
  - Immutable standalone artifact with SHA-256 manifest
  - M10 rollback runbook and timestamped installer rollback archive
PLAN
}

require_repo_root() {
  [[ -f package.json && -d src/app && -d src/features ]] || {
    echo "Error: run $SCRIPT_NAME from the VERZUS repository root."
    exit 1
  }
}

require_local_tools() {
  [[ -x node_modules/.bin/eslint && -x node_modules/.bin/tsc ]] || {
    echo "Error: local dependencies are unavailable. Run npm install, then rerun the installer."
    exit 1
  }
}

require_m10_7_prerequisite() {
  require_repo_root

  local required=(
    package.json
    scripts/verify-m10-10-7.mjs
    tsconfig.m10-10-7.json
    src/features/rewards/foundation/ui/RewardsFoundationScreen.tsx
    src/features/rewards/resources/ui/RewardsResourceScreen.tsx
    src/features/rewards/claims/hooks/useRewardClaim.ts
    src/features/rewards/telemetry/RewardTelemetry.tsx
    src/app/api/health/rewards/route.ts
    src/app/api/telemetry/rewards/route.ts
    "src/app/(platform)/rewards/page.tsx"
  )

  local file
  for file in "${required[@]}"; do
    [[ -f "$file" ]] || {
      echo "Error: missing M10.7 prerequisite: $file"
      exit 1
    }
  done

  if [[ -f scripts/verify-m10-10-8.mjs ]] && \
    grep -q 'data-m10-stage="10.8"' src/features/rewards/foundation/ui/RewardsFoundationScreen.tsx; then
    echo "M10.8 already appears to be installed. Running its lean verifier instead."
    npm run verify:m10:10.8
    exit 0
  fi

  grep -q 'data-m10-stage="10.7"' \
    src/features/rewards/foundation/ui/RewardsFoundationScreen.tsx || {
      echo "Error: M10.7 foundation stage marker was not found."
      exit 1
    }

  grep -q 'data-m10-stage="10.7"' \
    src/features/rewards/resources/ui/RewardsResourceScreen.tsx || {
      echo "Error: M10.7 resource stage marker was not found."
      exit 1
    }

  echo "Running M10.7 prerequisite marker verification..."
  node scripts/verify-m10-10-7.mjs

  local owned_new_files=(
    src/features/rewards/release/reward-release.config.ts
    src/features/rewards/release/RewardFeatureGate.tsx
    src/features/rewards/release/RewardFeatureGate.module.css
    src/features/rewards/release/index.ts
    "src/app/(platform)/rewards/layout.tsx"
    "src/app/(preview)/m10-rewards-review/page.tsx"
    "src/app/(preview)/m10-rewards-review/review.module.css"
    tests/e2e/m10/m10-rewards-release.spec.ts
    tests/visual/m10-rewards.visual.spec.ts
    playwright.m10.config.ts
    scripts/verify-m10-10-8.mjs
    scripts/package-m10-release.mjs
    scripts/approve-m10-visuals.mjs
    docs/milestones/M10/m10-10-8-release-readiness-feature-isolation-packaging.md
    docs/milestones/M10/m10-reference-approval.json
    docs/runbooks/m10-reward-rollback.md
    tsconfig.m10-10-8.json
  )

  for file in "${owned_new_files[@]}"; do
    if [[ "$file" == "docs/milestones/M10/m10-reference-approval.json" ]]; then
      continue
    fi
    if [[ -f "$file" ]] && ! grep -q 'VERZUS M10.8\|M10.8' "$file"; then
      echo "Error: refusing to overwrite unowned file: $file"
      exit 1
    fi
  done
}

backup_current_state() {
  mkdir -p "$BACKUP_DIR"

  local paths=(
    .env.example
    package.json
    src/features/rewards/index.ts
    src/features/rewards/foundation/ui/RewardsFoundationScreen.tsx
    src/features/rewards/resources/ui/RewardsResourceScreen.tsx
    src/app/api/health/rewards/route.ts
  )

  local optional=(
    src/features/rewards/release
    "src/app/(platform)/rewards/layout.tsx"
    "src/app/(preview)/m10-rewards-review"
    tests/e2e/m10
    tests/visual/m10-rewards.visual.spec.ts
    playwright.m10.config.ts
    scripts/verify-m10-10-8.mjs
    scripts/package-m10-release.mjs
    scripts/approve-m10-visuals.mjs
    docs/milestones/M10/m10-10-8-release-readiness-feature-isolation-packaging.md
    docs/milestones/M10/m10-reference-approval.json
    docs/runbooks/m10-reward-rollback.md
    tsconfig.m10-10-8.json
  )

  local file
  for file in "${optional[@]}"; do
    [[ -e "$file" ]] && paths+=("$file")
  done

  tar -czf "$ARCHIVE" "${paths[@]}"

  cat > "$BACKUP_DIR/manifest.txt" <<MANIFEST
VERZUS M10.8 backup
Created: $(date -Iseconds)
Branch: $(git branch --show-current 2>/dev/null || echo unavailable)
Commit: $(git rev-parse HEAD 2>/dev/null || echo unavailable)
Archive: $ARCHIVE
Rollback: bash ./$SCRIPT_NAME rollback
MANIFEST

  BACKUP_CREATED="true"
  echo "Rollback archive created: $ARCHIVE"
}

remove_m10_8_files() {
  rm -rf \
    src/features/rewards/release \
    "src/app/(preview)/m10-rewards-review" \
    tests/e2e/m10

  rm -f \
    "src/app/(platform)/rewards/layout.tsx" \
    tests/visual/m10-rewards.visual.spec.ts \
    playwright.m10.config.ts \
    scripts/verify-m10-10-8.mjs \
    scripts/package-m10-release.mjs \
    scripts/approve-m10-visuals.mjs \
    docs/milestones/M10/m10-10-8-release-readiness-feature-isolation-packaging.md \
    docs/milestones/M10/m10-reference-approval.json \
    docs/runbooks/m10-reward-rollback.md \
    tsconfig.m10-10-8.json \
    tsconfig.m10-10-8.tsbuildinfo
}

restore_archive() {
  local archive="$1"
  remove_m10_8_files
  tar -xzf "$archive"
}

cleanup_temp() {
  if [[ -n "$TEMP_PAYLOAD" && -f "$TEMP_PAYLOAD" ]]; then
    rm -f "$TEMP_PAYLOAD"
  fi
}

on_error() {
  local code=$?
  cleanup_temp
  if [[ "$MODE" == "install" && "$BACKUP_CREATED" == "true" && "$INSTALL_COMPLETE" != "true" ]]; then
    echo
    echo "M10.8 installation failed. Restoring the pre-install archive..."
    restore_archive "$ARCHIVE"
    echo "Restored: $ARCHIVE"
  fi
  exit "$code"
}

trap on_error ERR
trap cleanup_temp EXIT

decode_payload() {
  TEMP_PAYLOAD="$(mktemp "${TMPDIR:-/tmp}/verzus-m10-10-8.XXXXXX.tar.gz")"

  sed -n '/^__VERZUS_PAYLOAD_BELOW__$/,$p' "$0" | tail -n +2 | base64 --decode > "$TEMP_PAYLOAD"

  local actual
  actual="$(sha256sum "$TEMP_PAYLOAD" | awk '{print $1}')"
  if [[ "$actual" != "$PAYLOAD_SHA256" ]]; then
    echo "Error: embedded M10.8 payload checksum mismatch."
    exit 1
  fi
}

extract_payload() {
  decode_payload
  tar -xzf "$TEMP_PAYLOAD" -C .
}

patch_existing_files() {
  node <<'NODE'
const fs = require("node:fs");

function replaceRequired(file, from, to) {
  const text = fs.readFileSync(file, "utf8");
  if (!text.includes(from)) {
    throw new Error(`Missing expected M10.7 marker in ${file}: ${from}`);
  }
  fs.writeFileSync(file, text.replace(from, to));
}

replaceRequired(
  "src/features/rewards/foundation/ui/RewardsFoundationScreen.tsx",
  "// VERZUS M10.7 INDEPENDENT WIDGET FAILURE ISOLATION",
  "// VERZUS M10.7 INDEPENDENT WIDGET FAILURE ISOLATION\n// VERZUS M10.8 RELEASE-READY RESPONSIVE CONTAINMENT",
);
replaceRequired(
  "src/features/rewards/foundation/ui/RewardsFoundationScreen.tsx",
  'data-m10-stage="10.7"',
  'data-m10-stage="10.8"',
);

replaceRequired(
  "src/features/rewards/resources/ui/RewardsResourceScreen.tsx",
  "// VERZUS M10.7 RELIABILITY AND OBSERVABILITY COMPOSITION",
  "// VERZUS M10.7 RELIABILITY AND OBSERVABILITY COMPOSITION\n// VERZUS M10.8 RELEASE-READY REWARD COMPOSITION",
);
replaceRequired(
  "src/features/rewards/resources/ui/RewardsResourceScreen.tsx",
  'data-m10-stage="10.7"',
  'data-m10-stage="10.8"',
);

replaceRequired(
  "src/app/api/health/rewards/route.ts",
  "// VERZUS M10.7 REWARD DOMAIN HEALTH ENDPOINT",
  "// VERZUS M10.8 REWARD DOMAIN RELEASE HEALTH ENDPOINT",
);
replaceRequired(
  "src/app/api/health/rewards/route.ts",
  'stage: "10.7"',
  'stage: "10.8"',
);
replaceRequired(
  "src/app/api/health/rewards/route.ts",
  '        telemetry: "ready",',
  '        telemetry: "ready",\n        featureIsolation: "ready",\n        immutablePackaging: "ready",',
);

const indexPath = "src/features/rewards/index.ts";
let index = fs.readFileSync(indexPath, "utf8");
if (!index.includes('export * from "./release";')) {
  index = index.replace(
    'export * from "./reliability";\n',
    'export * from "./reliability";\nexport * from "./release";\n',
  );
  fs.writeFileSync(indexPath, index);
}

const envPath = ".env.example";
let env = fs.readFileSync(envPath, "utf8");
if (!env.includes("NEXT_PUBLIC_ENABLE_M10_REWARDS=true")) {
  env = `${env.trimEnd()}\n\n# VERZUS M10.8 Rewards release control\nNEXT_PUBLIC_ENABLE_M10_REWARDS=true\n`;
  fs.writeFileSync(envPath, env);
}

const packagePath = "package.json";
const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
packageJson.scripts ??= {};
packageJson.scripts["typecheck:m10:10.8"] = "tsc --noEmit -p tsconfig.m10-10-8.json";
packageJson.scripts["verify:m10:10.8"] =
  'node scripts/verify-m10-10-8.mjs && eslint src/features/rewards src/app/api/rewards src/app/api/health/rewards src/app/api/telemetry/rewards "src/app/(platform)/rewards" "src/app/(preview)/m10-rewards-review" scripts/verify-m10-10-8.mjs scripts/package-m10-release.mjs scripts/approve-m10-visuals.mjs playwright.m10.config.ts tests/e2e/m10 tests/visual/m10-rewards.visual.spec.ts --max-warnings=0 && npm run typecheck:m10:10.8';
packageJson.scripts["verify:m10:10.8:build"] =
  "npm run verify:m10:10.8 && npm run build";
packageJson.scripts["test:m10:10.8:e2e"] =
  "playwright test --config=playwright.m10.config.ts tests/e2e/m10";
packageJson.scripts["test:m10:10.8:visual"] =
  "playwright test --config=playwright.m10.config.ts tests/visual/m10-rewards.visual.spec.ts";
packageJson.scripts["m10:visual:update"] =
  "playwright test --config=playwright.m10.config.ts tests/visual/m10-rewards.visual.spec.ts --update-snapshots";
packageJson.scripts["m10:approve"] = "node scripts/approve-m10-visuals.mjs";
packageJson.scripts["m10:approval:check"] =
  "node scripts/approve-m10-visuals.mjs --check";
packageJson.scripts["m10:artifact"] = "node scripts/package-m10-release.mjs";
packageJson.scripts["m10:release"] =
  "npm run verify:m10:10.8 && npm run m10:approval:check && npm run build && npm run m10:artifact";
fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
NODE
}

format_changed_files() {
  if [[ -x node_modules/.bin/prettier ]]; then
    node_modules/.bin/prettier --write \
      package.json \
      "src/app/(platform)/rewards/layout.tsx" \
      "src/app/(preview)/m10-rewards-review" \
      src/app/api/health/rewards/route.ts \
      src/features/rewards/foundation/ui/RewardsFoundationScreen.tsx \
      src/features/rewards/resources/ui/RewardsResourceScreen.tsx \
      src/features/rewards/index.ts \
      src/features/rewards/release \
      tests/e2e/m10 \
      tests/visual/m10-rewards.visual.spec.ts \
      playwright.m10.config.ts \
      scripts/verify-m10-10-8.mjs \
      scripts/package-m10-release.mjs \
      scripts/approve-m10-visuals.mjs \
      docs/milestones/M10/m10-10-8-release-readiness-feature-isolation-packaging.md \
      docs/milestones/M10/m10-reference-approval.json \
      docs/runbooks/m10-reward-rollback.md \
      tsconfig.m10-10-8.json >/dev/null
  else
    echo "Prettier is not installed locally; continuing with the formatted embedded payload."
  fi
}

install_stage() {
  print_plan
  require_m10_7_prerequisite
  require_local_tools
  backup_current_state
  extract_payload
  patch_existing_files
  format_changed_files

  echo "Running lean M10.8 verification (marker, ESLint and focused TypeScript only)..."
  npm run verify:m10:10.8

  INSTALL_COMPLETE="true"
  cat <<'DONE'

M10.8 installation complete.

Preview:
  npm run m10:preview

Review hub:
  http://127.0.0.1:3122/m10-rewards-review

Health:
  http://127.0.0.1:3122/api/health/rewards

Verify again without Vitest or Playwright:
  npm run verify:m10:10.8

Optional browser review:
  npm run test:m10:10.8:e2e
  npm run m10:visual:update
  npm run test:m10:10.8:visual

Record manual approval after reviewing 390px, 768px and 1440px:
  VERZUS_M10_VISUAL_APPROVAL=APPROVED VERZUS_M10_APPROVED_BY="<name>" npm run m10:approve

Build and package the approved immutable artifact:
  npm run m10:release

Fast feature isolation:
  NEXT_PUBLIC_ENABLE_M10_REWARDS=false

Rollback:
  bash ./VERZUS_M10_10_8_Release_Readiness_Feature_Isolation_Packaging_NO_TESTS.sh rollback
DONE
}

rollback_stage() {
  require_repo_root
  local latest
  latest="$(find "$BACKUP_ROOT" -type f -name 'verzus-m10-10-8-before.tar.gz' 2>/dev/null | sort | tail -n 1 || true)"

  if [[ -z "$latest" ]]; then
    echo "Error: no M10.8 rollback archive was found under $BACKUP_ROOT."
    exit 1
  fi

  echo "Restoring M10.8 archive: $latest"
  restore_archive "$latest"
  echo "Running restored M10.7 marker verification..."
  node scripts/verify-m10-10-7.mjs
  echo "M10.8 rollback complete."
}

case "$MODE" in
  install)
    install_stage
    ;;
  rollback)
    rollback_stage
    ;;
  *)
    echo "Usage: bash ./$SCRIPT_NAME [install|rollback]"
    exit 1
    ;;
esac

exit 0
__VERZUS_PAYLOAD_BELOW__
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
