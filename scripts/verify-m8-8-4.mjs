// VERZUS M8.4 MODE RESOURCES AND RANKING COMPOSITION VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "src/features/leaderboards/modes/model/leaderboard-mode.types.ts",
  "src/features/leaderboards/modes/model/leaderboard-mode.registry.ts",
  "src/features/leaderboards/modes/model/leaderboard-mode.registry.test.ts",
  "src/features/leaderboards/modes/model/leaderboard-mode-api.adapter.test.ts",
  "src/features/leaderboards/modes/model/leaderboard-mode-query.test.ts",
  "src/features/leaderboards/modes/server/leaderboard-mode-read-model.ts",
  "src/features/leaderboards/modes/server/leaderboard-mode-read-model.test.ts",
  "src/features/leaderboards/modes/ui/LeaderboardModePresentation.tsx",
  "src/features/leaderboards/modes/ui/LeaderboardModePresentation.test.tsx",
  "src/app/api/leaderboards/[mode]/composition/route.ts",
  "docs/milestones/M8/m8-8-4-mode-resources-ranking-composition.md",
  "tsconfig.m8-8-4.json",
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

expectContains(
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.tsx",
  'data-m8-stage="8.4"',
);
expectContains(
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.tsx",
  "LeaderboardModeDesktopTable",
);
expectContains(
  "src/features/leaderboards/modes/model/leaderboard-mode.registry.ts",
  "Pool points before advancement lock",
);
expectContains(
  "src/features/leaderboards/modes/model/leaderboard-mode.registry.ts",
  "Normalized cross-game combine score",
);
expectContains(
  "src/features/leaderboards/modes/server/leaderboard-mode-read-model.ts",
  "createCrewChampionshipReadModel",
);
expectContains(
  "src/features/leaderboards/resources/api/leaderboard-api.adapter.ts",
  "adaptLeaderboardCompositionPayload",
);
expectContains(
  "src/features/leaderboards/resources/api/leaderboard.query.ts",
  "leaderboardCompositionQueryOptions",
);
expectContains(
  "src/features/leaderboards/resources/hooks/useLeaderboardResources.ts",
  "composition.data",
);
expectContains(
  "src/features/leaderboards/resources/server/mock-leaderboard.service.ts",
  'case "composition"',
);
expectContains(
  "src/app/api/leaderboards/[mode]/composition/route.ts",
  'handleMockLeaderboardGet(request, mode, "composition")',
);

const packageFile = path.join(root, "package.json");
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  for (const script of ["test:m8:8.4", "typecheck:m8:8.4", "verify:m8:8.4"]) {
    if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
  }
}

if (failures.length > 0) {
  console.error("M8.4 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M8.4 weekly player, pool, game lane, Crew and combine read-model composition markers are installed.",
);
