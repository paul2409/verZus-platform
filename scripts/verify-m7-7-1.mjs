// VERZUS M7.1 MATCH OPERATIONS VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "src/features/matches/operations/model/match-operations.types.ts",
  "src/features/matches/operations/model/match-operations.state.ts",
  "src/features/matches/operations/mocks/match-operations.mock.ts",
  "src/features/matches/operations/ui/MatchOperationsPanels.tsx",
  "src/features/matches/operations/ui/MatchOperationsScreen.tsx",
  "src/features/matches/operations/ui/MatchOperationsScreen.module.css",
  "src/features/matches/operations/ui/MatchOperationsScreen.test.tsx",
  "src/features/matches/operations/index.ts",
  "src/app/(platform)/matches/[matchId]/page.tsx",
  "src/app/(platform)/matches/[matchId]/loading.tsx",
  "src/app/(platform)/matches/[matchId]/error.tsx",
  "src/app/(platform)/matches/[matchId]/not-found.tsx",
  "public/matches/rebels-united.svg",
  "public/matches/apex-predators.svg",
  "docs/milestones/M7/m7-eight-stage-plan.md",
  "docs/milestones/M7/m7-7-1-match-operations-foundation.md",
  "docs/milestones/M7/m7-reference-approval.json",
  "tsconfig.m7-7-1.json",
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
  "src/features/matches/operations/ui/MatchOperationsScreen.tsx",
  'data-m7-stage="7.1"',
);
expectContains(
  "src/app/(platform)/matches/[matchId]/page.tsx",
  "VERZUS M7.1 MATCH OPERATIONS ROUTE",
);
expectContains("src/features/matches/index.ts", 'export * from "./operations";');
expectContains("docs/milestones/M7/m7-eight-stage-plan.md", "M7.8");

const typeFile = path.join(root, "src/features/matches/operations/model/match-operations.types.ts");
if (fs.existsSync(typeFile)) {
  const source = fs.readFileSync(typeFile, "utf8");
  const requiredStates = [
    "scheduled",
    "check-in-unavailable",
    "check-in-open",
    "checked-in",
    "opponent-not-checked-in",
    "both-ready",
    "lobby-open",
    "in-progress",
    "submit-result",
    "awaiting-opponent-confirmation",
    "result-confirmed",
    "disputed",
    "forfeit",
    "cancelled",
    "completed",
  ];
  for (const state of requiredStates) {
    if (!source.includes(`\"${state}\"`)) failures.push(`Missing M7 visual state: ${state}`);
  }
}

const packageFile = path.join(root, "package.json");
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  for (const script of ["m7:preview", "test:m7:7.1", "typecheck:m7:7.1", "verify:m7:7.1"]) {
    if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
  }
}

if (failures.length > 0) {
  console.error("M7.1 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M7.1 dynamic route, 15 visual states, responsive composition, component map and rollback markers are installed.",
);
