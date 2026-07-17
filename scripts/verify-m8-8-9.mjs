// VERZUS M8.9 ENTITY INTEL API AND CARD-SYSTEM VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const requiredFiles = [
  "src/features/profiles/intel-card/resource/player-intel-resource.schema.ts",
  "src/features/profiles/intel-card/resource/player-intel-resource.adapter.ts",
  "src/features/profiles/intel-card/resource/player-intel-resource.client.ts",
  "src/features/profiles/intel-card/resource/player-intel-resource.query.ts",
  "src/features/profiles/intel-card/resource/player-intel-resource.service.ts",
  "src/features/profiles/intel-card/resource/player-intel-resource.test.ts",
  "src/features/crews/intel-card/resource/crew-intel-resource.schema.ts",
  "src/features/crews/intel-card/resource/crew-intel-resource.adapter.ts",
  "src/features/crews/intel-card/resource/crew-intel-resource.client.ts",
  "src/features/crews/intel-card/resource/crew-intel-resource.query.ts",
  "src/features/crews/intel-card/resource/crew-intel-resource.service.ts",
  "src/features/crews/intel-card/resource/crew-intel-resource.test.ts",
  "src/features/matches/intel-card/resource/match-intel-resource.schema.ts",
  "src/features/matches/intel-card/resource/match-intel-resource.adapter.ts",
  "src/features/matches/intel-card/resource/match-intel-resource.client.ts",
  "src/features/matches/intel-card/resource/match-intel-resource.query.ts",
  "src/features/matches/intel-card/resource/match-intel-resource.service.ts",
  "src/features/matches/intel-card/resource/match-intel-resource.test.ts",
  "src/features/leaderboards/interactions/ui/LeaderboardIntelResourceCard.tsx",
  "src/features/leaderboards/interactions/ui/LeaderboardIntelResourceCard.test.tsx",
  "src/app/api/players/[playerId]/intel/route.ts",
  "src/app/api/crews/[crewId]/intel/route.ts",
  "src/app/api/matches/[matchId]/intel/route.ts",
  "docs/milestones/M8/m8-8-9-entity-intel-api-card-system.md",
  "tsconfig.m8-8-9.json",
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
  'data-m8-stage="8.9"',
);
expectContains(
  "src/features/leaderboards/interactions/ui/LeaderboardIntelPreview.tsx",
  "LeaderboardIntelResourceCard",
);
expectContains(
  "src/features/leaderboards/interactions/ui/LeaderboardIntelResourceCard.tsx",
  "playerIntelQueryOptions",
);
expectContains(
  "src/features/leaderboards/interactions/ui/LeaderboardIntelResourceCard.tsx",
  "crewIntelQueryOptions",
);
expectContains(
  "src/features/leaderboards/interactions/ui/LeaderboardIntelResourceCard.tsx",
  "matchIntelQueryOptions",
);
expectContains("src/app/api/players/[playerId]/intel/route.ts", 'source: "mock-player-intel"');
expectContains("src/app/api/crews/[crewId]/intel/route.ts", 'source: "mock-crew-intel"');
expectContains("src/app/api/matches/[matchId]/intel/route.ts", 'source: "mock-match-intel"');
expectContains("src/features/profiles/intel-card/PlayerIntelCard.tsx", "Recent verified matches");
expectContains("src/features/crews/intel-card/CrewIntelCard.tsx", "Leadership and recent form");
expectContains("src/features/matches/intel-card/MatchIntelCard.tsx", "Result integrity");

const packageFile = path.join(root, "package.json");
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  for (const script of ["test:m8:8.9", "typecheck:m8:8.9", "verify:m8:8.9"]) {
    if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
  }
}

if (failures.length > 0) {
  console.error("M8.9 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M8.9 independent Player, Crew and Match intel APIs, Zod adapters, query caches and card-system integration markers are installed.",
);
