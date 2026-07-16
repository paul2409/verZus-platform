import fs from "node:fs";

const requiredFiles = [
  "src/features/competitions/lifecycle/model/competition-lifecycle.types.ts",
  "src/features/competitions/lifecycle/model/competition-lifecycle.schema.ts",
  "src/features/competitions/lifecycle/model/competition-lifecycle.policy.ts",
  "src/features/competitions/lifecycle/api/competition-lifecycle-api.schema.ts",
  "src/features/competitions/lifecycle/api/competition-lifecycle-api.adapter.ts",
  "src/features/competitions/lifecycle/api/competition-lifecycle-api.client.ts",
  "src/features/competitions/lifecycle/api/competition-lifecycle.query.ts",
  "src/features/competitions/lifecycle/hooks/useCompetitionLifecycle.ts",
  "src/features/competitions/lifecycle/server/mock-competition-lifecycle.service.ts",
  "src/features/competitions/lifecycle/server/mock-competition-lifecycle.http.ts",
  "src/features/competitions/lifecycle/server/competition-entry-lifecycle.guard.ts",
  "src/features/competitions/lifecycle/ui/CompetitionLifecycleController.tsx",
  "src/features/competitions/lifecycle/ui/CompetitionLifecycleState.tsx",
  "src/features/competitions/lifecycle/ui/CompetitionLifecycleState.module.css",
  "src/app/api/competitions/[competitionId]/lifecycle/route.ts",
  "src/app/api/competitions/[competitionId]/entry/route.ts",
  "src/app/api/competitions/[competitionId]/entry/route.m6-5.ts",
  "docs/milestones/M6/m6-6-6-lifecycle-edge-states.md",
];

const errors = [];
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) errors.push(`Missing required M6.6 file: ${file}`);
}

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
}

const detailScreen = read("src/features/competitions/details/ui/CompetitionDetailScreen.tsx");
const featureIndex = read("src/features/competitions/index.ts");
const types = read("src/features/competitions/lifecycle/model/competition-lifecycle.types.ts");
const policy = read("src/features/competitions/lifecycle/model/competition-lifecycle.policy.ts");
const http = read("src/features/competitions/lifecycle/server/mock-competition-lifecycle.http.ts");
const entryRoute = read("src/app/api/competitions/[competitionId]/entry/route.ts");
const pkg = fs.existsSync("package.json")
  ? JSON.parse(fs.readFileSync("package.json", "utf8"))
  : { scripts: {} };

if (!detailScreen.includes('data-m6-stage="6.6"')) {
  errors.push("Competition detail screen is not marked M6.6.");
}
if (!detailScreen.includes("VERZUS M6.6 LIFECYCLE:START")) {
  errors.push("Competition lifecycle controller was not mounted in the detail screen.");
}
if (!featureIndex.includes('export * from "./lifecycle";')) {
  errors.push("Competition feature index does not export the lifecycle domain.");
}
if (!entryRoute.includes("VERZUS M6.6 ENTRY LIFECYCLE GUARD")) {
  errors.push("M6.5 entry route is not wrapped by the M6.6 lifecycle guard.");
}
if (!entryRoute.includes("guardCompetitionEntryRequest")) {
  errors.push("Entry route does not invoke the lifecycle guard.");
}
if (!http.includes("VERZUS_ENABLE_FAILURE_INJECTION")) {
  errors.push("Production failure injection guard is missing.");
}

for (const marker of [
  "draft",
  "scheduled",
  "registration_open",
  "registration_closed",
  "check_in_open",
  "in_progress",
  "completed",
  "cancelled",
  "archived",
]) {
  if (!types.includes(`"${marker}"`)) {
    errors.push(`Missing lifecycle state: ${marker}`);
  }
}

for (const marker of [
  "registration_closed",
  "waitlist",
  "not_eligible",
  "full_capacity",
  "cancelled",
  "offline",
  "partial_failure",
  "unauthorized",
  "forbidden",
  "not_found",
  "maintenance",
]) {
  if (!types.includes(`"${marker}"`)) {
    errors.push(`Missing M6.6 scenario: ${marker}`);
  }
}

for (const marker of [
  "entryAllowed: false",
  "waitlistAllowed: true",
  "partial_failure",
  "registration_closed",
  "cancelled",
]) {
  if (!policy.includes(marker)) {
    errors.push(`Missing lifecycle policy marker: ${marker}`);
  }
}

if (!pkg.scripts?.["test:m6:6.6"]) {
  errors.push("Missing package script: test:m6:6.6");
}
if (!pkg.scripts?.["verify:m6:6.6"]) {
  errors.push("Missing package script: verify:m6:6.6");
}

if (errors.length > 0) {
  console.error("M6.6 verification failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  "M6.6 lifecycle policy, edge-state UI, guarded entry route, tests, and rollback markers are installed.",
);
