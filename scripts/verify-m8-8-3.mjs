// VERZUS M8.3 SCHEMAS, APIS AND QUERY RESOURCES VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "src/features/leaderboards/resources/model/leaderboard-resource.types.ts",
  "src/features/leaderboards/resources/model/leaderboard-resource.schema.ts",
  "src/features/leaderboards/resources/api/leaderboard-api.schema.ts",
  "src/features/leaderboards/resources/api/leaderboard-api.adapter.ts",
  "src/features/leaderboards/resources/api/leaderboard-api.client.ts",
  "src/features/leaderboards/resources/api/leaderboard.query.ts",
  "src/features/leaderboards/resources/hooks/useLeaderboardResources.ts",
  "src/features/leaderboards/resources/server/mock-leaderboard.service.ts",
  "src/features/leaderboards/resources/server/mock-leaderboard.http.ts",
  "src/features/leaderboards/resources/ui/LeaderboardResourceScreen.tsx",
  "src/app/api/leaderboards/[mode]/summary/route.ts",
  "src/app/api/leaderboards/[mode]/entries/route.ts",
  "src/app/api/leaderboards/[mode]/current-position/route.ts",
  "src/app/api/leaderboards/[mode]/rewards/route.ts",
  "src/app/api/leaderboards/[mode]/status/route.ts",
  "docs/milestones/M8/m8-8-3-schemas-apis-query-resources.md",
  "tsconfig.m8-8-3.json",
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
  'data-m8-stage="8.3"',
);
expectContains(
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.tsx",
  "resourceSnapshot?.entries",
);
expectContains("src/features/leaderboards/ui/LeaderboardScreen.tsx", "LeaderboardResourceScreen");
expectContains(
  "src/features/leaderboards/resources/api/leaderboard-api.adapter.ts",
  "safeParse(payload)",
);
expectContains(
  "src/features/leaderboards/resources/api/leaderboard.query.ts",
  "placeholderData: keepPreviousData",
);
expectContains(
  "src/features/leaderboards/resources/hooks/useLeaderboardResources.ts",
  "leaderboardCurrentPositionQueryOptions",
);
expectContains(
  "src/features/leaderboards/resources/server/mock-leaderboard.service.ts",
  "buildLeaderboardPage",
);
expectContains(
  "src/app/api/leaderboards/[mode]/entries/route.ts",
  'handleMockLeaderboardGet(request, mode, "entries")',
);

const routeRoot = path.join(root, "src/app/api/leaderboards/[mode]");
if (fs.existsSync(routeRoot)) {
  const routeFiles = fs
    .readdirSync(routeRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const expected = ["current-position", "entries", "rewards", "status", "summary"];
  for (const resource of expected) {
    if (!routeFiles.includes(resource))
      failures.push(`Missing independent API resource: ${resource}`);
  }
}

const packageFile = path.join(root, "package.json");
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  for (const script of ["test:m8:8.3", "typecheck:m8:8.3", "verify:m8:8.3"]) {
    if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
  }
}

if (failures.length > 0) {
  console.error("M8.3 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M8.3 Zod schemas, domain adapters, five independent APIs and TanStack Query resource markers are installed.",
);
