// VERZUS M10.8 RELEASE READINESS, FEATURE ISOLATION AND PACKAGING VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "src/features/rewards/release/reward-release.config.ts",
  "src/features/rewards/release/RewardFeatureGate.tsx",
  "src/features/rewards/release/RewardFeatureGate.module.css",
  "src/features/rewards/release/index.ts",
  "src/app/(platform)/rewards/layout.tsx",
  "src/app/(preview)/m10-rewards-review/page.tsx",
  "src/app/(preview)/m10-rewards-review/review.module.css",
  "src/app/api/health/rewards/route.ts",
  "src/app/api/telemetry/rewards/route.ts",
  "tests/e2e/m10/m10-rewards-release.spec.ts",
  "tests/visual/m10-rewards.visual.spec.ts",
  "playwright.m10.config.ts",
  "scripts/package-m10-release.mjs",
  "scripts/approve-m10-visuals.mjs",
  "docs/milestones/M10/m10-10-8-release-readiness-feature-isolation-packaging.md",
  "docs/milestones/M10/m10-reference-approval.json",
  "docs/runbooks/m10-reward-rollback.md",
  "tsconfig.m10-10-8.json",
];

for (const relative of requiredFiles) {
  if (!fs.existsSync(path.join(root, relative))) failures.push(`Missing ${relative}`);
}

function expectContains(relative, marker) {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) return;
  if (!fs.readFileSync(absolute, "utf8").includes(marker)) {
    failures.push(`Missing marker ${marker} in ${relative}`);
  }
}

expectContains(
  "src/features/rewards/foundation/ui/RewardsFoundationScreen.tsx",
  'data-m10-stage="10.8"',
);
expectContains(
  "src/features/rewards/resources/ui/RewardsResourceScreen.tsx",
  'data-m10-stage="10.8"',
);
expectContains("src/app/api/health/rewards/route.ts", 'stage: "10.8"');
expectContains("src/app/api/health/rewards/route.ts", 'featureIsolation: "ready"');
expectContains("src/app/(platform)/rewards/layout.tsx", "RewardFeatureGate");
expectContains(".env.example", "NEXT_PUBLIC_ENABLE_M10_REWARDS=true");
expectContains("src/features/rewards/index.ts", 'export * from "./release"');

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
for (const script of [
  "typecheck:m10:10.8",
  "verify:m10:10.8",
  "verify:m10:10.8:build",
  "test:m10:10.8:e2e",
  "test:m10:10.8:visual",
  "m10:visual:update",
  "m10:approve",
  "m10:approval:check",
  "m10:artifact",
  "m10:release",
]) {
  if (!packageJson.scripts?.[script]) failures.push(`Missing package script ${script}`);
}

const leanVerify = packageJson.scripts?.["verify:m10:10.8"] ?? "";
if (/\bvitest\b|\bplaywright\s+test\b|npm run test(?::|\s|$)/.test(leanVerify)) {
  failures.push("verify:m10:10.8 must remain a lean marker, ESLint and TypeScript gate");
}

const release = packageJson.scripts?.["m10:release"] ?? "";
if (/\bvitest\b|\bplaywright\s+test\b|npm run test(?::|\s|$)/.test(release)) {
  failures.push("m10:release must not force Vitest or Playwright");
}

if (!release.includes("m10:approval:check")) {
  failures.push("m10:release must require explicit visual approval");
}

if (failures.length > 0) {
  console.error("M10.8 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M10.8 feature isolation, review hub, approval gate, optional browser review and immutable standalone packaging are installed.",
);
