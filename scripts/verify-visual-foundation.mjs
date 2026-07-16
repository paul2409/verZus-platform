import fs from "node:fs";

const layout = fs.readFileSync("src/app/layout.tsx", "utf8");
const tokens = fs.readFileSync("src/styles/tokens.css", "utf8");
const fonts = fs.readFileSync("src/styles/fonts.css", "utf8");
const visual = fs.readFileSync("src/styles/verzus-visual-system.css", "utf8");

const canonical = 'import "@/styles/verzus-visual-system.css";';
const obsolete = [
  "@/styles/verzus-retro-system.css",
  "@/styles/verzus-reference-lock.css",
  "@/styles/verzus-esports-design-system.css",
  "@/styles/verzus-font-reference.css",
];

const failures = [];
const canonicalCount = layout.split(canonical).length - 1;

if (canonicalCount !== 1) {
  failures.push(`Expected one canonical visual import, found ${canonicalCount}.`);
}

for (const importPath of obsolete) {
  if (layout.includes(importPath)) {
    failures.push(`Competing theme import remains: ${importPath}`);
  }
}

const tokenMarkers = [
  "VERZUS STAGE 1 FOUNDATION:BEGIN",
  "--vz-color-neutral-950: #080a0c;",
  "--vz-color-neutral-900: #111519;",
  "--vz-color-neutral-850: #1a2026;",
  "--vz-color-green-500: #00ff87;",
  "--vz-color-cyan-500: #00e5ff;",
  "--vz-color-red-500: #ff3830;",
  "--vz-color-pink-500: #ff2d87;",
  "--vz-color-warning-400: #ffc400;",
  "--vz-color-text-primary: #f1f0ff;",
  "--vz-color-text-secondary: #8a87b8;",
  "--vz-color-focus-ring: var(--vz-color-cyan-500);",
];

for (const marker of tokenMarkers) {
  if (!tokens.includes(marker)) {
    failures.push(`Missing token marker: ${marker}`);
  }
}

if (!fonts.includes("VERZUS STAGE 1 FONT LOCK:BEGIN")) {
  failures.push("Stage 1 font lock is missing.");
}

if (!visual.includes('[data-verzus-action="primary"]')) {
  failures.push("Canonical action signal is missing.");
}

if (failures.length > 0) {
  console.error("Stage 1 visual-foundation verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Stage 1 visual foundation is installed and theme conflicts are removed.");
