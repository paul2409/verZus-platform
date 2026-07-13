#!/usr/bin/env bash
set -euo pipefail

CONFIG="playwright.visual.config.ts"
STEP19="./script.sh"

echo "VERZUS - bypass Playwright workers typing and continue Step 19"
echo "No branch will be created or changed."

if [[ ! -f "$CONFIG" ]]; then
  echo "Error: $CONFIG was not found."
  echo "Run this script from the repository root."
  exit 1
fi

node <<'NODE'
const fs = require("node:fs");

const file = "playwright.visual.config.ts";
let source = fs.readFileSync(file, "utf8");

const patterns = [
  {
    regex: /^([ \t]*)workers\s*:\s*process\.env\.CI\s*\?\s*1\s*:\s*undefined\s*,?\s*$/m,
    replacement: (_, indent) => `${indent}...(process.env.CI ? { workers: 1 } : {}),`,
  },
  {
    regex: /^([ \t]*)workers\s*:\s*process\.env\.CI\s*\?\s*2\s*:\s*undefined\s*,?\s*$/m,
    replacement: (_, indent) => `${indent}...(process.env.CI ? { workers: 2 } : {}),`,
  },
  {
    regex: /^([ \t]*)workers\s*:\s*[^,\n]*\bundefined\b[^,\n]*,?\s*$/m,
    replacement: (_, indent) => `${indent}// workers omitted locally; Playwright uses its default`,
  },
];

let changed = false;

for (const { regex, replacement } of patterns) {
  if (regex.test(source)) {
    source = source.replace(regex, replacement);
    changed = true;
    break;
  }
}

if (!changed) {
  if (/workers\s*:/.test(source)) {
    console.error(
      "A workers property exists, but its format was not recognized. Open playwright.visual.config.ts and remove the workers line manually.",
    );
    process.exit(1);
  }

  console.log("No workers property needed repair.");
  process.exit(0);
}

fs.writeFileSync(file, source, "utf8");
console.log("Playwright workers typing bypass applied.");
NODE

npx prettier "$CONFIG" --write

echo
echo "Re-running TypeScript..."
npm run typecheck

if [[ ! -f "$STEP19" ]]; then
  echo
  echo "TypeScript passed, but ./script.sh was not found."
  echo "Run the Step 19 script manually."
  exit 0
fi

echo
echo "Restarting Step 19..."
chmod +x "$STEP19"
bash "$STEP19"
