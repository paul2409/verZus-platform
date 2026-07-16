import fs from "node:fs";
import path from "node:path";

const failures = [];
const passes = [];

function pass(message) {
  passes.push(message);
}

function fail(message) {
  failures.push(message);
}

const layout = fs.readFileSync("src/app/layout.tsx", "utf8");
if (layout.includes('data-theme="retro-competitive"')) {
  pass("Stage 1 theme attribute remains active.");
} else {
  fail("Stage 1 theme attribute is missing.");
}

if (layout.includes("@/styles/verzus-retro-system.css")) {
  pass("Retro stylesheet remains globally imported.");
} else {
  fail("Retro stylesheet is not globally imported.");
}

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
  "src/components/primitives/textarea/Textarea.module.css",
  "src/components/primitives/checkbox/Checkbox.module.css",
  "src/components/primitives/radio/Radio.module.css",
  "src/components/primitives/switch/Switch.module.css",
  "src/components/primitives/intel-card/IntelCard.module.css",
  "src/components/primitives/overlay/Overlay.module.css",
  "src/components/primitives/feedback/Feedback.module.css",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    fail(`Required Stage 2 file is missing: ${file}`);
    continue;
  }
  const source = fs.readFileSync(file, "utf8");
  if (source.includes("VERZUS STAGE 2 RETRO SHARED UI:BEGIN")) {
    pass(`Stage 2 marker exists: ${file}`);
  } else {
    fail(`Stage 2 marker is missing: ${file}`);
  }
}

const brand = fs.readFileSync("src/components/layout/app-shell/BrandMark.tsx", "utf8");
if (brand.includes("styles.brandVersion") && brand.includes('"/" + "/ V.01"')) {
  pass("VERZUS wordmark includes the accessible V.01 label.");
} else {
  fail("VERZUS wordmark version label is missing or unsafe.");
}

const navigation = fs.readFileSync("src/components/layout/app-shell/shell-navigation.ts", "utf8");
for (const label of ["Play", "Crew", "Watch", "Rewards", "Profile"]) {
  if (navigation.includes(`shortLabel: "${label}"`)) {
    pass(`Mobile navigation label exists: ${label}`);
  } else {
    fail(`Mobile navigation label is missing: ${label}`);
  }
}

const roots = [
  "src/components/layout/app-shell",
  "src/components/layout/route-boundary",
  "src/components/layout/widget-boundary",
  "src/components/layout/operational-screen",
  "src/components/layout/system-state",
  "src/components/primitives",
  "src/components/navigation",
  "src/components/feedback",
];

function walk(root) {
  if (!fs.existsSync(root)) return [];
  const out = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith(".css")) out.push(full);
  }
  return out;
}

let hexCount = 0;
let radiusCount = 0;
for (const file of roots.flatMap(walk)) {
  const source = fs.readFileSync(file, "utf8");
  hexCount += (source.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).length;
  radiusCount += [...source.matchAll(/border-radius\s*:\s*([^;]+);/g)].filter(
    (match) => match[1].trim() !== "0",
  ).length;
}

if (hexCount === 0) {
  pass("Stage 2 CSS contains no hardcoded hex colours.");
} else {
  fail(`Stage 2 CSS still contains ${hexCount} hardcoded hex colour(s).`);
}

if (radiusCount === 0) {
  pass("Stage 2 CSS contains no nonzero border radii.");
} else {
  fail(`Stage 2 CSS still contains ${radiusCount} nonzero border-radius declaration(s).`);
}

const appShellCss = fs.readFileSync("src/components/layout/app-shell/AppShell.module.css", "utf8");
if (/\.shell::before,[\s\S]*?\.shell::after[\s\S]*?display:\s*none/.test(appShellCss)) {
  pass("Duplicate shell atmosphere layers are disabled.");
} else {
  fail("Duplicate shell atmosphere layers are not disabled.");
}

for (const message of passes) console.log(`PASS: ${message}`);

if (failures.length > 0) {
  console.error("\nStage 2 retro shared-UI verification failed:");
  for (const message of failures) console.error(`FAIL: ${message}`);
  process.exit(1);
}

console.log("\nStage 2 retro shell and shared component verification passed.");
