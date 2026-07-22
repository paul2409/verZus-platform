#!/usr/bin/env bash
set -Eeuo pipefail

# VERZUS M12.9 - Step 7A v2
# Remove remaining runtime mock/fixture files reported by production guards.
# Preserves legacy content as .txt under tests/fixtures and creates rollback backup.
# Does not run lint, typecheck, tests, E2E, visual tests, or build.

ROOT="${1:-.}"
cd "$ROOT"

fail() {
  printf '\nERROR: %s\n' "$1" >&2
  exit 1
}

[[ -d .git ]] || fail "Run this from the VERZUS repository root, or pass the repository path."
[[ -f package.json ]] || fail "package.json was not found."
node -e 'const p=require("./package.json"); if (p.name !== "verzus-platform") process.exit(1)' \
  || fail "This is not the verzus-platform repository."

for command_name in node npm git tar; do
  command -v "$command_name" >/dev/null 2>&1 || fail "$command_name is required."
done

required_production_files=(
  "src/features/auth/server/auth-session.server.ts"
  "src/features/competitions/server/competition.repository.ts"
  "src/features/competitions/server/competition.service.ts"
  "src/features/matches/operations/server/production-match.service.ts"
  "src/features/leaderboards/resources/server/production-leaderboard.http.ts"
  "src/features/crews/server/crew.repository.ts"
  "src/features/profiles/resources/server/profile-resource.repository.ts"
)

for path in "${required_production_files[@]}"; do
  [[ -f "$path" ]] || fail "Production replacement is missing: $path. Do not delete its legacy mock yet."
done

printf '\n==> Step 7A: remove remaining runtime mocks and fixtures\n'
printf 'Repository: %s\n' "$(pwd)"
printf 'Branch    : %s\n' "$(git branch --show-current 2>/dev/null || printf unknown)"
printf '\nThis step will:\n'
printf '  - archive legacy mock files as non-runtime .txt fixtures\n'
printf '  - delete dead runtime mock servers and stores\n'
printf '  - replace Intel Card mock rendering with a controlled production fallback\n'
printf '  - replace leaderboard mock fallback data with neutral empty boards\n'
printf '  - remove mock exports from runtime barrels\n'
printf '  - retain valid suspended and banned account-state routes\n'
printf '  - run only npm run check:production-guards\n\n'

legacy_paths=(
  "src/features/competitions/details/mocks/competition-detail.mock.ts"
  "src/features/competitions/details/server/mock-competition-detail.http.ts"
  "src/features/competitions/details/server/mock-competition-detail.service.ts"
  "src/features/competitions/discovery/mocks/competition-discovery.mock.ts"
  "src/features/competitions/discovery/server/mock-competition-discovery.http.ts"
  "src/features/competitions/discovery/server/mock-competition-discovery.service.ts"
  "src/features/competitions/entry/server/mock-competition-entry.cookie.ts"
  "src/features/competitions/entry/server/mock-competition-entry.http.ts"
  "src/features/competitions/entry/server/mock-competition-entry.service.ts"
  "src/features/competitions/lifecycle/server/mock-competition-lifecycle.http.ts"
  "src/features/competitions/lifecycle/server/mock-competition-lifecycle.service.ts"
  "src/features/competitions/mocks/competition.mock.ts"
  "src/features/crews/discovery/mocks/crew-discovery.mock.ts"
  "src/features/crews/foundation/mocks/crew-foundation.mock.ts"
  "src/features/crews/intel-card/crew-intel.mock.ts"
  "src/features/leaderboards/foundation/mocks/leaderboard-foundation.mock.ts"
  "src/features/leaderboards/mocks/leaderboard.mock.ts"
  "src/features/leaderboards/resources/server/mock-leaderboard.http.ts"
  "src/features/leaderboards/resources/server/mock-leaderboard.service.ts"
  "src/features/matches/intel-card/match-intel.mock.ts"
  "src/features/matches/mocks/match.mock.ts"
  "src/features/matches/operations/mocks/match-operations.mock.ts"
  "src/features/matches/operations/server/match-resource.fixture.ts"
  "src/features/profiles/intel-card/player-intel.mock.ts"
  "src/shared/failures/mock-failure-scenario.ts"
  "src/shared/session/mock-session.ts"
)

# Old runtime files that are only valid with the fixtures above.
legacy_companion_paths=(
  "src/features/matches/operations/server/match-resource.route.ts"
  "src/features/competitions/lifecycle/server/competition-entry-lifecycle.guard.ts"
)

# Refuse to remove obsolete Match files if production code still imports them directly.
if grep -RInE --include='*.ts' --include='*.tsx' \
  'getMatchOperationsMock|match-resource\.fixture|match-resource\.route' \
  src/app src/features \
  | grep -vE '\.(test|stories)\.(ts|tsx):' \
  | grep -vE 'MatchOperationsScreen\.tsx|match-operations\.mock\.ts|match-resource\.fixture\.ts|match-resource\.route\.ts|operations/index\.ts|operations/server/index\.ts' \
  >/tmp/verzus-step7a-match-refs.txt 2>/dev/null; then
  printf '\nRemaining production references to the obsolete Match fixture path were found:\n' >&2
  cat /tmp/verzus-step7a-match-refs.txt >&2
  rm -f /tmp/verzus-step7a-match-refs.txt
  fail "Step 4D route cutover is incomplete. Fix these references before deleting the fixture path."
fi
rm -f /tmp/verzus-step7a-match-refs.txt

# Refuse to delete competition mocks if any public API still calls mock handlers.
if grep -RInE --include='*.ts' --include='*.tsx' \
  'handleMockCompetition|mock-competition-(detail|discovery|entry|lifecycle)' \
  src/app src/features/competitions \
  | grep -vE '\.(test|stories)\.(ts|tsx):' \
  | grep -vE '/mocks/|/server/mock-|competitions/.*/server/index\.ts|competition-entry-lifecycle\.guard\.ts' \
  >/tmp/verzus-step7a-competition-refs.txt 2>/dev/null; then
  printf '\nRemaining production references to old competition handlers were found:\n' >&2
  cat /tmp/verzus-step7a-competition-refs.txt >&2
  rm -f /tmp/verzus-step7a-competition-refs.txt
  fail "Step 4C API route cutover is incomplete. Fix these references before deleting the old servers."
fi
rm -f /tmp/verzus-step7a-competition-refs.txt

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
GIT_DIR="$(git rev-parse --git-dir)"
BACKUP_DIR="$GIT_DIR/verzus-backups/m12-9-step7a/$TIMESTAMP"
BACKUP_ARCHIVE="$BACKUP_DIR/files-before-step7a.tar.gz"
TOUCHED_FILE="$BACKUP_DIR/touched-paths.txt"
EXISTING_FILE="$BACKUP_DIR/existing-paths.txt"
ARCHIVE_ROOT="tests/fixtures/legacy-runtime-mocks"

mkdir -p "$BACKUP_DIR"

cat > "$TOUCHED_FILE" <<'EOF_TOUCHED'
scripts/check-production-routes.mjs
docs/production-route-surface.md
src/components/primitives/intel-card/IntelCardOverlayHost.tsx
src/features/competitions/details/mocks
src/features/competitions/details/server
src/features/competitions/discovery/mocks
src/features/competitions/discovery/server
src/features/competitions/entry/server
src/features/competitions/lifecycle/server
src/features/competitions/lifecycle/server/competition-entry-lifecycle.guard.ts
src/features/competitions/mocks
src/features/competitions/index.ts
src/features/crews/discovery/mocks
src/features/crews/discovery/index.ts
src/features/crews/foundation/mocks
src/features/crews/foundation/index.ts
src/features/crews/intel-card/crew-intel.mock.ts
src/features/crews/intel-card/index.ts
src/features/leaderboards/foundation/mocks
src/features/leaderboards/foundation/index.ts
src/features/leaderboards/foundation/model/leaderboard-empty-state.ts
src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.tsx
src/features/leaderboards/mocks
src/features/leaderboards/modes/server/leaderboard-mode-read-model.ts
src/features/leaderboards/resources/server/mock-leaderboard.http.ts
src/features/leaderboards/resources/server/mock-leaderboard.service.ts
src/features/leaderboards/resources/server/index.ts
src/features/matches/intel-card/match-intel.mock.ts
src/features/matches/intel-card/index.ts
src/features/matches/mocks
src/features/matches/operations/mocks
src/features/matches/operations/index.ts
src/features/matches/operations/server/index.ts
src/features/matches/operations/server/match-resource.fixture.ts
src/features/matches/operations/server/match-resource.route.ts
src/features/matches/operations/ui/MatchOperationsScreen.tsx
src/features/matches/operations/ui/MatchAvailabilityStateScreen.tsx
src/features/profiles/intel-card/player-intel.mock.ts
src/features/profiles/intel-card/index.ts
src/shared/failures/mock-failure-scenario.ts
src/shared/failures/index.ts
src/shared/session/mock-session.ts
tests/fixtures/legacy-runtime-mocks
EOF_TOUCHED

: > "$EXISTING_FILE"
while IFS= read -r path; do
  [[ -e "$path" ]] && printf '%s\n' "$path" >> "$EXISTING_FILE"
done < "$TOUCHED_FILE"

if [[ -s "$EXISTING_FILE" ]]; then
  tar -czf "$BACKUP_ARCHIVE" -T "$EXISTING_FILE"
else
  tar -czf "$BACKUP_ARCHIVE" --files-from /dev/null
fi

RESTORE_REQUIRED=true
restore_on_error() {
  local status=$?
  if [[ "$RESTORE_REQUIRED" == true ]]; then
    printf '\nStep 7A failed. Restoring repository files from:\n  %s\n' "$BACKUP_DIR" >&2
    while IFS= read -r path; do
      rm -rf -- "$path"
    done < "$TOUCHED_FILE"
    tar -xzf "$BACKUP_ARCHIVE" -C .
    printf 'Repository files restored.\n' >&2
  fi
  exit "$status"
}
trap restore_on_error ERR

printf '==> Retaining valid controlled account-state routes\n'
node <<'EOF_ACCOUNT_ROUTES'
const fs = require('node:fs');

const checkerPath = 'scripts/check-production-routes.mjs';
const docsPath = 'docs/production-route-surface.md';
const routes = ['/account/suspended', '/account/banned'];

if (!fs.existsSync(checkerPath)) {
  throw new Error(`${checkerPath} is missing. Run Step 7 before Step 7A.`);
}

let checker = fs.readFileSync(checkerPath, 'utf8');
const missingRoutes = routes.filter((route) => !checker.includes(`  "${route}",`));
if (missingRoutes.length > 0) {
  const marker = '  "/session-expired",';
  if (!checker.includes(marker)) {
    throw new Error(`Could not locate the anonymous route marker in ${checkerPath}.`);
  }

  checker = checker.replace(
    marker,
    `${marker}\n${missingRoutes.map((route) => `  "${route}",`).join('\n')}`,
  );
  fs.writeFileSync(checkerPath, checker);
}

if (fs.existsSync(docsPath)) {
  let docs = fs.readFileSync(docsPath, 'utf8');
  const missingDocs = routes.filter((route) => !docs.includes(`- \`${route}\``));

  if (missingDocs.length > 0) {
    const section = [
      '## Controlled account states',
      '',
      '- `/account/suspended`',
      '- `/account/banned`',
      '',
    ].join('\n');
    const onboardingMarker = '## Onboarding';

    docs = docs.includes(onboardingMarker)
      ? docs.replace(onboardingMarker, `${section}\n${onboardingMarker}`)
      : `${docs.trimEnd()}\n\n${section}`;

    fs.writeFileSync(docsPath, docs);
  }
}
EOF_ACCOUNT_ROUTES

printf '==> Archiving legacy runtime fixtures outside src\n' 
mkdir -p "$ARCHIVE_ROOT"
cat > "$ARCHIVE_ROOT/README.md" <<'EOF_README'
# Legacy runtime fixtures

These files were removed from `src` during M12.9 Step 7A.

They are retained only as plain-text historical references. They are not imported,
compiled, bundled, seeded, or used by production code. New deterministic fixtures
must be created inside the owning test directory and must never be imported by
runtime application or server modules.
EOF_README

for path in "${legacy_paths[@]}"; do
  if [[ -f "$path" ]]; then
    target="$ARCHIVE_ROOT/$path.txt"
    mkdir -p "$(dirname "$target")"
    cp "$path" "$target"
  fi
done

printf '==> Replacing the shared Intel Card mock renderer\n'
cat > src/components/primitives/intel-card/IntelCardOverlayHost.tsx <<'EOF_INTEL'
"use client";

import { Modal } from "@/components/primitives/overlay";

import { useIntelCard } from "./IntelCardProvider";
import styles from "./IntelCardOverlayHost.module.css";

function resolveDestination(type: string, id: string): string | null {
  switch (type) {
    case "player":
      return `/players/${encodeURIComponent(id)}`;
    case "crew":
      return `/crews/${encodeURIComponent(id)}`;
    case "match":
    case "crewWar":
      return `/matches/${encodeURIComponent(id)}`;
    default:
      return null;
  }
}

export function IntelCardOverlayHost() {
  const { open, request, closeIntel } = useIntelCard();

  if (!request) return null;

  const destination = resolveDestination(request.type, request.id);

  return (
    <Modal
      description="Live entity intelligence is temporarily unavailable."
      onOpenChange={(next) => {
        if (!next) closeIntel();
      }}
      open={open}
      size="lg"
      title={request.label ?? "Entity details"}
    >
      <div className={styles.host}>
        <section aria-live="polite">
          <h3>Live intel unavailable</h3>
          <p>
            VERZUS could not load a verified intelligence snapshot. No placeholder or
            fictional record has been substituted.
          </p>
          {destination ? <a href={destination}>Open the full production record</a> : null}
        </section>
      </div>
    </Modal>
  );
}
EOF_INTEL

printf '==> Replacing the cached Match fixture renderer\n'
cat > src/features/matches/operations/ui/MatchOperationsScreen.tsx <<'EOF_MATCH_SCREEN'
// VERZUS M12.9 PRODUCTION CACHED MATCH SNAPSHOT

import type { MatchOperationsViewModel } from "../model/match-operations.types";
import {
  CheckInPanel,
  DisputePanel,
  EvidenceUploader,
  LobbyPanel,
  MatchHeader,
  MatchSupportPanel,
  MatchTimeline,
  ParticipantPanel,
  ResultSubmissionPanel,
} from "./MatchOperationsPanels";
import styles from "./MatchOperationsScreen.module.css";

export type MatchOperationsScreenProps = {
  match: MatchOperationsViewModel;
};

export function MatchOperationsScreen({ match }: MatchOperationsScreenProps) {
  return (
    <main className={styles.page} data-match-operation-state={match.state}>
      <MatchHeader match={match} />
      <ParticipantPanel match={match} />

      <div className={styles.operationsGrid}>
        <MatchTimeline match={match} />

        <div className={styles.primaryColumn}>
          <CheckInPanel match={match} />
          <LobbyPanel match={match} />
          <ResultSubmissionPanel match={match} />
          <DisputePanel match={match} />
          <EvidenceUploader match={match} />
        </div>

        <MatchSupportPanel match={match} />
      </div>
    </main>
  );
}
EOF_MATCH_SCREEN

node <<'EOF_MATCH_AVAILABILITY'
const fs = require('node:fs');
const path = 'src/features/matches/operations/ui/MatchAvailabilityStateScreen.tsx';
if (fs.existsSync(path)) {
  let source = fs.readFileSync(path, 'utf8');
  source = source.replace(
    'href={`/matches/${encodeURIComponent(initialMatch.id)}?state=${initialMatch.state}`}',
    'href={`/matches/${encodeURIComponent(initialMatch.id)}`}',
  );
  source = source.replace(
    /<MatchOperationsScreen\s+clock=\{initialMatch\.clock\}\s+matchId=\{initialMatch\.id\}\s+state=\{initialMatch\.state\}\s*\/>/m,
    '<MatchOperationsScreen match={initialMatch} />',
  );
  fs.writeFileSync(path, source);
}
EOF_MATCH_AVAILABILITY

printf '==> Creating neutral leaderboard fallback boards\n'
mkdir -p src/features/leaderboards/foundation/model
cat > src/features/leaderboards/foundation/model/leaderboard-empty-state.ts <<'EOF_LEADERBOARD_EMPTY'
import type {
  LeaderboardEntityType,
  LeaderboardFoundationBoard,
  LeaderboardFoundationRow,
  LeaderboardMode,
} from "./leaderboard-foundation.types";

const modeCopy: Record<
  LeaderboardMode,
  { eyebrow: string; title: string; description: string; entityType: LeaderboardEntityType }
> = {
  weekly: {
    eyebrow: "Weekly standings",
    title: "Weekly leaderboard",
    description: "Confirmed weekly results will appear here.",
    entityType: "player",
  },
  pools: {
    eyebrow: "Pool standings",
    title: "Pool leaderboard",
    description: "Confirmed pool standings will appear here.",
    entityType: "pool",
  },
  game: {
    eyebrow: "Game rankings",
    title: "Game leaderboard",
    description: "Confirmed game-lane rankings will appear here.",
    entityType: "player",
  },
  crew: {
    eyebrow: "Crew championship",
    title: "Crew leaderboard",
    description: "Confirmed Crew standings will appear here.",
    entityType: "crew",
  },
  combine: {
    eyebrow: "Combine rankings",
    title: "Combine leaderboard",
    description: "Confirmed combine rankings will appear here.",
    entityType: "player",
  },
};

function unrankedEntry(mode: LeaderboardMode): LeaderboardFoundationRow {
  return {
    id: `unranked-${mode}`,
    rank: 0,
    previousRank: null,
    movement: "same",
    movementDelta: null,
    entityType: modeCopy[mode].entityType,
    name: "Unranked",
    handle: "No confirmed position",
    initials: "--",
    crewName: null,
    countryCode: "--",
    game: "ea-fc",
    scope: "global",
    wins: 0,
    losses: 0,
    winRate: 0,
    points: 0,
    streak: 0,
    trust: 0,
    tier: "bronze",
    memberCount: mode === "crew" ? 0 : null,
    isCurrentUser: true,
  };
}

export const emptyLeaderboardBoards: Record<LeaderboardMode, LeaderboardFoundationBoard> = {
  weekly: createEmptyBoard("weekly"),
  pools: createEmptyBoard("pools"),
  game: createEmptyBoard("game"),
  crew: createEmptyBoard("crew"),
  combine: createEmptyBoard("combine"),
};

function createEmptyBoard(mode: LeaderboardMode): LeaderboardFoundationBoard {
  const copy = modeCopy[mode];
  return {
    mode,
    eyebrow: copy.eyebrow,
    title: copy.title,
    description: copy.description,
    periodLabel: "No active period",
    countdownLabel: "Awaiting confirmed results",
    totalCompetitors: 0,
    percentileLabel: "Unranked",
    rows: [],
    currentEntry: unrankedEntry(mode),
    rewards: [],
  };
}
EOF_LEADERBOARD_EMPTY

node <<'EOF_NODE_PATCH'
const fs = require('node:fs');

function edit(path, transform) {
  if (!fs.existsSync(path)) return;
  const before = fs.readFileSync(path, 'utf8');
  const after = transform(before);
  if (after !== before) fs.writeFileSync(path, after);
}

function removeLinesContaining(source, needles) {
  return source
    .split(/\r?\n/)
    .filter((line) => !needles.some((needle) => line.includes(needle)))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s*$/, '\n');
}

edit('src/features/competitions/index.ts', (source) =>
  removeLinesContaining(source, ['competitionPreviewMock', './mocks/competition.mock']),
);
edit('src/features/crews/discovery/index.ts', (source) =>
  removeLinesContaining(source, ['crew-discovery.mock', 'crewDiscoveryMock']),
);
edit('src/features/crews/foundation/index.ts', (source) =>
  removeLinesContaining(source, ['crew-foundation.mock', 'getCrewFoundationMock']),
);
edit('src/features/crews/intel-card/index.ts', (source) =>
  removeLinesContaining(source, ['crew-intel.mock', 'crewIntelMock']),
);
edit('src/features/profiles/intel-card/index.ts', (source) =>
  removeLinesContaining(source, ['player-intel.mock', 'playerIntelMock']),
);
edit('src/features/matches/intel-card/index.ts', (source) =>
  removeLinesContaining(source, ['match-intel.mock', 'matchIntelMock', 'warMatchIntelMock']),
);
edit('src/features/matches/operations/index.ts', (source) =>
  removeLinesContaining(source, ['match-operations.mock', 'getMatchOperationsMock']),
);
edit('src/features/matches/operations/server/index.ts', (source) =>
  removeLinesContaining(source, ['match-resource.fixture', 'match-resource.route']),
);
edit('src/shared/failures/index.ts', (source) =>
  removeLinesContaining(source, [
    'mock-failure-scenario',
    'mockFailureScenarioValues',
    'resolveMockFailureScenario',
    'MockFailureScenario',
    'ResolveMockFailureScenarioInput',
  ]),
);
edit('src/features/leaderboards/foundation/index.ts', (source) => {
  let next = removeLinesContaining(source, [
    'leaderboard-foundation.mock',
    'leaderboardFoundationBoards',
  ]);
  if (!next.includes('leaderboard-empty-state')) {
    next = next.replace(
      'export * from "./model/leaderboard-foundation.types";',
      'export * from "./model/leaderboard-foundation.types";\nexport * from "./model/leaderboard-empty-state";',
    );
  }
  return next;
});
edit('src/features/leaderboards/resources/server/index.ts', (source) =>
  removeLinesContaining(source, ['mock-leaderboard.http', 'mock-leaderboard.service']),
);

edit('src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.tsx', (source) => {
  let next = source.replace(
    'import { leaderboardFoundationBoards } from "../mocks/leaderboard-foundation.mock";',
    'import { emptyLeaderboardBoards } from "../model/leaderboard-empty-state";',
  );
  next = next.replace(
    'const localBoard = leaderboardFoundationBoards[state.mode];',
    'const localBoard = emptyLeaderboardBoards[state.mode];',
  );
  next = next.replace(
    ': "Updated 2 minutes ago";',
    ': "No confirmed update yet";',
  );
  next = next.replace(
    'const showCurrentPosition = !reliability || currentPositionHealth?.hasData === true;',
    'const showCurrentPosition =\n    Boolean(resourceSnapshot?.currentPosition?.entry) &&\n    (!reliability || currentPositionHealth?.hasData === true);',
  );
  next = next.replace(
    'const showRewards = !reliability || rewardsHealth?.hasData === true;',
    'const showRewards =\n    Boolean(resourceSnapshot?.rewards?.items.length) &&\n    (!reliability || rewardsHealth?.hasData === true);',
  );
  next = next.replace(
    'data-resource-source={resourceSnapshot ? "api" : "local"}',
    'data-resource-source={resourceSnapshot ? "api" : "empty"}',
  );
  return next;
});

edit('src/features/leaderboards/modes/server/leaderboard-mode-read-model.ts', (source) =>
  source
    .replace(
      'import { leaderboardFoundationBoards } from "../../foundation/mocks/leaderboard-foundation.mock";',
      'import { emptyLeaderboardBoards } from "../../foundation/model/leaderboard-empty-state";',
    )
    .replaceAll('leaderboardFoundationBoards.', 'emptyLeaderboardBoards.'),
);
EOF_NODE_PATCH

printf '==> Removing obsolete runtime paths\n'
for path in "${legacy_paths[@]}" "${legacy_companion_paths[@]}"; do
  rm -f -- "$path"
done

# Remove empty mock directories but retain model/api/ui directories.
find src/features/competitions src/features/crews src/features/leaderboards src/features/matches \
  -type d \( -name mocks -o -name fixtures \) -empty -delete 2>/dev/null || true

# Old competition server barrels are no longer part of the production path.
for index_file in \
  src/features/competitions/details/server/index.ts \
  src/features/competitions/discovery/server/index.ts \
  src/features/competitions/entry/server/index.ts \
  src/features/competitions/lifecycle/server/index.ts; do
  if [[ -f "$index_file" ]]; then
    node - "$index_file" <<'EOF_INDEX'
const fs = require('node:fs');
const path = process.argv[2];
const before = fs.readFileSync(path, 'utf8');
const after = before
  .split(/\r?\n/)
  .filter((line) => !/mock-|MockCompetition|MOCK_COMPETITION/.test(line))
  .join('\n')
  .replace(/\n{3,}/g, '\n\n')
  .replace(/\s*$/, '\n');
fs.writeFileSync(path, after.trim() ? after : 'export {};\n');
EOF_INDEX
  fi
done

printf '==> Verifying runtime imports before running the guard\n'
if grep -RInE --include='*.ts' --include='*.tsx' \
  '(from|import\()[^;]*(/mock|/mocks|\.mock|/fixture|/fixtures|\.fixture|/seed|/seeds)' \
  src \
  | grep -vE '\.(test|stories)\.(ts|tsx):' \
  >/tmp/verzus-step7a-imports.txt 2>/dev/null; then
  cat /tmp/verzus-step7a-imports.txt >&2
  rm -f /tmp/verzus-step7a-imports.txt
  fail "Runtime imports still reference mock, fixture, or seed modules."
fi
rm -f /tmp/verzus-step7a-imports.txt

printf '==> Running only the production guard gate\n'
set +e
npm run check:production-guards
GUARD_STATUS=$?
set -e

RESTORE_REQUIRED=false
trap - ERR

if [[ "$GUARD_STATUS" -ne 0 ]]; then
  printf '\nSTEP 7A APPLIED, BUT ANOTHER PRODUCTION GUARD STILL FAILS.\n'
  printf 'The runtime mock/fixture cleanup was kept.\n'
  printf 'Run the failing individual guard shown above for the next narrow remediation.\n'
  printf 'Backup: %s\n' "$BACKUP_DIR"
  exit "$GUARD_STATUS"
fi

printf '\nSTEP 7A COMPLETE\n\n'
printf 'Remaining runtime mock and fixture files were removed from src.\n'
printf 'Legacy content was retained only as plain-text test reference.\n'
printf 'Intel Cards now fail closed instead of rendering fictional entities.\n'
printf 'Leaderboards use neutral empty boards until production data loads.\n'
printf 'Valid suspended and banned account-state routes remain allowlisted.\n'
printf 'Production guards now pass.\n'
printf 'Backup: %s\n' "$BACKUP_DIR"
