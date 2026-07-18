// VERZUS M9.8 RELEASE READINESS, OBSERVABILITY AND PACKAGING VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "src/features/crews/release/crew-release.config.ts",
  "src/features/crews/release/CrewFeatureGate.tsx",
  "src/features/crews/release/CrewFeatureGate.module.css",
  "src/features/crews/release/index.ts",
  "src/features/crews/telemetry/crew-telemetry.schema.ts",
  "src/features/crews/telemetry/crew-telemetry.client.ts",
  "src/features/crews/telemetry/CrewReleaseTelemetry.tsx",
  "src/features/crews/telemetry/index.ts",
  "src/app/(platform)/crews/layout.tsx",
  "src/app/api/health/crews/route.ts",
  "src/app/api/telemetry/crews/route.ts",
  "src/app/(preview)/m9-crew-review/page.tsx",
  "src/app/(preview)/m9-crew-review/review.module.css",
  "tests/e2e/m9/m9-crew-release.spec.ts",
  "tests/visual/m9-crews.visual.spec.ts",
  "playwright.m9.config.ts",
  "scripts/package-m9-release.mjs",
  "scripts/approve-m9-visuals.mjs",
  "docs/milestones/M9/m9-9-8-release-readiness-observability.md",
  "docs/milestones/M9/m9-reference-approval.json",
  "docs/runbooks/m9-crew-rollback.md",
  "tsconfig.m9-9-8.json",
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

expectContains("src/features/crews/resources/ui/CrewResourceScreen.tsx", 'data-m9-stage="9.8"');
expectContains(
  "src/features/crews/membership/ui/CrewMembershipScreen.tsx",
  "VERZUS M9.8 AUTHORITY AND LIFECYCLE TELEMETRY",
);
expectContains("src/app/api/health/crews/route.ts", 'stage: "9.8"');
expectContains("src/app/(platform)/crews/layout.tsx", "CrewFeatureGate");
expectContains(".env.example", "NEXT_PUBLIC_ENABLE_M9_CREWS=true");
expectContains("src/features/crews/index.ts", 'export * from "./release"');
expectContains("src/features/crews/index.ts", 'export * from "./telemetry"');

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
for (const script of [
  "typecheck:m9:9.8",
  "verify:m9:9.8",
  "verify:m9:9.8:build",
  "test:m9:9.8:e2e",
  "test:m9:9.8:visual",
  "m9:visual:update",
  "m9:approve",
  "m9:artifact",
  "m9:release",
]) {
  if (!packageJson.scripts?.[script]) failures.push(`Missing package script ${script}`);
}

const leanVerify = packageJson.scripts?.["verify:m9:9.8"] ?? "";
if (/vitest|playwright|npm run test(?::|\s|$)/.test(leanVerify)) {
  failures.push("verify:m9:9.8 must remain a lean marker, ESLint and focused TypeScript gate");
}

const release = packageJson.scripts?.["m9:release"] ?? "";
if (/vitest|playwright|npm run test(?::|\s|$)/.test(release)) {
  failures.push("m9:release must not force Vitest or Playwright");
}

if (failures.length > 0) {
  console.error("M9.8 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M9.8 feature isolation, Crew telemetry, health reporting, review hub, optional browser checks and immutable packaging are installed.",
);
