#!/usr/bin/env bash
set -euo pipefail

echo "VERZUS - Repair remaining visible preview-test regressions"
echo "No branch will be created or changed."
echo

BACKUP_ROOT=".verzus-backups/preview-test-regressions"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="${BACKUP_ROOT}/${STAMP}"
REPORT_DIR="reports"
FULL_REPORT="${REPORT_DIR}/m5-post-preview-repair-tests.txt"
SUMMARY_REPORT="${REPORT_DIR}/m5-remaining-test-failures.txt"

ROUTE_TEST="src/app/(platform)/route-boundaries-preview/page.test.tsx"
OVERLAY_TEST="src/app/(platform)/shell-overlays-preview/page.test.tsx"

FILES=(
  "$ROUTE_TEST"
  "$OVERLAY_TEST"
)

echo "KEEP"
echo "  - All production components"
echo "  - Existing route-boundary accessibility semantics"
echo "  - Existing shared Dialog close-button contract"
echo "  - M5 Play code and visual baselines"
echo
echo "REUSE"
echo "  - Testing Library role-based queries"
echo "  - Current Vitest suite"
echo
echo "REPLACE"
echo "  - Two stale preview-test expectations"
echo
echo "DELETE"
echo "  - Nothing"
echo
echo "CREATE"
echo "  - Timestamped rollback backup"
echo "  - Full and concise remaining-failure reports"
echo

for file in "${FILES[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "Error: required file not found: $file"
    echo "Run this script from the VERZUS repository root."
    exit 1
  fi
done

mkdir -p "$BACKUP_DIR" "$REPORT_DIR"

for file in "${FILES[@]}"; do
  mkdir -p "$BACKUP_DIR/$(dirname "$file")"
  cp "$file" "$BACKUP_DIR/$file"
done

node <<'NODE'
const fs = require("node:fs");

function patchFile(file, transform) {
  const source = fs.readFileSync(file, "utf8");
  const result = transform(source);

  if (result === source) {
    console.log(`${file}: already repaired or no matching stale expectation found.`);
  } else {
    fs.writeFileSync(file, result, "utf8");
    console.log(`${file}: repaired.`);
  }
}

patchFile(
  "src/app/(platform)/route-boundaries-preview/page.test.tsx",
  (source) => {
    let result = source;

    const replacements = [
      [
        'expect(screen.getByText("Loading Play")).toBeVisible();',
        `expect(
      screen.getByRole("heading", { name: "Loading Play" }),
    ).toBeVisible();`,
      ],
      [
        "expect(screen.getByText(/temporarily unavailable/i)).toBeVisible();",
        `expect(
      screen.getByRole("heading", {
        name: "Matches are temporarily unavailable",
      }),
    ).toBeVisible();`,
      ],
      [
        "expect(screen.getByText(/could not be located/i)).toBeVisible();",
        `expect(
      screen.getByRole("heading", {
        name: "Competition could not be located",
      }),
    ).toBeVisible();`,
      ],
      [
        "expect(screen.getByText(/needs a connection/i)).toBeVisible();",
        `expect(
      screen.getByRole("heading", {
        name: "This route needs a connection",
      }),
    ).toBeVisible();`,
      ],
    ];

    for (const [before, after] of replacements) {
      if (result.includes(before)) {
        result = result.replace(before, after);
      }
    }

    return result;
  },
);

patchFile(
  "src/app/(platform)/shell-overlays-preview/page.test.tsx",
  (source) =>
    source.replaceAll(
      'screen.getByRole("button", { name: "Close dialog" })',
      'screen.getByRole("button", { name: "Close" })',
    ),
);
NODE

echo
echo "Formatting repaired tests..."
npx prettier "${FILES[@]}" --write

echo
echo "Running focused ESLint..."
npx eslint "${FILES[@]}" --max-warnings=0

echo
echo "Running the two affected preview test files..."
npx vitest run \
  "$ROUTE_TEST" \
  "$OVERLAY_TEST"

echo
echo "Running the complete test suite..."
set +e
npm run test 2>&1 | tee "$FULL_REPORT"
TEST_STATUS=${PIPESTATUS[0]}
set -e

{
  echo "VERZUS remaining test-failure summary"
  echo "Generated: $(date -Iseconds)"
  echo
  grep -E "^ FAIL |^ Test Files |^      Tests " "$FULL_REPORT" || true
} > "$SUMMARY_REPORT"

if [[ "$TEST_STATUS" -ne 0 ]]; then
  echo
  echo "The two visible preview regressions passed, but other failures remain."
  echo "Upload this concise file next:"
  echo "  $SUMMARY_REPORT"
  echo
  echo "Full report:"
  echo "  $FULL_REPORT"
  exit "$TEST_STATUS"
fi

echo
echo "All application tests passed."
echo "Rollback backup:"
echo "  $BACKUP_DIR"
echo "Full test report:"
echo "  $FULL_REPORT"
