// VERZUS M7.8 IMMUTABLE ARTIFACT PACKAGER

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const buildIdFile = path.join(root, ".next/BUILD_ID");
if (!fs.existsSync(buildIdFile)) {
  console.error("Missing .next/BUILD_ID. Run npm run build before packaging.");
  process.exit(1);
}

const buildId = fs.readFileSync(buildIdFile, "utf8").trim();
const git = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" });
const commit = git.status === 0 ? git.stdout.trim() : "unknown";
const rawRelease = process.env.NEXT_PUBLIC_RELEASE_SHA || commit || buildId;
const release = rawRelease.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 120);
const outputDir = path.join(root, "artifacts/m7-match-operations", release);
fs.mkdirSync(outputDir, { recursive: true });

const archive = path.join(outputDir, `verzus-m7-match-operations-${release}.tar.gz`);
const inputs = [".next", "public", "package.json"];
for (const optional of [
  "package-lock.json",
  "next.config.ts",
  "next.config.mjs",
  "next.config.js",
]) {
  if (fs.existsSync(path.join(root, optional))) inputs.push(optional);
}

const tar = spawnSync("tar", ["-czf", archive, ...inputs], {
  cwd: root,
  stdio: "inherit",
});
if (tar.status !== 0) process.exit(tar.status ?? 1);

const digest = crypto.createHash("sha256").update(fs.readFileSync(archive)).digest("hex");
const manifest = {
  marker: "VERZUS M7.8 IMMUTABLE RELEASE",
  stage: "7.8",
  release,
  sourceCommit: commit,
  buildId,
  artifact: path.basename(archive),
  sha256: digest,
  node: process.version,
  createdAt: new Date().toISOString(),
  promotionRule: "Promote this exact archive through preview, staging and production.",
};
fs.writeFileSync(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`M7 immutable artifact: ${archive}`);
console.log(`SHA-256: ${digest}`);
