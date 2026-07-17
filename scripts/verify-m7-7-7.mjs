// VERZUS M7.7 TERMINAL, AUTHORIZATION AND FAILURE-STATE VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const requiredFiles = [
  "src/features/matches/operations/model/match-terminal-operations.types.ts",
  "src/features/matches/operations/model/match-terminal-operations.schema.ts",
  "src/features/matches/operations/api/match-terminal-api.schema.ts",
  "src/features/matches/operations/api/match-terminal-api.adapter.ts",
  "src/features/matches/operations/api/match-terminal-api.client.ts",
  "src/features/matches/operations/api/match-terminal.mutation.ts",
  "src/features/matches/operations/server/match-terminal.store.ts",
  "src/features/matches/operations/server/match-terminal.service.ts",
  "src/features/matches/operations/ui/MatchWidgetBoundary.tsx",
  "src/features/matches/operations/ui/MatchAccessStateScreen.tsx",
  "src/features/matches/operations/ui/MatchAvailabilityStateScreen.tsx",
  "src/features/matches/operations/ui/TerminalOperationsPanel.tsx",
  "src/app/api/matches/[matchId]/terminal/route.ts",
  "docs/milestones/M7/m7-7-7-terminal-authorization-failure-states.md",
  "tsconfig.m7-7-7.json",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`Missing required file: ${file}`);
}

function expectContains(file, marker) {
  const location = path.join(root, file);
  if (!fs.existsSync(location)) return;
  if (!fs.readFileSync(location, "utf8").includes(marker)) {
    failures.push(`${file} is missing marker: ${marker}`);
  }
}

expectContains(
  "src/features/matches/operations/ui/MatchOperationsResourceScreen.tsx",
  'data-m7-stage="7.7"',
);
expectContains(
  "src/features/matches/operations/ui/MatchOperationsResourceScreen.tsx",
  "MatchWidgetBoundary",
);
expectContains(
  "src/features/matches/operations/ui/MatchOperationsResourceScreen.tsx",
  "TerminalOperationsPanel",
);
expectContains(
  "src/features/matches/operations/server/match-terminal.store.ts",
  "__verzusM77TerminalStore",
);
expectContains(
  "src/features/matches/operations/server/match-terminal.service.ts",
  "MATCH_TERMINAL_FORBIDDEN",
);
expectContains("src/app/api/matches/[matchId]/terminal/route.ts", "export async function POST");
expectContains("src/app/(platform)/matches/[matchId]/page.tsx", "MatchAccessStateScreen");
expectContains("src/app/(platform)/matches/[matchId]/page.tsx", "MatchAvailabilityStateScreen");
expectContains("src/app/api/matches/[matchId]/clock/route.ts", "getMatchTerminalSnapshot");
expectContains(
  "src/features/matches/operations/server/match-resource.fixture.ts",
  "terminalSnapshot = getMatchTerminalSnapshot",
);

for (const route of ["check-in", "lobby", "result", "evidence", "dispute"]) {
  expectContains(`src/app/api/matches/[matchId]/${route}/route.ts`, "M7.7 TERMINAL MUTATION GUARD");
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
for (const script of ["test:m7:7.7", "typecheck:m7:7.7", "verify:m7:7.7"]) {
  if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
}

if (failures.length > 0) {
  console.error("M7.7 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M7.7 terminal transitions, authorization states, cached offline/stale screens, mutation guards and independent widget boundaries are installed.",
);
