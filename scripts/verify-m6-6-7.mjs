// VERZUS M6.7 competition release gate

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const technicalOnly = process.argv.includes("--technical-only");
const markersOnly = process.argv.includes("--markers-only");
const failures = [];

const requiredFiles = [
  "src/app/(platform)/compete/layout.tsx",
  "src/features/competitions/release/CompetitionFeatureGate.tsx",
  "src/features/competitions/release/competition-release.config.ts",
  "src/features/competitions/telemetry/CompetitionTelemetryBridge.tsx",
  "src/features/competitions/telemetry/competition-telemetry.schema.ts",
  "src/app/api/telemetry/competitions/route.ts",
  "src/app/api/health/competitions/route.ts",
  "src/app/(preview)/m6-competition-review/page.tsx",
  "tests/integration/m6-competition-release.integration.test.ts",
  "tests/e2e/m6/m6-competition-flow.spec.ts",
  "tests/e2e/m6/m6-competition-failure-injection.spec.ts",
  "tests/e2e/m6/m6-competition-accessibility.spec.ts",
  "tests/visual/m6-competitions.visual.spec.ts",
  "playwright.m6.config.ts",
  "docs/milestones/M6/m6-6-7-testing-observability-release.md",
  "docs/milestones/M6/m6-reference-approval.json",
  "docs/runbooks/m6-competition-rollback.md",
  "scripts/approve-m6-visuals.mjs",
  "scripts/package-m6-release.mjs",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`Missing required file: ${file}`);
}

const expectContains = (file, marker) => {
  const location = path.join(root, file);
  if (!fs.existsSync(location)) return;
  const source = fs.readFileSync(location, "utf8");
  if (!source.includes(marker)) failures.push(`${file} is missing marker: ${marker}`);
};

expectContains("src/app/(platform)/compete/layout.tsx", "VERZUS M6.7 COMPETITION RELEASE GATE");
expectContains(
  "src/features/competitions/details/ui/CompetitionDetailScreen.tsx",
  'data-m6-stage="6.7"',
);
expectContains(".env.example", "NEXT_PUBLIC_ENABLE_M6_COMPETITIONS");
expectContains("src/app/api/telemetry/competitions/route.ts", "MAX_BODY_BYTES");
expectContains("scripts/package-m6-release.mjs", "SHA-256");

const packageFile = path.join(root, "package.json");
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  for (const script of [
    "test:m6:6.7:unit",
    "test:m6:6.7:e2e",
    "test:m6:6.7:visual",
    "m6:visual:update",
    "m6:approve",
    "verify:m6:6.7:technical",
    "verify:m6:6.7",
    "m6:artifact",
    "m6:release",
  ]) {
    if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
  }
}

let approvalPassed = true;
if (!technicalOnly) {
  const approvalFile = path.join(root, "docs/milestones/M6/m6-reference-approval.json");
  if (!fs.existsSync(approvalFile)) {
    approvalPassed = false;
    failures.push("Missing M6 visual approval manifest.");
  } else {
    const approval = JSON.parse(fs.readFileSync(approvalFile, "utf8"));
    if (approval.status !== "approved" || !approval.approvedAt || !approval.approvedBy) {
      approvalPassed = false;
      failures.push("M6 visual references are not approved.");
    }
  }

  const snapshotRoot = path.join(root, "tests/visual/m6-competitions.visual.spec.ts-snapshots");
  const snapshots = fs.existsSync(snapshotRoot)
    ? fs.readdirSync(snapshotRoot).filter((file) => file.endsWith(".png"))
    : [];
  if (snapshots.length < 24) {
    failures.push(
      `Visual baseline incomplete: expected at least 24 PNG snapshots, found ${snapshots.length}.`,
    );
  }
}

const technicalPassed =
  failures.filter(
    (failure) =>
      !failure.startsWith("M6 visual references") &&
      !failure.startsWith("Visual baseline incomplete"),
  ).length === 0;

console.log(`Technical gate: ${technicalPassed ? "PASS" : "FAIL"}`);
console.log(`Approval gate: ${technicalOnly ? "SKIPPED" : approvalPassed ? "PASS" : "FAIL"}`);

if (!markersOnly) {
  fs.mkdirSync(path.join(root, "reports"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "reports/m6-verification.json"),
    `${JSON.stringify(
      {
        marker: "VERZUS M6.7 COMPETITION RELEASE GATE",
        generatedAt: new Date().toISOString(),
        technicalOnly,
        technicalGate: technicalPassed ? "PASS" : "FAIL",
        approvalGate: technicalOnly ? "SKIPPED" : approvalPassed ? "PASS" : "FAIL",
        failures,
      },
      null,
      2,
    )}\n`,
  );
}

if (failures.length > 0) {
  console.error("\nM6.7 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("M6.7 competition release gate: PASS");
