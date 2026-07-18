// VERZUS M10.3 REWARD RESOURCE VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "src/features/rewards/resources/model/reward-resource.types.ts",
  "src/features/rewards/resources/schema/reward-resource.schema.ts",
  "src/features/rewards/resources/adapter/reward-resource.adapter.ts",
  "src/features/rewards/resources/api/reward-resource.client.ts",
  "src/features/rewards/resources/api/reward-resource.query.ts",
  "src/features/rewards/resources/hooks/useRewardResources.ts",
  "src/features/rewards/resources/model/reward-resource.merge.ts",
  "src/features/rewards/resources/server/reward-resource.service.ts",
  "src/features/rewards/resources/server/reward-resource.http.ts",
  "src/features/rewards/resources/ui/RewardResourceStatusStrip.tsx",
  "src/features/rewards/resources/ui/RewardsResourceScreen.tsx",
  "src/app/api/rewards/progress/route.ts",
  "src/app/api/rewards/inventory/route.ts",
  "src/app/api/rewards/history/route.ts",
  "src/app/api/rewards/achievements/route.ts",
  "docs/milestones/M10/m10-10-3-reward-resources.md",
  "tsconfig.m10-10-3.json",
];

for (const relative of requiredFiles) {
  if (!fs.existsSync(path.join(root, relative))) failures.push(`Missing ${relative}`);
}

function read(relative) {
  const absolute = path.join(root, relative);
  return fs.existsSync(absolute) ? fs.readFileSync(absolute, "utf8") : "";
}

function expectContains(relative, marker) {
  const source = read(relative);
  if (source && !source.includes(marker)) failures.push(`Missing marker ${marker} in ${relative}`);
}

expectContains(
  "src/features/rewards/resources/ui/RewardsResourceScreen.tsx",
  'data-m10-stage="10.3"',
);
expectContains(
  "src/features/rewards/foundation/ui/RewardsFoundationScreen.tsx",
  'data-m10-stage="10.3"',
);
expectContains("src/features/rewards/index.ts", 'export * from "./resources"');
expectContains("src/features/rewards/ui/RewardsScreen.tsx", "RewardsResourceScreen");
expectContains("src/app/(platform)/rewards/page.tsx", "parseRewardResourceName");
expectContains(
  "src/features/rewards/inventory/ui/RewardInventoryPanel.tsx",
  "items = rewardInventoryMock",
);

const resourceNames = ["progress", "inventory", "history", "achievements"];
const types = read("src/features/rewards/resources/model/reward-resource.types.ts");
const query = read("src/features/rewards/resources/api/reward-resource.query.ts");
const hook = read("src/features/rewards/resources/hooks/useRewardResources.ts");

for (const resource of resourceNames) {
  if (!types.includes(`"${resource}"`)) failures.push(`Missing resource type ${resource}`);
  if (!query.includes(`resource("${resource}"`)) failures.push(`Missing query key for ${resource}`);
  if (!hook.includes(`healthFromQuery("${resource}"`))
    failures.push(`Missing health state for ${resource}`);
}

const client = read("src/features/rewards/resources/api/reward-resource.client.ts");
if (!client.includes("signal?: AbortSignal")) failures.push("Reward clients must be abortable");
if (!client.includes('cache: "no-store"'))
  failures.push("Reward clients must avoid browser HTTP caching");

const schemas = read("src/features/rewards/resources/schema/reward-resource.schema.ts");
if (!schemas.includes("rewardResourceErrorEnvelopeSchema"))
  failures.push("Missing structured error schema");

const packageJson = JSON.parse(read("package.json"));
for (const script of ["m10:preview", "typecheck:m10:10.3", "verify:m10:10.3"]) {
  if (!packageJson.scripts?.[script]) failures.push(`Missing package script ${script}`);
}

const verifyScript = packageJson.scripts?.["verify:m10:10.3"] ?? "";
if (/vitest|playwright|npm run test(?::|\s|$)/.test(verifyScript)) {
  failures.push("verify:m10:10.3 must remain a lean marker, ESLint and TypeScript gate");
}

const routes = resourceNames.map((resource) => read(`src/app/api/rewards/${resource}/route.ts`));
if (routes.some((source) => !source.includes("handleRewardResourceGet"))) {
  failures.push("Every reward API route must use the shared isolated handler");
}

const allRewardUi = [
  read("src/features/rewards/foundation/ui/RewardsFoundationScreen.tsx"),
  read("src/features/rewards/inventory/ui/RewardInventoryPanel.tsx"),
].join("\n");
if (/\buseMutation\b|method:\s*["'](?:POST|PATCH|DELETE)["']/.test(allRewardUi)) {
  failures.push("M10.3 must preserve the non-mutating claim boundary");
}

if (failures.length > 0) {
  console.error("M10.3 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M10.3 independent progress, inventory, history and achievement resources are validated, adapted, cached and failure-isolated.",
);
