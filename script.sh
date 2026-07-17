#!/usr/bin/env bash
set -Eeuo pipefail

MODE="${1:-install}"
SCRIPT_NAME="VERZUS_M7_7_8_Testing_Observability_Release.sh"
BACKUP_ROOT=".verzus-backups/m7-7-8-testing-observability-release"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="${BACKUP_ROOT}/${STAMP}"
ARCHIVE="${BACKUP_DIR}/verzus-m7-7-8-before.tar.gz"
BACKUP_CREATED="false"
INSTALL_FINISHED="false"

print_plan() {
  cat <<'PLAN'
VERZUS M7.8 - Match Testing, Observability and Release

KEEP
  - Approved M7.1 Match Operations composition and all 15 match-state references
  - M7.2 lifecycle graph, UTC server clock and stale mutation guards
  - M7.3 schemas, adapters, independent APIs and query resources
  - M7.4 idempotent check-in and readiness persistence
  - M7.5 lobby, match start and independent issue reporting
  - M7.6 result, evidence, confirmation and auditable disputes
  - M7.7 terminal states, authorization, offline/stale and widget isolation

REUSE
  - Existing M7 preview server on port 3119
  - Existing Vitest, Playwright, axe, ESLint, TypeScript and build tooling
  - Existing request IDs, idempotency keys, structured errors and failure scenarios
  - Existing release SHA and application-environment variables
  - Existing App Shell and route-level match boundaries

REPLACE
  - M7.7 stage marker with the M7.8 release-gate marker
  - Informal milestone completion with executable technical and approval gates
  - Untraceable preview output with health, release and checksum evidence

DELETE
  - No M7.1-M7.7 feature behavior, route, API, test or approved composition
  - No shared primitive, App Shell navigation, artwork or historical evidence
  - No prerequisite visual approval requirement for installing this stage

CREATE
  - Match Operations feature flag and controlled degradation boundary
  - Allowlisted client telemetry and structured ingestion endpoint
  - Match Operations health endpoint with environment and release metadata
  - Unit, integration, E2E, accessibility and failure-injection coverage
  - Visual regression coverage for all 15 states at 390px, 768px and 1440px
  - M7 visual review hub and explicit final approval manifest
  - Full technical/release verifiers and immutable artifact packager
  - Rollback runbook and timestamped pre-install archive
PLAN
}

require_repo_root() {
  [[ -f package.json && -d src/app && -d src/features ]] || {
    echo "Error: run $SCRIPT_NAME from the VERZUS repository root."
    exit 1
  }
}

require_m7_7_prerequisite() {
  require_repo_root

  local required=(
    scripts/verify-m7-7-7.mjs
    src/features/matches/operations/ui/MatchOperationsResourceScreen.tsx
    src/features/matches/operations/ui/MatchWidgetBoundary.tsx
    src/features/matches/operations/model/match-terminal-operations.types.ts
    src/features/matches/operations/server/match-terminal.service.ts
    'src/app/(platform)/matches/[matchId]/page.tsx'
    'src/app/api/matches/[matchId]/terminal/route.ts'
    docs/milestones/M7/m7-reference-approval.json
  )

  local file
  for file in "${required[@]}"; do
    [[ -f "$file" ]] || {
      echo "Error: missing M7.7 prerequisite: $file"
      echo "Apply and verify M7.7 before running M7.8."
      exit 1
    }
  done

  echo "Running M7.7 prerequisite marker verification..."
  node scripts/verify-m7-7-7.mjs

  grep -q 'data-m7-stage="7.7"' \
    src/features/matches/operations/ui/MatchOperationsResourceScreen.tsx || {
      echo "Error: M7.7 Match Operations screen marker is missing."
      exit 1
    }
}

owned_new_files=(
  'src/app/(platform)/matches/[matchId]/layout.tsx'
  'src/app/(preview)/m7-match-review/page.tsx'
  'src/app/(preview)/m7-match-review/review.module.css'
  'src/app/api/telemetry/matches/route.ts'
  'src/app/api/health/matches/route.ts'
  src/features/matches/operations/release/match-release.config.ts
  src/features/matches/operations/release/match-release.config.test.ts
  src/features/matches/operations/release/MatchOperationsFeatureGate.tsx
  src/features/matches/operations/release/MatchOperationsFeatureGate.module.css
  src/features/matches/operations/release/index.ts
  src/features/matches/operations/telemetry/match-telemetry.schema.ts
  src/features/matches/operations/telemetry/match-telemetry.schema.test.ts
  src/features/matches/operations/telemetry/match-telemetry.client.ts
  src/features/matches/operations/telemetry/MatchTelemetryBridge.tsx
  src/features/matches/operations/telemetry/index.ts
  tests/integration/m7-match-release.integration.test.ts
  tests/e2e/m7/m7-match-flow.spec.ts
  tests/e2e/m7/m7-match-accessibility.spec.ts
  tests/e2e/m7/m7-match-failure-injection.spec.ts
  tests/visual/m7-match-operations.visual.spec.ts
  playwright.m7.config.ts
  vitest.m7.config.ts
  docs/milestones/M7/m7-7-8-testing-observability-release.md
  docs/runbooks/m7-match-rollback.md
  scripts/approve-m7-visuals.mjs
  scripts/package-m7-release.mjs
  scripts/verify-m7-7-8.mjs
)

modified_files=(
  package.json
  .env.example
  src/features/matches/operations/index.ts
  src/features/matches/operations/ui/MatchOperationsResourceScreen.tsx
  docs/milestones/M7/m7-reference-approval.json
  playwright.m6.config.ts
  src/features/competitions/lifecycle/api/competition-lifecycle-api.client.ts
  src/features/competitions/lifecycle/ui/index.ts
)

check_owned_files() {
  local file
  for file in "${owned_new_files[@]}"; do
    [[ -f "$file" ]] || continue
    if ! grep -q 'VERZUS M7.8' "$file"; then
      echo "Error: refusing to overwrite unowned file: $file"
      exit 1
    fi
  done
}

backup_current_state() {
  mkdir -p "$BACKUP_DIR"
  local paths=()
  local file

  for file in "${modified_files[@]}"; do
    [[ -e "$file" ]] && paths+=("$file")
  done
  for file in "${owned_new_files[@]}"; do
    [[ -e "$file" ]] && paths+=("$file")
  done
  [[ -d tests/visual/m7-match-operations.visual.spec.ts-snapshots ]] && \
    paths+=(tests/visual/m7-match-operations.visual.spec.ts-snapshots)
  [[ -e reports/m7-verification.json ]] && paths+=(reports/m7-verification.json)

  tar -czf "$ARCHIVE" "${paths[@]}"
  BACKUP_CREATED="true"

  cat > "$BACKUP_DIR/manifest.txt" <<MANIFEST
VERZUS M7.8 backup
Created: $(date -Iseconds)
Branch: $(git branch --show-current 2>/dev/null || echo unavailable)
Commit: $(git rev-parse HEAD 2>/dev/null || echo unavailable)
Archive: $ARCHIVE
Rollback: bash ./$SCRIPT_NAME rollback
MANIFEST

  echo "Rollback archive created: $ARCHIVE"
}

restore_archive() {
  local archive="$1"
  local file

  for file in "${owned_new_files[@]}"; do
    rm -rf "$file"
  done
  rm -rf tests/visual/m7-match-operations.visual.spec.ts-snapshots
  rm -f reports/m7-verification.json
  tar -xzf "$archive"

  rmdir 'src/app/(preview)/m7-match-review' 2>/dev/null || true
  rmdir 'src/app/api/telemetry/matches' 2>/dev/null || true
  rmdir 'src/app/api/health/matches' 2>/dev/null || true
  rmdir src/features/matches/operations/release 2>/dev/null || true
  rmdir src/features/matches/operations/telemetry 2>/dev/null || true
  rmdir tests/e2e/m7 2>/dev/null || true
}

on_install_error() {
  local status=$?
  if [[ "$MODE" == "install" && "$BACKUP_CREATED" == "true" && "$INSTALL_FINISHED" != "true" ]]; then
    echo
    echo "M7.8 installation failed. Restoring the pre-install archive..."
    restore_archive "$ARCHIVE"
    echo "Restored: $ARCHIVE"
  fi
  exit "$status"
}

trap on_install_error ERR

write_release_domain() {
  mkdir -p src/features/matches/operations/release

  cat > src/features/matches/operations/release/match-release.config.ts <<'EOF'
// VERZUS M7.8 MATCH OPERATIONS RELEASE GATE

export type MatchOperationsReleaseMetadata = {
  stage: "7.8";
  environment: string;
  release: string;
  enabled: boolean;
};

export function isMatchOperationsFeatureEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_M7_MATCH_OPERATIONS !== "false";
}

export function getMatchOperationsReleaseMetadata(): MatchOperationsReleaseMetadata {
  return {
    stage: "7.8",
    environment: process.env.NEXT_PUBLIC_APP_ENV ?? "local",
    release: process.env.NEXT_PUBLIC_RELEASE_SHA ?? "local",
    enabled: isMatchOperationsFeatureEnabled(),
  };
}
EOF

  cat > src/features/matches/operations/release/match-release.config.test.ts <<'EOF'
// VERZUS M7.8 MATCH OPERATIONS RELEASE CONFIG TESTS

import { afterEach, describe, expect, it } from "vitest";

import {
  getMatchOperationsReleaseMetadata,
  isMatchOperationsFeatureEnabled,
} from "./match-release.config";

const originalFlag = process.env.NEXT_PUBLIC_ENABLE_M7_MATCH_OPERATIONS;
const originalEnvironment = process.env.NEXT_PUBLIC_APP_ENV;
const originalRelease = process.env.NEXT_PUBLIC_RELEASE_SHA;

afterEach(() => {
  process.env.NEXT_PUBLIC_ENABLE_M7_MATCH_OPERATIONS = originalFlag;
  process.env.NEXT_PUBLIC_APP_ENV = originalEnvironment;
  process.env.NEXT_PUBLIC_RELEASE_SHA = originalRelease;
});

describe("M7.8 match release configuration", () => {
  it("is enabled unless explicitly disabled", () => {
    delete process.env.NEXT_PUBLIC_ENABLE_M7_MATCH_OPERATIONS;
    expect(isMatchOperationsFeatureEnabled()).toBe(true);

    process.env.NEXT_PUBLIC_ENABLE_M7_MATCH_OPERATIONS = "false";
    expect(isMatchOperationsFeatureEnabled()).toBe(false);
  });

  it("exposes traceable release metadata", () => {
    process.env.NEXT_PUBLIC_APP_ENV = "preview";
    process.env.NEXT_PUBLIC_RELEASE_SHA = "release-abc123";

    expect(getMatchOperationsReleaseMetadata()).toEqual({
      stage: "7.8",
      environment: "preview",
      release: "release-abc123",
      enabled: true,
    });
  });
});
EOF

  cat > src/features/matches/operations/release/MatchOperationsFeatureGate.tsx <<'EOF'
// VERZUS M7.8 MATCH OPERATIONS RELEASE GATE

import { Suspense, type ReactNode } from "react";

import { MatchTelemetryBridge } from "../telemetry";
import { getMatchOperationsReleaseMetadata } from "./match-release.config";
import styles from "./MatchOperationsFeatureGate.module.css";

export type MatchOperationsFeatureGateProps = {
  children: ReactNode;
};

export function MatchOperationsFeatureGate({ children }: MatchOperationsFeatureGateProps) {
  const release = getMatchOperationsReleaseMetadata();

  if (!release.enabled) {
    return (
      <main
        className={styles.disabled}
        data-m7-release="7.8"
        data-release={release.release}
        role="main"
      >
        <section aria-labelledby="match-operations-disabled-title" role="status">
          <span>MATCH OPERATIONS · CONTROLLED DEGRADATION</span>
          <h1 id="match-operations-disabled-title">MATCH OPERATIONS TEMPORARILY PAUSED</h1>
          <p>
            Check-in and match operations are disabled for this release. The application shell,
            competition discovery and primary navigation remain available.
          </p>
          <a href="/play">RETURN TO PLAY</a>
        </section>
      </main>
    );
  }

  return (
    <div
      data-app-environment={release.environment}
      data-m7-release="7.8"
      data-release={release.release}
    >
      <Suspense fallback={null}>
        <MatchTelemetryBridge environment={release.environment} release={release.release} />
      </Suspense>
      {children}
    </div>
  );
}
EOF

  cat > src/features/matches/operations/release/MatchOperationsFeatureGate.module.css <<'EOF'
/* VERZUS M7.8 MATCH OPERATIONS RELEASE GATE */

.disabled {
  min-height: min(72vh, 760px);
  display: grid;
  place-items: center;
  padding: clamp(1.5rem, 4vw, 4rem);
}

.disabled section {
  width: min(100%, 760px);
  padding: clamp(1.5rem, 5vw, 3.5rem);
  border: 1px solid color-mix(in srgb, var(--color-accent-primary, #a855f7) 70%, transparent);
  background:
    linear-gradient(145deg, rgb(13 8 29 / 96%), rgb(8 9 22 / 96%)),
    repeating-linear-gradient(0deg, transparent 0 3px, rgb(255 255 255 / 2%) 3px 4px);
  box-shadow: 0 0 48px rgb(168 85 247 / 18%);
}

.disabled span {
  font: 700 0.75rem/1.2 var(--font-interface, sans-serif);
  letter-spacing: 0.16em;
  color: var(--color-accent-primary, #c084fc);
}

.disabled h1 {
  margin: 0.75rem 0;
  font: 800 clamp(1.8rem, 5vw, 3.5rem)/0.95 var(--font-display, sans-serif);
}

.disabled p {
  max-width: 62ch;
  color: var(--color-text-secondary, #b9b4ca);
}

.disabled a {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  margin-top: 1rem;
  padding: 0 1rem;
  border: 1px solid currentColor;
  color: var(--color-accent-primary, #c084fc);
  font-weight: 800;
  text-decoration: none;
}
EOF

  cat > src/features/matches/operations/release/index.ts <<'EOF'
// VERZUS M7.8 MATCH OPERATIONS RELEASE EXPORTS

export * from "./match-release.config";
export { MatchOperationsFeatureGate } from "./MatchOperationsFeatureGate";
EOF
}

write_telemetry_domain() {
  mkdir -p src/features/matches/operations/telemetry

  cat > src/features/matches/operations/telemetry/match-telemetry.schema.ts <<'EOF'
// VERZUS M7.8 MATCH OPERATIONS TELEMETRY

import { z } from "zod";

export const matchTelemetryEventNames = [
  "match.route_viewed",
  "match.state_viewed",
  "match.check_in_started",
  "match.lobby_action_started",
  "match.result_action_started",
  "match.dispute_started",
  "match.terminal_action_started",
  "match.retry_requested",
  "match.resource_failed",
  "match.widget_recovered",
  "match.feature_disabled",
] as const;

export const matchTelemetryEventSchema = z
  .object({
    name: z.enum(matchTelemetryEventNames),
    occurredAt: z.string().datetime({ offset: true }),
    route: z.string().min(1).max(240),
    matchId: z.string().min(1).max(160).optional(),
    state: z.string().min(1).max(80).optional(),
    resource: z.string().min(1).max(80).optional(),
    scenario: z.string().min(1).max(80).optional(),
    code: z.string().min(1).max(120).optional(),
    requestId: z.string().min(1).max(180).optional(),
    status: z.number().int().min(100).max(599).optional(),
    durationMs: z.number().finite().min(0).max(120_000).optional(),
    environment: z.string().min(1).max(40),
    release: z.string().min(1).max(120),
  })
  .strict();

export type MatchTelemetryEvent = z.infer<typeof matchTelemetryEventSchema>;
EOF

  cat > src/features/matches/operations/telemetry/match-telemetry.schema.test.ts <<'EOF'
// VERZUS M7.8 MATCH OPERATIONS TELEMETRY TESTS

import { describe, expect, it } from "vitest";

import { matchTelemetryEventSchema } from "./match-telemetry.schema";

describe("match telemetry schema", () => {
  it("accepts allowlisted, release-scoped events", () => {
    expect(
      matchTelemetryEventSchema.parse({
        name: "match.state_viewed",
        occurredAt: "2026-07-17T00:00:00.000Z",
        route: "/matches/m7-preview",
        matchId: "m7-preview",
        state: "check-in-open",
        environment: "preview",
        release: "abc123",
      }),
    ).toMatchObject({ name: "match.state_viewed", matchId: "m7-preview" });
  });

  it("rejects unknown event names and unexpected fields", () => {
    expect(() =>
      matchTelemetryEventSchema.parse({
        name: "match.secret_dump",
        occurredAt: "2026-07-17T00:00:00.000Z",
        route: "/matches/m7-preview",
        environment: "preview",
        release: "abc123",
        token: "not-allowed",
      }),
    ).toThrow();
  });
});
EOF

  cat > src/features/matches/operations/telemetry/match-telemetry.client.ts <<'EOF'
// VERZUS M7.8 MATCH OPERATIONS TELEMETRY CLIENT

import type { MatchTelemetryEvent } from "./match-telemetry.schema";

type MatchTelemetryInput = Omit<MatchTelemetryEvent, "occurredAt">;

export function trackMatchEvent(event: MatchTelemetryInput): void {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify({ ...event, occurredAt: new Date().toISOString() });
  const endpoint = "/api/telemetry/matches";

  if (navigator.sendBeacon) {
    const accepted = navigator.sendBeacon(endpoint, new Blob([payload], { type: "application/json" }));
    if (accepted) return;
  }

  void fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload,
    keepalive: true,
    credentials: "same-origin",
  }).catch(() => undefined);
}
EOF

  cat > src/features/matches/operations/telemetry/MatchTelemetryBridge.tsx <<'EOF'
// VERZUS M7.8 MATCH OPERATIONS TELEMETRY BRIDGE

"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { trackMatchEvent } from "./match-telemetry.client";

export type MatchTelemetryBridgeProps = {
  environment: string;
  release: string;
};

function getMatchId(pathname: string): string | undefined {
  const segments = pathname.split("/").filter(Boolean);
  return segments[0] === "matches" && segments.length > 1 ? segments[1] : undefined;
}

export function MatchTelemetryBridge({ environment, release }: MatchTelemetryBridgeProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const state = searchParams.get("state") ?? undefined;
  const resource = searchParams.get("resource") ?? undefined;
  const scenario = searchParams.get("scenario") ?? undefined;

  useEffect(() => {
    const base = {
      route: pathname,
      matchId: getMatchId(pathname),
      state,
      resource,
      scenario,
      environment,
      release,
    };

    trackMatchEvent({ name: "match.route_viewed", ...base });

    const root = document.querySelector<HTMLElement>("[data-match-operation-state]");
    if (root?.dataset.matchOperationState) {
      trackMatchEvent({
        name: "match.state_viewed",
        ...base,
        state: root.dataset.matchOperationState,
      });
    }

    const handleClick = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>(
        "button, a, [role='button']",
      );
      if (!target) return;
      const label = (target.getAttribute("aria-label") ?? target.textContent ?? "")
        .trim()
        .toLowerCase();

      if (label.includes("retry")) {
        trackMatchEvent({ name: "match.retry_requested", ...base });
      } else if (label.includes("check in")) {
        trackMatchEvent({ name: "match.check_in_started", ...base });
      } else if (label.includes("lobby") || label.includes("start match")) {
        trackMatchEvent({ name: "match.lobby_action_started", ...base });
      } else if (label.includes("result") || label.includes("confirm score")) {
        trackMatchEvent({ name: "match.result_action_started", ...base });
      } else if (label.includes("dispute")) {
        trackMatchEvent({ name: "match.dispute_started", ...base });
      } else if (
        label.includes("forfeit") ||
        label.includes("cancel match") ||
        label.includes("complete match")
      ) {
        trackMatchEvent({ name: "match.terminal_action_started", ...base });
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [environment, pathname, release, resource, scenario, state]);

  return null;
}
EOF

  cat > src/features/matches/operations/telemetry/index.ts <<'EOF'
// VERZUS M7.8 MATCH OPERATIONS TELEMETRY EXPORTS

export * from "./match-telemetry.schema";
export { trackMatchEvent } from "./match-telemetry.client";
export { MatchTelemetryBridge } from "./MatchTelemetryBridge";
EOF
}

write_layout_and_endpoints() {
  mkdir -p \
    'src/app/(platform)/matches/[matchId]' \
    'src/app/api/telemetry/matches' \
    'src/app/api/health/matches'

  cat > 'src/app/(platform)/matches/[matchId]/layout.tsx' <<'EOF'
// VERZUS M7.8 MATCH OPERATIONS RELEASE GATE LAYOUT

import type { ReactNode } from "react";

import { MatchOperationsFeatureGate } from "@/features/matches/operations/release";

export default function MatchOperationsLayout({ children }: { children: ReactNode }) {
  return <MatchOperationsFeatureGate>{children}</MatchOperationsFeatureGate>;
}
EOF

  cat > 'src/app/api/telemetry/matches/route.ts' <<'EOF'
// VERZUS M7.8 MATCH OPERATIONS TELEMETRY ENDPOINT

import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { matchTelemetryEventSchema } from "@/features/matches/operations/telemetry";

const MAX_BODY_BYTES = 16_384;

function getRequestId(request: NextRequest): string {
  return request.headers.get("x-request-id") ?? `m7-${randomUUID()}`;
}

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: { code: "payload_too_large", requestId } },
      { status: 413, headers: { "cache-control": "no-store", "x-request-id": requestId } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "invalid_json", requestId } },
      { status: 400, headers: { "cache-control": "no-store", "x-request-id": requestId } },
    );
  }

  const parsed = matchTelemetryEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: { code: "invalid_event", requestId } },
      { status: 400, headers: { "cache-control": "no-store", "x-request-id": requestId } },
    );
  }

  console.warn(
    JSON.stringify({
      level: "info",
      domain: "match-operations",
      requestId,
      ...parsed.data,
    }),
  );

  return NextResponse.json(
    { ok: true, requestId },
    { status: 202, headers: { "cache-control": "no-store", "x-request-id": requestId } },
  );
}
EOF

  cat > 'src/app/api/health/matches/route.ts' <<'EOF'
// VERZUS M7.8 MATCH OPERATIONS HEALTH ENDPOINT

import { NextResponse } from "next/server";

import { getMatchOperationsReleaseMetadata } from "@/features/matches/operations/release";

export function GET() {
  const release = getMatchOperationsReleaseMetadata();

  return NextResponse.json(
    {
      ok: true,
      feature: "match-operations",
      stage: release.stage,
      enabled: release.enabled,
      environment: release.environment,
      release: release.release,
      controls: {
        idempotentCheckIn: true,
        serverTime: true,
        versionCheckedResults: true,
        independentEvidence: true,
        auditableDisputes: true,
        widgetIsolation: true,
      },
      checkedAt: new Date().toISOString(),
    },
    { headers: { "cache-control": "no-store" } },
  );
}
EOF
}

write_review_hub() {
  mkdir -p 'src/app/(preview)/m7-match-review'

  cat > 'src/app/(preview)/m7-match-review/page.tsx' <<'EOF'
// VERZUS M7.8 MATCH OPERATIONS VISUAL REVIEW HUB

import Link from "next/link";

import { matchOperationStateLabels, matchOperationStates } from "@/features/matches";
import { getMatchOperationsReleaseMetadata } from "@/features/matches/operations/release";

import styles from "./review.module.css";

const edgeReferences = [
  ["Unauthorized", "/matches/m7-preview?access=unauthorized"],
  ["Forbidden", "/matches/m7-preview?access=forbidden"],
  ["Not found", "/matches/m7-preview?access=not_found"],
  ["Maintenance", "/matches/m7-preview?access=maintenance"],
  ["Offline cached snapshot", "/matches/m7-preview?state=in-progress&availability=offline"],
  ["Stale cached snapshot", "/matches/m7-preview?state=in-progress&availability=stale"],
  [
    "Timeline partial failure",
    "/matches/m7-preview?state=in-progress&resource=timeline&scenario=partial_failure",
  ],
  ["Timeline widget crash", "/matches/m7-preview?state=in-progress&crash=timeline"],
] as const;

export default function M7MatchReviewPage() {
  const release = getMatchOperationsReleaseMetadata();

  return (
    <main className={styles.page} data-m7-review="7.8">
      <header className={styles.hero}>
        <span>M7.8 · RELEASE REVIEW</span>
        <h1>MATCH OPERATIONS</h1>
        <p>
          Review every lifecycle state at 390px, 768px and 1440px before recording final approval.
        </p>
        <dl>
          <div>
            <dt>Environment</dt>
            <dd>{release.environment}</dd>
          </div>
          <div>
            <dt>Release</dt>
            <dd>{release.release}</dd>
          </div>
          <div>
            <dt>Feature</dt>
            <dd>{release.enabled ? "enabled" : "disabled"}</dd>
          </div>
        </dl>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <span>01</span>
          <h2>Lifecycle references</h2>
          <strong>15 states × 3 widths</strong>
        </div>
        <div className={styles.grid}>
          {matchOperationStates.map((state, index) => (
            <Link href={`/matches/m7-preview?state=${state}`} key={state}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{matchOperationStateLabels[state]}</strong>
              <small>{state}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <span>02</span>
          <h2>Failure and access references</h2>
          <strong>Isolation review</strong>
        </div>
        <div className={styles.grid}>
          {edgeReferences.map(([label, href], index) => (
            <Link href={href} key={label}>
              <span>E{String(index + 1).padStart(2, "0")}</span>
              <strong>{label}</strong>
              <small>Open reference</small>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.commands}>
        <h2>Release commands</h2>
        <code>npm run m7:visual:update</code>
        <code>
          VERZUS_M7_VISUAL_APPROVAL=APPROVED VERZUS_M7_APPROVED_BY=&quot;Prismo&quot; npm run
          m7:approve
        </code>
        <code>npm run verify:m7:7.8</code>
        <code>npm run m7:release</code>
      </section>
    </main>
  );
}
EOF

  cat > 'src/app/(preview)/m7-match-review/review.module.css' <<'EOF'
/* VERZUS M7.8 MATCH OPERATIONS VISUAL REVIEW HUB */

.page {
  min-height: 100vh;
  padding: clamp(1rem, 3vw, 3rem);
  color: #f8f6ff;
  background:
    radial-gradient(circle at 20% 0%, rgb(124 58 237 / 22%), transparent 36rem),
    #080611;
}

.hero,
.section,
.commands {
  width: min(100%, 1180px);
  margin-inline: auto;
}

.hero {
  padding: clamp(1.5rem, 4vw, 3rem);
  border: 1px solid rgb(168 85 247 / 52%);
  background: rgb(13 9 28 / 90%);
  box-shadow: 0 0 60px rgb(124 58 237 / 14%);
}

.hero > span,
.sectionHeading > span {
  color: #c084fc;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.hero h1 {
  margin: 0.65rem 0;
  font-size: clamp(2.4rem, 8vw, 6rem);
  line-height: 0.9;
}

.hero p {
  max-width: 70ch;
  color: #c8c1d8;
}

.hero dl {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 2rem 0 0;
}

.hero dl div {
  min-width: 10rem;
  padding: 0.75rem 1rem;
  border-left: 2px solid #a855f7;
  background: rgb(255 255 255 / 4%);
}

.hero dt,
.hero dd {
  margin: 0;
}

.hero dt {
  color: #8f879f;
  font-size: 0.72rem;
  text-transform: uppercase;
}

.section {
  margin-top: 2rem;
}

.sectionHeading {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.sectionHeading h2 {
  margin: 0;
  font-size: clamp(1.2rem, 3vw, 2rem);
}

.sectionHeading strong {
  color: #958ca8;
  font-size: 0.75rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 0.75rem;
}

.grid a {
  min-height: 110px;
  display: grid;
  align-content: center;
  gap: 0.25rem;
  padding: 1rem;
  border: 1px solid rgb(255 255 255 / 10%);
  background: linear-gradient(145deg, rgb(23 16 45 / 96%), rgb(10 9 20 / 96%));
  color: inherit;
  text-decoration: none;
}

.grid a:hover,
.grid a:focus-visible {
  border-color: #a855f7;
  outline: none;
  box-shadow: 0 0 24px rgb(168 85 247 / 22%);
}

.grid a span,
.grid a small {
  color: #958ca8;
}

.commands {
  display: grid;
  gap: 0.5rem;
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid rgb(168 85 247 / 30%);
  background: #0d091c;
}

.commands h2 {
  margin: 0 0 0.5rem;
}

.commands code {
  overflow-wrap: anywhere;
  padding: 0.75rem;
  background: #05040b;
  color: #d8b4fe;
}

@media (max-width: 620px) {
  .sectionHeading {
    grid-template-columns: auto 1fr;
  }

  .sectionHeading strong {
    grid-column: 2;
  }
}
EOF
}

write_tests() {
  mkdir -p tests/integration tests/e2e/m7 tests/visual

  cat > tests/integration/m7-match-release.integration.test.ts <<'EOF'
// VERZUS M7.8 MATCH OPERATIONS RELEASE INTEGRATION

import { describe, expect, it } from "vitest";

import { getMatchOperationsReleaseMetadata } from "../../src/features/matches/operations/release/match-release.config";
import { matchTelemetryEventSchema } from "../../src/features/matches/operations/telemetry/match-telemetry.schema";

describe("M7.8 release integration", () => {
  it("binds stage, release and telemetry to one contract", () => {
    const release = getMatchOperationsReleaseMetadata();
    const event = matchTelemetryEventSchema.parse({
      name: "match.route_viewed",
      occurredAt: new Date().toISOString(),
      route: "/matches/m7-preview",
      matchId: "m7-preview",
      environment: release.environment,
      release: release.release,
    });

    expect(release.stage).toBe("7.8");
    expect(event.environment).toBe(release.environment);
    expect(event.release).toBe(release.release);
  });
});
EOF

  cat > tests/e2e/m7/m7-match-flow.spec.ts <<'EOF'
// VERZUS M7.8 MATCH OPERATIONS E2E

import { expect, test } from "@playwright/test";

test("match lifecycle references remain reachable through the release gate", async ({ page }) => {
  for (const state of ["scheduled", "check-in-open", "lobby-open", "in-progress", "completed"]) {
    await page.goto(`/matches/m7-preview?state=${state}`);
    await expect(page.locator('[data-m7-release="7.8"]')).toBeVisible();
    await expect(page.locator('[data-m7-stage="7.8"]')).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Unhandled Runtime Error");
  }
});

test("health and telemetry endpoints expose controlled contracts", async ({ request }) => {
  const health = await request.get("/api/health/matches");
  expect(health.ok()).toBe(true);
  await expect(health.json()).resolves.toMatchObject({
    ok: true,
    feature: "match-operations",
    stage: "7.8",
  });

  const telemetry = await request.post("/api/telemetry/matches", {
    data: {
      name: "match.route_viewed",
      occurredAt: new Date().toISOString(),
      route: "/matches/m7-preview",
      matchId: "m7-preview",
      environment: "test",
      release: "e2e",
    },
  });
  expect(telemetry.status()).toBe(202);
  expect(telemetry.headers()["x-request-id"]).toBeTruthy();
});
EOF

  cat > tests/e2e/m7/m7-match-accessibility.spec.ts <<'EOF'
// VERZUS M7.8 MATCH OPERATIONS ACCESSIBILITY

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const route of [
  "/matches/m7-preview?state=check-in-open",
  "/matches/m7-preview?state=submit-result",
  "/matches/m7-preview?state=disputed",
  "/matches/m7-preview?access=maintenance",
]) {
  test(`${route} has no serious or critical accessibility violations`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('[data-m7-release="7.8"]')).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    const severe = results.violations.filter(({ impact }) =>
      impact === "serious" || impact === "critical",
    );
    expect(severe).toEqual([]);
  });
}

test("keyboard focus leaves the document body", async ({ page }) => {
  await page.goto("/matches/m7-preview?state=check-in-open");
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement?.tagName);
  expect(focused).not.toBe("BODY");
});
EOF

  cat > tests/e2e/m7/m7-match-failure-injection.spec.ts <<'EOF'
// VERZUS M7.8 MATCH OPERATIONS FAILURE INJECTION

import { expect, test } from "@playwright/test";

const references = [
  "/matches/m7-preview?access=unauthorized",
  "/matches/m7-preview?access=forbidden",
  "/matches/m7-preview?access=not_found",
  "/matches/m7-preview?access=maintenance",
  "/matches/m7-preview?state=in-progress&availability=offline",
  "/matches/m7-preview?state=in-progress&availability=stale",
  "/matches/m7-preview?state=in-progress&resource=timeline&scenario=partial_failure",
  "/matches/m7-preview?state=in-progress&crash=timeline",
] as const;

for (const route of references) {
  test(`${route} remains controlled`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('[data-m7-release="7.8"]')).toBeVisible();
    await expect(page.locator("body")).not.toContainText("Application error");
    await expect(page.locator("body")).not.toContainText("Unhandled Runtime Error");
  });
}
EOF

  cat > tests/visual/m7-match-operations.visual.spec.ts <<'EOF'
// VERZUS M7.8 MATCH OPERATIONS VISUAL REGRESSION

import { expect, test } from "@playwright/test";

const states = [
  "scheduled",
  "check-in-unavailable",
  "check-in-open",
  "checked-in",
  "opponent-not-checked-in",
  "both-ready",
  "lobby-open",
  "in-progress",
  "submit-result",
  "awaiting-opponent-confirmation",
  "result-confirmed",
  "disputed",
  "forfeit",
  "cancelled",
  "completed",
] as const;

for (const state of states) {
  test(`${state} visual baseline`, async ({ page }) => {
    await page.goto(`/matches/m7-preview?state=${state}`);
    await expect(page.locator('[data-m7-release="7.8"]')).toBeVisible();
    await page.addStyleTag({
      content:
        "*,*::before,*::after{animation-duration:0s!important;transition:none!important;caret-color:transparent!important}",
    });
    await expect(page).toHaveScreenshot(`${state}.png`, {
      fullPage: true,
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.01,
    });
  });
}
EOF
}

write_test_configs() {
  cat > playwright.m7.config.ts <<'EOF'
// VERZUS M7.8 PLAYWRIGHT CONFIGURATION

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "line",
  use: {
    baseURL: "http://127.0.0.1:3119",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "mobile-390",
      use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } },
    },
    {
      name: "tablet-768",
      use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } },
    },
    {
      name: "desktop-1440",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } },
    },
  ],
  webServer: {
    command: "npm run m7:preview",
    url: "http://127.0.0.1:3119/api/health/matches",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
EOF

  cat > vitest.m7.config.ts <<'EOF'
// VERZUS M7.8 VITEST CONFIGURATION

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: [
      "src/features/matches/operations/**/*.test.{ts,tsx}",
      "tests/integration/m7-*.test.{ts,tsx}",
    ],
    exclude: ["tests/e2e/**", ".next/**", "node_modules/**"],
  },
});
EOF
}

write_approval_and_release_scripts() {
  cat > scripts/approve-m7-visuals.mjs <<'EOF'
// VERZUS M7.8 VISUAL APPROVAL

import fs from "node:fs";

const file = "docs/milestones/M7/m7-reference-approval.json";
const token = process.env.VERZUS_M7_VISUAL_APPROVAL;
const approvedBy = process.env.VERZUS_M7_APPROVED_BY?.trim();

if (token !== "APPROVED" || !approvedBy) {
  console.error(
    'Approval requires VERZUS_M7_VISUAL_APPROVAL=APPROVED and VERZUS_M7_APPROVED_BY="name".',
  );
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
manifest.releaseGate = {
  status: "approved",
  stage: "7.8",
  approvedAt: new Date().toISOString(),
  approvedBy,
  requiredViewports: [390, 768, 1440],
  requiredSnapshotCount: 45,
};
fs.writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`M7 visual approval recorded for ${approvedBy}.`);
EOF

  cat > scripts/package-m7-release.mjs <<'EOF'
// VERZUS M7.8 IMMUTABLE ARTIFACT PACKAGER

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const buildIdFile = path.join(root, ".next/BUILD_ID");
if (!fs.existsSync(buildIdFile)) {
  console.error("Missing .next/BUILD_ID. Run npm run build before packaging.");
  process.exit(1);
}

const buildId = fs.readFileSync(buildIdFile, "utf8").trim();
const git = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" });
const commit = git.status === 0 ? git.stdout.trim() : "unknown";
const rawRelease = process.env.NEXT_PUBLIC_RELEASE_SHA || commit || buildId;
const release = rawRelease.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 120);
const outputDir = path.join(root, "artifacts/m7-match-operations", release);
fs.mkdirSync(outputDir, { recursive: true });

const archive = path.join(outputDir, `verzus-m7-match-operations-${release}.tar.gz`);
const inputs = [".next", "public", "package.json"];
for (const optional of [
  "package-lock.json",
  "next.config.ts",
  "next.config.mjs",
  "next.config.js",
]) {
  if (fs.existsSync(path.join(root, optional))) inputs.push(optional);
}

const tar = spawnSync("tar", ["-czf", archive, ...inputs], {
  cwd: root,
  stdio: "inherit",
});
if (tar.status !== 0) process.exit(tar.status ?? 1);

const digest = crypto.createHash("sha256").update(fs.readFileSync(archive)).digest("hex");
const manifest = {
  marker: "VERZUS M7.8 IMMUTABLE RELEASE",
  stage: "7.8",
  release,
  sourceCommit: commit,
  buildId,
  artifact: path.basename(archive),
  sha256: digest,
  node: process.version,
  createdAt: new Date().toISOString(),
  promotionRule: "Promote this exact archive through preview, staging and production.",
};
fs.writeFileSync(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`M7 immutable artifact: ${archive}`);
console.log(`SHA-256: ${digest}`);
EOF
}

write_verifier() {
  cat > scripts/verify-m7-7-8.mjs <<'EOF'
// VERZUS M7.8 MATCH OPERATIONS RELEASE GATE

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const technicalOnly = process.argv.includes("--technical-only");
const markersOnly = process.argv.includes("--markers-only");
const failures = [];

const requiredFiles = [
  "src/app/(platform)/matches/[matchId]/layout.tsx",
  "src/features/matches/operations/release/MatchOperationsFeatureGate.tsx",
  "src/features/matches/operations/release/match-release.config.ts",
  "src/features/matches/operations/telemetry/MatchTelemetryBridge.tsx",
  "src/features/matches/operations/telemetry/match-telemetry.schema.ts",
  "src/app/api/telemetry/matches/route.ts",
  "src/app/api/health/matches/route.ts",
  "src/app/(preview)/m7-match-review/page.tsx",
  "tests/integration/m7-match-release.integration.test.ts",
  "tests/e2e/m7/m7-match-flow.spec.ts",
  "tests/e2e/m7/m7-match-failure-injection.spec.ts",
  "tests/e2e/m7/m7-match-accessibility.spec.ts",
  "tests/visual/m7-match-operations.visual.spec.ts",
  "playwright.m7.config.ts",
  "vitest.m7.config.ts",
  "docs/milestones/M7/m7-7-8-testing-observability-release.md",
  "docs/milestones/M7/m7-reference-approval.json",
  "docs/runbooks/m7-match-rollback.md",
  "scripts/approve-m7-visuals.mjs",
  "scripts/package-m7-release.mjs",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`Missing required file: ${file}`);
}

function expectContains(file, marker) {
  const location = path.join(root, file);
  if (!fs.existsSync(location)) return;
  const source = fs.readFileSync(location, "utf8");
  if (!source.includes(marker)) failures.push(`${file} is missing marker: ${marker}`);
}

expectContains("src/app/(platform)/matches/[matchId]/layout.tsx", "VERZUS M7.8");
expectContains(
  "src/features/matches/operations/ui/MatchOperationsResourceScreen.tsx",
  'data-m7-stage="7.8"',
);
expectContains(".env.example", "NEXT_PUBLIC_ENABLE_M7_MATCH_OPERATIONS");
expectContains("src/app/api/telemetry/matches/route.ts", "MAX_BODY_BYTES");
expectContains("scripts/package-m7-release.mjs", "SHA-256");

const packageFile = path.join(root, "package.json");
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  for (const script of [
    "test:m7:7.8:unit",
    "test:m7:7.8:e2e",
    "test:m7:7.8:visual",
    "m7:visual:update",
    "m7:approve",
    "verify:m7:7.8:technical",
    "verify:m7:7.8",
    "m7:artifact",
    "m7:release",
  ]) {
    if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
  }
}

let approvalPassed = true;
if (!technicalOnly) {
  const approvalFile = path.join(root, "docs/milestones/M7/m7-reference-approval.json");
  if (!fs.existsSync(approvalFile)) {
    approvalPassed = false;
    failures.push("Missing M7 visual approval manifest.");
  } else {
    const approval = JSON.parse(fs.readFileSync(approvalFile, "utf8"));
    if (
      approval.releaseGate?.status !== "approved" ||
      !approval.releaseGate?.approvedAt ||
      !approval.releaseGate?.approvedBy
    ) {
      approvalPassed = false;
      failures.push("M7 final visual references are not approved.");
    }
  }

  const snapshotRoot = path.join(root, "tests/visual/m7-match-operations.visual.spec.ts-snapshots");
  const snapshots = fs.existsSync(snapshotRoot)
    ? fs.readdirSync(snapshotRoot).filter((file) => file.endsWith(".png"))
    : [];
  if (snapshots.length < 45) {
    failures.push(
      `Visual baseline incomplete: expected at least 45 PNG snapshots, found ${snapshots.length}.`,
    );
  }
}

const technicalFailures = failures.filter(
  (failure) =>
    !failure.startsWith("M7 final visual references") &&
    !failure.startsWith("Visual baseline incomplete"),
);
const technicalPassed = technicalFailures.length === 0;

console.log(`Technical gate: ${technicalPassed ? "PASS" : "FAIL"}`);
console.log(`Approval gate: ${technicalOnly ? "SKIPPED" : approvalPassed ? "PASS" : "FAIL"}`);

if (!markersOnly) {
  fs.mkdirSync(path.join(root, "reports"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "reports/m7-verification.json"),
    `${JSON.stringify(
      {
        marker: "VERZUS M7.8 MATCH OPERATIONS RELEASE GATE",
        generatedAt: new Date().toISOString(),
        technicalOnly,
        technicalGate: technicalPassed ? "PASS" : "FAIL",
        approvalGate: technicalOnly ? "SKIPPED" : approvalPassed ? "PASS" : "FAIL",
        failures,
      },
      null,
      2,
    )}\n`,
  );
}

if (failures.length > 0) {
  console.error("\nM7.8 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("M7.8 match operations release gate: PASS");
EOF
}

write_docs() {
  mkdir -p docs/milestones/M7 docs/runbooks

  cat > docs/milestones/M7/m7-7-8-testing-observability-release.md <<'EOF'
<!-- VERZUS M7.8 TESTING, OBSERVABILITY AND RELEASE -->
# M7.8 — Testing, Observability and Release

## Intent

Close Milestone 7 only after lifecycle, mutations, failure isolation, visual references and rollback are executable and reviewable.

## Technical gate

```bash
npm run verify:m7:7.8:technical
```

This runs structural verification, focused linting, M7.8 unit/integration tests, repository typecheck, production build and M7 E2E/accessibility/failure-injection tests.

## Visual gate

Generate or update all 45 baselines:

```bash
npm run m7:visual:update
```

Review every state at 390px, 768px and 1440px through `/m7-match-review`, then record approval:

```bash
VERZUS_M7_VISUAL_APPROVAL=APPROVED \
VERZUS_M7_APPROVED_BY="Prismo" \
npm run m7:approve
```

## Full release gate

```bash
npm run verify:m7:7.8
```

## Immutable artifact

```bash
npm run m7:release
```

The artifact is written under `artifacts/m7-match-operations/<release>/` with a SHA-256 manifest. Promote the same archive through preview, staging and production.

## Feature disable

Set `NEXT_PUBLIC_ENABLE_M7_MATCH_OPERATIONS=false` and deploy the same application version. Match routes display a controlled degradation screen while the App Shell remains available.

## Rollback

See `docs/runbooks/m7-match-rollback.md`.
EOF

  cat > docs/runbooks/m7-match-rollback.md <<'EOF'
<!-- VERZUS M7.8 MATCH OPERATIONS ROLLBACK RUNBOOK -->
# M7 Match Operations Rollback

## Fast containment

1. Set `NEXT_PUBLIC_ENABLE_M7_MATCH_OPERATIONS=false`.
2. Confirm `/api/health/matches` reports `enabled: false`.
3. Confirm `/play`, `/compete` and global navigation remain reachable.

## Application rollback

Promote the previously verified immutable archive. Do not rebuild the previous commit during an incident.

Verify:

- release identifier is visible in `/api/health/matches`;
- check-in and result mutations are disabled or served by the intended version;
- no mixed application artifacts remain across instances.

## Installer rollback

```bash
bash ./VERZUS_M7_7_8_Testing_Observability_Release.sh rollback
```

This restores the most recent timestamped pre-M7.8 archive under `.verzus-backups/m7-7-8-testing-observability-release/`.

## Data safety

M7 mock stores are process-local. Production rollback must preserve server-side check-in, result, evidence, dispute and audit records. Never roll back data by deleting audit events.
EOF
}

repair_existing_full_gate_blockers() {
  node <<'NODE'
const fs = require("node:fs");

const m6Playwright = "playwright.m6.config.ts";
if (fs.existsSync(m6Playwright)) {
  let source = fs.readFileSync(m6Playwright, "utf8");
  source = source.replace(/^\s*reducedMotion:\s*"reduce",\s*$/m, "");
  fs.writeFileSync(m6Playwright, source);
}

const lifecycleClient =
  "src/features/competitions/lifecycle/api/competition-lifecycle-api.client.ts";
if (fs.existsSync(lifecycleClient)) {
  let source = fs.readFileSync(lifecycleClient, "utf8");
  source = source.replace(
    /\n\s*signal,\n/,
    "\n      ...(signal ? { signal } : {}),\n",
  );
  fs.writeFileSync(lifecycleClient, source);
}

const lifecycleUiIndex = "src/features/competitions/lifecycle/ui/index.ts";
if (fs.existsSync(lifecycleUiIndex)) {
  let source = fs.readFileSync(lifecycleUiIndex, "utf8");
  source = source.replace(
    'export { CompetitionLifecycleState } from "./CompetitionLifecycleState";',
    'export { CompetitionLifecycleState as CompetitionLifecycleStateView } from "./CompetitionLifecycleState";',
  );
  fs.writeFileSync(lifecycleUiIndex, source);
}
NODE
}

patch_repository() {
  node <<'NODE'
const fs = require("node:fs");

const packageFile = "package.json";
const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
packageJson.scripts ??= {};
Object.assign(packageJson.scripts, {
  "test:m7:7.8:unit":
    "vitest run --config vitest.m7.config.ts src/features/matches/operations/release/match-release.config.test.ts src/features/matches/operations/telemetry/match-telemetry.schema.test.ts tests/integration/m7-match-release.integration.test.ts",
  "test:m7:7.8:e2e": "playwright test --config=playwright.m7.config.ts tests/e2e/m7",
  "test:m7:7.8:visual":
    "playwright test --config=playwright.m7.config.ts tests/visual/m7-match-operations.visual.spec.ts",
  "m7:visual:update":
    "playwright test --config=playwright.m7.config.ts tests/visual/m7-match-operations.visual.spec.ts --update-snapshots",
  "m7:approve": "node scripts/approve-m7-visuals.mjs",
  "verify:m7:7.8:technical":
    "node scripts/verify-m7-7-8.mjs --technical-only && eslint src/features/matches/operations src/app/api/matches src/app/api/telemetry/matches src/app/api/health/matches 'src/app/(platform)/matches/[matchId]' 'src/app/(preview)/m7-match-review' tests/e2e/m7 tests/integration/m7-match-release.integration.test.ts tests/visual/m7-match-operations.visual.spec.ts playwright.m7.config.ts --max-warnings=0 && npm run test:m7:7.8:unit && npm run typecheck && npm run build && npm run test:m7:7.8:e2e",
  "verify:m7:7.8":
    "node scripts/verify-m7-7-8.mjs && npm run lint && npm run typecheck && npm run test && npm run build && npm run test:m7:7.8:e2e && npm run test:m7:7.8:visual",
  "m7:artifact": "node scripts/package-m7-release.mjs",
  "m7:release": "npm run verify:m7:7.8 && npm run m7:artifact",
});
fs.writeFileSync(packageFile, `${JSON.stringify(packageJson, null, 2)}\n`);

const envFile = ".env.example";
let env = fs.readFileSync(envFile, "utf8");
if (!env.includes("NEXT_PUBLIC_ENABLE_M7_MATCH_OPERATIONS=")) {
  if (!env.endsWith("\n")) env += "\n";
  env += "NEXT_PUBLIC_ENABLE_M7_MATCH_OPERATIONS=true\n";
}
fs.writeFileSync(envFile, env);

const screenFile = "src/features/matches/operations/ui/MatchOperationsResourceScreen.tsx";
let screen = fs.readFileSync(screenFile, "utf8");
screen = screen.replace(
  "// VERZUS M7.7 TERMINAL, AUTHORIZATION AND FAILURE ISOLATION",
  "// VERZUS M7.7 TERMINAL, AUTHORIZATION AND FAILURE ISOLATION\n// VERZUS M7.8 TESTING, OBSERVABILITY AND RELEASE",
);
screen = screen.replace('data-m7-stage="7.7"', 'data-m7-stage="7.8"');
if (!screen.includes('data-m7-stage="7.8"')) {
  throw new Error("M7.8 screen stage patch failed");
}
fs.writeFileSync(screenFile, screen);

const indexFile = "src/features/matches/operations/index.ts";
let index = fs.readFileSync(indexFile, "utf8");
for (const line of ['export * from "./release";\n', 'export * from "./telemetry";\n']) {
  if (!index.includes(line)) index += line;
}
fs.writeFileSync(indexFile, index);

const approvalFile = "docs/milestones/M7/m7-reference-approval.json";
const approval = JSON.parse(fs.readFileSync(approvalFile, "utf8"));
approval.releaseGate = {
  status: "pending",
  stage: "7.8",
  requiredViewports: [390, 768, 1440],
  requiredSnapshotCount: 45,
  approvedAt: null,
  approvedBy: null,
};
fs.writeFileSync(approvalFile, `${JSON.stringify(approval, null, 2)}\n`);
NODE
}

format_changed_files() {
  npx --no-install prettier --write \
    package.json \
    playwright.m6.config.ts \
    src/features/competitions/lifecycle/api/competition-lifecycle-api.client.ts \
    src/features/competitions/lifecycle/ui/index.ts \
    src/features/matches/operations/index.ts \
    src/features/matches/operations/ui/MatchOperationsResourceScreen.tsx \
    src/features/matches/operations/release/match-release.config.ts \
    src/features/matches/operations/release/match-release.config.test.ts \
    src/features/matches/operations/release/MatchOperationsFeatureGate.tsx \
    src/features/matches/operations/release/MatchOperationsFeatureGate.module.css \
    src/features/matches/operations/release/index.ts \
    src/features/matches/operations/telemetry/match-telemetry.schema.ts \
    src/features/matches/operations/telemetry/match-telemetry.schema.test.ts \
    src/features/matches/operations/telemetry/match-telemetry.client.ts \
    src/features/matches/operations/telemetry/MatchTelemetryBridge.tsx \
    src/features/matches/operations/telemetry/index.ts \
    'src/app/(platform)/matches/[matchId]/layout.tsx' \
    'src/app/(preview)/m7-match-review/page.tsx' \
    'src/app/(preview)/m7-match-review/review.module.css' \
    'src/app/api/telemetry/matches/route.ts' \
    'src/app/api/health/matches/route.ts' \
    tests/integration/m7-match-release.integration.test.ts \
    tests/e2e/m7/m7-match-flow.spec.ts \
    tests/e2e/m7/m7-match-accessibility.spec.ts \
    tests/e2e/m7/m7-match-failure-injection.spec.ts \
    tests/visual/m7-match-operations.visual.spec.ts \
    playwright.m7.config.ts \
    vitest.m7.config.ts \
    docs/milestones/M7/m7-7-8-testing-observability-release.md \
    docs/milestones/M7/m7-reference-approval.json \
    docs/runbooks/m7-match-rollback.md \
    scripts/approve-m7-visuals.mjs \
    scripts/package-m7-release.mjs \
    scripts/verify-m7-7-8.mjs
}

install() {
  print_plan
  echo
  require_m7_7_prerequisite
  check_owned_files
  backup_current_state

  write_release_domain
  write_telemetry_domain
  write_layout_and_endpoints
  write_review_hub
  write_tests
  write_test_configs
  write_approval_and_release_scripts
  write_verifier
  write_docs
  repair_existing_full_gate_blockers
  patch_repository
  format_changed_files

  echo "Running lightweight M7.8 marker verification..."
  node scripts/verify-m7-7-8.mjs --technical-only --markers-only

  INSTALL_FINISHED="true"
  cat <<'DONE'

M7.8 installation complete.

Technical gate:
  npm run verify:m7:7.8:technical

Preview and review hub:
  npm run m7:preview
  http://127.0.0.1:3119/m7-match-review

Generate visual baselines:
  npm run m7:visual:update

Record final visual approval:
  VERZUS_M7_VISUAL_APPROVAL=APPROVED \
  VERZUS_M7_APPROVED_BY="Prismo" \
  npm run m7:approve

Full release gate:
  npm run verify:m7:7.8

Immutable artifact:
  npm run m7:release

Rollback:
  bash ./VERZUS_M7_7_8_Testing_Observability_Release.sh rollback
DONE
}

rollback() {
  require_repo_root

  local latest
  latest="$(find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | sort | tail -n 1 || true)"
  [[ -n "$latest" && -f "$latest/verzus-m7-7-8-before.tar.gz" ]] || {
    echo "Error: no M7.8 rollback archive found under $BACKUP_ROOT."
    exit 1
  }

  restore_archive "$latest/verzus-m7-7-8-before.tar.gz"
  echo "M7.8 rollback restored: $latest/verzus-m7-7-8-before.tar.gz"
}

case "$MODE" in
  install)
    install
    ;;
  rollback)
    rollback
    ;;
  *)
    echo "Usage: bash ./$SCRIPT_NAME [install|rollback]"
    exit 1
    ;;
esac
