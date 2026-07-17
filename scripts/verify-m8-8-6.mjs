// VERZUS M8.6 RELIABILITY AND EDGE-STATE VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "src/features/leaderboards/reliability/index.ts",
  "src/features/leaderboards/reliability/model/leaderboard-reliability.types.ts",
  "src/features/leaderboards/reliability/model/leaderboard-reliability.ts",
  "src/features/leaderboards/reliability/model/leaderboard-reliability.test.ts",
  "src/features/leaderboards/reliability/ui/LeaderboardReliabilityState.tsx",
  "src/features/leaderboards/reliability/ui/LeaderboardReliabilityState.test.tsx",
  "src/features/leaderboards/reliability/ui/index.ts",
  "src/features/leaderboards/resources/api/leaderboard-row-isolation.test.ts",
  "src/features/leaderboards/resources/server/mock-leaderboard-reliability.test.ts",
  "docs/milestones/M8/m8-8-6-reliability-edge-states.md",
  "tsconfig.m8-8-6.json",
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
  'data-m8-stage="8.6"',
);
expectContains(
  "src/features/leaderboards/reliability/model/leaderboard-reliability.ts",
  "parseLeaderboardReliabilitySelection",
);
expectContains(
  "src/features/leaderboards/resources/model/leaderboard-resource.types.ts",
  '"malformed-row"',
);
expectContains(
  "src/features/leaderboards/resources/api/leaderboard-api.adapter.ts",
  "isolatedRowIds",
);
expectContains(
  "src/features/leaderboards/resources/server/mock-leaderboard.http.ts",
  "CONTROLLED SLOW RESOURCE",
);
expectContains(
  "src/features/leaderboards/resources/server/mock-leaderboard.service.ts",
  "leaderboard_unauthorized",
);
expectContains(
  "src/features/leaderboards/resources/ui/LeaderboardResourceScreen.tsx",
  "parseLeaderboardReliabilitySelection",
);
expectContains(
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.module.css",
  "VERZUS M8.6 LEADERBOARD RELIABILITY",
);

const packageFile = path.join(root, "package.json");
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  for (const script of ["test:m8:8.6", "typecheck:m8:8.6", "verify:m8:8.6"]) {
    if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
  }
}

if (failures.length > 0) {
  console.error("M8.6 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M8.6 loading, empty, stale, error, offline, unauthorized, cached-data and malformed-row isolation markers are installed.",
);
