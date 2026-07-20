// VERZUS M11.2 STRUCTURAL VERIFIER

import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "src/features/profiles/public-profile/model/public-player-profile.types.ts",
  "src/features/profiles/public-profile/mocks/public-player-profile.mock.ts",
  "src/features/profiles/public-profile/server/public-profile-policy.ts",
  "src/features/profiles/public-profile/ui/PlayerPublicProfileScreen.tsx",
  "src/features/profiles/public-profile/ui/PlayerPublicProfileScreen.module.css",
  "src/features/profiles/public-profile/ui/index.ts",
  "src/features/profiles/public-profile/index.ts",
  "src/app/(platform)/players/[playerId]/page.tsx",
  "src/app/(platform)/players/[playerId]/loading.tsx",
  "src/app/(platform)/players/[playerId]/error.tsx",
  "src/app/(platform)/players/[playerId]/not-found.tsx",
  "docs/milestones/M11/m11-11-2-public-profile-permissions.md",
  "tsconfig.m11-11-2.json",
];

for (const file of requiredFiles) {
  if (!existsSync(file)) throw new Error(`M11.2 missing required file: ${file}`);
}

const types = readFileSync(
  "src/features/profiles/public-profile/model/public-player-profile.types.ts",
  "utf8",
);
const policy = readFileSync(
  "src/features/profiles/public-profile/server/public-profile-policy.ts",
  "utf8",
);
const screen = readFileSync(
  "src/features/profiles/public-profile/ui/PlayerPublicProfileScreen.tsx",
  "utf8",
);
const route = readFileSync("src/app/(platform)/players/[playerId]/page.tsx", "utf8");
const ownScreen = readFileSync(
  "src/features/profiles/foundation/ui/PlayerProfileFoundationScreen.tsx",
  "utf8",
);
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

for (const marker of [
  "PublicProfileViewerMode",
  "PublicProfilePrivacyPolicy",
  "PublicProfilePermissions",
  "PublicPlayerProfileViewModel",
  "redactedFields",
]) {
  if (!types.includes(marker)) throw new Error(`M11.2 type marker missing: ${marker}`);
}

for (const marker of [
  "derivePermissions",
  "audienceAllows",
  "projectPublicPlayerProfile",
  'viewerMode === "blocked"',
  'record.identity.profileVisibility === "friends"',
]) {
  if (!policy.includes(marker)) throw new Error(`M11.2 policy marker missing: ${marker}`);
}

for (const marker of [
  'data-m11-stage="11.2"',
  'data-profile-scope="public"',
  "Permission-aware profile",
  "Competitive statistics",
  "Game identities",
  "Recent matches",
  "Privacy protections active",
]) {
  if (!screen.includes(marker)) throw new Error(`M11.2 screen marker missing: ${marker}`);
}

for (const marker of [
  "notFound()",
  "parsePublicProfileViewerMode",
  "projectPublicPlayerProfile",
  "PlayerPublicProfileScreen",
]) {
  if (!route.includes(marker)) throw new Error(`M11.2 route marker missing: ${marker}`);
}

if (!ownScreen.includes("VERZUS M11.2 PUBLIC VIEW LINK")) {
  throw new Error("M11.2 own-profile public-view link is missing.");
}

for (const script of ["m11:preview", "typecheck:m11:11.2", "verify:m11:11.2"]) {
  if (!packageJson.scripts?.[script]) throw new Error(`M11.2 package script missing: ${script}`);
}

const publicFiles = `${screen}\n${route}`;
if (
  /useMutation|method:\s*["'](?:POST|PUT|PATCH|DELETE)|fetch\([^)]*api\/profile\/me/.test(
    publicFiles,
  )
) {
  throw new Error("M11.2 public profile must remain read-only and non-authoritative.");
}

if (/privacy:\s*record\.privacy|record\.privacy\s*[},]/.test(screen)) {
  throw new Error("M11.2 UI must not receive the source privacy record.");
}

console.log(
  "M11.2 public-player route, server permission projection, field redaction, restricted states and owner/public separation are installed.",
);
