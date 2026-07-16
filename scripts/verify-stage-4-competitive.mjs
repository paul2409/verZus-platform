import fs from "node:fs";

const requiredFiles = [
  "src/features/leaderboards/ui/LeaderboardScreen.tsx",
  "src/features/leaderboards/ui/LeaderboardScreen.module.css",
  "src/features/crews/ui/CrewsScreen.tsx",
  "src/features/crews/ui/CrewsScreen.module.css",
  "src/features/crews/ui/IslandElitesIntelCard.tsx",
  "src/features/matches/ui/MatchesScreen.tsx",
  "src/features/matches/ui/MatchesScreen.module.css",
  "src/features/competitions/ui/CompetitionDiscoveryScreen.tsx",
  "src/features/competitions/ui/CompetitionDiscoveryScreen.module.css",
  "src/features/rewards/ui/RewardsScreen.tsx",
  "src/features/rewards/ui/RewardsScreen.module.css",
  "src/app/(platform)/leaderboards/weekly/page.tsx",
  "src/app/(platform)/crews/page.tsx",
  "src/app/(platform)/matches/page.tsx",
  "src/app/(platform)/compete/page.tsx",
  "src/app/(platform)/rewards/page.tsx",
];

const routeExpectations = new Map([
  ["src/app/(platform)/leaderboards/weekly/page.tsx", "LeaderboardScreen"],
  ["src/app/(platform)/crews/page.tsx", "CrewsScreen"],
  ["src/app/(platform)/matches/page.tsx", "MatchesScreen"],
  ["src/app/(platform)/compete/page.tsx", "CompetitionDiscoveryScreen"],
  ["src/app/(platform)/rewards/page.tsx", "RewardsScreen"],
]);

const screenMarkers = new Map([
  ["src/features/leaderboards/ui/LeaderboardScreen.tsx", 'data-stage-4-screen="leaderboards"'],
  ["src/features/crews/ui/CrewsScreen.tsx", 'data-stage-4-screen="crews"'],
  ["src/features/matches/ui/MatchesScreen.tsx", 'data-stage-4-screen="matches"'],
  ["src/features/competitions/ui/CompetitionDiscoveryScreen.tsx", 'data-stage-4-screen="compete"'],
  ["src/features/rewards/ui/RewardsScreen.tsx", 'data-stage-4-screen="rewards"'],
]);

const errors = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    errors.push(`Missing Stage 4 file: ${file}`);
  }
}

for (const [file, component] of routeExpectations) {
  if (!fs.existsSync(file)) {
    continue;
  }

  const source = fs.readFileSync(file, "utf8");
  if (!source.includes(component)) {
    errors.push(`${file} does not render ${component}.`);
  }
  if (source.includes("PlatformRoutePlaceholder")) {
    errors.push(`${file} still renders PlatformRoutePlaceholder.`);
  }
}

for (const [file, marker] of screenMarkers) {
  if (!fs.existsSync(file)) {
    continue;
  }

  const source = fs.readFileSync(file, "utf8");
  if (!source.includes(marker)) {
    errors.push(`${file} is missing marker ${marker}.`);
  }
}

const implementationFiles = requiredFiles.filter((file) => file.includes("/ui/"));
const hardcodedHex = /#[0-9a-fA-F]{3,8}\b/;

for (const file of implementationFiles) {
  if (!fs.existsSync(file)) {
    continue;
  }

  const source = fs.readFileSync(file, "utf8");
  if (hardcodedHex.test(source)) {
    errors.push(`${file} contains a hardcoded hexadecimal color.`);
  }
}

if (errors.length > 0) {
  console.error("Stage 4 competitive-screen verification failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Stage 4 competitive-screen markers are installed.");
console.log("Five feature routes now render domain-owned responsive screens.");
