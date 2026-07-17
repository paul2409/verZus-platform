// VERZUS M8.10 IMMUTABLE RELEASE PACKAGER

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
const artifactDirectory = path.join(root, "artifacts/m8-leaderboards", releaseId);
const archiveName = `verzus-m8-leaderboards-${releaseId}.tar.gz`;
const archivePath = path.join(artifactDirectory, archiveName);
fs.mkdirSync(artifactDirectory, { recursive: true });

const included = [
  "src/features/leaderboards",
  "src/features/profiles/intel-card",
  "src/features/crews/intel-card",
  "src/features/matches/intel-card",
  "src/app/(platform)/leaderboards",
  "src/app/api/leaderboards",
  "src/app/api/players/[playerId]/intel",
  "src/app/api/crews/[crewId]/intel",
  "src/app/api/matches/[matchId]/intel",
  "src/app/api/telemetry/leaderboards",
  "src/app/api/health/leaderboards",
  "docs/milestones/M8",
  "docs/runbooks/m8-leaderboard-rollback.md",
  "tests/e2e/m8",
  "tests/visual/m8-leaderboards.visual.spec.ts",
  "playwright.m8.config.ts",
  "package.json",
  "package-lock.json",
].filter((item) => fs.existsSync(path.join(root, item)));

execFileSync("tar", ["-czf", archivePath, ...included], { cwd: root, stdio: "inherit" });
const checksum = createHash("sha256").update(fs.readFileSync(archivePath)).digest("hex");
const manifest = {
  milestone: "M8",
  stage: "8.10",
  releaseId,
  commit,
  buildId: process.env.NEXT_PUBLIC_RELEASE_SHA ?? commit,
  nodeVersion: process.version,
  archive: archiveName,
  sha256: checksum,
  createdAt: new Date().toISOString(),
  promotionRule: "Promote this exact archive and checksum through preview, staging and production.",
};
fs.writeFileSync(
  path.join(artifactDirectory, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(`M8 artifact created: ${archivePath}`);
console.log(`SHA-256: ${checksum}`);
