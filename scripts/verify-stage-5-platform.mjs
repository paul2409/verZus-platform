import fs from "node:fs";

const requiredFiles = [
  "src/components/layout/operational-screen/OperationalScreen.tsx",
  "src/components/layout/system-state/SystemStateScreen.tsx",
  "src/features/profiles/ui/ProfileScreen.tsx",
  "src/features/notifications/ui/NotificationsScreen.tsx",
  "src/features/search/ui/SearchScreen.tsx",
  "src/features/settings/ui/SettingsScreen.tsx",
  "docs/design-system/stage-5-platform-contract.md",
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
  ["src/app/token-preview/page.tsx", "CANONICAL TOKEN SYSTEM"],
  ["scripts/verify-retro-ui.mjs", "Canonical VERZUS"],
  ["scripts/verify-reference-ui.mjs", "Reference-aligned"],
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
for (const obsolete of [
  "verzus-retro-system.css",
  "verzus-reference-lock.css",
  "verzus-esports-design-system.css",
  "verzus-font-reference.css",
]) {
  if (layout.includes(obsolete)) {
    failures.push(`src/app/layout.tsx: obsolete import ${obsolete}`);
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
  console.error("Stage 5 platform verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Stage 5 platform completion markers are installed.");
