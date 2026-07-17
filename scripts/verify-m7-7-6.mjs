// VERZUS M7.6 RESULTS, EVIDENCE, CONFIRMATION AND DISPUTES VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "src/features/matches/operations/model/match-result-operations.types.ts",
  "src/features/matches/operations/model/match-result-operations.schema.ts",
  "src/features/matches/operations/api/match-result-api.schema.ts",
  "src/features/matches/operations/api/match-result-api.adapter.ts",
  "src/features/matches/operations/api/match-result-api.client.ts",
  "src/features/matches/operations/api/match-result.mutations.ts",
  "src/features/matches/operations/server/match-result.store.ts",
  "src/features/matches/operations/server/match-result.service.ts",
  "src/features/matches/operations/ui/ResultOperationsPanel.tsx",
  "src/features/matches/operations/ui/EvidenceUploadPanel.tsx",
  "src/features/matches/operations/ui/DisputeOperationsPanel.tsx",
  "src/app/api/matches/[matchId]/result/route.ts",
  "src/app/api/matches/[matchId]/evidence/route.ts",
  "src/app/api/matches/[matchId]/dispute/route.ts",
  "docs/milestones/M7/m7-7-6-results-evidence-confirmation-disputes.md",
  "tsconfig.m7-7-6.json",
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
  'data-m7-stage="7.6"',
);
expectContains(
  "src/features/matches/operations/ui/MatchOperationsResourceScreen.tsx",
  "ResultOperationsPanel",
);
expectContains(
  "src/features/matches/operations/server/match-result.store.ts",
  "__verzusM76ResultStore",
);
expectContains(
  "src/features/matches/operations/server/match-result.service.ts",
  "persistResultConflict",
);
expectContains(
  "src/features/matches/operations/server/match-result.service.ts",
  "MATCH_EVIDENCE_TYPE_FORBIDDEN",
);
expectContains("src/features/matches/operations/server/match-result.service.ts", "auditEventId");
expectContains("src/app/api/matches/[matchId]/result/route.ts", "export async function POST");
expectContains("src/app/api/matches/[matchId]/evidence/route.ts", "await request.formData()");
expectContains("src/app/api/matches/[matchId]/dispute/route.ts", "executeMatchDisputeCommand");
expectContains(
  "src/features/matches/operations/server/match-resource.fixture.ts",
  "confirmation_status",
);
expectContains(
  "src/features/matches/operations/server/match-resource.fixture.ts",
  "attachments: resultSnapshot.evidenceAttachments",
);

const packageFile = path.join(root, "package.json");
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  for (const script of ["test:m7:7.6", "typecheck:m7:7.6", "verify:m7:7.6"]) {
    if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
  }
}

if (failures.length > 0) {
  console.error("M7.6 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M7.6 version-checked result submission, confirmation persistence, conflict handling, independent evidence and auditable dispute markers are installed.",
);
