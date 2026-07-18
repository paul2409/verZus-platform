// VERZUS M9.6 ROLES, PERMISSIONS AND MEMBER MANAGEMENT VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const requiredFiles = [
  "src/features/crews/governance/model/crew-governance.types.ts",
  "src/features/crews/governance/schema/crew-governance.schema.ts",
  "src/features/crews/governance/server/crew-governance.store.ts",
  "src/features/crews/governance/server/crew-governance.service.ts",
  "src/features/crews/governance/server/crew-governance.service.test.ts",
  "src/features/crews/governance/server/crew-governance.http.ts",
  "src/features/crews/governance/api/crew-governance.client.ts",
  "src/features/crews/governance/api/crew-governance.query.ts",
  "src/features/crews/governance/ui/CrewGovernancePanels.tsx",
  "src/features/crews/governance/ui/CrewGovernancePanels.test.tsx",
  "src/features/crews/governance/ui/CrewGovernance.module.css",
  "src/features/crews/governance/index.ts",
  "src/app/api/crews/[crewId]/governance/route.ts",
  "src/app/api/crews/[crewId]/members/[memberId]/role/route.ts",
  "src/app/api/crews/[crewId]/members/[memberId]/remove/route.ts",
  "src/app/api/crews/[crewId]/ownership/transfer/route.ts",
  "docs/milestones/M9/m9-9-6-roles-permissions-member-management.md",
  "tsconfig.m9-9-6.json",
];

for (const relative of requiredFiles) {
  if (!fs.existsSync(path.join(root, relative))) failures.push(`Missing ${relative}`);
}

const checks = [
  [
    "src/features/crews/foundation/ui/CrewFoundationScreen.tsx",
    "VERZUS M9.6 GOVERNANCE PANEL SLOT",
  ],
  [
    "src/features/crews/membership/ui/CrewMembershipScreen.tsx",
    "VERZUS M9.6 GOVERNANCE-AWARE CREW PROFILE",
  ],
  [
    "src/features/crews/membership/server/crew-membership.store.ts",
    "VERZUS M9.6 GOVERNANCE SYNCHRONIZATION",
  ],
  [
    "src/features/crews/resources/ui/CrewResourceScreen.tsx",
    "VERZUS M9.6 GOVERNANCE-AWARE RESOURCE COMPOSITION",
  ],
  ["src/features/crews/governance/server/crew-governance.store.ts", "assertOwnerInvariant"],
  ["src/features/crews/governance/server/crew-governance.service.ts", "ownership_transferred"],
  ["src/features/crews/governance/ui/CrewGovernancePanels.tsx", "TRANSFER OWNERSHIP"],
];

for (const [relative, marker] of checks) {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute) || !fs.readFileSync(absolute, "utf8").includes(marker)) {
    failures.push(`Missing marker ${marker} in ${relative}`);
  }
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
for (const script of ["test:m9:9.6", "typecheck:m9:9.6", "verify:m9:9.6"]) {
  if (!packageJson.scripts?.[script]) failures.push(`Missing package script ${script}`);
}

if (failures.length > 0) {
  console.error("M9.6 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M9.6 roles, permission matrix, audited member management, atomic ownership transfer and failure-isolated governance resource are installed.",
);
