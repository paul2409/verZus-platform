// VERZUS M7.5 LOBBY AND IN-PROGRESS VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const requiredFiles = [
  "src/features/matches/operations/model/match-lobby-operations.types.ts",
  "src/features/matches/operations/model/match-lobby-operations.schema.ts",
  "src/features/matches/operations/api/match-lobby-api.schema.ts",
  "src/features/matches/operations/api/match-lobby-api.adapter.ts",
  "src/features/matches/operations/api/match-lobby-api.adapter.test.ts",
  "src/features/matches/operations/api/match-lobby-api.client.ts",
  "src/features/matches/operations/api/match-lobby.mutation.ts",
  "src/features/matches/operations/server/match-lobby.store.ts",
  "src/features/matches/operations/server/match-lobby.service.ts",
  "src/features/matches/operations/server/match-lobby.service.test.ts",
  "src/features/matches/operations/ui/LobbyOperationsPanel.tsx",
  "src/features/matches/operations/ui/LobbyOperationsPanel.test.tsx",
  "src/app/api/matches/[matchId]/lobby/route.ts",
  "docs/milestones/M7/m7-7-5-lobby-in-progress-operations.md",
  "tsconfig.m7-7-5.json",
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
  "src/features/matches/operations/ui/MatchOperationsResourceScreen.tsx",
  'data-m7-stage="7.5"',
);
expectContains(
  "src/features/matches/operations/ui/LobbyOperationsPanel.tsx",
  'data-lobby-operations="m7.5"',
);
expectContains(
  "src/features/matches/operations/server/match-lobby.store.ts",
  "__verzusM75LobbyStore",
);
expectContains(
  "src/features/matches/operations/server/match-lobby.service.ts",
  'command.action === "start_match"',
);
expectContains(
  "src/features/matches/operations/server/match-lobby.service.ts",
  "MATCH_PARTICIPANTS_NOT_READY",
);
expectContains(
  "src/app/api/matches/[matchId]/lobby/route.ts",
  'request.headers.get("idempotency-key")',
);
expectContains("src/app/api/matches/[matchId]/lobby/route.ts", "export async function POST");
expectContains(
  "src/features/matches/operations/server/match-resource.fixture.ts",
  "getMatchLobbyOperationsSnapshot",
);
expectContains("src/app/(platform)/matches/[matchId]/page.tsx", "getMatchLobbyOperationsSnapshot");
expectContains("src/app/api/matches/[matchId]/clock/route.ts", "getMatchLobbyOperationsSnapshot");

const packageFile = path.join(root, "package.json");
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  for (const script of ["test:m7:7.5", "typecheck:m7:7.5", "verify:m7:7.5"]) {
    if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
  }
}

if (failures.length > 0) {
  console.error("M7.5 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M7.5 lobby entry, readiness, server-time match start, in-progress operations and auditable issue markers are installed.",
);
