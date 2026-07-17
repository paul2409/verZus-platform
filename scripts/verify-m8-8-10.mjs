// VERZUS M8.10 INTERACTION RELIABILITY AND RELEASE VERIFIER

import fs from "node:fs";
import path from "node:path";

const technicalOnly = process.argv.includes("--technical-only");
const root = process.cwd();
const failures = [];

const requiredFiles = [
  "src/features/leaderboards/release/leaderboard-release.config.ts",
  "src/features/leaderboards/release/leaderboard-release.config.test.ts",
  "src/features/leaderboards/release/LeaderboardFeatureGate.tsx",
  "src/features/leaderboards/telemetry/leaderboard-telemetry.schema.ts",
  "src/features/leaderboards/telemetry/leaderboard-telemetry.schema.test.ts",
  "src/features/leaderboards/telemetry/leaderboard-telemetry.client.ts",
  "src/app/(platform)/leaderboards/layout.tsx",
  "src/app/api/telemetry/leaderboards/route.ts",
  "src/app/api/health/leaderboards/route.ts",
  "src/app/(preview)/m8-leaderboard-review/page.tsx",
  "tests/integration/m8-leaderboard-release.integration.test.ts",
  "tests/e2e/m8/m8-entity-intel-interactions.spec.ts",
  "tests/e2e/m8/m8-entity-intel-accessibility.spec.ts",
  "tests/e2e/m8/m8-entity-intel-failure-isolation.spec.ts",
  "tests/visual/m8-leaderboards.visual.spec.ts",
  "playwright.m8.config.ts",
  "vitest.m8.config.ts",
  "scripts/approve-m8-visuals.mjs",
  "scripts/package-m8-release.mjs",
  "docs/milestones/M8/m8-8-10-interaction-reliability-testing-release.md",
  "docs/runbooks/m8-leaderboard-rollback.md",
  "tsconfig.m8-8-10.json",
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
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.tsx",
  'data-m8-stage="8.10"',
);
expectContains(
  "src/features/leaderboards/interactions/ui/LeaderboardEntityLink.tsx",
  "event.currentTarget.click()",
);
expectContains(
  "src/features/leaderboards/interactions/ui/LeaderboardEntityLink.tsx",
  "NEXT_PUBLIC_ENABLE_M8_ENTITY_INTEL",
);
expectContains(
  "src/features/leaderboards/interactions/ui/LeaderboardIntelPreview.tsx",
  "focusTrigger(previous)",
);
expectContains(
  "src/features/leaderboards/interactions/ui/LeaderboardIntelResourceCard.tsx",
  "VERZUS M8.10 INTEL LOAD TELEMETRY",
);
expectContains("src/app/api/health/leaderboards/route.ts", 'stage: "8.10"');
expectContains("tests/e2e/m8/m8-entity-intel-interactions.spec.ts", 'page.keyboard.press("Space")');

const packageFile = path.join(root, "package.json");
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  for (const script of [
    "test:m8:8.10:unit",
    "test:m8:8.10:e2e",
    "test:m8:8.10:visual",
    "m8:visual:update",
    "m8:approve",
    "verify:m8:8.10:technical",
    "verify:m8:8.10",
    "m8:artifact",
    "m8:release",
  ]) {
    if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
  }
}

if (!technicalOnly) {
  const approvalFile = path.join(root, "docs/milestones/M8/m8-reference-approval.json");
  if (fs.existsSync(approvalFile)) {
    const approval = JSON.parse(fs.readFileSync(approvalFile, "utf8"));
    if (approval.releaseGate?.status !== "approved" || approval.releaseGate?.stage !== "8.10") {
      failures.push("M8.10 visual approval is pending.");
    }
  }
}

if (failures.length > 0) {
  console.error("M8.10 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `M8.10 leaderboard interaction and release gate: PASS${technicalOnly ? " (technical)" : ""}`,
);
