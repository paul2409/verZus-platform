#!/usr/bin/env bash
set -Eeuo pipefail

MODE="${1:-install}"
SCRIPT_NAME="VERZUS_M9_9_8_Release_Readiness_Observability_Packaging_NO_TESTS.sh"
BACKUP_ROOT=".verzus-backups/m9-9-8-release-readiness-observability-packaging"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="${BACKUP_ROOT}/${STAMP}"
ARCHIVE="${BACKUP_DIR}/verzus-m9-9-8-before.tar.gz"
PAYLOAD_SHA256="ad05104bda251cacf7c7565a1a73112f6e0ce1b71d01cc1519b955f07be72de7"
BACKUP_CREATED="false"
INSTALL_COMPLETE="false"

print_plan() {
  cat <<'PLAN'
VERZUS M9.8 - Release Readiness, Observability and Immutable Packaging

KEEP
  - M9.1 responsive Crew profile and visual identity
  - M9.2 no-Crew state, discovery, search, filters and URL state
  - M9.3 Crew creation and identity assets
  - M9.4 independent Crew resources and partial-failure composition
  - M9.5 applications, invites, membership versioning and leave protection
  - M9.6 roles, permissions, member management and atomic ownership transfer
  - M9.7 lifecycle controls, guarded disbanding and retained activity fallbacks
  - Existing shell, navigation, request IDs and rollback conventions

REUSE
  - Existing Crew routes and feature-owned resources
  - Existing environment and release SHA values
  - Existing Zod, TanStack Query, Next route and CSS Module patterns
  - Existing preview port 3121 and M9 scenario routes

REPLACE
  - Ungated Crew routes with a domain-level feature isolation layout
  - Unobservable Crew failures with structured, privacy-safe telemetry
  - Informal final review with one deterministic M9 review hub
  - Manual file copying with a checksum-addressed immutable artifact

DELETE
  - No M9.1-M9.7 screen, route, contract, mutation or lifecycle behavior
  - No Vitest execution during installation
  - No Playwright execution during installation
  - No release dependency on one oversized Crew API
  - No telemetry payload containing application messages or sensitive content

CREATE
  - NEXT_PUBLIC_ENABLE_M9_CREWS feature flag
  - Crew feature gate preserving the rest of the application shell
  - Crew health and telemetry endpoints
  - Surface, resource, authority and lifecycle telemetry beacons
  - M9 review hub with primary, failure and lifecycle cases
  - Optional single-worker accessibility and visual browser checks
  - Focused structural, ESLint and TypeScript verification
  - Production-build release command without forced test workers
  - Immutable Crew artifact and SHA-256 manifest
  - Visual approval recorder and rollback runbook
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

require_m9_7_prerequisite() {
  require_repo_root

  local required=(
    package.json
    scripts/verify-m9-9-7.mjs
    src/features/crews/lifecycle/server/crew-lifecycle.service.ts
    src/features/crews/governance/server/crew-governance.store.ts
    src/features/crews/membership/ui/CrewMembershipScreen.tsx
    src/features/crews/resources/ui/CrewResourceScreen.tsx
    src/features/crews/ui/CrewsScreen.tsx
    src/features/crews/index.ts
  )

  local file
  for file in "${required[@]}"; do
    [[ -f "$file" ]] || {
      echo "Error: missing M9.7 prerequisite: $file"
      exit 1
    }
  done

  if [[ -f scripts/verify-m9-9-8.mjs ]]; then
    echo "Error: M9.8 appears to be installed already. Use rollback before reinstalling."
    exit 1
  fi

  echo "Running M9.7 prerequisite marker verification..."
  node scripts/verify-m9-9-7.mjs

  grep -q 'data-m9-stage="9.7"' src/features/crews/resources/ui/CrewResourceScreen.tsx || {
    echo "Error: M9.7 Crew resource marker is missing."
    exit 1
  }
}

backup_current_state() {
  mkdir -p "$BACKUP_DIR"

  tar -czf "$ARCHIVE"     .env.example     package.json     'src/app/(platform)/crews'     src/features/crews/index.ts     src/features/crews/ui/CrewsScreen.tsx     src/features/crews/resources/ui/CrewResourceScreen.tsx     src/features/crews/membership/ui/CrewMembershipScreen.tsx

  cat > "$BACKUP_DIR/manifest.txt" <<MANIFEST
VERZUS M9.8 backup
Created: $(date -Iseconds)
Branch: $(git branch --show-current 2>/dev/null || echo unavailable)
Commit: $(git rev-parse HEAD 2>/dev/null || echo unavailable)
Archive: $ARCHIVE
Rollback: bash ./$SCRIPT_NAME rollback
MANIFEST

  BACKUP_CREATED="true"
  echo "Rollback archive created: $ARCHIVE"
}

remove_m9_8_files() {
  rm -rf     src/features/crews/release     src/features/crews/telemetry     'src/app/(preview)/m9-crew-review'     src/app/api/health/crews     src/app/api/telemetry/crews     tests/e2e/m9

  rm -f     'src/app/(platform)/crews/layout.tsx'     tests/visual/m9-crews.visual.spec.ts     playwright.m9.config.ts     scripts/verify-m9-9-8.mjs     scripts/package-m9-release.mjs     scripts/approve-m9-visuals.mjs     docs/milestones/M9/m9-9-8-release-readiness-observability.md     docs/milestones/M9/m9-reference-approval.json     docs/runbooks/m9-crew-rollback.md     tsconfig.m9-9-8.json     tsconfig.m9-9-8.tsbuildinfo
}

restore_archive() {
  local archive="$1"
  remove_m9_8_files
  tar -xzf "$archive"
}

on_error() {
  local code=$?
  if [[ "$MODE" == "install" && "$BACKUP_CREATED" == "true" && "$INSTALL_COMPLETE" != "true" ]]; then
    echo
    echo "M9.8 installation failed. Restoring the pre-install archive..."
    restore_archive "$ARCHIVE"
    echo "Restored: $ARCHIVE"
  fi
  exit "$code"
}
trap on_error ERR

extract_payload() {
  local temp_dir
  temp_dir="$(mktemp -d)"
  local payload="$temp_dir/m9-9-8-payload.tar.gz"

  sed -n '/^__VERZUS_M9_8_PAYLOAD_BEGIN__$/,/^__VERZUS_M9_8_PAYLOAD_END__$/p' "$0"     | sed '1d;$d'     | base64 -d > "$payload"

  local actual_sha
  actual_sha="$(sha256sum "$payload" | awk '{print $1}')"
  if [[ "$actual_sha" != "$PAYLOAD_SHA256" ]]; then
    echo "Error: M9.8 payload integrity check failed."
    rm -rf "$temp_dir"
    exit 1
  fi

  tar -xzf "$payload" -C .
  rm -rf "$temp_dir"
}

install_stage() {
  print_plan
  require_m9_7_prerequisite
  require_local_tools
  backup_current_state
  extract_payload

  echo "Running lean M9.8 verification (marker, ESLint and focused TypeScript only)..."
  npm run verify:m9:9.8

  INSTALL_COMPLETE="true"
  cat <<'DONE'

M9.8 installation complete.

Preview:
  npm run m9:preview

Review hub:
  http://127.0.0.1:3121/m9-crew-review

Health:
  http://127.0.0.1:3121/api/health/crews

Verify again without Vitest or Playwright:
  npm run verify:m9:9.8

Production build and immutable artifact:
  npm run m9:release

Optional browser checks only when required:
  npm run test:m9:9.8:e2e
  npm run m9:visual:update
  npm run test:m9:9.8:visual

Fast feature isolation:
  NEXT_PUBLIC_ENABLE_M9_CREWS=false

Rollback:
  bash ./VERZUS_M9_9_8_Release_Readiness_Observability_Packaging_NO_TESTS.sh rollback
DONE
}

rollback_stage() {
  require_repo_root
  local latest
  latest="$(find "$BACKUP_ROOT" -mindepth 2 -maxdepth 2 -type f -name 'verzus-m9-9-8-before.tar.gz' 2>/dev/null | sort | tail -n 1)"
  if [[ -z "$latest" ]]; then
    echo "Error: no M9.8 rollback archive found under $BACKUP_ROOT."
    exit 1
  fi

  restore_archive "$latest"
  echo "Running restored M9.7 marker verification..."
  node scripts/verify-m9-9-7.mjs
  echo "M9.8 rollback restored: $latest"
}

case "$MODE" in
  install) install_stage ;;
  rollback) rollback_stage ;;
  *)
    echo "Usage: bash ./$SCRIPT_NAME [install|rollback]"
    exit 1
    ;;
esac
exit 0

__VERZUS_M9_8_PAYLOAD_BEGIN__
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
f3mwzdoAuAEA
__VERZUS_M9_8_PAYLOAD_END__
