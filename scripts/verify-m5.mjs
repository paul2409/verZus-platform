// VERZUS M5 STEPS 5.9-5.13

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const technicalOnly = process.argv.includes("--technical");
const failures = [];

const requiredFiles = [
  "src/app/(platform)/play/page.tsx",
  "src/features/play/ui/PlayCommandCenter.tsx",
  "src/features/play/actions/use-play-check-in.ts",
  "src/features/play/telemetry/play-telemetry.ts",
  "src/app/api/check-ins/current/route.ts",
  "tests/e2e/m5/play-command-center.spec.ts",
  "tests/visual/m5-play.visual.spec.ts",
  "playwright.m5.config.ts",
  "docs/runbooks/m5-play-rollback.md",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    failures.push(`Missing required file: ${file}`);
  }
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

for (const script of [
  "test:m5:unit",
  "test:e2e:m5",
  "m5:visual:update",
  "test:visual:m5",
  "m5:preview",
  "m5:verify:technical",
  "m5:verify",
]) {
  if (!packageJson.scripts?.[script]) {
    failures.push(`Missing package script: ${script}`);
  }
}

let approvalPassed = true;
const approvalFile = path.join(root, "docs/milestones/M5/m5-reference-approval.json");

if (!fs.existsSync(approvalFile)) {
  approvalPassed = false;
  failures.push("Missing M5 reference approval manifest.");
} else {
  const approval = JSON.parse(fs.readFileSync(approvalFile, "utf8"));
  const scenarios = [
    "normal",
    "check_in_open",
    "checked_in",
    "match_starting_soon",
    "no_match_scheduled",
    "crew_activity_present",
    "no_crew",
    "opportunities_available",
    "partial_api_failure",
    "offline",
  ];

  for (const viewport of ["mobile390", "tablet768", "desktop1440"]) {
    for (const scenario of scenarios) {
      if (approval[viewport]?.[scenario] !== "approved") {
        approvalPassed = false;
        failures.push(`Unapproved reference: ${viewport}.${scenario}`);
      }
    }
  }
}

if (!technicalOnly) {
  const snapshotRoot = path.join(root, "tests/visual/m5-play.visual.spec.ts-snapshots");
  const snapshots = fs.existsSync(snapshotRoot)
    ? fs.readdirSync(snapshotRoot).filter((file) => file.endsWith(".png"))
    : [];

  if (snapshots.length < 30) {
    failures.push(
      `Visual baseline incomplete: expected at least 30 PNG snapshots, found ${snapshots.length}.`,
    );
  }
}

const technicalFailures = failures.filter(
  (failure) => !failure.startsWith("Unapproved reference:"),
);
const technicalPassed = technicalFailures.length === 0;

console.log(`Technical gate: ${technicalPassed ? "PASS" : "FAIL"}`);
console.log(`Approval gate: ${approvalPassed ? "PASS" : "FAIL"}`);

if (failures.length > 0) {
  console.error("\nM5 verification failures:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
}

const report = {
  marker: "VERZUS M5 STEPS 5.9-5.13",
  generatedAt: new Date().toISOString(),
  technicalOnly,
  technicalGate: technicalPassed ? "PASS" : "FAIL",
  approvalGate: approvalPassed ? "PASS" : "FAIL",
  failures,
};

fs.mkdirSync(path.join(root, "reports"), { recursive: true });
fs.writeFileSync(
  path.join(root, "reports/m5-verification.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8",
);

if (failures.length > 0) {
  process.exit(1);
}

console.log("M5 completion gate: PASS");
