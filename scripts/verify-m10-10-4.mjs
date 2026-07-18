#!/usr/bin/env node

// VERZUS M10.4 LEAN STRUCTURAL VERIFIER

import fs from "node:fs";

const requiredFiles = [
  "src/features/rewards/claims/model/reward-claim.types.ts",
  "src/features/rewards/claims/schema/reward-claim.schema.ts",
  "src/features/rewards/claims/api/reward-claim.client.ts",
  "src/features/rewards/claims/hooks/useRewardClaim.ts",
  "src/features/rewards/claims/server/reward-claim.store.ts",
  "src/features/rewards/claims/server/reward-claim.service.ts",
  "src/features/rewards/claims/server/reward-claim.http.ts",
  "src/features/rewards/claims/ui/RewardClaimContext.tsx",
  "src/features/rewards/claims/ui/RewardClaimAction.tsx",
  "src/features/rewards/claims/ui/RewardClaimFeedback.tsx",
  "src/app/api/rewards/[rewardId]/claim/route.ts",
  "docs/milestones/M10/m10-10-4-idempotent-reward-claiming.md",
  "tsconfig.m10-10-4.json",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`M10.4 required file is missing: ${file}`);
}

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
for (const script of ["typecheck:m10:10.4", "verify:m10:10.4"]) {
  if (!packageJson.scripts?.[script]) throw new Error(`Missing package script: ${script}`);
}

const route = fs.readFileSync("src/app/api/rewards/[rewardId]/claim/route.ts", "utf8");
if (!route.includes("handleRewardClaim") || !route.includes("export async function POST")) {
  throw new Error("M10.4 claim route is not connected to the server handler.");
}

const http = fs.readFileSync("src/features/rewards/claims/server/reward-claim.http.ts", "utf8");
for (const marker of [
  'request.headers.get("idempotency-key")',
  "expected_version",
  "response-lost",
  "REWARD_CLAIM_RESPONSE_LOST",
]) {
  if (!http.includes(marker)) throw new Error(`M10.4 HTTP safeguard is missing: ${marker}`);
}

const service = fs.readFileSync(
  "src/features/rewards/claims/server/reward-claim.service.ts",
  "utf8",
);
for (const marker of [
  "REWARD_INVENTORY_STALE_VERSION",
  "REWARD_ALREADY_CLAIMED",
  'reward.state !== "claimable"',
  "getStoredRewardClaim",
]) {
  if (!service.includes(marker)) throw new Error(`M10.4 service guard is missing: ${marker}`);
}

const store = fs.readFileSync("src/features/rewards/claims/server/reward-claim.store.ts", "utf8");
for (const marker of [
  "claimsByIdempotencyKey",
  "auditEvents",
  "store.version += 1",
  "idempotencyKeyHash",
]) {
  if (!store.includes(marker)) throw new Error(`M10.4 store invariant is missing: ${marker}`);
}

const screen = fs.readFileSync(
  "src/features/rewards/foundation/ui/RewardsFoundationScreen.tsx",
  "utf8",
);
if (!screen.includes('data-m10-stage="10.4"') || !screen.includes("RewardClaimAction")) {
  throw new Error("M10.4 claim UI marker or action is missing.");
}

const resourceTypes = fs.readFileSync(
  "src/features/rewards/resources/model/reward-resource.types.ts",
  "utf8",
);
if (!resourceTypes.includes("version: number")) {
  throw new Error("M10.4 inventory version is missing from the resource contract.");
}

const allRewardSource = requiredFiles
  .filter((file) => file.startsWith("src/"))
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");
if (allRewardSource.includes("useOptimistic(")) {
  throw new Error("M10.4 must not optimistically grant reward inventory.");
}

console.log(
  "M10.4 server-authoritative reward claiming, version checks, idempotency replay, audit records and retry-safe confirmation are installed.",
);
