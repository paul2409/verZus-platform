// VERZUS M8.8 COLOR AND INTERACTION VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const requiredFiles = [
  "src/features/leaderboards/interactions/index.ts",
  "src/features/leaderboards/interactions/model/leaderboard-interaction.types.ts",
  "src/features/leaderboards/interactions/model/leaderboard-interaction.types.test.ts",
  "src/features/leaderboards/interactions/model/leaderboard-color-policy.ts",
  "src/features/leaderboards/interactions/model/leaderboard-color-policy.test.ts",
  "src/features/leaderboards/interactions/ui/index.ts",
  "src/features/leaderboards/interactions/ui/LeaderboardEntityLink.tsx",
  "src/features/leaderboards/interactions/ui/LeaderboardInteractiveIdentity.tsx",
  "src/features/leaderboards/interactions/ui/LeaderboardIntelPreview.tsx",
  "src/features/leaderboards/interactions/ui/LeaderboardIntelPreview.test.tsx",
  "src/features/leaderboards/interactions/ui/LeaderboardInteractions.module.css",
  "docs/milestones/M8/m8-8-8-color-interactive-ranking-anatomy.md",
  "tsconfig.m8-8-8.json",
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
  'data-m8-stage="8.8"',
);
expectContains(
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.tsx",
  "LeaderboardIntelPreview",
);
expectContains(
  "src/features/leaderboards/modes/ui/LeaderboardModePresentation.tsx",
  "data-rank-zone={visual.rankZone}",
);
expectContains(
  "src/features/leaderboards/modes/ui/LeaderboardModePresentation.tsx",
  "LeaderboardRecentMatchLink",
);
expectContains(
  "src/features/leaderboards/interactions/ui/LeaderboardEntityLink.tsx",
  "data-intel-entity",
);
expectContains(
  "src/features/leaderboards/interactions/ui/LeaderboardIntelPreview.tsx",
  'role="dialog"',
);
expectContains("src/features/leaderboards/modes/model/leaderboard-mode.types.ts", '"recent-match"');
expectContains(
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.module.css",
  "VERZUS M8.8 TOKEN-DRIVEN COLOR BANDS",
);

const packageFile = path.join(root, "package.json");
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  for (const script of ["test:m8:8.8", "typecheck:m8:8.8", "verify:m8:8.8"]) {
    if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
  }
}

if (failures.length > 0) {
  console.error("M8.8 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M8.8 color bands, explicit player/Crew/match triggers, deep-linked intel cards and accessibility markers are installed.",
);
