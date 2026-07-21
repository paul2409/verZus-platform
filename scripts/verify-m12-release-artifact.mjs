// VERZUS M12.8 RELEASE ARTIFACT INTEGRITY VERIFIER

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const artifactRoot = ".verzus-artifacts/m12";
const latestPath = path.join(artifactRoot, "latest.json");

function normalize(value) {
  return value.split(path.sep).join("/");
}

function hashBuffer(value) {
  return createHash("sha256").update(value).digest("hex");
}

function walk(target) {
  if (!fs.existsSync(target)) return [];
  const stat = fs.statSync(target);
  if (stat.isFile()) return [normalize(target)];
  if (!stat.isDirectory()) return [];
  return fs
    .readdirSync(target, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => walk(path.join(target, entry.name)));
}

if (!fs.existsSync(latestPath)) {
  throw new Error("M12 latest artifact pointer is missing. Run npm run package:m12:release.");
}

const latest = JSON.parse(fs.readFileSync(latestPath, "utf8"));
const artifactDir = path.join(artifactRoot, latest.digest);
const manifestPath = path.join(artifactDir, "manifest.json");
if (!fs.existsSync(manifestPath)) {
  throw new Error(`M12 artifact manifest is missing: ${manifestPath}`);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (manifest.digest !== latest.digest || path.basename(artifactDir) !== manifest.digest) {
  throw new Error("M12 artifact pointer, directory and manifest digests disagree.");
}

const identity = {
  schemaVersion: manifest.schemaVersion,
  milestone: manifest.milestone,
  stage: manifest.stage,
  gitCommit: manifest.gitCommit,
  buildId: manifest.buildId,
  files: manifest.files,
};
const computedDigest = hashBuffer(Buffer.from(JSON.stringify(identity)));
if (computedDigest !== manifest.digest) {
  throw new Error("M12 aggregate artifact digest is invalid.");
}

const expectedInputPaths = new Set();
for (const file of manifest.files) {
  const packagedPath = path.join(artifactDir, "inputs", file.path);
  expectedInputPaths.add(normalize(packagedPath));
  if (!fs.existsSync(packagedPath)) {
    throw new Error(`Packaged M12 input is missing: ${file.path}`);
  }
  const packaged = fs.readFileSync(packagedPath);
  if (packaged.byteLength !== file.size || hashBuffer(packaged) !== file.sha256) {
    throw new Error(`Packaged M12 input failed integrity verification: ${file.path}`);
  }
  if (!fs.existsSync(file.path)) {
    throw new Error(`Current source input is missing after packaging: ${file.path}`);
  }
  const current = fs.readFileSync(file.path);
  if (hashBuffer(current) !== file.sha256) {
    throw new Error(`Current source drifted after M12 packaging: ${file.path}`);
  }
}

const actualInputPaths = walk(path.join(artifactDir, "inputs"));
for (const inputPath of actualInputPaths) {
  if (!expectedInputPaths.has(inputPath)) {
    throw new Error(`Unlisted file exists inside immutable M12 inputs: ${inputPath}`);
  }
}

const packagedBuildIdPath = path.join(artifactDir, "build", "BUILD_ID");
if (!fs.existsSync(packagedBuildIdPath)) {
  throw new Error("Packaged Next.js BUILD_ID evidence is missing.");
}
if (fs.readFileSync(packagedBuildIdPath, "utf8").trim() !== manifest.buildId) {
  throw new Error("Packaged Next.js BUILD_ID does not match the M12 manifest.");
}

if (manifest.responsiveApproval?.status !== "approved") {
  throw new Error("M12 artifact does not contain an approved responsive review.");
}
if (manifest.promotion?.rule !== "promote-the-same-digest-without-rebuilding") {
  throw new Error("M12 same-artifact promotion rule is missing.");
}

console.log(`M12 artifact integrity verified: ${manifest.digest}`);
