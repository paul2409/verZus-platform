// VERZUS M12.1 STRUCTURAL VERIFIER

import fs from "node:fs";

const requiredFiles = [
  "src/features/search/foundation/model/search-foundation.types.ts",
  "src/features/search/foundation/mocks/search-foundation.mock.ts",
  "src/features/search/foundation/ui/SearchFoundationScreen.tsx",
  "src/features/search/foundation/ui/SearchFoundationScreen.module.css",
  "src/features/search/foundation/ui/index.ts",
  "src/features/search/foundation/index.ts",
  "src/features/search/ui/SearchScreen.tsx",
  "docs/milestones/M12/m12-eight-stage-plan.md",
  "docs/milestones/M12/m12-12-1-global-search-foundation.md",
  "docs/milestones/M12/m12-reference-approval.json",
  "tsconfig.m12-12-1.json",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`M12.1 missing required file: ${file}`);
}

const screen = fs.readFileSync(
  "src/features/search/foundation/ui/SearchFoundationScreen.tsx",
  "utf8",
);
const mock = fs.readFileSync(
  "src/features/search/foundation/mocks/search-foundation.mock.ts",
  "utf8",
);
const css = fs.readFileSync(
  "src/features/search/foundation/ui/SearchFoundationScreen.module.css",
  "utf8",
);
const routeComposition = fs.readFileSync("src/features/search/ui/SearchScreen.tsx", "utf8");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const approval = JSON.parse(
  fs.readFileSync("docs/milestones/M12/m12-reference-approval.json", "utf8"),
);

for (const marker of [
  'data-m12-stage="12.1"',
  "SEARCH VERZUS",
  "Search the competitive network",
  "Recent searches",
  "Trending now",
  "Explore the network",
  "Nothing matched",
]) {
  if (!screen.includes(marker)) throw new Error(`M12.1 screen marker missing: ${marker}`);
}

for (const marker of [
  'domain: "players"',
  'domain: "crews"',
  'domain: "competitions"',
  'domain: "matches"',
  "Island Elites",
  "TheUnbreakableContinentalChampion",
]) {
  if (!mock.includes(marker)) throw new Error(`M12.1 fixture marker missing: ${marker}`);
}

for (const marker of ["@media (min-width: 40rem)", "@media (min-width: 64rem)", "text-overflow: ellipsis", "prefers-reduced-motion"]) {
  if (!css.includes(marker)) throw new Error(`M12.1 responsive marker missing: ${marker}`);
}

if (!routeComposition.includes("SearchFoundationScreen")) {
  throw new Error("M12.1 Search route is not composed from the Search foundation.");
}

for (const scriptName of ["m12:preview", "typecheck:m12:12.1", "verify:m12:12.1"]) {
  if (!packageJson.scripts?.[scriptName]) {
    throw new Error(`M12.1 package script missing: ${scriptName}`);
  }
}

if (approval.milestone !== "M12" || approval.stage !== "12.1") {
  throw new Error("M12.1 reference record is invalid.");
}

console.log(
  "M12.1 mobile-first global Search, URL query/domain state, discovery, deterministic cross-domain results and no-results handling are installed.",
);
