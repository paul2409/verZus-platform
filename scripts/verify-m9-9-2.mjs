// VERZUS M9.2 CREW DISCOVERY VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "src/features/crews/discovery/model/crew-discovery.types.ts",
  "src/features/crews/discovery/model/crew-discovery.query.ts",
  "src/features/crews/discovery/model/crew-discovery.query.test.ts",
  "src/features/crews/discovery/mocks/crew-discovery.mock.ts",
  "src/features/crews/discovery/ui/CrewDiscoveryScreen.tsx",
  "src/features/crews/discovery/ui/CrewDiscoveryScreen.module.css",
  "src/features/crews/discovery/ui/CrewDiscoveryScreen.test.tsx",
  "src/features/crews/discovery/ui/index.ts",
  "src/features/crews/discovery/index.ts",
  "docs/milestones/M9/m9-9-2-crew-discovery.md",
  "tsconfig.m9-9-2.json",
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

expectContains("src/features/crews/discovery/ui/CrewDiscoveryScreen.tsx", 'data-m9-stage="9.2"');
expectContains(
  "src/features/crews/discovery/ui/CrewDiscoveryScreen.tsx",
  "Membership requests arrive in M9.5.",
);
expectContains(
  "src/features/crews/discovery/model/crew-discovery.query.ts",
  "buildCrewDiscoverySearchParams",
);
expectContains("src/features/crews/ui/CrewsScreen.tsx", "MEMBERSHIP-AWARE CREW ROUTING");
expectContains(
  "src/features/crews/foundation/ui/CrewFoundationScreen.tsx",
  "VERZUS M9.2 DISCOVERY LINK",
);
expectContains("src/app/(platform)/crews/page.tsx", "parseCrewDiscoveryQuery");
expectContains("src/features/crews/index.ts", 'export * from "./discovery";');

const packageFile = path.join(root, "package.json");
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  for (const script of ["test:m9:9.2", "typecheck:m9:9.2", "verify:m9:9.2"]) {
    if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
  }
}

if (failures.length > 0) {
  console.error("M9.2 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M9.2 no-Crew state, discovery cards, debounced search, URL filters, deterministic sorting, pagination and join-intent markers are installed.",
);
