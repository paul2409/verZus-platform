// VERZUS M12.8 STRUCTURAL VERIFIER

import fs from "node:fs";

const requiredFiles = [
  "docs/milestones/M12/m12-12-8-release-readiness.md",
  "docs/milestones/M12/m12-release-readiness.json",
  "docs/milestones/M12/m12-responsive-review.json",
  "scripts/approve-m12-responsive-review.mjs",
  "scripts/package-m12-release.mjs",
  "scripts/run-m12-release-gate.mjs",
  "scripts/verify-m12-release-artifact.mjs",
  "tsconfig.m12-12-8.json",
];

for (let stage = 1; stage <= 7; stage += 1) {
  requiredFiles.push(`scripts/verify-m12-12-${stage}.mjs`);
}

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`M12.8 missing required file: ${file}`);
}

const plan = fs.readFileSync("docs/milestones/M12/m12-eight-stage-plan.md", "utf8");
for (const marker of ["M12.8", "Release readiness", "immutable packaging", "rollback"]) {
  if (!plan.toLowerCase().includes(marker.toLowerCase())) {
    throw new Error(`M12 eight-stage plan marker missing: ${marker}`);
  }
}

const release = JSON.parse(
  fs.readFileSync("docs/milestones/M12/m12-release-readiness.json", "utf8"),
);
if (release.milestone !== "M12" || release.stage !== "12.8") {
  throw new Error("M12.8 release-readiness contract is invalid.");
}
if (release.productionReady !== false) {
  throw new Error("M12.8 must not claim production readiness before the full gate and preview approval.");
}
if (release.artifact?.identity !== "sha256" || release.artifact?.promoteSameDigest !== true) {
  throw new Error("M12.8 immutable same-digest promotion contract is incomplete.");
}
for (const command of ["lint", "typecheck", "test", "build"]) {
  if (!release.qualityGate?.required?.includes(command)) {
    throw new Error(`M12.8 full quality gate is missing: ${command}`);
  }
}

const review = JSON.parse(
  fs.readFileSync("docs/milestones/M12/m12-responsive-review.json", "utf8"),
);
const requiredWidths = [360, 390, 430, 768, 1024, 1440];
if (JSON.stringify(review.viewports) !== JSON.stringify(requiredWidths)) {
  throw new Error("M12.8 responsive review does not contain the required viewport matrix.");
}
if (!["review-required", "approved"].includes(review.status)) {
  throw new Error("M12.8 responsive review has an invalid status.");
}
if (review.status === "approved" && (!review.approvedBy || !review.approvedAt)) {
  throw new Error("M12.8 responsive approval is missing reviewer metadata.");
}
for (const route of ["/search", "/notifications", "/notifications/settings", "/activity"]) {
  if (!review.routes?.some((entry) => entry.path === route)) {
    throw new Error(`M12.8 responsive route is missing: ${route}`);
  }
}

const packager = fs.readFileSync("scripts/package-m12-release.mjs", "utf8");
for (const marker of [
  ".verzus-artifacts/m12",
  ".next/BUILD_ID",
  "sha256",
  "promote-the-same-digest-without-rebuilding",
  "VERZUS_ALLOW_DIRTY_RELEASE",
]) {
  if (!packager.includes(marker)) throw new Error(`M12.8 packager marker missing: ${marker}`);
}

const artifactVerifier = fs.readFileSync("scripts/verify-m12-release-artifact.mjs", "utf8");
for (const marker of ["Current source drifted", "BUILD_ID", "aggregate artifact digest"]) {
  if (!artifactVerifier.includes(marker)) {
    throw new Error(`M12.8 artifact-verifier marker missing: ${marker}`);
  }
}

const gate = fs.readFileSync("scripts/run-m12-release-gate.mjs", "utf8");
for (const marker of [
  '"verify:m12:12.8"',
  '"lint"',
  '"typecheck"',
  '"test"',
  '"build"',
  '"package:m12:release"',
  '"verify:m12:artifact"',
]) {
  if (!gate.includes(marker)) throw new Error(`M12.8 release-gate marker missing: ${marker}`);
}

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
for (const name of [
  "typecheck:m12:12.8",
  "verify:m12:12.8",
  "approve:m12:responsive",
  "package:m12:release",
  "verify:m12:artifact",
  "release:gate:m12",
]) {
  if (!packageJson.scripts?.[name]) throw new Error(`M12.8 package script missing: ${name}`);
}

if (fs.existsSync("src/app/api/search-dashboard")) {
  throw new Error("M12.8 found a forbidden combined Search dashboard endpoint.");
}

console.log(
  "M12.8 responsive approval, full quality gate, content-addressed artifact evidence and rollback contract are installed.",
);
