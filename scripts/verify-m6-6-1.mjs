import fs from "node:fs";

const requiredFiles = [
  "src/features/competitions/ui/CompetitionDiscoveryScreen.tsx",
  "src/features/competitions/ui/CompetitionDiscoveryScreen.module.css",
  "src/features/competitions/discovery/ui/CompetitionHero.tsx",
  "src/features/competitions/discovery/ui/CompetitionJourney.tsx",
  "src/features/competitions/discovery/ui/CompetitionCard.tsx",
  "src/features/competitions/discovery/ui/CompetitionSidebar.tsx",
  "src/features/competitions/discovery/model/competition-discovery.types.ts",
  "src/features/competitions/discovery/mocks/competition-discovery.mock.ts",
  "public/competitions/verzus-championship-trophy.svg",
  "docs/milestones/M6/m6-seven-stage-plan.md",
  "docs/milestones/M6/m6-6-1-discovery-contract.md",
];

const errors = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    errors.push(`Missing required M6.1 file: ${file}`);
  }
}

const screen = fs.readFileSync(
  "src/features/competitions/ui/CompetitionDiscoveryScreen.tsx",
  "utf8",
);
const css = fs.readFileSync(
  "src/features/competitions/ui/CompetitionDiscoveryScreen.module.css",
  "utf8",
);
const discoveryCss = fs.readFileSync(
  "src/features/competitions/discovery/ui/CompetitionDiscovery.module.css",
  "utf8",
);

const requiredScreenMarkers = [
  'data-m6-stage="6.1"',
  "ALL COMPETITIONS",
  "CompetitionSidebar",
  "CompetitionJourney",
];

for (const marker of requiredScreenMarkers) {
  if (!screen.includes(marker)) {
    errors.push(`Missing M6.1 screen marker: ${marker}`);
  }
}

const mock = fs.readFileSync(
  "src/features/competitions/discovery/mocks/competition-discovery.mock.ts",
  "utf8",
);

if (!mock.includes("VERZUS CHAMPIONSHIP SERIES")) {
  errors.push("Missing approved featured competition content in the M6.1 mock.");
}

const combinedCss = `${css}\n${discoveryCss}`;

if (/#[0-9a-fA-F]{3,8}\b/.test(combinedCss)) {
  errors.push("M6.1 CSS contains a hardcoded hexadecimal color.");
}

const radiusDeclarations = [...combinedCss.matchAll(/border-radius\s*:\s*([^;]+);/g)].map((match) =>
  match[1].trim(),
);
const nonZeroRadius = radiusDeclarations.filter(
  (value) => value !== "0" && value !== "0px" && value !== "0rem",
);
if (nonZeroRadius.length > 0) {
  errors.push(`M6.1 CSS contains nonzero border-radius rules: ${nonZeroRadius.join(", ")}`);
}

if (/body::before|body::after/.test(combinedCss)) {
  errors.push("M6.1 duplicates the global grid or scanline atmosphere.");
}

if (errors.length > 0) {
  console.error("M6.1 verification failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("M6.1 competition discovery foundation markers are installed.");
