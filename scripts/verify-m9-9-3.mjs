// VERZUS M9.3 CREW CREATION VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "src/features/crews/creation/model/crew-creation.types.ts",
  "src/features/crews/creation/model/crew-creation.validation.ts",
  "src/features/crews/creation/model/crew-creation.validation.test.ts",
  "src/features/crews/creation/model/crew-creation.repository.ts",
  "src/features/crews/creation/model/crew-creation.repository.test.ts",
  "src/features/crews/creation/ui/CrewCreationScreen.tsx",
  "src/features/crews/creation/ui/CrewCreationScreen.module.css",
  "src/features/crews/creation/ui/CrewCreationScreen.test.tsx",
  "src/features/crews/creation/index.ts",
  "src/app/(platform)/crews/create/page.tsx",
  "src/app/(platform)/crews/create/loading.tsx",
  "src/app/(platform)/crews/create/error.tsx",
  "public/crews/create/crest-neon-v.svg",
  "public/crews/create/crest-orbit.svg",
  "public/crews/create/crest-strike.svg",
  "public/crews/create/banner-neon-grid.svg",
  "public/crews/create/banner-cosmic.svg",
  "public/crews/create/banner-stadium.svg",
  "docs/milestones/M9/m9-9-3-crew-creation.md",
  "tsconfig.m9-9-3.json",
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

expectContains("src/features/crews/creation/ui/CrewCreationScreen.tsx", 'data-m9-stage="9.3"');
expectContains(
  "src/features/crews/creation/model/crew-creation.repository.ts",
  'lifecycle: "forming"',
);
expectContains("src/features/crews/creation/model/crew-creation.repository.ts", 'role: "owner"');
expectContains(
  "src/features/crews/discovery/ui/CrewDiscoveryScreen.tsx",
  "/crews/create?membership=none",
);
expectContains("src/features/crews/index.ts", 'export * from "./creation";');
expectContains("src/app/(platform)/crews/create/page.tsx", "parseCrewCreationStep");

const packageFile = path.join(root, "package.json");
if (fs.existsSync(packageFile)) {
  const pkg = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  for (const script of ["test:m9:9.3", "typecheck:m9:9.3", "verify:m9:9.3"]) {
    if (!pkg.scripts?.[script]) failures.push(`Missing package script: ${script}`);
  }
}

if (failures.length > 0) {
  console.error("M9.3 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M9.3 five-step Crew creation, original identity assets, owner/forming invariants, refresh persistence and rollback markers are installed.",
);
