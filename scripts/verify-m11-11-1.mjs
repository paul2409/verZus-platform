// VERZUS M11.1 STRUCTURAL VERIFIER

import { readFileSync, existsSync } from "node:fs";

const requiredFiles = [
  "src/features/profiles/foundation/model/player-profile.types.ts",
  "src/features/profiles/foundation/mocks/player-profile.mock.ts",
  "src/features/profiles/foundation/ui/PlayerProfileFoundationScreen.tsx",
  "src/features/profiles/foundation/ui/PlayerProfileFoundationScreen.module.css",
  "src/features/profiles/foundation/ui/index.ts",
  "src/features/profiles/foundation/index.ts",
  "src/features/profiles/ui/ProfileScreen.tsx",
  "public/profiles/prismo-avatar.svg",
  "public/profiles/prismo-banner.svg",
  "docs/milestones/M11/m11-eight-stage-plan.md",
  "docs/milestones/M11/m11-11-1-player-profile-foundation.md",
  "docs/milestones/M11/m11-reference-approval.json",
  "tsconfig.m11-11-1.json",
];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    throw new Error(`M11.1 missing required file: ${file}`);
  }
}

const screen = readFileSync(
  "src/features/profiles/foundation/ui/PlayerProfileFoundationScreen.tsx",
  "utf8",
);
const types = readFileSync(
  "src/features/profiles/foundation/model/player-profile.types.ts",
  "utf8",
);
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

const requiredScreenMarkers = [
  'data-m11-stage="11.1"',
  'data-profile-scope="own"',
  'data-reference-viewport="390"',
  "Player statistics",
  "Game identities",
  "Recent matches",
  "Achievements",
  "Availability",
];

for (const marker of requiredScreenMarkers) {
  if (!screen.includes(marker)) {
    throw new Error(`M11.1 screen marker missing: ${marker}`);
  }
}

const requiredTypeMarkers = [
  "PlayerProfileIdentity",
  "PlayerProfileStats",
  "PlayerGameIdentity",
  "PlayerRecentMatch",
  "PlayerAchievementPreview",
  "PlayerProfileViewModel",
];

for (const marker of requiredTypeMarkers) {
  if (!types.includes(marker)) {
    throw new Error(`M11.1 type marker missing: ${marker}`);
  }
}

for (const script of ["m11:preview", "typecheck:m11:11.1", "verify:m11:11.1"]) {
  if (!packageJson.scripts?.[script]) {
    throw new Error(`M11.1 package script missing: ${script}`);
  }
}

if (/fetch\(|useMutation|POST\s+\/api\/profile|PUT\s+\/api\/profile/.test(screen)) {
  throw new Error("M11.1 must remain a read-only profile foundation.");
}

console.log(
  "M11.1 own-player identity, statistics, Crew, game identities, recent form, achievements and mobile-first profile markers are installed.",
);
