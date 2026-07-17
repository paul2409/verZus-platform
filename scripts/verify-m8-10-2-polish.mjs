// VERZUS M8.10.2 DESKTOP LEADERBOARD POLISH VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "src/features/leaderboards/explorer/model/leaderboard-query-state.ts",
  "src/features/leaderboards/modes/model/leaderboard-mode.registry.ts",
  "src/features/leaderboards/modes/ui/LeaderboardModePresentation.tsx",
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.tsx",
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.module.css",
  "src/features/leaderboards/interactions/ui/LeaderboardInteractiveIdentity.tsx",
  "src/features/leaderboards/interactions/ui/LeaderboardEntityLink.tsx",
  "src/features/leaderboards/interactions/ui/LeaderboardInteractions.module.css",
  "src/features/leaderboards/foundation/ui/LeaderboardDesktopPolish.test.tsx",
  "tests/e2e/m8/m8-leaderboard-desktop-polish.spec.ts",
  "playwright.m8-polish.config.ts",
  "docs/milestones/M8/m8-10-2-desktop-leaderboard-polish.md",
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
  "src/features/leaderboards/explorer/model/leaderboard-query-state.ts",
  "pageSize: 10,",
);
expectContains(
  "src/features/leaderboards/modes/ui/LeaderboardModePresentation.tsx",
  "data-column={column.key}",
);
expectContains(
  "src/features/leaderboards/modes/ui/LeaderboardModePresentation.tsx",
  "LeaderboardAffiliationLink",
);
expectContains(
  "src/features/leaderboards/interactions/ui/LeaderboardInteractiveIdentity.tsx",
  'variant?: "default" | "table"',
);
expectContains(
  "src/features/leaderboards/interactions/ui/LeaderboardInteractiveIdentity.tsx",
  "export function LeaderboardAffiliationLink",
);
expectContains(
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.tsx",
  "page.totalPages > 1 ?",
);
expectContains(
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.module.css",
  "VERZUS M8.10.2 DESKTOP LEADERBOARD POLISH START",
);
expectContains(
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.module.css",
  "table-layout: fixed;",
);
expectContains(
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.module.css",
  '.pinnedBody[data-desktop-pinned="true"]',
);
expectContains(
  "src/features/leaderboards/interactions/ui/LeaderboardEntityLink.tsx",
  "VERZUS M8.10.2 NULL-SAFE ROUTER COMPATIBILITY",
);
expectContains(
  "src/features/leaderboards/interactions/ui/LeaderboardInteractions.module.css",
  "VERZUS M8.10.2 COMPACT TABLE INTERACTIONS START",
);

const packageFile = path.join(root, "package.json");
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  for (const script of ["test:m8:10.2", "typecheck:m8:10.2", "verify:m8:10.2"]) {
    if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
  }
}

if (failures.length > 0) {
  console.error("M8.10.2 desktop leaderboard polish verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M8.10.2 ten-row default, no-overflow width contract, clickable Crew cells, compact rows and desktop current-position deduplication are installed.",
);
