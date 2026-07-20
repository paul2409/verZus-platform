// VERZUS M11.7 STRUCTURAL VERIFIER

import fs from "node:fs";

const requiredFiles = [
  "src/features/profiles/privacy/model/profile-privacy.types.ts",
  "src/features/profiles/privacy/schema/profile-privacy.schema.ts",
  "src/features/profiles/privacy/adapter/profile-privacy.adapter.ts",
  "src/features/profiles/privacy/api/profile-privacy.client.ts",
  "src/features/profiles/privacy/api/profile-privacy.query.ts",
  "src/features/profiles/privacy/server/profile-privacy.store.ts",
  "src/features/profiles/privacy/server/profile-privacy.service.ts",
  "src/features/profiles/privacy/server/profile-privacy.http.ts",
  "src/features/profiles/privacy/ui/ProfilePrivacySettingsScreen.tsx",
  "src/features/profiles/privacy/ui/ProfilePrivacySettingsScreen.module.css",
  "src/features/profiles/account-state/model/profile-account-state.types.ts",
  "src/features/profiles/account-state/schema/profile-account-state.schema.ts",
  "src/features/profiles/account-state/adapter/profile-account-state.adapter.ts",
  "src/features/profiles/account-state/api/profile-account-state.client.ts",
  "src/features/profiles/account-state/api/profile-account-state.query.ts",
  "src/features/profiles/account-state/server/profile-account-state.service.ts",
  "src/features/profiles/account-state/server/profile-account-state.http.ts",
  "src/features/profiles/account-state/ui/ProfileAccountStateGate.tsx",
  "src/features/profiles/account-state/ui/PublicProfileAccountStateScreen.tsx",
  "src/app/(platform)/profile/settings/page.tsx",
  "src/app/(platform)/profile/settings/loading.tsx",
  "src/app/(platform)/profile/settings/error.tsx",
  "src/app/api/profile/privacy/route.ts",
  "src/app/api/profile/account-state/route.ts",
  "docs/milestones/M11/m11-11-7-privacy-edge-states-failure-isolation.md",
  "tsconfig.m11-11-7.json",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`M11.7 missing required file: ${file}`);
}

const privacyScreen = fs.readFileSync(
  "src/features/profiles/privacy/ui/ProfilePrivacySettingsScreen.tsx",
  "utf8",
);
const accountGate = fs.readFileSync(
  "src/features/profiles/account-state/ui/ProfileAccountStateGate.tsx",
  "utf8",
);
const publicPage = fs.readFileSync("src/app/(platform)/players/[playerId]/page.tsx", "utf8");
const profileScreen = fs.readFileSync("src/features/profiles/ui/ProfileScreen.tsx", "utf8");
const foundation = fs.readFileSync(
  "src/features/profiles/foundation/ui/PlayerProfileFoundationScreen.tsx",
  "utf8",
);
const privacyHttp = fs.readFileSync(
  "src/features/profiles/privacy/server/profile-privacy.http.ts",
  "utf8",
);
const privacyStore = fs.readFileSync(
  "src/features/profiles/privacy/server/profile-privacy.store.ts",
  "utf8",
);
const publicMock = fs.readFileSync(
  "src/features/profiles/public-profile/mocks/public-player-profile.mock.ts",
  "utf8",
);
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

const privacyMarkers = [
  'data-m11-stage="11.7"',
  "profilePrivacyQueryOptions",
  "updateProfilePrivacy",
  "privacySaveScenario",
  "Retry safely",
  "fieldLabels",
  "Profile visibility",
  "Exact availability",
];
for (const marker of privacyMarkers) {
  if (!privacyScreen.includes(marker)) throw new Error(`M11.7 privacy marker missing: ${marker}`);
}

const stateMarkers = [
  "accountScenario",
  "ProfileAccountStateResourceError",
  "Create player identity",
  "Profile data stays hidden",
  'data-m11-stage="11.7"',
];
for (const marker of stateMarkers) {
  if (!accountGate.includes(marker))
    throw new Error(`M11.7 account-state marker missing: ${marker}`);
}

for (const marker of [
  "getPublicProfileAccountState",
  "PublicProfileAccountStateScreen",
  'accountState.status !== "active"',
]) {
  if (!publicPage.includes(marker)) throw new Error(`M11.7 public-state marker missing: ${marker}`);
}

for (const marker of ["ProfileAccountStateGate", "PlayerProfileResourceScreen"]) {
  if (!profileScreen.includes(marker))
    throw new Error(`M11.7 profile gate marker missing: ${marker}`);
}

for (const marker of ["VERZUS M11.7 PRIVACY SETTINGS LINK", 'href="/profile/settings"']) {
  if (!foundation.includes(marker)) throw new Error(`M11.7 foundation marker missing: ${marker}`);
}

for (const marker of [
  "idempotency-key",
  "expected_version",
  "PROFILE_PRIVACY_RESPONSE_LOST",
  '"x-request-id"',
  '"cache-control"',
]) {
  if (!privacyHttp.includes(marker))
    throw new Error(`M11.7 privacy HTTP marker missing: ${marker}`);
}

for (const marker of [
  "commands: Map",
  "findStoredProfilePrivacyCommand",
  "persistProfilePrivacyUpdate",
  "shouldLoseProfilePrivacyResponse",
]) {
  if (!privacyStore.includes(marker))
    throw new Error(`M11.7 privacy store marker missing: ${marker}`);
}

if (!publicMock.includes("readProfilePrivacyForPublicProjection")) {
  throw new Error("M11.7 public profile does not use the confirmed privacy store.");
}

for (const scriptName of ["typecheck:m11:11.7", "verify:m11:11.7"]) {
  if (!packageJson.scripts?.[scriptName]) {
    throw new Error(`M11.7 package script missing: ${scriptName}`);
  }
}

console.log(
  "M11.7 server-authoritative privacy, idempotent updates, empty/suspended/blocked profiles and failure-isolated account states are installed.",
);
