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
  "VERZUS STAGE 3 RETRO PLAY",
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

const cssFiles = [
  "play-command-center.module.css",
  "game-mode-grid.module.css",
  "status-chip.module.css",
];

for (const file of cssFiles) {
  const source = fs.readFileSync(path.join(uiDir, file), "utf8");
  const hexMatches = source.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];
  if (hexMatches.length > 0) {
    errors.push(`${file} hardcodes colour values: ${hexMatches.join(", ")}`);
  }

  for (const match of source.matchAll(/border-radius\s*:\s*([^;]+);/g)) {
    if (match[1].trim() !== "0") {
      errors.push(`${file} contains a nonzero border radius: ${match[1].trim()}`);
    }
  }

  for (const match of source.matchAll(/box-shadow\s*:\s*([^;]+);/g)) {
    const value = match[1].trim();
    if (value !== "none" && !value.includes("var(--vz-shadow-")) {
      errors.push(`${file} contains an unapproved raw shadow: ${value}`);
    }
  }

  if (/body::before|body::after|\.playRoot::before/.test(source)) {
    errors.push(`${file} duplicates the global grid or scanline atmosphere.`);
  }
}

for (const marker of [
  "var(--vz-retro-green)",
  "var(--vz-retro-cyan)",
  "var(--vz-retro-gold)",
  "var(--vz-retro-pink)",
  "var(--vz-retro-cut-sm)",
]) {
  if (!css.includes(marker)) {
    errors.push(`Missing approved retro CSS token usage: ${marker}`);
  }
}

if (errors.length > 0) {
  console.error("Stage 3 Retro Play verification failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  "Stage 3 Retro Play composition, responsive markers, and token-only component colours are installed.",
);
