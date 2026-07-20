#!/usr/bin/env bash
set -Eeuo pipefail

MODE="${1:-install}"
SCRIPT_NAME="VERZUS_M11_11_8_Release_Readiness_Feature_Isolation_Packaging_NO_TESTS.sh"
BACKUP_ROOT=".verzus-backups/m11-11-8-release-readiness-feature-isolation-packaging"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="${BACKUP_ROOT}/${STAMP}"
ARCHIVE="${BACKUP_DIR}/verzus-m11-11-8-before.tar.gz"
PAYLOAD_SHA256="6a3030f046ab07b36db094dd301086a4a156cee6c0df595f2ee69cdab3c1a754"
BACKUP_CREATED="false"
INSTALL_COMPLETE="false"
TEMP_PAYLOAD=""

print_plan() {
  cat <<'PLAN'
VERZUS M11.8 - Release Readiness, Feature Isolation and Immutable Packaging

KEEP
  - M11.1 approved own-profile hierarchy and local player artwork
  - M11.2 server-projected public profiles and viewer permission boundaries
  - M11.3 validated profile editing and restricted avatar controls
  - M11.4 independently validated profile resources and query caches
  - M11.5 paginated match history and detailed statistics
  - M11.6 achievements, game identities and auditable trust history
  - M11.7 privacy controls, account edge states and failure isolation
  - Completed Play, Competition, Match, Leaderboard, Crew and Rewards domains
  - Existing request IDs, environment validation, backup and rollback conventions

REUSE
  - Existing /profile, /profile/* and /players/[playerId] routes
  - Existing account-state and privacy authorization boundaries
  - Existing M11 preview port 3123 and failure-injection scenarios
  - Existing Next.js standalone output and immutable release conventions
  - Existing Zod, TanStack Query, CSS Module and structured-error patterns

REPLACE
  - Ungated Profile routes with domain-level feature isolation
  - Informal final review with one deterministic M11 review hub
  - Unrecorded responsive sign-off with an explicit approval manifest
  - Unobservable route failures with a controlled release boundary and telemetry
  - Manual source copying with checksum-addressed immutable packaging

DELETE
  - No M11.1-M11.7 profile behavior, data contract, route or permission rule
  - No sensitive profile data in telemetry payloads
  - No client-side authority over privacy, trust, rank or account status
  - No Vitest execution during installation
  - No Playwright execution during installation
  - No production release without explicit responsive approval

CREATE
  - NEXT_PUBLIC_ENABLE_M11_PROFILES feature flag
  - Profile feature gate preserving shell and unrelated domains
  - Route-level release error boundary with user-visible error IDs
  - Profile health and privacy-safe telemetry endpoints
  - M11 review hub for own, public, edit, history, insights, privacy and edge states
  - Optional single-worker browser and visual checks at 390px, 768px and 1440px
  - Lean structural, ESLint and focused TypeScript verification
  - Explicit responsive approval recorder and release gate
  - Immutable standalone artifact with SHA-256 manifest
  - M11 rollback runbook and timestamped installer rollback archive
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

require_m11_7_prerequisite() {
  require_repo_root

  local required=(
    package.json
    .env.example
    scripts/verify-m11-11-7.mjs
    tsconfig.m11-11-7.json
    src/features/profiles/foundation/ui/PlayerProfileFoundationScreen.tsx
    src/features/profiles/ui/ProfileScreen.tsx
    src/features/profiles/privacy/ui/ProfilePrivacySettingsScreen.tsx
    src/features/profiles/account-state/ui/ProfileAccountStateGate.tsx
    src/features/profiles/public-profile/ui/PlayerPublicProfileScreen.tsx
    "src/app/(platform)/profile/page.tsx"
    "src/app/(platform)/players/[playerId]/page.tsx"
    src/app/api/profile/privacy/route.ts
    src/app/api/profile/account-state/route.ts
    docs/milestones/M11/m11-reference-approval.json
  )

  local file
  for file in "${required[@]}"; do
    [[ -f "$file" ]] || {
      echo "Error: missing M11.7 prerequisite: $file"
      exit 1
    }
  done

  if [[ -f scripts/verify-m11-11-8.mjs ]] && \
    grep -q 'data-m11-stage="11.8"' src/features/profiles/foundation/ui/PlayerProfileFoundationScreen.tsx; then
    echo "M11.8 already appears to be installed. Running its lean verifier instead."
    npm run verify:m11:11.8
    exit 0
  fi

  grep -q 'data-m11-stage="11.7"' \
    src/features/profiles/foundation/ui/PlayerProfileFoundationScreen.tsx || {
      echo "Error: M11.7 foundation stage marker was not found."
      exit 1
    }

  echo "Running M11.7 prerequisite marker verification..."
  node scripts/verify-m11-11-7.mjs

  local owned_new_files=(
    src/features/profiles/release/profile-release.config.ts
    src/features/profiles/release/ProfileFeatureGate.tsx
    src/features/profiles/release/ProfileFeatureGate.module.css
    src/features/profiles/release/ProfileReleaseBoundary.tsx
    src/features/profiles/release/ProfileReleaseBoundary.module.css
    src/features/profiles/release/index.ts
    "src/app/(platform)/profile/layout.tsx"
    "src/app/(platform)/players/layout.tsx"
    "src/app/(preview)/m11-profile-review/page.tsx"
    "src/app/(preview)/m11-profile-review/review.module.css"
    src/app/api/health/profiles/route.ts
    src/app/api/telemetry/profiles/route.ts
    tests/e2e/m11/m11-profile-release.spec.ts
    tests/visual/m11-profiles.visual.spec.ts
    playwright.m11.config.ts
    scripts/verify-m11-11-8.mjs
    scripts/approve-m11-visuals.mjs
    scripts/package-m11-release.mjs
    docs/milestones/M11/m11-11-8-release-readiness-feature-isolation-packaging.md
    docs/runbooks/m11-profile-rollback.md
    tsconfig.m11-11-8.json
  )

  for file in "${owned_new_files[@]}"; do
    if [[ -f "$file" ]] && ! grep -q 'VERZUS M11.8\|M11.8' "$file"; then
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
    src/features/profiles/foundation/ui/PlayerProfileFoundationScreen.tsx
    src/features/profiles/ui/ProfileScreen.tsx
    docs/milestones/M11/m11-reference-approval.json
  )

  local optional=(
    src/features/profiles/release
    "src/app/(platform)/profile/layout.tsx"
    "src/app/(platform)/players/layout.tsx"
    "src/app/(preview)/m11-profile-review"
    src/app/api/health/profiles
    src/app/api/telemetry/profiles
    tests/e2e/m11
    tests/visual/m11-profiles.visual.spec.ts
    playwright.m11.config.ts
    scripts/verify-m11-11-8.mjs
    scripts/approve-m11-visuals.mjs
    scripts/package-m11-release.mjs
    docs/milestones/M11/m11-11-8-release-readiness-feature-isolation-packaging.md
    docs/runbooks/m11-profile-rollback.md
    tsconfig.m11-11-8.json
  )

  local file
  for file in "${optional[@]}"; do
    [[ -e "$file" ]] && paths+=("$file")
  done

  tar -czf "$ARCHIVE" "${paths[@]}"

  cat > "$BACKUP_DIR/manifest.txt" <<MANIFEST
VERZUS M11.8 backup
Created: $(date -Iseconds)
Branch: $(git branch --show-current 2>/dev/null || echo unavailable)
Commit: $(git rev-parse HEAD 2>/dev/null || echo unavailable)
Archive: $ARCHIVE
Rollback: bash ./$SCRIPT_NAME rollback
MANIFEST

  BACKUP_CREATED="true"
  echo "Rollback archive created: $ARCHIVE"
}

remove_m11_8_files() {
  rm -rf \
    src/features/profiles/release \
    "src/app/(preview)/m11-profile-review" \
    src/app/api/health/profiles \
    src/app/api/telemetry/profiles \
    tests/e2e/m11

  rm -f \
    "src/app/(platform)/profile/layout.tsx" \
    "src/app/(platform)/players/layout.tsx" \
    tests/visual/m11-profiles.visual.spec.ts \
    playwright.m11.config.ts \
    scripts/verify-m11-11-8.mjs \
    scripts/approve-m11-visuals.mjs \
    scripts/package-m11-release.mjs \
    docs/milestones/M11/m11-11-8-release-readiness-feature-isolation-packaging.md \
    docs/runbooks/m11-profile-rollback.md \
    tsconfig.m11-11-8.json \
    tsconfig.m11-11-8.tsbuildinfo
}

restore_archive() {
  local archive="$1"
  remove_m11_8_files
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
    echo "M11.8 installation failed. Restoring the pre-install archive..."
    restore_archive "$ARCHIVE"
    echo "Restored: $ARCHIVE"
  fi
  exit "$code"
}

trap on_error ERR
trap cleanup_temp EXIT

decode_payload() {
  TEMP_PAYLOAD="$(mktemp "${TMPDIR:-/tmp}/verzus-m11-11-8.XXXXXX.tar.gz")"

  sed -n '/^__VERZUS_PAYLOAD_BELOW__$/,$p' "$0" | tail -n +2 | base64 --decode > "$TEMP_PAYLOAD"

  local actual
  actual="$(sha256sum "$TEMP_PAYLOAD" | awk '{print $1}')"
  if [[ "$actual" != "$PAYLOAD_SHA256" ]]; then
    echo "Error: embedded M11.8 payload checksum mismatch."
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

function replaceRequired(file, pattern, replacement, description) {
  const text = fs.readFileSync(file, "utf8");
  const next = text.replace(pattern, replacement);
  if (next === text) {
    throw new Error(`M11.8 could not patch ${description} in ${file}.`);
  }
  fs.writeFileSync(file, next);
}

const foundationPath =
  "src/features/profiles/foundation/ui/PlayerProfileFoundationScreen.tsx";
let foundation = fs.readFileSync(foundationPath, "utf8");
if (!foundation.includes("VERZUS M11.8 RELEASE-READY PROFILE FOUNDATION")) {
  foundation = foundation.replace(
    /export function PlayerProfileFoundationScreen\(/,
    "// VERZUS M11.8 RELEASE-READY PROFILE FOUNDATION\nexport function PlayerProfileFoundationScreen(",
  );
}
if (!foundation.includes('data-m11-stage="11.8"')) {
  const next = foundation.replace('data-m11-stage="11.7"', 'data-m11-stage="11.8"');
  if (next === foundation) {
    throw new Error("M11.8 could not locate the M11.7 foundation stage marker.");
  }
  foundation = next;
}
fs.writeFileSync(foundationPath, foundation);

const profileScreenPath = "src/features/profiles/ui/ProfileScreen.tsx";
let profileScreen = fs.readFileSync(profileScreenPath, "utf8");
if (!profileScreen.includes("VERZUS M11.8 RELEASE-READY PROFILE COMPOSITION")) {
  replaceRequired(
    profileScreenPath,
    "// VERZUS M11.7 PROFILE ACCOUNT-STATE AND RESOURCE COMPOSITION",
    "// VERZUS M11.7 PROFILE ACCOUNT-STATE AND RESOURCE COMPOSITION\n// VERZUS M11.8 RELEASE-READY PROFILE COMPOSITION",
    "ProfileScreen release marker",
  );
}

const envPath = ".env.example";
let env = fs.readFileSync(envPath, "utf8");
if (!env.includes("NEXT_PUBLIC_ENABLE_M11_PROFILES=true")) {
  env = `${env.trimEnd()}\n\n# VERZUS M11.8 Player Profile release control\nNEXT_PUBLIC_ENABLE_M11_PROFILES=true\n`;
  fs.writeFileSync(envPath, env);
}

const approvalPath = "docs/milestones/M11/m11-reference-approval.json";
const approval = JSON.parse(fs.readFileSync(approvalPath, "utf8"));
approval.stage = "11.8";
approval.releaseGate = {
  status: "pending",
  stage: "11.8",
  reviewedViewports: [390, 768, 1440],
  note: "Record explicit approval after reviewing owner, public, edit, history, identity-insight, privacy and account-state surfaces.",
};
fs.writeFileSync(approvalPath, `${JSON.stringify(approval, null, 2)}\n`);

const packagePath = "package.json";
const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));
packageJson.scripts ??= {};
packageJson.scripts["typecheck:m11:11.8"] = "tsc --noEmit -p tsconfig.m11-11-8.json";
packageJson.scripts["verify:m11:11.8"] =
  'node scripts/verify-m11-11-8.mjs && eslint src/features/profiles "src/app/(platform)/profile" "src/app/(platform)/players" "src/app/(preview)/m11-profile-review" src/app/api/profile src/app/api/health/profiles src/app/api/telemetry/profiles scripts/verify-m11-11-8.mjs scripts/package-m11-release.mjs scripts/approve-m11-visuals.mjs playwright.m11.config.ts tests/e2e/m11 tests/visual/m11-profiles.visual.spec.ts --max-warnings=0 && npm run typecheck:m11:11.8';
packageJson.scripts["verify:m11:11.8:build"] =
  "npm run verify:m11:11.8 && npm run build";
packageJson.scripts["test:m11:11.8:e2e"] =
  "playwright test --config=playwright.m11.config.ts tests/e2e/m11";
packageJson.scripts["test:m11:11.8:visual"] =
  "playwright test --config=playwright.m11.config.ts tests/visual/m11-profiles.visual.spec.ts";
packageJson.scripts["m11:visual:update"] =
  "playwright test --config=playwright.m11.config.ts tests/visual/m11-profiles.visual.spec.ts --update-snapshots";
packageJson.scripts["m11:approve"] = "node scripts/approve-m11-visuals.mjs";
packageJson.scripts["m11:approval:check"] =
  "node scripts/approve-m11-visuals.mjs --check";
packageJson.scripts["m11:artifact"] = "node scripts/package-m11-release.mjs";
packageJson.scripts["m11:release"] =
  "npm run verify:m11:11.8 && npm run m11:approval:check && npm run build && npm run m11:artifact";
fs.writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);
NODE
}

format_changed_files() {
  if [[ -x node_modules/.bin/prettier ]]; then
    node_modules/.bin/prettier --write \
      package.json \
      "src/app/(platform)/profile/layout.tsx" \
      "src/app/(platform)/players/layout.tsx" \
      "src/app/(preview)/m11-profile-review" \
      src/app/api/health/profiles/route.ts \
      src/app/api/telemetry/profiles/route.ts \
      src/features/profiles/release \
      src/features/profiles/foundation/ui/PlayerProfileFoundationScreen.tsx \
      src/features/profiles/ui/ProfileScreen.tsx \
      tests/e2e/m11 \
      tests/visual/m11-profiles.visual.spec.ts \
      playwright.m11.config.ts \
      scripts/verify-m11-11-8.mjs \
      scripts/approve-m11-visuals.mjs \
      scripts/package-m11-release.mjs \
      docs/milestones/M11/m11-11-8-release-readiness-feature-isolation-packaging.md \
      docs/milestones/M11/m11-reference-approval.json \
      docs/runbooks/m11-profile-rollback.md \
      tsconfig.m11-11-8.json >/dev/null
  else
    echo "Prettier is not installed locally; continuing with the formatted embedded payload."
  fi
}

install_stage() {
  print_plan
  require_m11_7_prerequisite
  require_local_tools
  backup_current_state
  extract_payload
  patch_existing_files
  format_changed_files

  echo "Running lean M11.8 verification (marker, ESLint and focused TypeScript only)..."
  npm run verify:m11:11.8

  INSTALL_COMPLETE="true"
  cat <<'DONE'

M11.8 installation complete.

Preview:
  npm run m11:preview

Review hub:
  http://127.0.0.1:3123/m11-profile-review

Health:
  http://127.0.0.1:3123/api/health/profiles

Verify again without Vitest or Playwright:
  npm run verify:m11:11.8

Optional browser review:
  npm run test:m11:11.8:e2e
  npm run m11:visual:update
  npm run test:m11:11.8:visual

Record manual approval after reviewing 390px, 768px and 1440px:
  VERZUS_M11_VISUAL_APPROVAL=APPROVED VERZUS_M11_APPROVED_BY="<name>" npm run m11:approve

Build and package the approved immutable artifact:
  npm run m11:release

Fast feature isolation:
  NEXT_PUBLIC_ENABLE_M11_PROFILES=false

Rollback:
  bash ./VERZUS_M11_11_8_Release_Readiness_Feature_Isolation_Packaging_NO_TESTS.sh rollback
DONE
}

rollback_stage() {
  require_repo_root
  local latest
  latest="$(find "$BACKUP_ROOT" -type f -name 'verzus-m11-11-8-before.tar.gz' 2>/dev/null | sort | tail -n 1 || true)"

  if [[ -z "$latest" ]]; then
    echo "Error: no M11.8 rollback archive was found under $BACKUP_ROOT."
    exit 1
  fi

  echo "Restoring M11.8 archive: $latest"
  restore_archive "$latest"
  echo "Running restored M11.7 marker verification..."
  node scripts/verify-m11-11-7.mjs
  echo "M11.8 rollback complete."
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
