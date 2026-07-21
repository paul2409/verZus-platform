// VERZUS M12.8 CONTENT-ADDRESSED RELEASE EVIDENCE PACKAGE

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const artifactRoot = ".verzus-artifacts/m12";
const reviewPath = "docs/milestones/M12/m12-responsive-review.json";
const releaseContractPath = "docs/milestones/M12/m12-release-readiness.json";

const explicitFiles = [
  "package.json",
  "package-lock.json",
  "npm-shrinkwrap.json",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "tsconfig.json",
  "docs/milestones/M12/m12-eight-stage-plan.md",
  reviewPath,
  releaseContractPath,
];

const roots = [
  "src/features/search",
  "src/features/notifications",
  "src/features/activity",
  "src/lib/reliability",
  "src/components/feedback/resource-state",
  "src/app/api/search",
  "src/app/api/notifications",
  "src/app/api/activity",
  "src/app/(platform)/search",
  "src/app/(platform)/notifications",
  "src/app/(platform)/activity",
  "docs/milestones/M12",
];

const buildEvidenceFiles = [
  ".next/BUILD_ID",
  ".next/routes-manifest.json",
  ".next/prerender-manifest.json",
  ".next/required-server-files.json",
  ".next/server/middleware-manifest.json",
];

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

function gitOutput(args, fallback) {
  try {
    return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return fallback;
  }
}

const review = JSON.parse(fs.readFileSync(reviewPath, "utf8"));
if (review.status !== "approved" || !review.approvedBy || !review.approvedAt) {
  throw new Error(
    'Responsive review is not approved. Run: npm run approve:m12:responsive -- --by "Reviewer name"',
  );
}

if (!fs.existsSync(".next/BUILD_ID")) {
  throw new Error("Next.js BUILD_ID is missing. Run npm run build before packaging M12.");
}

const dirtyOutput = gitOutput(["status", "--porcelain"], "git-unavailable");
const dirty = dirtyOutput.length > 0;
if (dirty && process.env.VERZUS_ALLOW_DIRTY_RELEASE !== "1") {
  throw new Error(
    "Refusing to package an uncommitted release. Commit the release candidate or set VERZUS_ALLOW_DIRTY_RELEASE=1 for local diagnostics only.",
  );
}

const scriptFiles = fs.existsSync("scripts")
  ? fs
      .readdirSync("scripts")
      .filter((name) => /^verify-m12-12-[1-8]\.mjs$/.test(name))
      .map((name) => `scripts/${name}`)
  : [];
const configFiles = fs
  .readdirSync(".")
  .filter((name) => /^tsconfig\.m12-12-[1-8]\.json$/.test(name));

const sourceFiles = Array.from(
  new Set([
    ...explicitFiles.filter((file) => fs.existsSync(file)),
    ...roots.flatMap(walk),
    ...scriptFiles,
    ...configFiles,
  ]),
).sort();

if (sourceFiles.length === 0) {
  throw new Error("No M12 release inputs were found.");
}

const files = sourceFiles.map((file) => {
  const content = fs.readFileSync(file);
  return {
    path: file,
    sha256: hashBuffer(content),
    size: content.byteLength,
  };
});

const gitCommit = gitOutput(["rev-parse", "HEAD"], "unavailable");
const branch = gitOutput(["branch", "--show-current"], "unavailable");
const buildId = fs.readFileSync(".next/BUILD_ID", "utf8").trim();
const identity = {
  schemaVersion: 1,
  milestone: "M12",
  stage: "12.8",
  gitCommit,
  buildId,
  files,
};
const digest = hashBuffer(Buffer.from(JSON.stringify(identity)));
const artifactDir = path.join(artifactRoot, digest);
const manifestPath = path.join(artifactDir, "manifest.json");

if (fs.existsSync(artifactDir)) {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Artifact directory already exists without a manifest: ${artifactDir}`);
  }
  const existing = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (existing.digest !== digest) {
    throw new Error(`Refusing to overwrite immutable artifact directory: ${artifactDir}`);
  }
  console.log(`M12 artifact already exists: ${digest}`);
  process.exit(0);
}

for (const file of sourceFiles) {
  const destination = path.join(artifactDir, "inputs", file);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(file, destination);
}

const copiedBuildEvidence = [];
for (const file of buildEvidenceFiles) {
  if (!fs.existsSync(file)) continue;
  const destination = path.join(artifactDir, "build", file.replace(/^\.next\//, ""));
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(file, destination);
  const content = fs.readFileSync(file);
  copiedBuildEvidence.push({
    path: file,
    sha256: hashBuffer(content),
    size: content.byteLength,
  });
}

const manifest = {
  ...identity,
  digest,
  artifactType: "m12-release-evidence",
  createdAt: new Date().toISOString(),
  branch,
  dirty,
  dirtyOverride: process.env.VERZUS_ALLOW_DIRTY_RELEASE === "1",
  responsiveApproval: {
    status: review.status,
    approvedBy: review.approvedBy,
    approvedAt: review.approvedAt,
    evidence: review.evidence,
  },
  buildEvidence: copiedBuildEvidence,
  promotion: {
    environments: ["preview", "staging", "production"],
    rule: "promote-the-same-digest-without-rebuilding",
  },
  rollback: {
    rule: "redeploy-the-previous-retained-digest",
    retainFailedArtifact: true,
  },
};

fs.mkdirSync(artifactDir, { recursive: true });
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
fs.mkdirSync(artifactRoot, { recursive: true });
fs.writeFileSync(
  path.join(artifactRoot, "latest.json"),
  `${JSON.stringify({ milestone: "M12", digest, manifest: normalize(manifestPath) }, null, 2)}\n`,
);

console.log(`M12 immutable artifact evidence created: ${digest}`);
console.log(`Manifest: ${normalize(manifestPath)}`);
