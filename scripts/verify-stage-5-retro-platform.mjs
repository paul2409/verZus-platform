import fs from "node:fs";

const requiredFiles = [
  "src/components/layout/operational-screen/OperationalScreen.tsx",
  "src/components/layout/system-state/SystemStateScreen.tsx",
  "src/features/profiles/ui/ProfileScreen.tsx",
  "src/features/notifications/ui/NotificationsScreen.tsx",
  "src/features/search/ui/SearchScreen.tsx",
  "src/features/settings/ui/SettingsScreen.tsx",
  "docs/design-system/stage-5-retro-platform-contract.md",
  "docs/design-system/stage-5-retro-audit.md",
  "reports/stage-5-retro/style-audit.txt",
  "docs/design-system/legacy-theme-retirement.md",
  "docs/runbooks/ui-rollback.md",
];

const checks = [
  ["src/app/(platform)/profile/page.tsx", "<ProfileScreen"],
  ["src/app/(platform)/notifications/page.tsx", "<NotificationsScreen"],
  ["src/app/(platform)/search/page.tsx", "<SearchScreen"],
  ["src/app/(platform)/settings/page.tsx", "<SettingsScreen"],
  ["src/features/auth/ui/AuthScreens.module.css", "VERZUS STAGE 5 AUTH:BEGIN"],
  ["src/features/auth/forms/AuthForms.module.css", "VERZUS STAGE 5 AUTH FORMS:BEGIN"],
  [
    "src/features/onboarding/ui/onboarding-experience.module.css",
    "VERZUS STAGE 5 ONBOARDING:BEGIN",
  ],
  [
    "src/components/layout/route-boundary/RouteBoundary.module.css",
    "VERZUS STAGE 5 ROUTE BOUNDARY:BEGIN",
  ],
  [
    "src/components/layout/widget-boundary/WidgetBoundary.module.css",
    "VERZUS STAGE 5 WIDGET BOUNDARY:BEGIN",
  ],
  ["src/app/global-error.tsx", "<SystemStateScreen"],
  ["src/app/token-preview/page.tsx", "RETRO TOKEN SYSTEM"],
  ["scripts/verify-retro-ui.mjs", "Retro VERZUS"],
  ["scripts/verify-reference-ui.mjs", "Reference-aligned"],
  ["reports/stage-5-retro/style-audit.txt", "Hardcoded hex values remaining: 0"],
  ["reports/stage-5-retro/style-audit.txt", "Nonzero border-radius declarations remaining: 0"],
];

const failures = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    failures.push(`${file}: missing`);
  }
}

for (const [file, marker] of checks) {
  if (!fs.existsSync(file)) {
    failures.push(`${file}: missing`);
    continue;
  }

  const source = fs.readFileSync(file, "utf8");
  if (!source.includes(marker)) {
    failures.push(`${file}: missing ${marker}`);
  }
}

const layout = fs.readFileSync("src/app/layout.tsx", "utf8");
if (!layout.includes('data-theme="retro-competitive"')) {
  failures.push("src/app/layout.tsx: retro theme attribute is missing");
}
if (!layout.includes("verzus-retro-system.css")) {
  failures.push("src/app/layout.tsx: active retro theme import is missing");
}
for (const inactive of [
  "verzus-reference-lock.css",
  "verzus-esports-design-system.css",
  "verzus-font-reference.css",
  "verzus-visual-system.css",
]) {
  if (layout.includes(inactive)) {
    failures.push(`src/app/layout.tsx: inactive theme import ${inactive}`);
  }
}

for (const page of [
  "src/app/(platform)/profile/page.tsx",
  "src/app/(platform)/notifications/page.tsx",
  "src/app/(platform)/search/page.tsx",
  "src/app/(platform)/settings/page.tsx",
]) {
  if (fs.readFileSync(page, "utf8").includes("PlatformRoutePlaceholder")) {
    failures.push(`${page}: still renders PlatformRoutePlaceholder`);
  }
}

if (failures.length > 0) {
  console.error("Stage 5 retro platform verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Stage 5 retro platform completion markers are installed.");
