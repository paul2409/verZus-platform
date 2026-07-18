// VERZUS M9.8 IMMUTABLE CREW RELEASE PACKAGER

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const commit = (() => {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return process.env.NEXT_PUBLIC_RELEASE_SHA ?? "uncommitted";
  }
})();
const releaseId = commit === "uncommitted" ? `local-${Date.now()}` : commit.slice(0, 12);
const artifactDirectory = path.join(root, "artifacts/m9-crews", releaseId);
const archiveName = `verzus-m9-crews-${releaseId}.tar.gz`;
const archivePath = path.join(artifactDirectory, archiveName);
fs.mkdirSync(artifactDirectory, { recursive: true });

const included = [
  "src/features/crews",
  "src/app/(platform)/crews",
  "src/app/api/crews",
  "src/app/api/health/crews",
  "src/app/api/telemetry/crews",
  "src/app/(preview)/m9-crew-review",
  "docs/milestones/M9",
  "docs/runbooks/m9-crew-rollback.md",
  "tests/e2e/m9",
  "tests/visual/m9-crews.visual.spec.ts",
  "playwright.m9.config.ts",
  "tsconfig.m9-9-8.json",
  ".env.example",
  "package.json",
  "package-lock.json",
].filter((item) => fs.existsSync(path.join(root, item)));

execFileSync("tar", ["-czf", archivePath, ...included], { cwd: root, stdio: "inherit" });
const checksum = createHash("sha256").update(fs.readFileSync(archivePath)).digest("hex");
const manifest = {
  milestone: "M9",
  stage: "9.8",
  releaseId,
  commit,
  buildId: process.env.NEXT_PUBLIC_RELEASE_SHA ?? commit,
  nodeVersion: process.version,
  archive: archiveName,
  sha256: checksum,
  createdAt: new Date().toISOString(),
  verification: "Lean M9.8 verification and production build; browser suites remain opt-in.",
  promotionRule: "Promote this exact archive and checksum through preview, staging and production.",
};
fs.writeFileSync(
  path.join(artifactDirectory, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(`M9 artifact created: ${archivePath}`);
console.log(`SHA-256: ${checksum}`);
