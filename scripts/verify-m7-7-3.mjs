// VERZUS M7.3 SCHEMAS, API RESOURCES AND QUERY VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "src/features/matches/operations/model/match-resource.types.ts",
  "src/features/matches/operations/model/match-resource.schema.ts",
  "src/features/matches/operations/api/match-operations-api.schema.ts",
  "src/features/matches/operations/api/match-operations-api.adapter.ts",
  "src/features/matches/operations/api/match-operations-api.adapter.test.ts",
  "src/features/matches/operations/api/match-operations-api.client.ts",
  "src/features/matches/operations/api/match-operations.query.ts",
  "src/features/matches/operations/api/index.ts",
  "src/features/matches/operations/server/match-resource.fixture.ts",
  "src/features/matches/operations/server/match-resource.fixture.test.ts",
  "src/features/matches/operations/server/match-resource.route.ts",
  "src/features/matches/operations/ui/match-operations-resource.ts",
  "src/features/matches/operations/ui/match-operations-resource.test.ts",
  "src/features/matches/operations/ui/MatchOperationsResourceScreen.tsx",
  "docs/milestones/M7/m7-7-3-schemas-apis-query-resources.md",
  "tsconfig.m7-7-3.json",
];

for (const route of [
  "summary",
  "participants",
  "timeline",
  "check-in",
  "lobby",
  "result",
  "evidence",
  "dispute",
  "support",
]) {
  requiredFiles.push(`src/app/api/matches/[matchId]/${route}/route.ts`);
}

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
  'data-m7-stage="7.3"',
);
expectContains(
  "src/features/matches/operations/api/match-operations-api.adapter.ts",
  "invalid_response",
);
expectContains(
  "src/features/matches/operations/api/match-operations.query.ts",
  "matchOperationsQueryKeys",
);
expectContains(
  "src/features/matches/operations/server/match-resource.route.ts",
  '"Cache-Control": "no-store, max-age=0"',
);
expectContains("src/features/matches/operations/ui/match-operations-resource.ts", 'state: "stale"');
expectContains("src/app/(platform)/matches/[matchId]/page.tsx", "MatchOperationsResourceScreen");

const packageFile = path.join(root, "package.json");
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  for (const script of ["test:m7:7.3", "typecheck:m7:7.3", "verify:m7:7.3"]) {
    if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
  }
}

if (failures.length > 0) {
  console.error("M7.3 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M7.3 Zod schemas, domain adapters, independent APIs, query resources and isolated panel states are installed.",
);
