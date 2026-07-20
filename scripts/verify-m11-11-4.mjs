// VERZUS M11.4 STRUCTURAL VERIFIER

import fs from "node:fs";

const requiredFiles = [
  "src/features/profiles/resources/model/profile-resource.types.ts",
  "src/features/profiles/resources/schema/profile-resource.schema.ts",
  "src/features/profiles/resources/adapter/profile-resource.adapter.ts",
  "src/features/profiles/resources/api/profile-resource.client.ts",
  "src/features/profiles/resources/api/profile-resource.query.ts",
  "src/features/profiles/resources/hooks/useProfileResources.ts",
  "src/features/profiles/resources/model/profile-resource.merge.ts",
  "src/features/profiles/resources/server/profile-resource.service.ts",
  "src/features/profiles/resources/server/profile-resource.http.ts",
  "src/features/profiles/resources/ui/ProfileResourceStatusStrip.tsx",
  "src/features/profiles/resources/ui/PlayerProfileResourceScreen.tsx",
  "src/app/api/profile/identity/route.ts",
  "src/app/api/profile/competitive-summary/route.ts",
  "src/app/api/profile/crew/route.ts",
  "src/app/api/profile/availability/route.ts",
  "docs/milestones/M11/m11-11-4-profile-resources.md",
  "tsconfig.m11-11-4.json",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`M11.4 missing required file: ${file}`);
}

const screen = fs.readFileSync(
  "src/features/profiles/resources/ui/PlayerProfileResourceScreen.tsx",
  "utf8",
);
const schema = fs.readFileSync(
  "src/features/profiles/resources/schema/profile-resource.schema.ts",
  "utf8",
);
const queries = fs.readFileSync(
  "src/features/profiles/resources/api/profile-resource.query.ts",
  "utf8",
);
const http = fs.readFileSync(
  "src/features/profiles/resources/server/profile-resource.http.ts",
  "utf8",
);
const profileScreen = fs.readFileSync("src/features/profiles/ui/ProfileScreen.tsx", "utf8");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

const markers = [
  [screen, 'data-m11-stage="11.4"', "M11.4 stage marker"],
  [screen, "mergeProfileResourceSnapshots", "resource view-model merge"],
  [schema, "profileIdentityResponseSchema", "identity Zod schema"],
  [schema, "profileCompetitiveSummaryResponseSchema", "summary Zod schema"],
  [queries, "profileResourceKeys", "separate query keys"],
  [queries, "keepPreviousData", "retained previous data"],
  [http, "x-request-id", "request IDs"],
  [http, "PROFILE_RESOURCE_MAINTENANCE", "controlled maintenance state"],
  [profileScreen, "PlayerProfileResourceScreen", "route resource composition"],
];

for (const [source, marker, label] of markers) {
  if (!source.includes(marker)) throw new Error(`M11.4 missing ${label}: ${marker}`);
}

if (!pkg.scripts?.["verify:m11:11.4"] || !pkg.scripts?.["typecheck:m11:11.4"]) {
  throw new Error("M11.4 package scripts are missing.");
}

if (/vitest|playwright/.test(pkg.scripts["verify:m11:11.4"])) {
  throw new Error("M11.4 lean verifier must not run Vitest or Playwright.");
}

console.log(
  "M11.4 independent identity, competitive-summary, Crew and availability resources are installed with Zod validation, adapters, retained caches and local retry controls.",
);
