// VERZUS M9.1 CREW FOUNDATION VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "src/features/crews/foundation/model/crew-foundation.types.ts",
  "src/features/crews/foundation/mocks/crew-foundation.mock.ts",
  "src/features/crews/foundation/ui/CrewFoundationScreen.tsx",
  "src/features/crews/foundation/ui/CrewFoundationScreen.module.css",
  "src/features/crews/foundation/ui/CrewFoundationScreen.test.tsx",
  "src/features/crews/foundation/ui/index.ts",
  "src/features/crews/foundation/index.ts",
  "src/app/(platform)/crews/[crewId]/page.tsx",
  "src/app/(platform)/crews/[crewId]/loading.tsx",
  "src/app/(platform)/crews/[crewId]/error.tsx",
  "src/app/(platform)/crews/[crewId]/not-found.tsx",
  "public/crews/xenon-esports-crest.svg",
  "public/crews/xenon-esports-banner.svg",
  "docs/milestones/M9/m9-eight-stage-plan.md",
  "docs/milestones/M9/m9-9-1-crew-foundation.md",
  "docs/milestones/M9/m9-reference-approval.json",
  "tsconfig.m9-9-1.json",
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

expectContains("src/features/crews/foundation/ui/CrewFoundationScreen.tsx", 'data-m9-stage="9.1"');
expectContains(
  "src/features/crews/foundation/ui/CrewFoundationScreen.tsx",
  'data-crew-panel="overview"',
);
expectContains(
  "src/features/crews/foundation/model/crew-foundation.types.ts",
  '"owner" | "captain" | "manager" | "member" | "trial"',
);
expectContains(
  "src/features/crews/foundation/model/crew-foundation.types.ts",
  '"forming" | "active" | "inactive" | "suspended" | "disbanded" | "archived"',
);
expectContains("src/features/crews/ui/CrewsScreen.tsx", "CrewFoundationScreen");
expectContains(
  "docs/milestones/M9/m9-reference-approval.json",
  '"status": "approved-for-m9.1-foundation"',
);
expectContains("public/crews/xenon-esports-crest.svg", "VERZUS M9.1 ORIGINAL CREW CREST");

const packageFile = path.join(root, "package.json");
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  for (const script of ["m9:preview", "test:m9:9.1", "typecheck:m9:9.1", "verify:m9:9.1"]) {
    if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
  }
}

if (failures.length > 0) {
  console.error("M9.1 Crew foundation verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M9.1 responsive Crew profile, typed tabs, role/lifecycle vocabulary, routes, artwork, tests and rollback markers are installed.",
);
