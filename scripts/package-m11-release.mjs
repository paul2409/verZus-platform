// VERZUS M11.8 IMMUTABLE PROFILE RELEASE PACKAGER

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const approvalFile = path.join(root, "docs/milestones/M11/m11-reference-approval.json");

if (!fs.existsSync(approvalFile)) {
  console.error("M11 approval manifest is missing.");
  process.exit(1);
}

const approval = JSON.parse(fs.readFileSync(approvalFile, "utf8"));
if (approval.releaseGate?.status !== "approved") {
  console.error("M11 artifact packaging is blocked until responsive visual review is approved.");
  process.exit(1);
}

const standalone = path.join(root, ".next/standalone");
if (!fs.existsSync(standalone)) {
  console.error("Missing .next/standalone. Run npm run build before packaging M11.");
  process.exit(1);
}

const commit = (() => {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return process.env.NEXT_PUBLIC_RELEASE_SHA ?? "uncommitted";
  }
})();
const releaseId = commit === "uncommitted" ? `local-${Date.now()}` : commit.slice(0, 12);
const artifactDirectory = path.join(root, "artifacts/m11-profiles", releaseId);
const archiveName = `verzus-m11-profiles-${releaseId}.tar.gz`;
const archivePath = path.join(artifactDirectory, archiveName);
fs.mkdirSync(artifactDirectory, { recursive: true });

const included = [
  ".next/standalone",
  ".next/static",
  "public/profiles",
  "src/features/profiles",
  "src/app/(platform)/profile",
  "src/app/(platform)/players",
  "src/app/api/profile",
  "src/app/api/health/profiles",
  "src/app/api/telemetry/profiles",
  "src/app/(preview)/m11-profile-review",
  "docs/milestones/M11",
  "docs/runbooks/m11-profile-rollback.md",
  "tests/e2e/m11",
  "tests/visual/m11-profiles.visual.spec.ts",
  "playwright.m11.config.ts",
  "tsconfig.m11-11-8.json",
  "next.config.ts",
  ".env.example",
  "package.json",
  "package-lock.json",
].filter((entry) => fs.existsSync(path.join(root, entry)));

execFileSync("tar", ["-czf", archivePath, ...included], { cwd: root, stdio: "inherit" });
const checksum = createHash("sha256").update(fs.readFileSync(archivePath)).digest("hex");
const manifest = {
  milestone: "M11",
  stage: "11.8",
  releaseId,
  commit,
  buildId: process.env.NEXT_PUBLIC_RELEASE_SHA ?? commit,
  nodeVersion: process.version,
  archive: archiveName,
  sha256: checksum,
  createdAt: new Date().toISOString(),
  visualApproval: approval.releaseGate,
  verification:
    "Lean M11.8 verification, production build and explicit visual approval. Browser suites remain opt-in.",
  promotionRule:
    "Promote this exact archive and checksum through preview, staging and production without rebuilding.",
};
fs.writeFileSync(
  path.join(artifactDirectory, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(`M11 artifact created: ${archivePath}`);
console.log(`SHA-256: ${checksum}`);
