#!/usr/bin/env bash
set -euo pipefail

echo "VERZUS M4 responsive reference exact-optional-property repair"
echo "No branch will be created or changed."
echo

TARGET="src/app/(preview)/m4-onboarding-responsive-references/page.tsx"

if [[ ! -f "$TARGET" ]]; then
  echo "Error: required file not found: $TARGET"
  echo "Run this script from the VERZUS repository root."
  exit 1
fi

node <<'NODE'
const fs = require("node:fs");

const file =
  "src/app/(preview)/m4-onboarding-responsive-references/page.tsx";

let source = fs.readFileSync(file, "utf8");

const oldType = `  className?: string;`;
const newType = `  className?: string | undefined;`;

if (source.includes(newType)) {
  console.log(
    "PanelProps.className already accepts explicit undefined.",
  );
} else if (source.includes(oldType)) {
  source = source.replace(oldType, newType);
  fs.writeFileSync(file, source, "utf8");

  console.log(
    "Updated PanelProps.className for exactOptionalPropertyTypes.",
  );
} else {
  throw new Error(
    "Could not find PanelProps.className in the responsive reference page.",
  );
}

const finalSource = fs.readFileSync(file, "utf8");

if (!finalSource.includes(newType)) {
  throw new Error(
    "Repair validation failed: updated className type is missing.",
  );
}

console.log("Exact optional property repair validated.");
NODE

echo
echo "Formatting repaired page..."
npx prettier "$TARGET" --write

echo
echo "Running focused lint..."
npx eslint "$TARGET" --max-warnings=0

echo
echo "Removing stale generated development types..."
rm -rf .next/dev/types

echo
echo "Running TypeScript verification..."
npm run typecheck

echo
echo "Running production build..."
npm run build

echo
echo "Repair completed successfully."
echo
echo "Start the reference board with:"
echo "npm run m4:onboarding-responsive-references"
echo
echo "Open:"
echo "http://localhost:3107/m4-onboarding-responsive-references"
