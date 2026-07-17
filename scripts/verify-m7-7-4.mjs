// VERZUS M7.4 IDEMPOTENT CHECK-IN VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const requiredFiles = [
  "src/features/matches/operations/model/match-check-in.types.ts",
  "src/features/matches/operations/model/match-check-in.schema.ts",
  "src/features/matches/operations/api/match-check-in-api.schema.ts",
  "src/features/matches/operations/api/match-check-in-api.adapter.ts",
  "src/features/matches/operations/api/match-check-in-api.adapter.test.ts",
  "src/features/matches/operations/api/match-check-in-api.client.ts",
  "src/features/matches/operations/api/match-check-in.mutation.ts",
  "src/features/matches/operations/server/match-check-in.store.ts",
  "src/features/matches/operations/server/match-check-in.service.ts",
  "src/features/matches/operations/server/match-check-in.service.test.ts",
  "src/features/matches/operations/ui/CheckInMutationPanel.tsx",
  "src/features/matches/operations/ui/CheckInMutationPanel.test.tsx",
  "src/app/api/matches/[matchId]/check-in/route.ts",
  "docs/milestones/M7/m7-7-4-idempotent-check-in-readiness.md",
  "tsconfig.m7-7-4.json",
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
  'data-m7-stage="7.4"',
);
expectContains("src/features/matches/operations/ui/CheckInMutationPanel.tsx", "clickLock.current");
expectContains(
  "src/features/matches/operations/server/match-check-in.store.ts",
  "idempotencyResults",
);
expectContains(
  "src/features/matches/operations/server/match-check-in.service.ts",
  'nextState = snapshot.opponent.checkedIn ? "both-ready" : "checked-in"',
);
expectContains(
  "src/app/api/matches/[matchId]/check-in/route.ts",
  'request.headers.get("idempotency-key")',
);
expectContains("src/app/api/matches/[matchId]/check-in/route.ts", "export async function POST");
expectContains(
  "src/features/matches/operations/server/match-resource.fixture.ts",
  "getMatchCheckInSnapshot",
);
expectContains("src/app/(platform)/matches/[matchId]/page.tsx", "resourceState={requestedState}");

const packageFile = path.join(root, "package.json");
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  for (const script of ["test:m7:7.4", "typecheck:m7:7.4", "verify:m7:7.4"]) {
    if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
  }
}

if (failures.length > 0) {
  console.error("M7.4 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M7.4 idempotent check-in, duplicate-click lock, persisted readiness and both-ready transition markers are installed.",
);
