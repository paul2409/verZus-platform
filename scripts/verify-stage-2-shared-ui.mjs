import fs from "node:fs";

const marker = "VERZUS STAGE 2 SHARED UI:BEGIN";

const requiredFiles = [
  "src/components/layout/app-shell/AppShell.module.css",
  "src/components/layout/app-shell/ShellOverlays.module.css",
  "src/components/layout/route-boundary/RouteBoundary.module.css",
  "src/components/layout/widget-boundary/WidgetBoundary.module.css",
  "src/components/primitives/button/Button.module.css",
  "src/components/primitives/badge/Badge.module.css",
  "src/components/primitives/card/Card.module.css",
  "src/components/primitives/panel/Panel.module.css",
  "src/components/primitives/avatar/Avatar.module.css",
  "src/components/primitives/bottom-navigation/BottomNavigation.module.css",
  "src/components/primitives/tabs/Tabs.module.css",
  "src/components/primitives/segmented-control/SegmentedControl.module.css",
  "src/components/primitives/input/Input.module.css",
  "src/components/primitives/select/Select.module.css",
  "src/components/primitives/checkbox/Checkbox.module.css",
  "src/components/primitives/radio/Radio.module.css",
  "src/components/primitives/switch/Switch.module.css",
  "src/components/primitives/textarea/Textarea.module.css",
  "src/components/primitives/overlay/Overlay.module.css",
  "src/components/primitives/feedback/Feedback.module.css",
  "src/components/primitives/intel-card/IntelCard.module.css",
];

const errors = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    errors.push(`Missing Stage 2 file: ${file}`);
    continue;
  }

  const source = fs.readFileSync(file, "utf8");

  if (!source.includes(marker)) {
    errors.push(`Missing Stage 2 marker: ${file}`);
  }
}

const layout = fs.readFileSync("src/app/layout.tsx", "utf8");
const brand = fs.readFileSync("src/components/layout/app-shell/BrandMark.tsx", "utf8");
const topBar = fs.readFileSync("src/components/layout/app-shell/TopBar.tsx", "utf8");
const navigation = fs.readFileSync("src/components/layout/app-shell/shell-navigation.ts", "utf8");

if (!layout.includes('import "@/styles/verzus-visual-system.css";')) {
  errors.push("Stage 1 canonical visual-system import is missing.");
}

if (!brand.includes('{"/" + "/ V.01"}')) {
  errors.push("BrandMark does not contain the lint-safe // V.01 label.");
}

if (!topBar.includes('aria-label="Open leaderboards"')) {
  errors.push("TopBar leaderboards shortcut is missing.");
}

for (const label of [
  'label: "Play"',
  'label: "Crew"',
  'label: "Watch"',
  'label: "Rewards"',
  'label: "Profile"',
]) {
  if (!navigation.includes(label)) {
    errors.push(`Mobile navigation label is missing: ${label}`);
  }
}

if (errors.length > 0) {
  console.error("Stage 2 shared-UI verification failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Stage 2 shared shell and primitive markers are installed.");
