// VERZUS M9.5 INVITES, APPLICATIONS AND MEMBERSHIP VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const requiredFiles = [
  "src/features/crews/membership/model/crew-membership.types.ts",
  "src/features/crews/membership/schema/crew-membership.schema.ts",
  "src/features/crews/membership/server/crew-membership.store.ts",
  "src/features/crews/membership/server/crew-membership.service.ts",
  "src/features/crews/membership/server/crew-membership.service.test.ts",
  "src/features/crews/membership/server/crew-membership.http.ts",
  "src/features/crews/membership/api/crew-membership.client.ts",
  "src/features/crews/membership/api/crew-membership.query.ts",
  "src/features/crews/membership/ui/CrewApplicationAction.tsx",
  "src/features/crews/membership/ui/CrewMembershipPanels.tsx",
  "src/features/crews/membership/ui/CrewMembershipScreen.tsx",
  "src/app/api/crews/[crewId]/membership/route.ts",
  "src/app/api/crews/[crewId]/applications/route.ts",
  "src/app/api/crews/[crewId]/applications/[applicationId]/decision/route.ts",
  "src/app/api/crews/[crewId]/invites/route.ts",
  "src/app/api/crews/[crewId]/invites/[inviteId]/decision/route.ts",
  "src/app/api/crews/[crewId]/membership/leave/route.ts",
  "src/app/api/crews/[crewId]/membership/expire/route.ts",
  "docs/milestones/M9/m9-9-5-invites-applications-membership.md",
  "tsconfig.m9-9-5.json",
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
  "src/features/crews/membership/server/crew-membership.store.ts",
  "idempotencyResults",
);
expectContains(
  "src/features/crews/membership/server/crew-membership.service.ts",
  "CREW_OWNER_TRANSFER_REQUIRED",
);
expectContains(
  "src/features/crews/membership/server/crew-membership.service.ts",
  "CREW_MEMBERSHIP_STALE_VERSION",
);
expectContains("src/features/crews/discovery/ui/CrewDiscoveryScreen.tsx", "CrewApplicationAction");
expectContains("src/features/crews/resources/ui/CrewResourceScreen.tsx", "CrewMembershipScreen");
expectContains(
  "src/features/crews/foundation/ui/CrewFoundationScreen.tsx",
  "requestsPanel?: ReactNode",
);
expectContains("src/features/crews/membership/ui/CrewMembershipScreen.tsx", 'data-m9-stage="9.5"');

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
for (const script of ["test:m9:9.5", "typecheck:m9:9.5", "verify:m9:9.5"]) {
  if (!pkg.scripts?.[script]) failures.push(`Missing package script: ${script}`);
}

if (failures.length) {
  console.error("M9.5 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M9.5 idempotent applications, invites, decisions, membership leave, expiry and owner-protection markers are installed.",
);
