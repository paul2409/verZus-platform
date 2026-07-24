import { readFileSync } from "node:fs";

const playCss = readFileSync("src/features/play/ui/play-command-center.module.css", "utf8");
const actionCss = readFileSync("src/features/play/ui/action-centre-panel.module.css", "utf8");

const requiredPlayFragments = [
  "VERZUS PLAY INTERACTIONS START",
  "@media (hover: hover) and (pointer: fine)",
  ".sectionHeader:hover",
  ".widget:hover",
  ".quickActionList a:hover",
  ".playModeGrid a:hover",
  ".opportunityCards article:hover",
  ".activityFeed article:hover",
  ".crewSignalRows > div:hover",
  ":focus-visible",
  "prefers-reduced-motion: reduce",
];

const requiredActionFragments = [
  "VERZUS ACTION CENTRE INTERACTIONS START",
  ".panel:hover",
  ".actionRow:hover",
  ".actionRow:focus-visible",
  ".stateCard a:hover",
  "prefers-reduced-motion: reduce",
];

const missing = [
  ...requiredPlayFragments
    .filter((fragment) => !playCss.includes(fragment))
    .map((fragment) => `Play CSS: ${fragment}`),
  ...requiredActionFragments
    .filter((fragment) => !actionCss.includes(fragment))
    .map((fragment) => `Action Centre CSS: ${fragment}`),
];

if (missing.length > 0) {
  console.error("Play interaction contract failed. Missing:");
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

console.log("VERZUS Play interaction contract passed.");
