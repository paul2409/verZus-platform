#!/usr/bin/env node

// VERZUS M10.7 STRUCTURAL VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function read(relativePath) {
  const absolute = path.join(root, relativePath);
  if (!fs.existsSync(absolute)) {
    failures.push(`Missing ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolute, "utf8");
}

function expect(relativePath, marker) {
  const content = read(relativePath);
  if (content && !content.includes(marker)) {
    failures.push(`${relativePath} is missing marker: ${marker}`);
  }
}

const required = [
  "src/features/rewards/reliability/model/reward-reliability.types.ts",
  "src/features/rewards/reliability/model/reward-reliability.parsers.ts",
  "src/features/rewards/reliability/ui/RewardWidgetBoundary.tsx",
  "src/features/rewards/reliability/ui/RewardWidgetFault.tsx",
  "src/features/rewards/telemetry/reward-telemetry.schema.ts",
  "src/features/rewards/telemetry/reward-telemetry.client.ts",
  "src/features/rewards/telemetry/RewardTelemetry.tsx",
  "src/app/api/health/rewards/route.ts",
  "src/app/api/telemetry/rewards/route.ts",
  "docs/milestones/M10/m10-10-7-reliability-failure-isolation-observability.md",
  "tsconfig.m10-10-7.json",
];

for (const file of required) read(file);

expect("src/features/rewards/foundation/ui/RewardsFoundationScreen.tsx", 'data-m10-stage="10.7"');
expect("src/features/rewards/resources/ui/RewardsResourceScreen.tsx", 'data-m10-stage="10.7"');
expect("src/features/rewards/reliability/ui/RewardWidgetBoundary.tsx", "reward_widget_failed");
expect("src/features/rewards/claims/hooks/useRewardClaim.ts", "reward_claim_succeeded");
expect("src/features/rewards/claims/hooks/useRewardClaim.ts", "reward_claim_failed");
expect("src/features/rewards/resources/model/reward-resource.types.ts", '"maintenance"');
expect("src/features/rewards/resources/model/reward-resource.types.ts", '"retrying"');
expect("src/app/api/health/rewards/route.ts", 'stage: "10.7"');
expect("src/app/api/telemetry/rewards/route.ts", "rewardTelemetrySchema");

const foundation = read("src/features/rewards/foundation/ui/RewardsFoundationScreen.tsx");
for (const widget of [
  "progress",
  "claimable",
  "inventory",
  "season",
  "achievements",
  "recent-history",
  "audit-history",
]) {
  if (!foundation.includes(`widget=\"${widget}\"`)) {
    failures.push(`Missing isolated widget: ${widget}`);
  }
}

const telemetry = read("src/features/rewards/telemetry/reward-telemetry.schema.ts");
for (const forbidden of ["email", "displayName", "idempotencyKey", "gameHandle"]) {
  if (telemetry.includes(forbidden)) {
    failures.push(`Telemetry schema contains forbidden field: ${forbidden}`);
  }
}

const giantEndpoint = path.join(root, "src/app/api/rewards-dashboard");
if (fs.existsSync(giantEndpoint)) {
  failures.push("Oversized rewards-dashboard endpoint must not exist.");
}

if (failures.length > 0) {
  console.error("M10.7 verification failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M10.7 widget isolation, explicit retry states, controlled edge scenarios, reward health and privacy-safe telemetry are installed.",
);
