// VERZUS M8.7 PERFORMANCE, ACCESSIBILITY AND FAILURE-ISOLATION VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "src/features/leaderboards/quality/index.ts",
  "src/features/leaderboards/quality/model/leaderboard-quality.types.ts",
  "src/features/leaderboards/quality/model/leaderboard-quality.types.test.ts",
  "src/features/leaderboards/quality/model/leaderboard-performance.ts",
  "src/features/leaderboards/quality/model/leaderboard-performance.test.ts",
  "src/features/leaderboards/quality/ui/index.ts",
  "src/features/leaderboards/quality/ui/LeaderboardModeTabs.tsx",
  "src/features/leaderboards/quality/ui/LeaderboardModeTabs.test.tsx",
  "src/features/leaderboards/quality/ui/LeaderboardWidgetBoundary.tsx",
  "src/features/leaderboards/quality/ui/LeaderboardWidgetBoundary.test.tsx",
  "src/features/leaderboards/quality/ui/LeaderboardAccessibility.test.tsx",
  "docs/milestones/M8/m8-8-7-performance-accessibility-failure-isolation.md",
  "tsconfig.m8-8-7.json",
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
  'data-m8-stage="8.7"',
);
expectContains(
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.tsx",
  'href="#leaderboard-results"',
);
expectContains(
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.tsx",
  'target="ranking"',
);
expectContains(
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.tsx",
  'target="current-position"',
);
expectContains(
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.tsx",
  'target="rewards"',
);
expectContains("src/features/leaderboards/quality/ui/LeaderboardModeTabs.tsx", 'role="tablist"');
expectContains(
  "src/features/leaderboards/modes/ui/LeaderboardModePresentation.tsx",
  "aria-sort={columnAriaSort",
);
expectContains(
  "src/features/leaderboards/quality/model/leaderboard-performance.ts",
  "leaderboardMaximumVisibleRows = 10",
);
expectContains(
  "src/features/leaderboards/resources/ui/LeaderboardResourceScreen.tsx",
  "parseLeaderboardCrashTarget",
);
expectContains(
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.module.css",
  "VERZUS M8.7 PERFORMANCE, ACCESSIBILITY AND FAILURE ISOLATION",
);

const packageFile = path.join(root, "package.json");
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  for (const script of ["test:m8:8.7", "typecheck:m8:8.7", "verify:m8:8.7"]) {
    if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
  }
}

if (failures.length > 0) {
  console.error("M8.7 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M8.7 keyboard navigation, table semantics, render budget and independent widget-boundary markers are installed.",
);
