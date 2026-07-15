#!/usr/bin/env bash
set -euo pipefail

echo "VERZUS M5 - Robust Play hydration and preview-session repair"
echo "No branch will be created or changed."
echo

PLAY_HOOK="src/features/play/ui/usePlayCommandCenter.ts"
PLAY_PAGE="src/app/(platform)/play/page.tsx"
BOOTSTRAP_ROUTE="src/app/api/dev/m5-session/route.ts"
DOC_FILE="docs/milestones/M5/m5-play-preview-session-repair.md"

required_files=(
  "package.json"
  "$PLAY_HOOK"
  "$PLAY_PAGE"
  "src/shared/session/mock-session.ts"
  "src/features/play/model/play.schema.ts"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "Error: required file not found: $file"
    echo "Run this script from the VERZUS repository root."
    exit 1
  fi
done

echo "KEEP"
echo "  - Production Play component tree"
echo "  - Seven independently authorized Play APIs"
echo "  - Server-side authorization"
echo "  - Existing scenario and failure-isolation contracts"
echo
echo "REUSE"
echo "  - usePlayCommandCenter query orchestration"
echo "  - Existing mock-session cookie"
echo "  - Existing Play scenario schema"
echo
echo "REPLACE"
echo "  - Non-hydration-safe online-state calculation"
echo "  - Development scenario entry handling in /play"
echo
echo "CREATE"
echo "  - Development-only authenticated preview-session endpoint"
echo "  - Repair documentation"
echo

echo "Stopping any process using port 3110..."

if command -v powershell.exe >/dev/null 2>&1; then
  powershell.exe -NoProfile -ExecutionPolicy Bypass -Command '
    try {
      $connections = Get-NetTCPConnection -LocalPort 3110 -ErrorAction SilentlyContinue
      $processIds = @(
        $connections |
          Where-Object { $_.OwningProcess -gt 0 } |
          Select-Object -ExpandProperty OwningProcess -Unique
      )

      foreach ($processId in $processIds) {
        try {
          Stop-Process -Id $processId -Force -ErrorAction Stop
          Write-Host ("Stopped PID {0}" -f $processId)
        } catch {
          Write-Host ("Process {0} was already stopped." -f $processId)
        }
      }
    } catch {
      Write-Host "Port inspection skipped."
    }
  ' || true
fi

mkdir -p "$(dirname "$BOOTSTRAP_ROUTE")" "$(dirname "$DOC_FILE")"

node <<'NODE'
const fs = require("node:fs");

const file =
  "src/features/play/ui/usePlayCommandCenter.ts";

let source = fs.readFileSync(file, "utf8");

if (!source.includes('"use client";')) {
  throw new Error(
    "usePlayCommandCenter.ts is not a client component.",
  );
}

if (
  !source.includes(
    'import { useSyncExternalStore } from "react";',
  )
) {
  source = source.replace(
    '"use client";',
    '"use client";\n\nimport { useSyncExternalStore } from "react";',
  );
}

const helperBlock = `function subscribeToOnlineStatus(
  onStoreChange: () => void,
): () => void {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);

  return () => {
    window.removeEventListener(
      "online",
      onStoreChange,
    );
    window.removeEventListener(
      "offline",
      onStoreChange,
    );
  };
}

function getOnlineSnapshot(): boolean {
  return navigator.onLine;
}

function getServerOnlineSnapshot(): boolean {
  return true;
}

`;

if (
  !source.includes(
    "function subscribeToOnlineStatus(",
  )
) {
  const interfaceMarker =
    "export interface PlayCommandCenterController";

  if (!source.includes(interfaceMarker)) {
    throw new Error(
      "Could not locate PlayCommandCenterController.",
    );
  }

  source = source.replace(
    interfaceMarker,
    `${helperBlock}${interfaceMarker}`,
  );
}

const onlineSectionPattern =
  /  const online\s*=[\s\S]*?;\s*\n\s*const viewModel\s*=/m;

const replacement = `  const browserOnline = useSyncExternalStore(
    subscribeToOnlineStatus,
    getOnlineSnapshot,
    getServerOnlineSnapshot,
  );

  const online =
    scenario !== "offline" && browserOnline;

  const viewModel =`;

if (
  source.includes(
    "const browserOnline = useSyncExternalStore(",
  )
) {
  console.log(
    "Hydration-safe online state already installed.",
  );
} else if (onlineSectionPattern.test(source)) {
  source = source.replace(
    onlineSectionPattern,
    replacement,
  );
  console.log(
    "Replaced the existing online-state block.",
  );
} else {
  const navigatorIndex =
    source.indexOf("navigator.onLine");

  if (navigatorIndex < 0) {
    throw new Error(
      "Could not locate the online-state calculation or navigator.onLine.",
    );
  }

  const functionIndex = source.indexOf(
    "export function usePlayCommandCenter(",
  );

  const viewModelIndex = source.indexOf(
    "  const viewModel =",
    functionIndex,
  );

  if (
    functionIndex < 0 ||
    viewModelIndex < 0 ||
    navigatorIndex < functionIndex ||
    navigatorIndex > viewModelIndex
  ) {
    throw new Error(
      "Could not safely determine the online-state section.",
    );
  }

  const before = source.slice(0, functionIndex);
  const functionPrefix = source.slice(
    functionIndex,
    viewModelIndex,
  );
  const after = source.slice(viewModelIndex);

  const firstConstIndex =
    functionPrefix.lastIndexOf("  const ");

  if (firstConstIndex < 0) {
    throw new Error(
      "Could not locate the final declaration before viewModel.",
    );
  }

  const repairedPrefix = functionPrefix.replace(
    /  const online\s*=[\s\S]*?;\s*$/m,
    `  const browserOnline = useSyncExternalStore(
    subscribeToOnlineStatus,
    getOnlineSnapshot,
    getServerOnlineSnapshot,
  );

  const online =
    scenario !== "offline" && browserOnline;

`,
  );

  if (repairedPrefix === functionPrefix) {
    throw new Error(
      "Fallback repair could not replace the online declaration.",
    );
  }

  source = before + repairedPrefix + after;
  console.log(
    "Applied fallback online-state repair.",
  );
}

fs.writeFileSync(file, source, "utf8");

const finalSource = fs.readFileSync(file, "utf8");

for (const fragment of [
  'import { useSyncExternalStore } from "react";',
  "function subscribeToOnlineStatus(",
  "function getOnlineSnapshot(): boolean",
  "function getServerOnlineSnapshot(): boolean",
  "const browserOnline = useSyncExternalStore(",
  'scenario !== "offline" && browserOnline',
]) {
  if (!finalSource.includes(fragment)) {
    throw new Error(
      `Hydration repair validation failed: missing ${fragment}`,
    );
  }
}

const directNavigatorUses =
  finalSource.match(/navigator\.onLine/g) ?? [];

if (directNavigatorUses.length !== 1) {
  throw new Error(
    `Expected navigator.onLine only inside getOnlineSnapshot, found ${directNavigatorUses.length} occurrences.`,
  );
}

console.log("Hydration-safe online state validated.");
NODE

cat > "$BOOTSTRAP_ROUTE" <<'EOF'
// VERZUS M5 PLAY PREVIEW SESSION REPAIR

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  playScenarioSchema,
} from "@/features/play/model";
import {
  isMockSessionEnabled,
  MOCK_SESSION_COOKIE,
  mockSessionValues,
} from "@/shared/session/mock-session";

function notFoundResponse(): NextResponse {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "not_found",
        message: "Not found.",
        request_id: `m5-preview-${globalThis.crypto.randomUUID()}`,
        retryable: false,
        field_errors: {},
      },
    },
    {
      status: 404,
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}

export function GET(
  request: NextRequest,
): NextResponse {
  if (
    process.env.NODE_ENV === "production" ||
    !isMockSessionEnabled()
  ) {
    return notFoundResponse();
  }

  const parsed = playScenarioSchema.safeParse(
    request.nextUrl.searchParams.get("scenario"),
  );
  const scenario = parsed.success
    ? parsed.data
    : "normal";

  const destination = new URL(
    "/play",
    request.url,
  );
  destination.searchParams.set(
    "scenario",
    scenario,
  );

  const response =
    NextResponse.redirect(destination);

  response.cookies.set(
    MOCK_SESSION_COOKIE,
    mockSessionValues.authenticated,
    {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60,
    },
  );

  response.headers.set(
    "cache-control",
    "no-store",
  );
  response.headers.set(
    "x-verzus-preview-session",
    "authenticated",
  );

  return response;
}
EOF

cat > "$PLAY_PAGE" <<'EOF'
// VERZUS M5 PLAY PREVIEW SESSION REPAIR

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  getPlatformRouteById,
} from "@/components/layout/app-shell";
import {
  playScenarioSchema,
  type PlayScenario,
} from "@/features/play/model";
import {
  PlayCommandCenter,
} from "@/features/play/ui";
import {
  authStateFromMockSession,
  isMockSessionEnabled,
  MOCK_SESSION_COOKIE,
} from "@/shared/session/mock-session";

const route = getPlatformRouteById("play");

export const metadata: Metadata = {
  title: route.title,
  description: route.description,
};

type PlayPageProps = {
  searchParams: Promise<
    Record<
      string,
      string | string[] | undefined
    >
  >;
};

function firstSearchValue(
  value: string | string[] | undefined,
): string | undefined {
  return Array.isArray(value)
    ? value[0]
    : value;
}

export default async function PlayPage({
  searchParams,
}: PlayPageProps) {
  const params = await searchParams;
  const rawScenario = firstSearchValue(
    params.scenario,
  );
  const parsed =
    playScenarioSchema.safeParse(rawScenario);
  const scenario: PlayScenario = parsed.success
    ? parsed.data
    : "normal";

  if (
    rawScenario !== undefined &&
    isMockSessionEnabled() &&
    process.env.NODE_ENV !== "production"
  ) {
    const cookieStore = await cookies();
    const authState =
      authStateFromMockSession(
        cookieStore.get(
          MOCK_SESSION_COOKIE,
        )?.value ?? null,
      );

    if (authState !== "authenticated") {
      redirect(
        `/api/dev/m5-session?scenario=${encodeURIComponent(
          scenario,
        )}`,
      );
    }
  }

  return (
    <PlayCommandCenter scenario={scenario} />
  );
}
EOF

cat > "$DOC_FILE" <<'EOF'
<!-- VERZUS M5 PLAY PREVIEW SESSION REPAIR -->

# M5 Play Hydration and Preview Session Repair

## Hydration failure

The Play hook read `navigator.onLine` during its first render. The server and
browser could therefore produce different HTML before React hydration.

The repair uses `useSyncExternalStore` with:

```text
server snapshot: online
browser snapshot: navigator.onLine
updates: online and offline browser events
```

The explicit `offline` scenario remains deterministic on server and client.

## Unauthorized Play API responses

All seven Play APIs correctly require an authenticated session.

Opening a scenario URL in a fresh browser did not include the existing
`verzus_mock_session` cookie, so each API returned HTTP 401.

A development-only bootstrap endpoint now:

1. validates the requested Play scenario
2. sets the existing authenticated HTTP-only mock cookie
3. redirects only to `/play`
4. returns HTTP 404 in production

No Play API authorization rule was removed or bypassed.

## Preview URL

```text
http://localhost:3110/play?scenario=check_in_open
```

The first request establishes the development preview session and redirects
back to the same scenario.
EOF

echo
echo "Formatting repaired files..."
npx prettier \
  "$PLAY_HOOK" \
  "$PLAY_PAGE" \
  "$BOOTSTRAP_ROUTE" \
  "$DOC_FILE" \
  --write

echo
echo "Running focused ESLint..."
npx eslint \
  "$PLAY_HOOK" \
  "$PLAY_PAGE" \
  "$BOOTSTRAP_ROUTE" \
  --max-warnings=0

echo
echo "Running M5 foundation tests..."
npm run test:m5:foundation

echo
echo "Running focused Play UI tests..."
npm run test:m5:ui

echo
echo "Removing stale Next.js output..."
rm -rf .next

echo
echo "Running TypeScript verification..."
npm run typecheck

echo
echo "Running architecture boundary checks..."
npm run check:boundaries

echo
echo "Running production build..."
npm run build

echo
echo "Repair completed successfully."
echo
echo "Start Play with:"
echo "npm run m5:play"
echo
echo "Open:"
echo "http://localhost:3110/play?scenario=check_in_open"
