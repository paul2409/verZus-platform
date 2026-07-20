// VERZUS M11.8 STRUCTURAL RELEASE VERIFIER

import fs from "node:fs";

const requiredFiles = [
  "src/features/profiles/release/profile-release.config.ts",
  "src/features/profiles/release/ProfileFeatureGate.tsx",
  "src/features/profiles/release/ProfileFeatureGate.module.css",
  "src/features/profiles/release/ProfileReleaseBoundary.tsx",
  "src/features/profiles/release/ProfileReleaseBoundary.module.css",
  "src/features/profiles/release/index.ts",
  "src/app/(platform)/profile/layout.tsx",
  "src/app/(platform)/players/layout.tsx",
  "src/app/(preview)/m11-profile-review/page.tsx",
  "src/app/(preview)/m11-profile-review/review.module.css",
  "src/app/api/health/profiles/route.ts",
  "src/app/api/telemetry/profiles/route.ts",
  "tests/e2e/m11/m11-profile-release.spec.ts",
  "tests/visual/m11-profiles.visual.spec.ts",
  "playwright.m11.config.ts",
  "scripts/package-m11-release.mjs",
  "scripts/approve-m11-visuals.mjs",
  "docs/milestones/M11/m11-11-8-release-readiness-feature-isolation-packaging.md",
  "docs/runbooks/m11-profile-rollback.md",
  "tsconfig.m11-11-8.json",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`M11.8 missing required file: ${file}`);
}

const foundation = fs.readFileSync(
  "src/features/profiles/foundation/ui/PlayerProfileFoundationScreen.tsx",
  "utf8",
);
const profileScreen = fs.readFileSync("src/features/profiles/ui/ProfileScreen.tsx", "utf8");
const featureGate = fs.readFileSync("src/features/profiles/release/ProfileFeatureGate.tsx", "utf8");
const releaseConfig = fs.readFileSync(
  "src/features/profiles/release/profile-release.config.ts",
  "utf8",
);
const boundary = fs.readFileSync(
  "src/features/profiles/release/ProfileReleaseBoundary.tsx",
  "utf8",
);
const health = fs.readFileSync("src/app/api/health/profiles/route.ts", "utf8");
const telemetry = fs.readFileSync("src/app/api/telemetry/profiles/route.ts", "utf8");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const env = fs.readFileSync(".env.example", "utf8");
const approval = JSON.parse(
  fs.readFileSync("docs/milestones/M11/m11-reference-approval.json", "utf8"),
);

for (const marker of ['data-m11-stage="11.8"', "VERZUS M11.8 RELEASE-READY PROFILE FOUNDATION"]) {
  if (!foundation.includes(marker)) throw new Error(`M11.8 foundation marker missing: ${marker}`);
}

if (!profileScreen.includes("VERZUS M11.8 RELEASE-READY PROFILE COMPOSITION")) {
  throw new Error("M11.8 ProfileScreen release marker is missing.");
}

if (!releaseConfig.includes("NEXT_PUBLIC_ENABLE_M11_PROFILES")) {
  throw new Error("M11.8 release config feature flag marker is missing.");
}

for (const marker of ['data-m11-feature-state="disabled"', "Return to Play"]) {
  if (!featureGate.includes(marker))
    throw new Error(`M11.8 feature-gate marker missing: ${marker}`);
}

for (const marker of ["ProfileReleaseBoundary", "surface_failed", "Error ID:"]) {
  if (!boundary.includes(marker)) throw new Error(`M11.8 boundary marker missing: ${marker}`);
}

for (const marker of ['feature: "profiles"', 'stage: "11.8"', "featureIsolation"]) {
  if (!health.includes(marker)) throw new Error(`M11.8 health marker missing: ${marker}`);
}

for (const marker of ["telemetrySchema", "surface_failed", "requestId", ".strict()"]) {
  if (!telemetry.includes(marker)) throw new Error(`M11.8 telemetry marker missing: ${marker}`);
}

if (!env.includes("NEXT_PUBLIC_ENABLE_M11_PROFILES=true")) {
  throw new Error("M11.8 environment feature flag is missing.");
}

for (const scriptName of [
  "typecheck:m11:11.8",
  "verify:m11:11.8",
  "test:m11:11.8:e2e",
  "test:m11:11.8:visual",
  "m11:visual:update",
  "m11:approve",
  "m11:approval:check",
  "m11:artifact",
  "m11:release",
]) {
  if (!packageJson.scripts?.[scriptName]) {
    throw new Error(`M11.8 package script missing: ${scriptName}`);
  }
}

if (!approval.releaseGate || approval.releaseGate.stage !== "11.8") {
  throw new Error("M11.8 responsive release gate record is missing.");
}

console.log(
  "M11.8 profile feature isolation, health, privacy-safe telemetry, responsive review, approval gate and immutable packaging are installed.",
);
