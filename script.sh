#!/usr/bin/env bash
set -euo pipefail

SEARCH_MODAL="src/components/layout/app-shell/ShellSearchModal.tsx"
HOOK_FILE=".husky/pre-commit"

echo "VERZUS M3 staged-copy repair"
echo "No branch will be created or changed."
echo

for file in "$SEARCH_MODAL" "$HOOK_FILE"; do
  if [[ ! -f "$file" ]]; then
    echo "Error: required file not found: $file"
    echo "Run this script from the repository root."
    exit 1
  fi
done

node <<'NODE'
const fs = require("node:fs");

const file = "src/components/layout/app-shell/ShellSearchModal.tsx";
let source = fs.readFileSync(file, "utf8");
const original = source;

source = source.replace(
  'import { useEffect, useState } from "react";',
  'import { useState } from "react";',
);

source = source.replace(
`  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  return (`,
`  const [query, setQuery] = useState("");

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setQuery("");
    }

    onOpenChange(nextOpen);
  };

  return (`,
);

source = source.replace(
  "onOpenChange={onOpenChange}",
  "onOpenChange={handleOpenChange}",
);

source = source.replaceAll(
  "onOpenChange(false)",
  "handleOpenChange(false)",
);

const valid =
  source.includes('import { useState } from "react";') &&
  source.includes("const handleOpenChange = (nextOpen: boolean)") &&
  !source.includes("useEffect(() =>");

if (!valid) {
  console.error("ShellSearchModal repair validation failed.");
  process.exit(1);
}

if (source !== original) {
  fs.writeFileSync(file, source, "utf8");
  console.log("Repaired ShellSearchModal working copy.");
} else {
  console.log("ShellSearchModal working copy is already repaired.");
}
NODE

node <<'NODE'
const fs = require("node:fs");

const file = ".husky/pre-commit";
let source = fs.readFileSync(file, "utf8");

if (!source.includes("--concurrent 1")) {
  const patterns = [
    /\bnpx\s+lint-staged\b/,
    /\bnpm\s+exec\s+lint-staged\b/,
    /\blint-staged\b/,
  ];

  let updated = source;

  for (const pattern of patterns) {
    if (pattern.test(updated)) {
      updated = updated.replace(pattern, (match) => `${match} --concurrent 1`);
      break;
    }
  }

  if (updated === source) {
    console.error("Could not find lint-staged in .husky/pre-commit.");
    process.exit(1);
  }

  fs.writeFileSync(file, updated, "utf8");
  console.log("Configured sequential lint-staged execution.");
} else {
  console.log("Sequential lint-staged execution is already configured.");
}
NODE

echo
echo "Formatting repaired files..."
npx prettier "$SEARCH_MODAL" --write

echo
echo "Running focused ESLint..."
npx eslint "$SEARCH_MODAL" --max-warnings=0

echo
echo "Running TypeScript verification..."
npm run typecheck

echo
echo "Staging the repaired copies before lint-staged..."
git add "$SEARCH_MODAL" "$HOOK_FILE"

echo
echo "Confirming the staged ShellSearchModal no longer contains useEffect..."
if git show ":$SEARCH_MODAL" | grep -q "useEffect"; then
  echo "Error: staged ShellSearchModal still contains useEffect."
  exit 1
fi

if ! git show ":$SEARCH_MODAL" | grep -q "handleOpenChange"; then
  echo "Error: staged ShellSearchModal does not contain handleOpenChange."
  exit 1
fi

echo "Staged copy is correct."

echo
echo "Checking staged whitespace..."
git diff --cached --check

echo
echo "Running lint-staged sequentially against the repaired staged copy..."
npx lint-staged --concurrent 1

echo
echo "All pre-commit checks passed."
echo
echo "Review:"
echo "  git status --short"
echo
echo "Commit:"
echo '  git commit -m "m3 complete"'
