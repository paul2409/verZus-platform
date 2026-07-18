// VERZUS M9.4 CREW RESOURCE VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "src/features/crews/resources/model/crew-resource.types.ts",
  "src/features/crews/resources/model/crew-resource.merge.ts",
  "src/features/crews/resources/schema/crew-resource.schema.ts",
  "src/features/crews/resources/adapter/crew-resource.adapter.ts",
  "src/features/crews/resources/api/crew-resource.client.ts",
  "src/features/crews/resources/api/crew-resource.query.ts",
  "src/features/crews/resources/hooks/useCrewResources.ts",
  "src/features/crews/resources/server/crew-resource.service.ts",
  "src/features/crews/resources/server/crew-resource.http.ts",
  "src/features/crews/resources/ui/CrewResourceScreen.tsx",
  "src/features/crews/resources/ui/CrewResourceStatusStrip.tsx",
  "src/app/api/crews/[crewId]/profile/route.ts",
  "src/app/api/crews/[crewId]/roster/route.ts",
  "src/app/api/crews/[crewId]/requests/route.ts",
  "src/app/api/crews/[crewId]/activity/route.ts",
  "src/app/api/crews/[crewId]/rankings/route.ts",
  "src/app/api/crews/[crewId]/achievements/route.ts",
  "src/app/api/crews/[crewId]/settings/route.ts",
  "docs/milestones/M9/m9-9-4-schemas-apis-query-resources.md",
  "tsconfig.m9-9-4.json",
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

expectContains("src/features/crews/resources/ui/CrewResourceScreen.tsx", 'data-m9-stage="9.4"');
expectContains("src/features/crews/ui/CrewsScreen.tsx", "CrewResourceScreen");
expectContains(
  "src/features/crews/resources/schema/crew-resource.schema.ts",
  "crewProfileEnvelopeSchema",
);
expectContains("src/features/crews/resources/api/crew-resource.query.ts", "crewResourceQueryKeys");
expectContains("src/features/crews/resources/server/crew-resource.http.ts", "X-Crew-Resource");
expectContains("src/app/(platform)/crews/page.tsx", "parseCrewResourceScenario");
expectContains("src/features/crews/index.ts", 'export * from "./resources";');

const packageFile = path.join(root, "package.json");
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  for (const script of ["test:m9:9.4", "typecheck:m9:9.4", "verify:m9:9.4"]) {
    if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
  }
}

if (failures.length > 0) {
  console.error("M9.4 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M9.4 Crew profile, roster, requests, activity, rankings, achievements and settings resources are installed independently.",
);
