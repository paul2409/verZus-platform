#!/usr/bin/env node

// VERZUS M10.6 LEAN STRUCTURAL VERIFIER

import fs from "node:fs";

const requiredFiles = [
  "src/features/rewards/achievements/model/reward-achievement.types.ts",
  "src/features/rewards/achievements/schema/reward-achievement.schema.ts",
  "src/features/rewards/achievements/adapter/reward-achievement-detail.adapter.ts",
  "src/features/rewards/achievements/api/reward-achievement-detail.client.ts",
  "src/features/rewards/achievements/api/reward-achievement-detail.query.ts",
  "src/features/rewards/achievements/server/reward-achievement-detail.http.ts",
  "src/features/rewards/achievements/server/reward-achievement-detail.service.ts",
  "src/features/rewards/achievements/ui/RewardAchievementsPanel.tsx",
  "src/features/rewards/history/model/reward-history-audit.types.ts",
  "src/features/rewards/history/schema/reward-history-audit.schema.ts",
  "src/features/rewards/history/adapter/reward-history-audit.adapter.ts",
  "src/features/rewards/history/api/reward-history-audit.client.ts",
  "src/features/rewards/history/api/reward-history-audit.query.ts",
  "src/features/rewards/history/server/reward-history-audit.http.ts",
  "src/features/rewards/history/server/reward-history-audit.service.ts",
  "src/features/rewards/history/ui/RewardHistoryAuditPanel.tsx",
  "src/app/api/rewards/achievements/[achievementId]/route.ts",
  "src/app/api/rewards/history/audit/route.ts",
  "docs/milestones/M10/m10-10-6-achievement-detail-auditable-history.md",
  "tsconfig.m10-10-6.json",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`M10.6 required file is missing: ${file}`);
}

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
for (const script of ["typecheck:m10:10.6", "verify:m10:10.6"]) {
  if (!packageJson.scripts?.[script]) throw new Error(`Missing package script: ${script}`);
}

const screen = fs.readFileSync(
  "src/features/rewards/foundation/ui/RewardsFoundationScreen.tsx",
  "utf8",
);
for (const marker of [
  'data-m10-stage="10.6"',
  "RewardAchievementsPanel",
  "RewardHistoryAuditPanel",
  "selectedAchievementId",
  "historyPage",
]) {
  if (!screen.includes(marker)) throw new Error(`M10.6 Rewards composition is missing: ${marker}`);
}

const page = fs.readFileSync("src/app/(platform)/rewards/page.tsx", "utf8");
for (const marker of [
  "parseRewardAchievementId",
  "parseRewardHistoryPage",
  "query.achievement",
  "query.historyPage",
]) {
  if (!page.includes(marker)) throw new Error(`M10.6 route state is missing: ${marker}`);
}

const achievementRoute = fs.readFileSync(
  "src/app/api/rewards/achievements/[achievementId]/route.ts",
  "utf8",
);
if (!achievementRoute.includes("handleRewardAchievementDetailGet")) {
  throw new Error("M10.6 achievement detail route is not connected.");
}

const historyRoute = fs.readFileSync("src/app/api/rewards/history/audit/route.ts", "utf8");
if (!historyRoute.includes("handleRewardHistoryAuditGet")) {
  throw new Error("M10.6 audit history route is not connected.");
}

const historyService = fs.readFileSync(
  "src/features/rewards/history/server/reward-history-audit.service.ts",
  "utf8",
);
for (const marker of [
  "reward_expired",
  "reward_revoked",
  "claimReference",
  "inventoryVersion",
  "totalPages",
]) {
  if (!historyService.includes(marker)) {
    throw new Error(`M10.6 auditable history is missing: ${marker}`);
  }
}

const achievementSource = [
  "src/features/rewards/achievements/schema/reward-achievement.schema.ts",
  "src/features/rewards/achievements/adapter/reward-achievement-detail.adapter.ts",
  "src/features/rewards/achievements/ui/RewardAchievementsPanel.tsx",
]
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");
for (const marker of ["provenance", "linked_reward", "requestId", "Retry detail"]) {
  if (!achievementSource.includes(marker)) {
    throw new Error(`M10.6 achievement detail is missing: ${marker}`);
  }
}

const readOnlySource = requiredFiles
  .filter(
    (file) =>
      file.startsWith("src/features/rewards/achievements") ||
      file.startsWith("src/features/rewards/history"),
  )
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");
for (const forbidden of ["useMutation(", 'method: "POST"', 'method: "PATCH"', 'method: "DELETE"']) {
  if (readOnlySource.includes(forbidden)) {
    throw new Error(`M10.6 detail and history resources must remain read-only: ${forbidden}`);
  }
}

const verifyScript = packageJson.scripts["verify:m10:10.6"];
if (/vitest|playwright|test:m10/i.test(verifyScript)) {
  throw new Error("M10.6 lean verification must not execute Vitest or Playwright.");
}

console.log(
  "M10.6 achievement detail, verified provenance, paginated audit history, expiration and revocation presentations are installed.",
);
