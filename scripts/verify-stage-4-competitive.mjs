import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");

const failures = [];
const layout = read("src/app/layout.tsx");
const shell = read("src/components/layout/app-shell/AppShell.module.css");
const play = read("src/features/play/ui/PlayCommandCenter.tsx");

if (!layout.includes('data-theme="retro-competitive"')) {
  failures.push("Stage 1 retro theme attribute is missing.");
}
if (!layout.includes("@/styles/verzus-retro-system.css")) {
  failures.push("Stage 1 retro stylesheet import is missing.");
}
if (!shell.includes("VERZUS STAGE 2 RETRO SHARED UI:BEGIN")) {
  failures.push("Stage 2 shared-UI marker is missing.");
}
if (!play.includes("VERZUS STAGE 3 RETRO PLAY")) {
  failures.push("Stage 3 Play marker is missing.");
}

const screens = [
  ["leaderboards", "src/features/leaderboards/ui/LeaderboardScreen.tsx"],
  ["crews", "src/features/crews/ui/CrewsScreen.tsx"],
  ["matches", "src/features/matches/ui/MatchesScreen.tsx"],
  ["compete", "src/features/competitions/ui/CompetitionDiscoveryScreen.tsx"],
  ["rewards", "src/features/rewards/ui/RewardsScreen.tsx"],
];

for (const [id, file] of screens) {
  const source = read(file);
  if (!source.includes(`data-stage-4-screen="${id}"`)) {
    failures.push(`Missing Stage 4 screen marker in ${file}.`);
  }
  if (/PlatformRoutePlaceholder/.test(source)) {
    failures.push(`Placeholder remains in ${file}.`);
  }
}

const cssFiles = [
  "src/features/leaderboards/ui/LeaderboardScreen.module.css",
  "src/features/crews/ui/CrewsScreen.module.css",
  "src/features/matches/ui/MatchesScreen.module.css",
  "src/features/competitions/ui/CompetitionDiscoveryScreen.module.css",
  "src/features/rewards/ui/RewardsScreen.module.css",
  "src/features/competitions/components/CompetitionPrimitives.module.css",
  "src/features/matches/components/MatchPrimitives.module.css",
  "src/features/crews/intel-card/CrewIntelCard.module.css",
];

for (const file of cssFiles) {
  const source = read(file);

  if (!source.includes("VERZUS STAGE 4 RETRO COMPETITIVE")) {
    failures.push(`Missing retro Stage 4 marker in ${file}.`);
  }
  if (/#[0-9a-f]{3,8}\b/i.test(source)) {
    failures.push(`Hardcoded hex colour found in ${file}.`);
  }
  const radiusValues = [...source.matchAll(/border-radius:\s*([^;]+);/gi)].map((match) =>
    match[1].trim(),
  );
  if (radiusValues.some((value) => value !== "0")) {
    failures.push(`Nonzero border radius found in ${file}.`);
  }
  if (/body::(?:before|after)/.test(source)) {
    failures.push(`Duplicate global atmosphere selector found in ${file}.`);
  }
}

const crews = read("src/features/crews/ui/CrewsScreen.tsx");
for (const marker of ['aria-modal="true"', 'role="dialog"', 'aria-label="Close crew intel"']) {
  if (!crews.includes(marker)) {
    failures.push(`Crew Intel accessibility marker missing: ${marker}`);
  }
}

const routeChecks = [
  ["src/app/(platform)/leaderboards/weekly/page.tsx", "LeaderboardScreen"],
  ["src/app/(platform)/crews/page.tsx", "CrewsScreen"],
  ["src/app/(platform)/matches/page.tsx", "MatchesScreen"],
  ["src/app/(platform)/compete/page.tsx", "CompetitionDiscoveryScreen"],
  ["src/app/(platform)/rewards/page.tsx", "RewardsScreen"],
];

for (const [file, component] of routeChecks) {
  if (!read(file).includes(component)) {
    failures.push(`${file} does not render ${component}.`);
  }
}

if (failures.length > 0) {
  console.error("Stage 4 retro competitive verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Stage 4 retro competitive screens are installed.");
console.log("Five routes use the approved retro theme without hardcoded hex values.");
