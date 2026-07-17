// VERZUS M7.8 MATCH OPERATIONS RELEASE GATE

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const technicalOnly = process.argv.includes("--technical-only");
const markersOnly = process.argv.includes("--markers-only");
const failures = [];

const requiredFiles = [
  "src/app/(platform)/matches/[matchId]/layout.tsx",
  "src/features/matches/operations/release/MatchOperationsFeatureGate.tsx",
  "src/features/matches/operations/release/match-release.config.ts",
  "src/features/matches/operations/telemetry/MatchTelemetryBridge.tsx",
  "src/features/matches/operations/telemetry/match-telemetry.schema.ts",
  "src/app/api/telemetry/matches/route.ts",
  "src/app/api/health/matches/route.ts",
  "src/app/(preview)/m7-match-review/page.tsx",
  "tests/integration/m7-match-release.integration.test.ts",
  "tests/e2e/m7/m7-match-flow.spec.ts",
  "tests/e2e/m7/m7-match-failure-injection.spec.ts",
  "tests/e2e/m7/m7-match-accessibility.spec.ts",
  "tests/visual/m7-match-operations.visual.spec.ts",
  "playwright.m7.config.ts",
  "vitest.m7.config.ts",
  "docs/milestones/M7/m7-7-8-testing-observability-release.md",
  "docs/milestones/M7/m7-reference-approval.json",
  "docs/runbooks/m7-match-rollback.md",
  "scripts/approve-m7-visuals.mjs",
  "scripts/package-m7-release.mjs",
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

expectContains("src/app/(platform)/matches/[matchId]/layout.tsx", "VERZUS M7.8");
expectContains(
  "src/features/matches/operations/ui/MatchOperationsResourceScreen.tsx",
  'data-m7-stage="7.8"',
);
expectContains(".env.example", "NEXT_PUBLIC_ENABLE_M7_MATCH_OPERATIONS");
expectContains("src/app/api/telemetry/matches/route.ts", "MAX_BODY_BYTES");
expectContains("scripts/package-m7-release.mjs", "SHA-256");

const packageFile = path.join(root, "package.json");
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  for (const script of [
    "test:m7:7.8:unit",
    "test:m7:7.8:e2e",
    "test:m7:7.8:visual",
    "m7:visual:update",
    "m7:approve",
    "verify:m7:7.8:technical",
    "verify:m7:7.8",
    "m7:artifact",
    "m7:release",
  ]) {
    if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
  }
}

let approvalPassed = true;
if (!technicalOnly) {
  const approvalFile = path.join(root, "docs/milestones/M7/m7-reference-approval.json");
  if (!fs.existsSync(approvalFile)) {
    approvalPassed = false;
    failures.push("Missing M7 visual approval manifest.");
  } else {
    const approval = JSON.parse(fs.readFileSync(approvalFile, "utf8"));
    if (
      approval.releaseGate?.status !== "approved" ||
      !approval.releaseGate?.approvedAt ||
      !approval.releaseGate?.approvedBy
    ) {
      approvalPassed = false;
      failures.push("M7 final visual references are not approved.");
    }
  }

  const snapshotRoot = path.join(root, "tests/visual/m7-match-operations.visual.spec.ts-snapshots");
  const snapshots = fs.existsSync(snapshotRoot)
    ? fs.readdirSync(snapshotRoot).filter((file) => file.endsWith(".png"))
    : [];
  if (snapshots.length < 45) {
    failures.push(
      `Visual baseline incomplete: expected at least 45 PNG snapshots, found ${snapshots.length}.`,
    );
  }
}

const technicalFailures = failures.filter(
  (failure) =>
    !failure.startsWith("M7 final visual references") &&
    !failure.startsWith("Visual baseline incomplete"),
);
const technicalPassed = technicalFailures.length === 0;

console.log(`Technical gate: ${technicalPassed ? "PASS" : "FAIL"}`);
console.log(`Approval gate: ${technicalOnly ? "SKIPPED" : approvalPassed ? "PASS" : "FAIL"}`);

if (!markersOnly) {
  fs.mkdirSync(path.join(root, "reports"), { recursive: true });
  fs.writeFileSync(
    path.join(root, "reports/m7-verification.json"),
    `${JSON.stringify(
      {
        marker: "VERZUS M7.8 MATCH OPERATIONS RELEASE GATE",
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
  console.error("\nM7.8 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("M7.8 match operations release gate: PASS");
