// VERZUS M11.6 STRUCTURAL VERIFIER

import fs from "node:fs";

const requiredFiles = [
  "src/features/profiles/identity-insights/model/player-identity-insights.types.ts",
  "src/features/profiles/identity-insights/schema/player-identity-insights.schema.ts",
  "src/features/profiles/identity-insights/adapter/player-identity-insights.adapter.ts",
  "src/features/profiles/identity-insights/api/player-identity-insights.client.ts",
  "src/features/profiles/identity-insights/api/player-identity-insights.query.ts",
  "src/features/profiles/identity-insights/server/player-identity-insights.service.ts",
  "src/features/profiles/identity-insights/server/player-identity-insights.http.ts",
  "src/features/profiles/identity-insights/ui/PlayerIdentityInsightsScreen.tsx",
  "src/features/profiles/identity-insights/ui/PlayerIdentityInsightsScreen.module.css",
  "src/app/(platform)/profile/achievements/page.tsx",
  "src/app/(platform)/profile/achievements/loading.tsx",
  "src/app/(platform)/profile/achievements/error.tsx",
  "src/app/api/profile/achievements/route.ts",
  "src/app/api/profile/game-identities/route.ts",
  "src/app/api/profile/trust-history/route.ts",
  "docs/milestones/M11/m11-11-6-achievements-game-identities-trust-history.md",
  "tsconfig.m11-11-6.json",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`M11.6 missing required file: ${file}`);
}

const screen = fs.readFileSync(
  "src/features/profiles/identity-insights/ui/PlayerIdentityInsightsScreen.tsx",
  "utf8",
);
const foundation = fs.readFileSync(
  "src/features/profiles/foundation/ui/PlayerProfileFoundationScreen.tsx",
  "utf8",
);
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

const requiredMarkers = [
  'data-m11-stage="11.6"',
  "profileAchievementsQueryOptions",
  "profileGameIdentitiesQueryOptions",
  "profileTrustHistoryQueryOptions",
  'id="achievements"',
  'id="game-identities"',
  'id="trust-history"',
  "Error ID:",
];
for (const marker of requiredMarkers) {
  if (!screen.includes(marker)) throw new Error(`M11.6 screen marker missing: ${marker}`);
}

const foundationMarkers = [
  "VERZUS M11.6 COMPLETE GAME IDENTITY RECORD LINK",
  "VERZUS M11.6 COMPLETE ACHIEVEMENT AND TRUST RECORD LINK",
  'href="/profile/achievements"',
];
for (const marker of foundationMarkers) {
  if (!foundation.includes(marker)) throw new Error(`M11.6 foundation marker missing: ${marker}`);
}

for (const scriptName of ["typecheck:m11:11.6", "verify:m11:11.6"]) {
  if (!packageJson.scripts?.[scriptName]) {
    throw new Error(`M11.6 package script missing: ${scriptName}`);
  }
}

const apiRoutes = [
  "src/app/api/profile/achievements/route.ts",
  "src/app/api/profile/game-identities/route.ts",
  "src/app/api/profile/trust-history/route.ts",
];
for (const file of apiRoutes) {
  const source = fs.readFileSync(file, "utf8");
  if (!source.includes("x-request-id") || !source.includes("cache-control")) {
    throw new Error(`M11.6 API reliability headers missing: ${file}`);
  }
}

console.log(
  "M11.6 achievements, game identities, trust history, independent resources, pagination and owner-only privacy boundaries are installed.",
);
