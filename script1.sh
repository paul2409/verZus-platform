#!/usr/bin/env bash
set -euo pipefail

INSTALLER="./script.sh"
TEST_FILE="tests/e2e/m3-shell-navigation.spec.ts"

echo "VERZUS M3 Step 3.8 - Mobile active-route assertion repair"
echo "No branch will be created or changed."

for file in "$INSTALLER" "$TEST_FILE"; do
  if [[ ! -f "$file" ]]; then
    echo "Error: required file not found: $file"
    echo "Run this script from the repository root beside script.sh."
    exit 1
  fi
done

node <<'NODE'
const fs = require("node:fs");

const testFile = "tests/e2e/m3-shell-navigation.spec.ts";
const installerFile = "./script.sh";

const oldAssertion = `    await expect(page).toHaveURL(/\\/compete$/);
    await expect(page.locator('[aria-current="page"]').first()).toBeVisible();`;

const newAssertion = `    await expect(page).toHaveURL(/\\/compete$/);

    const mobileNavigation = page.getByRole("navigation", {
      name: "Primary mobile navigation",
    });
    const activeMobileDestination = mobileNavigation.locator(
      '[aria-current="page"]',
    );

    await expect(activeMobileDestination).toBeVisible();
    await expect(activeMobileDestination).toHaveAttribute("href", "/compete");`;

function patch(file) {
  let source = fs.readFileSync(file, "utf8");

  if (source.includes(newAssertion)) {
    console.log(`${file}: already repaired.`);
    return;
  }

  if (!source.includes(oldAssertion)) {
    console.error(
      `${file}: could not find the original mobile active-route assertion.`,
    );
    process.exit(1);
  }

  source = source.replace(oldAssertion, newAssertion);
  fs.writeFileSync(file, source, "utf8");
  console.log(`${file}: repaired.`);
}

patch(testFile);
patch(installerFile);
NODE

echo
echo "Formatting the repaired E2E test..."
npx prettier "$TEST_FILE" --write

echo
echo "Checking installer shell syntax..."
bash -n "$INSTALLER"

echo
echo "Running the previously failing navigation suite..."
npm run test:m3:navigation

echo
echo "Navigation suite passed."
echo "Running the complete M3 verification gate..."
npm run verify:m3

echo
echo "M3 Step 3.8 verification completed successfully."
echo "Approval centre: http://localhost:3000/m3-preview"
