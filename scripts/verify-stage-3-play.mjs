import fs from "node:fs";
import path from "node:path";

const uiDir = "src/features/play/ui";

const requiredFiles = [
  "PlayCommandCenter.tsx",
  "PlayerStatusStrip.tsx",
  "PlayHero.tsx",
  "PrimaryActionPanel.tsx",
  "NextMatchCard.tsx",
  "CheckInControl.tsx",
  "CurrentPositionWidget.tsx",
  "GameModeGrid.tsx",
  "GameModeCard.tsx",
  "StatusChip.tsx",
  "OpportunityRail.tsx",
  "CrewPulseWidget.tsx",
  "RecentActivityWidget.tsx",
  "WidgetFrame.tsx",
  "play-command-center.module.css",
  "game-mode-grid.module.css",
  "status-chip.module.css",
];

const errors = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(uiDir, file))) {
    errors.push(`Missing Stage 3 file: ${file}`);
  }
}

const commandCenter = fs.readFileSync(path.join(uiDir, "PlayCommandCenter.tsx"), "utf8");
const hero = fs.readFileSync(path.join(uiDir, "PlayHero.tsx"), "utf8");
const css = fs.readFileSync(path.join(uiDir, "play-command-center.module.css"), "utf8");

const requiredMarkers = [
  "VERZUS STAGE 3 PLAY COMMAND CENTER",
  "data-play-command-center",
  "<PlayHero",
  "<PrimaryActionPanel",
  "<GameModeGrid",
  "<CurrentPositionWidget",
  "<OpportunityRail",
  "<RecentActivityWidget",
  "<CrewPulseWidget",
];

for (const marker of requiredMarkers) {
  if (!commandCenter.includes(marker)) {
    errors.push(`Missing Play composition marker: ${marker}`);
  }
}

for (const marker of [
  "EVERY GAME",
  "IS A VERZUS",
  "VS POINTS",
  "QUEUE RANKED",
  "VIEW PLAYER CARD",
]) {
  if (!hero.includes(marker)) {
    errors.push(`Missing hero marker: ${marker}`);
  }
}

for (const marker of [
  ".playRoot",
  ".playHero",
  ".matchCard",
  ".checkInControl",
  ".positionLead",
  "@media (min-width: 64rem)",
]) {
  if (!css.includes(marker)) {
    errors.push(`Missing Play CSS marker: ${marker}`);
  }
}

if (commandCenter.includes("play-premium.module.css")) {
  errors.push("Temporary premium Play stylesheet is still imported.");
}

const componentFiles = fs.readdirSync(uiDir).filter((file) => file.endsWith(".tsx"));

for (const file of componentFiles) {
  const source = fs.readFileSync(path.join(uiDir, file), "utf8");
  const hexMatches = source.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
  if (hexMatches.length > 0) {
    errors.push(`${file} hardcodes colour values: ${hexMatches.join(", ")}`);
  }
}

if (errors.length > 0) {
  console.error("Stage 3 Play verification failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  "Stage 3 Play composition, responsive markers, and token-only component colours are installed.",
);
