// VERZUS M8.2 SEARCH FILTERS URL STATE VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "src/features/leaderboards/explorer/model/leaderboard-query-state.ts",
  "src/features/leaderboards/explorer/model/leaderboard-query-state.test.ts",
  "src/features/leaderboards/explorer/model/leaderboard-ranking.ts",
  "src/features/leaderboards/explorer/model/leaderboard-ranking.test.ts",
  "src/features/leaderboards/explorer/hooks/useLeaderboardUrlState.ts",
  "src/features/leaderboards/explorer/index.ts",
  "docs/milestones/M8/m8-8-2-search-filters-url-state.md",
  "scripts/verify-m8-8-2.mjs",
  "tsconfig.m8-8-2.json",
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
  'data-m8-stage="8.2"',
);
expectContains(
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.tsx",
  "useDebouncedValue(searchInput, 300)",
);
expectContains(
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.tsx",
  'aria-label="Leaderboard pagination"',
);
expectContains(
  "src/features/leaderboards/explorer/model/leaderboard-ranking.ts",
  'return left.id.localeCompare(right.id, "en")',
);
expectContains(
  "src/features/leaderboards/explorer/model/leaderboard-query-state.ts",
  "serializeLeaderboardQueryState",
);
expectContains(
  "src/features/leaderboards/explorer/hooks/useLeaderboardUrlState.ts",
  'window.addEventListener("popstate"',
);
expectContains("src/app/(platform)/leaderboards/weekly/page.tsx", "initialSearchParams");

const packageFile = path.join(root, "package.json");
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  for (const script of ["test:m8:8.2", "typecheck:m8:8.2", "verify:m8:8.2"]) {
    if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
  }
}

if (failures.length > 0) {
  console.error("M8.2 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M8.2 debounced search, URL filters, deterministic sorting, pagination and history-restoration markers are installed.",
);
