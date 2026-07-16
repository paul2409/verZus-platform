import fs from "node:fs";

const requiredFiles = [
  "src/features/competitions/discovery/hooks/useCompetitionDiscoveryUrlState.ts",
  "src/features/competitions/discovery/model/competition-discovery.query.ts",
  "src/features/competitions/discovery/model/competition-discovery.query.test.ts",
  "src/features/competitions/discovery/ui/CompetitionSearchBar.tsx",
  "src/features/competitions/discovery/ui/CompetitionPagination.tsx",
  "docs/milestones/M6/m6-6-2-search-filter-url-state.md",
];

const failures = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) failures.push(`Missing required M6.2 file: ${file}`);
}

const screenPath = "src/features/competitions/ui/CompetitionDiscoveryScreen.tsx";
const screen = fs.readFileSync(screenPath, "utf8");
const query = fs.readFileSync(
  "src/features/competitions/discovery/model/competition-discovery.query.ts",
  "utf8",
);
const hook = fs.readFileSync(
  "src/features/competitions/discovery/hooks/useCompetitionDiscoveryUrlState.ts",
  "utf8",
);
const cssFiles = [
  "src/features/competitions/ui/CompetitionDiscoveryScreen.module.css",
  "src/features/competitions/discovery/ui/CompetitionDiscovery.module.css",
];

for (const marker of [
  'data-m6-stage="6.2"',
  "CompetitionSearchBar",
  "CompetitionPagination",
  "useCompetitionDiscoveryUrlState",
]) {
  if (!screen.includes(marker)) failures.push(`Screen marker missing: ${marker}`);
}

for (const marker of [
  "parseCompetitionDiscoverySearchParams",
  "serializeCompetitionDiscoverySearchParams",
  "filterCompetitionDiscoveryItems",
  "paginateCompetitionDiscoveryItems",
]) {
  if (!query.includes(marker)) failures.push(`Query helper missing: ${marker}`);
}

for (const marker of ["useSearchParams", "router.replace", "SEARCH_DEBOUNCE_MS"]) {
  if (!hook.includes(marker)) failures.push(`URL-state marker missing: ${marker}`);
}

for (const file of cssFiles) {
  const css = fs.readFileSync(file, "utf8");
  if (/#[0-9a-fA-F]{3,8}\b/.test(css)) {
    failures.push(`Hardcoded hexadecimal colour found in ${file}`);
  }
  const radiusMatches = [...css.matchAll(/border-radius\s*:\s*([^;]+);/g)];
  for (const match of radiusMatches) {
    if (match[1].trim() !== "0") {
      failures.push(`Nonzero border radius found in ${file}: ${match[1].trim()}`);
    }
  }
  if (/body::before|body::after/.test(css)) {
    failures.push(`Duplicate global atmosphere selector found in ${file}`);
  }
}

if (failures.length) {
  console.error("M6.2 verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("M6.2 search, filters, sorting, pagination and URL-state markers are installed.");
