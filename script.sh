#!/usr/bin/env bash
set -euo pipefail

echo "VERZUS - Fix BrandMark version label lint rule"
echo "No branch will be created or changed."
echo

FILE="src/components/layout/app-shell/BrandMark.tsx"
BACKUP_DIR=".verzus-backups/brandmark-version-label/$(date +%Y%m%d-%H%M%S)"

echo "KEEP"
echo "  - Existing visual system"
echo "  - Existing VERZUS wordmark"
echo "  - Existing BrandMark structure"
echo
echo "REUSE"
echo "  - Existing version label span"
echo
echo "REPLACE"
echo "  - Literal // text with a JSX expression that builds the same visible label"
echo
echo "DELETE"
echo "  - Nothing"
echo
echo "CREATE"
echo "  - Timestamped rollback backup"
echo

if [[ ! -f "$FILE" ]]; then
  echo "Error: required file not found: $FILE"
  echo "Run this script from the VERZUS repository root."
  exit 1
fi

mkdir -p "$BACKUP_DIR/$(dirname "$FILE")"
cp "$FILE" "$BACKUP_DIR/$FILE"

node <<'NODE'
const fs = require("node:fs");

const file =
  "src/components/layout/app-shell/BrandMark.tsx";

let source = fs.readFileSync(file, "utf8");

const replacement =
  '<span aria-hidden="true">{"/" + "/ V.01"}</span>';

const patterns = [
  /<span\s+aria-hidden=["']true["']>\s*\{\s*["']\/\/ V\.01["']\s*\}\s*<\/span>/g,
  /<span\s+aria-hidden=["']true["']>\s*\/\/ V\.01\s*<\/span>/g,
  /<span\s+aria-hidden=["']true["']>\s*&#47;&#47;\s*V\.01\s*<\/span>/g,
  /<span\s+aria-hidden=["']true["']>\s*\{\s*["']\\u002F\\u002F V\.01["']\s*\}\s*<\/span>/g,
];

let changed = false;

for (const pattern of patterns) {
  if (pattern.test(source)) {
    source = source.replace(pattern, replacement);
    changed = true;
  }
}

if (!changed && !source.includes(replacement)) {
  const broadPattern =
    /<span\s+aria-hidden=["']true["'][^>]*>[\s\S]*?V\.01[\s\S]*?<\/span>/;

  if (broadPattern.test(source)) {
    source = source.replace(broadPattern, replacement);
    changed = true;
  }
}

if (!changed && !source.includes(replacement)) {
  throw new Error(
    "Could not locate the V.01 version label in BrandMark.tsx.",
  );
}

fs.writeFileSync(file, source, "utf8");

const finalSource = fs.readFileSync(file, "utf8");

if (!finalSource.includes(replacement)) {
  throw new Error(
    "BrandMark version-label repair validation failed.",
  );
}

console.log(
  'BrandMark version label now renders as: "/" + "/ V.01".',
);
NODE

echo
echo "Formatting BrandMark..."
npx prettier "$FILE" --write

echo
echo "Running focused ESLint..."
npx eslint "$FILE" --max-warnings=0

echo
echo "BrandMark version-label lint repair completed successfully."
echo "Rollback backup:"
echo "  $BACKUP_DIR"
