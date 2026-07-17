// VERZUS M7.2 STATE MACHINE AND SERVER TIME VERIFIER
// VERZUS M7.2 FIXED INSTALLER V2

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "src/features/matches/operations/model/match-lifecycle.machine.ts",
  "src/features/matches/operations/model/match-lifecycle.machine.test.ts",
  "src/features/matches/operations/model/match-clock.policy.ts",
  "src/features/matches/operations/model/match-clock.policy.test.ts",
  "src/features/matches/operations/model/match-timeline.ts",
  "src/features/matches/operations/model/match-timeline.test.ts",
  "src/features/matches/operations/server/match-clock.service.ts",
  "src/features/matches/operations/server/match-clock.service.test.ts",
  "src/features/matches/operations/server/index.ts",
  "src/features/matches/operations/ui/ServerCountdown.tsx",
  "src/features/matches/operations/ui/ServerCountdown.test.tsx",
  "src/app/api/matches/[matchId]/clock/route.ts",
  "docs/milestones/M7/m7-7-2-state-machine-server-time.md",
  "tsconfig.m7-7-2.json",
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
  'data-m7-stage="7.2"',
);
expectContains(
  "src/features/matches/operations/model/match-lifecycle.machine.ts",
  "MATCH_STALE_VERSION",
);
expectContains(
  "src/features/matches/operations/model/match-lifecycle.machine.ts",
  "MATCH_INVALID_TRANSITION",
);
expectContains(
  "src/features/matches/operations/ui/ServerCountdown.tsx",
  'data-server-authoritative="true"',
);
expectContains(
  "src/app/api/matches/[matchId]/clock/route.ts",
  '"Cache-Control": "no-store, max-age=0"',
);
expectContains(
  "src/features/matches/operations/mocks/match-operations.mock.ts",
  "buildMatchTimeline(state, clock)",
);
expectContains("src/app/(platform)/matches/[matchId]/page.tsx", "getMockMatchClockSnapshot");
expectContains("src/app/(platform)/matches/[matchId]/page.tsx", "state={clock.state}");
expectContains(
  "src/features/matches/operations/server/match-clock.service.ts",
  "MATCH_REFERENCE_PREVIEW_ID",
);

const packageFile = path.join(root, "package.json");
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  for (const script of ["test:m7:7.2", "typecheck:m7:7.2", "verify:m7:7.2"]) {
    if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
  }
}

if (failures.length > 0) {
  console.error("M7.2 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M7.2 lifecycle transitions, stale-state/version guards, server clock, timeline policy and drift-corrected countdown markers are installed.",
);
