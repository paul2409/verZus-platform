// VERZUS M8.5 CURRENT POSITION AND UPDATE STABILITY VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const required = [
  "src/features/leaderboards/live/index.ts",
  "src/features/leaderboards/live/model/leaderboard-live.types.ts",
  "src/features/leaderboards/live/model/leaderboard-movement.ts",
  "src/features/leaderboards/live/model/leaderboard-movement.test.ts",
  "src/features/leaderboards/live/model/leaderboard-stable-update.ts",
  "src/features/leaderboards/live/model/leaderboard-stable-update.test.ts",
  "src/features/leaderboards/live/api/leaderboard-live.schema.ts",
  "src/features/leaderboards/live/api/leaderboard-live.adapter.ts",
  "src/features/leaderboards/live/api/leaderboard-live.adapter.test.ts",
  "src/features/leaderboards/live/api/leaderboard-live.client.ts",
  "src/features/leaderboards/live/api/leaderboard-live.query.ts",
  "src/features/leaderboards/live/hooks/useLeaderboardLiveUpdates.ts",
  "src/features/leaderboards/live/server/leaderboard-live.service.ts",
  "src/features/leaderboards/live/server/leaderboard-live.service.test.ts",
  "src/features/leaderboards/live/server/index.ts",
  "src/features/leaderboards/live/ui/LeaderboardLiveState.test.tsx",
  "src/app/api/leaderboards/[mode]/updates/route.ts",
  "docs/milestones/M8/m8-8-5-current-position-movement-update-stability.md",
  "tsconfig.m8-8-5.json",
];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`Missing required file: ${file}`);
}

function expectContains(file, marker) {
  const location = path.join(root, file);
  if (!fs.existsSync(location)) return;
  if (!fs.readFileSync(location, "utf8").includes(marker)) {
    failures.push(`${file} is missing marker: ${marker}`);
  }
}

expectContains(
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.tsx",
  'data-m8-stage="8.5"',
);
expectContains(
  "src/features/leaderboards/modes/ui/LeaderboardModePresentation.tsx",
  "data-live-changed",
);
expectContains(
  "src/features/leaderboards/live/model/leaderboard-movement.ts",
  "deriveLeaderboardMovement",
);
expectContains(
  "src/features/leaderboards/live/model/leaderboard-stable-update.ts",
  "previousOrder",
);
expectContains(
  "src/features/leaderboards/live/api/leaderboard-live.query.ts",
  "refetchInterval: 30_000",
);
expectContains(
  "src/app/api/leaderboards/[mode]/updates/route.ts",
  '"cache-control": "no-store, max-age=0"',
);
expectContains(
  "src/features/leaderboards/resources/ui/LeaderboardResourceScreen.tsx",
  "mergeLeaderboardLiveSnapshot",
);
expectContains("src/features/leaderboards/index.ts", 'export * from "./live";');

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
for (const script of ["test:m8:8.5", "typecheck:m8:8.5", "verify:m8:8.5"]) {
  if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
}

if (failures.length > 0) {
  console.error("M8.5 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M8.5 independent current position, derived movement, revision polling and stable equal-rank ordering markers are installed.",
);
