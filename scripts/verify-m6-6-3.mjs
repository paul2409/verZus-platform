import fs from "node:fs";

const requiredFiles = [
  "src/features/competitions/discovery/api/competition-discovery-api.schema.ts",
  "src/features/competitions/discovery/api/competition-discovery-api.adapter.ts",
  "src/features/competitions/discovery/api/competition-discovery-api.client.ts",
  "src/features/competitions/discovery/api/competition-discovery.query.ts",
  "src/features/competitions/discovery/hooks/useCompetitionDiscoveryData.ts",
  "src/features/competitions/discovery/server/mock-competition-discovery.http.ts",
  "src/features/competitions/discovery/server/mock-competition-discovery.service.ts",
  "src/app/api/competitions/discovery/route.ts",
  "src/app/api/competitions/discovery/featured/route.ts",
  "src/app/api/competitions/discovery/metadata/route.ts",
  "src/app/api/competitions/entries/me/route.ts",
];

const errors = [];
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) errors.push(`Missing file: ${file}`);
}

const screen = fs.readFileSync(
  "src/features/competitions/ui/CompetitionDiscoveryScreen.tsx",
  "utf8",
);
const types = fs.readFileSync(
  "src/features/competitions/discovery/model/competition-discovery.types.ts",
  "utf8",
);
const query = fs.readFileSync(
  "src/features/competitions/discovery/api/competition-discovery.query.ts",
  "utf8",
);

if (!screen.includes('data-m6-stage="6.3"')) errors.push("Screen is not marked M6.3.");
if (!screen.includes("useCompetitionDiscoveryData")) {
  errors.push("Screen is not connected to the M6.3 query resources.");
}
if (screen.includes("competitionDiscoveryMock")) {
  errors.push("Screen still imports mock data directly.");
}
for (const marker of ["partial_failure", "stale", "malformed"]) {
  if (!types.includes(marker)) errors.push(`Missing scenario marker: ${marker}`);
}
for (const marker of ["featured", "list", "metadata", "currentEntry"]) {
  if (!query.includes(marker)) errors.push(`Missing independent query key: ${marker}`);
}

if (errors.length > 0) {
  console.error("M6.3 verification failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("M6.3 schemas, adapters, independent APIs and query resources are installed.");
