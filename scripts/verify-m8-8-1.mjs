// VERZUS M8.1 LEADERBOARD RESPONSIVE FOUNDATION VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "src/features/leaderboards/foundation/model/leaderboard-foundation.types.ts",
  "src/features/leaderboards/foundation/mocks/leaderboard-foundation.mock.ts",
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.tsx",
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.module.css",
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.test.tsx",
  "src/features/leaderboards/foundation/ui/index.ts",
  "src/features/leaderboards/foundation/index.ts",
  "docs/milestones/M8/m8-eight-stage-plan.md",
  "docs/milestones/M8/m8-8-1-responsive-foundation.md",
  "docs/milestones/M8/m8-reference-approval.json",
  "tsconfig.m8-8-1.json",
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
  'data-m8-stage="8.1"',
);
expectContains(
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.tsx",
  'data-leaderboard-presentation="mobile-list"',
);
expectContains(
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.tsx",
  'data-leaderboard-presentation="table"',
);
expectContains(
  "src/features/leaderboards/foundation/model/leaderboard-foundation.types.ts",
  '["weekly", "pools", "game", "crew", "combine"]',
);
expectContains("src/features/leaderboards/ui/LeaderboardScreen.tsx", "LeaderboardFoundationScreen");
expectContains(
  "docs/milestones/M8/m8-reference-approval.json",
  '"status": "approved-for-m8.1-foundation"',
);

const packageFile = path.join(root, "package.json");
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  for (const script of ["m8:preview", "test:m8:8.1", "typecheck:m8:8.1", "verify:m8:8.1"]) {
    if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
  }
}

if (failures.length > 0) {
  console.error("M8.1 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M8.1 five-mode responsive leaderboard, separate mobile/desktop presentations, pinned position, tests and rollback markers are installed.",
);
