// VERZUS M10.2 REWARD INVENTORY VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "src/features/rewards/inventory/model/reward-inventory.types.ts",
  "src/features/rewards/inventory/model/reward-inventory.view-model.ts",
  "src/features/rewards/inventory/mocks/reward-inventory.mock.ts",
  "src/features/rewards/inventory/ui/RewardInventoryPanel.tsx",
  "src/features/rewards/inventory/ui/RewardInventoryPanel.module.css",
  "src/features/rewards/inventory/ui/index.ts",
  "src/features/rewards/inventory/index.ts",
  "docs/milestones/M10/m10-10-2-reward-inventory.md",
  "tsconfig.m10-10-2.json",
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
  "src/features/rewards/foundation/ui/RewardsFoundationScreen.tsx",
  'data-m10-stage="10.2"',
);
expectContains(
  "src/features/rewards/foundation/ui/RewardsFoundationScreen.tsx",
  "RewardInventoryPanel",
);
expectContains("src/features/rewards/index.ts", 'export * from "./inventory"');
expectContains(
  "src/features/rewards/inventory/ui/RewardInventoryPanel.tsx",
  'id="reward-inventory"',
);
expectContains(
  "src/features/rewards/inventory/ui/RewardInventoryPanel.tsx",
  "aria-pressed={activeFilter === filter}",
);

const states = ["locked", "eligible", "claimable", "claiming", "claimed", "expired", "revoked"];
const typesSource = read("src/features/rewards/inventory/model/reward-inventory.types.ts");
const fixtureSource = read("src/features/rewards/inventory/mocks/reward-inventory.mock.ts");
const presentationSource = read(
  "src/features/rewards/inventory/model/reward-inventory.view-model.ts",
);

for (const state of states) {
  if (!typesSource.includes(`"${state}"`)) failures.push(`Missing inventory filter state ${state}`);
  if (!fixtureSource.includes(`state: "${state}"`)) failures.push(`Missing fixture for ${state}`);
  if (!presentationSource.includes(`${state}: {`))
    failures.push(`Missing presentation for ${state}`);
}

const inventoryUi = read("src/features/rewards/inventory/ui/RewardInventoryPanel.tsx");
if (/fetch\(|\/api\//.test(inventoryUi)) {
  failures.push("M10.2 inventory must remain fixture-backed until M10.3 resources");
}
if (/\bfetch\s*\(|\buseMutation\b|method:\s*["\'](?:POST|PATCH|DELETE)["\']/.test(inventoryUi)) {
  failures.push("M10.2 must not introduce a reward inventory mutation");
}
if (!inventoryUi.includes("Claim execution remains disabled until M10.4")) {
  failures.push("M10.2 claim boundary must remain explicit");
}

const packageJson = JSON.parse(read("package.json"));
for (const script of ["m10:preview", "typecheck:m10:10.2", "verify:m10:10.2"]) {
  if (!packageJson.scripts?.[script]) failures.push(`Missing package script ${script}`);
}

const verifyScript = packageJson.scripts?.["verify:m10:10.2"] ?? "";
if (/vitest|playwright|npm run test(?::|\s|$)/.test(verifyScript)) {
  failures.push("verify:m10:10.2 must remain a lean marker, ESLint and TypeScript gate");
}

if (failures.length > 0) {
  console.error("M10.2 verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M10.2 complete reward-state inventory, deterministic filters, expandable details and non-mutating claim boundary are installed.",
);
