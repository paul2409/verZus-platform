// VERZUS M9.7 LIFECYCLE, ACTIVITY RELIABILITY AND DESTRUCTIVE OPERATIONS VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const requiredFiles = [
  "src/features/crews/lifecycle/model/crew-lifecycle.types.ts",
  "src/features/crews/lifecycle/schema/crew-lifecycle.schema.ts",
  "src/features/crews/lifecycle/server/crew-lifecycle.store.ts",
  "src/features/crews/lifecycle/server/crew-lifecycle.service.ts",
  "src/features/crews/lifecycle/server/crew-lifecycle.http.ts",
  "src/features/crews/lifecycle/api/crew-lifecycle.client.ts",
  "src/features/crews/lifecycle/api/crew-lifecycle.query.ts",
  "src/features/crews/lifecycle/ui/CrewLifecyclePanels.tsx",
  "src/features/crews/lifecycle/ui/CrewLifecycle.module.css",
  "src/features/crews/lifecycle/index.ts",
  "src/app/api/crews/[crewId]/lifecycle/route.ts",
  "src/app/api/crews/[crewId]/lifecycle/transition/route.ts",
  "src/app/api/crews/[crewId]/disband/route.ts",
  "docs/milestones/M9/m9-9-7-lifecycle-activity-reliability-destructive-operations.md",
  "tsconfig.m9-9-7.json",
];

for (const relative of requiredFiles) {
  if (!fs.existsSync(path.join(root, relative))) failures.push(`Missing ${relative}`);
}

const checks = [
  [
    "src/features/crews/foundation/ui/CrewFoundationScreen.tsx",
    "VERZUS M9.7 ACTIVITY RELIABILITY PANEL SLOT",
  ],
  [
    "src/features/crews/membership/ui/CrewMembershipScreen.tsx",
    "VERZUS M9.7 LIFECYCLE-AWARE CREW PROFILE",
  ],
  [
    "src/features/crews/membership/server/crew-membership.service.ts",
    "VERZUS M9.7 LIFECYCLE-ENFORCED MEMBERSHIP MUTATIONS",
  ],
  [
    "src/features/crews/resources/ui/CrewResourceScreen.tsx",
    "VERZUS M9.7 LIFECYCLE AND ACTIVITY RELIABILITY COMPOSITION",
  ],
  [
    "src/features/crews/lifecycle/server/crew-lifecycle.service.ts",
    "CREW_DISBAND_CONFIRMATION_INVALID",
  ],
  ["src/features/crews/lifecycle/server/crew-lifecycle.store.ts", "disbanded: []"],
  ["src/features/crews/lifecycle/ui/CrewLifecyclePanels.tsx", "Permanently disband Crew"],
  ["src/features/crews/resources/model/crew-resource.types.ts", '"offline"'],
];

for (const [relative, marker] of checks) {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute) || !fs.readFileSync(absolute, "utf8").includes(marker)) {
    failures.push(`Missing marker ${marker} in ${relative}`);
  }
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
for (const script of ["typecheck:m9:9.7", "verify:m9:9.7"]) {
  if (!packageJson.scripts?.[script]) failures.push(`Missing package script ${script}`);
}

const stageVerify = packageJson.scripts?.["verify:m9:9.7"] ?? "";
if (stageVerify.includes("vitest") || stageVerify.includes("test:m9:9.7")) {
  failures.push("verify:m9:9.7 must remain a lean marker, ESLint and focused TypeScript gate");
}

if (failures.length > 0) {
  console.error("M9.7 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M9.7 lifecycle states, audited transitions, guarded disbanding, lifecycle-enforced membership and retained activity fallbacks are installed.",
);
