// VERZUS M10.8 IMMUTABLE REWARD RELEASE PACKAGER

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const approvalFile = path.join(root, "docs/milestones/M10/m10-reference-approval.json");

if (!fs.existsSync(approvalFile)) {
  console.error("M10 approval manifest is missing.");
  process.exit(1);
}

const approval = JSON.parse(fs.readFileSync(approvalFile, "utf8"));
if (approval.releaseGate?.status !== "approved") {
  console.error("M10 artifact packaging is blocked until responsive visual review is approved.");
  process.exit(1);
}

const standalone = path.join(root, ".next/standalone");
if (!fs.existsSync(standalone)) {
  console.error("Missing .next/standalone. Run npm run build before packaging M10.");
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
const artifactDirectory = path.join(root, "artifacts/m10-rewards", releaseId);
const archiveName = `verzus-m10-rewards-${releaseId}.tar.gz`;
const archivePath = path.join(artifactDirectory, archiveName);
fs.mkdirSync(artifactDirectory, { recursive: true });

const included = [
  ".next/standalone",
  ".next/static",
  "public",
  "src/features/rewards",
  "src/app/(platform)/rewards",
  "src/app/api/rewards",
  "src/app/api/health/rewards",
  "src/app/api/telemetry/rewards",
  "src/app/(preview)/m10-rewards-review",
  "docs/milestones/M10",
  "docs/runbooks/m10-reward-rollback.md",
  "tests/e2e/m10",
  "tests/visual/m10-rewards.visual.spec.ts",
  "playwright.m10.config.ts",
  "tsconfig.m10-10-8.json",
  "next.config.ts",
  ".env.example",
  "package.json",
  "package-lock.json",
].filter((entry) => fs.existsSync(path.join(root, entry)));

execFileSync("tar", ["-czf", archivePath, ...included], { cwd: root, stdio: "inherit" });
const checksum = createHash("sha256").update(fs.readFileSync(archivePath)).digest("hex");
const manifest = {
  milestone: "M10",
  stage: "10.8",
  releaseId,
  commit,
  buildId: process.env.NEXT_PUBLIC_RELEASE_SHA ?? commit,
  nodeVersion: process.version,
  archive: archiveName,
  sha256: checksum,
  createdAt: new Date().toISOString(),
  visualApproval: approval.releaseGate,
  verification:
    "Lean M10.8 verification, production build and explicit visual approval. Browser suites remain opt-in.",
  promotionRule:
    "Promote this exact archive and checksum through preview, staging and production without rebuilding.",
};
fs.writeFileSync(
  path.join(artifactDirectory, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(`M10 artifact created: ${archivePath}`);
console.log(`SHA-256: ${checksum}`);
