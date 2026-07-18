// VERZUS M10.1 REWARDS FOUNDATION VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "src/features/rewards/foundation/model/reward-foundation.types.ts",
  "src/features/rewards/foundation/mocks/reward-foundation.mock.ts",
  "src/features/rewards/foundation/ui/RewardsFoundationScreen.tsx",
  "src/features/rewards/foundation/ui/RewardsFoundationScreen.module.css",
  "src/features/rewards/foundation/ui/index.ts",
  "src/features/rewards/foundation/index.ts",
  "public/rewards/level-shield.svg",
  "public/rewards/verzus-coin.svg",
  "public/rewards/reward-crate.svg",
  "public/rewards/xp-ticket.svg",
  "public/rewards/crew-sticker.svg",
  "docs/milestones/M10/m10-eight-stage-plan.md",
  "docs/milestones/M10/m10-10-1-rewards-foundation.md",
  "docs/milestones/M10/m10-reference-approval.json",
  "tsconfig.m10-10-1.json",
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

expectContains(
  "src/features/rewards/foundation/ui/RewardsFoundationScreen.tsx",
  'data-m10-stage="10.1"',
);
expectContains(
  "src/features/rewards/foundation/ui/RewardsFoundationScreen.tsx",
  'data-reference-viewport="390"',
);
expectContains("src/features/rewards/ui/RewardsScreen.tsx", "RewardsFoundationScreen");
expectContains("src/features/rewards/index.ts", 'export * from "./foundation"');
expectContains("docs/milestones/M10/m10-reference-approval.json", '"status": "approved"');

const typesPath = path.join(
  root,
  "src/features/rewards/foundation/model/reward-foundation.types.ts",
);
if (fs.existsSync(typesPath)) {
  const source = fs.readFileSync(typesPath, "utf8");
  for (const state of [
    "locked",
    "eligible",
    "claimable",
    "claiming",
    "claimed",
    "expired",
    "revoked",
  ]) {
    if (!source.includes(`"${state}"`)) failures.push(`Missing reward state ${state}`);
  }
}

const screenPath = path.join(
  root,
  "src/features/rewards/foundation/ui/RewardsFoundationScreen.tsx",
);
if (fs.existsSync(screenPath)) {
  const source = fs.readFileSync(screenPath, "utf8");
  if (/fetch\(|\/api\//.test(source)) {
    failures.push("M10.1 foundation screen must not introduce a page-level API dependency");
  }
}

const approvalPath = path.join(root, "docs/milestones/M10/m10-reference-approval.json");
if (fs.existsSync(approvalPath)) {
  const approval = JSON.parse(fs.readFileSync(approvalPath, "utf8"));
  if (approval.viewports?.["390"]?.status !== "approved") {
    failures.push("390px Rewards reference must be recorded as approved");
  }
  if (approval.viewports?.["1440"]?.status !== "pending") {
    failures.push("Desktop reference must remain pending at M10.1");
  }
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
for (const script of ["m10:preview", "typecheck:m10:10.1", "verify:m10:10.1"]) {
  if (!packageJson.scripts?.[script]) failures.push(`Missing package script ${script}`);
}

const leanVerify = packageJson.scripts?.["verify:m10:10.1"] ?? "";
if (/vitest|playwright|npm run test(?::|\s|$)/.test(leanVerify)) {
  failures.push("verify:m10:10.1 must remain a lean marker, ESLint and focused TypeScript gate");
}

if (failures.length > 0) {
  console.error("M10.1 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M10.1 typed reward states, approved 390px progression hierarchy, local artwork and safe non-mutating claim preview are installed.",
);
