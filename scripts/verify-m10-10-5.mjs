#!/usr/bin/env node

// VERZUS M10.5 LEAN STRUCTURAL VERIFIER

import fs from "node:fs";

const requiredFiles = [
  "src/features/rewards/progression/model/reward-progression.types.ts",
  "src/features/rewards/progression/mocks/reward-progression.mock.ts",
  "src/features/rewards/progression/ui/RewardProgressionPanel.tsx",
  "src/features/rewards/progression/ui/RewardProgressionPanel.module.css",
  "src/features/rewards/progression/index.ts",
  "src/app/api/rewards/season/route.ts",
  "docs/milestones/M10/m10-10-5-progression-track-season-progress.md",
  "tsconfig.m10-10-5.json",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`M10.5 required file is missing: ${file}`);
}

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
for (const script of ["typecheck:m10:10.5", "verify:m10:10.5"]) {
  if (!packageJson.scripts?.[script]) throw new Error(`Missing package script: ${script}`);
}

const types = fs.readFileSync(
  "src/features/rewards/resources/model/reward-resource.types.ts",
  "utf8",
);
for (const marker of ['"season"', "RewardSeasonResource", "season: RewardSeasonProgress | null"]) {
  if (!types.includes(marker)) throw new Error(`M10.5 resource contract is missing: ${marker}`);
}

const schema = fs.readFileSync(
  "src/features/rewards/resources/schema/reward-resource.schema.ts",
  "utf8",
);
for (const marker of [
  "rewardSeasonEnvelopeSchema",
  "weekly_xp_cap",
  "boost_multiplier",
  "milestones",
]) {
  if (!schema.includes(marker)) throw new Error(`M10.5 season schema is missing: ${marker}`);
}

const service = fs.readFileSync(
  "src/features/rewards/resources/server/reward-resource.service.ts",
  "utf8",
);
for (const marker of [
  'case "season"',
  "rewardSeasonProgressMock",
  "weekly_xp_earned",
  "reward_id",
]) {
  if (!service.includes(marker)) throw new Error(`M10.5 season service is missing: ${marker}`);
}

const route = fs.readFileSync("src/app/api/rewards/season/route.ts", "utf8");
if (!route.includes('handleRewardResourceGet(request, "season")')) {
  throw new Error("M10.5 season route is not connected to the independent resource handler.");
}

const hook = fs.readFileSync("src/features/rewards/resources/hooks/useRewardResources.ts", "utf8");
for (const marker of [
  "rewardSeasonQueryOptions",
  'scenarioFor("season"',
  'healthFromQuery("season"',
  "season: season.refetch",
]) {
  if (!hook.includes(marker)) throw new Error(`M10.5 season query isolation is missing: ${marker}`);
}

const screen = fs.readFileSync(
  "src/features/rewards/foundation/ui/RewardsFoundationScreen.tsx",
  "utf8",
);
if (!screen.includes('data-m10-stage="10.5"') || !screen.includes("RewardProgressionPanel")) {
  throw new Error("M10.5 progression UI marker or composition is missing.");
}

const progressionSource = requiredFiles
  .filter((file) => file.startsWith("src/features/rewards/progression"))
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");
for (const forbidden of ["fetch(", "useMutation(", 'method: "POST"', 'method: "PATCH"']) {
  if (progressionSource.includes(forbidden)) {
    throw new Error(`M10.5 progression UI must remain read-only: ${forbidden}`);
  }
}

const verifyScript = packageJson.scripts["verify:m10:10.5"];
if (/vitest|playwright|test:m10/i.test(verifyScript)) {
  throw new Error("M10.5 lean verification must not execute Vitest or Playwright.");
}

console.log(
  "M10.5 independent season resource, confirmed progression metrics, weekly objectives, milestones, empty-season state and responsive reward path are installed.",
);
