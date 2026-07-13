#!/usr/bin/env bash
set -euo pipefail

echo "VERZUS M4 visual-review direct Next.js spawn repair"
echo "No branch will be created or changed."
echo

TARGET="scripts/m4-visual-review.mjs"

if [[ ! -f "$TARGET" ]]; then
  echo "Error: required file not found: $TARGET"
  echo "Run this script from the VERZUS repository root."
  exit 1
fi

node <<'NODE'
const fs = require("node:fs");

const file = "scripts/m4-visual-review.mjs";
let source = fs.readFileSync(file, "utf8");

const serverAnchor =
  "Starting VERZUS development server";
const anchorIndex = source.indexOf(serverAnchor);

if (anchorIndex < 0) {
  throw new Error(
    "Could not find the development-server start section.",
  );
}

const spawnIndex = source.indexOf(
  "child = spawn(",
  anchorIndex,
);

if (spawnIndex < 0) {
  throw new Error(
    "Could not find child = spawn(...) after the server-start section.",
  );
}

const readyIndex = source.indexOf(
  "const ready = await waitForServer()",
  spawnIndex,
);

if (readyIndex < 0) {
  throw new Error(
    "Could not find the waitForServer() call after child = spawn(...).",
  );
}

const commandIndex = source.lastIndexOf(
  "const command",
  spawnIndex,
);

let replaceStart = spawnIndex;

if (
  commandIndex >= anchorIndex &&
  commandIndex < spawnIndex
) {
  replaceStart = commandIndex;
}

replaceStart =
  source.lastIndexOf("\n", replaceStart) + 1;

const replaceEnd =
  source.lastIndexOf("\n", readyIndex) + 1;

const replacement = `  const nextCli = path.join(
    root,
    "node_modules",
    "next",
    "dist",
    "bin",
    "next",
  );

  if (!fs.existsSync(nextCli)) {
    throw new Error(
      \`Next.js CLI was not found at \${nextCli}. Run npm install first.\`,
    );
  }

  child = spawn(
    process.execPath,
    [
      nextCli,
      "dev",
      "--hostname",
      host,
      "--port",
      String(port),
    ],
    {
      cwd: root,
      stdio: "inherit",
      windowsHide: false,
      env: {
        ...process.env,
        BROWSER: "none",
      },
    },
  );

`;

source =
  source.slice(0, replaceStart) +
  replacement +
  source.slice(replaceEnd);

fs.writeFileSync(file, source, "utf8");

const finalSource = fs.readFileSync(file, "utf8");

const requiredFragments = [
  'const nextCli = path.join(',
  '"node_modules",',
  '"next",',
  '"dist",',
  '"bin",',
  'process.execPath',
  'child = spawn(',
  'const ready = await waitForServer()',
];

for (const fragment of requiredFragments) {
  if (!finalSource.includes(fragment)) {
    throw new Error(
      `Repair validation failed: missing ${fragment}`,
    );
  }
}

if (finalSource.includes('"npm.cmd"')) {
  throw new Error(
    "The failing npm.cmd spawn path still exists.",
  );
}

console.log(
  "Replaced npm spawning with direct Next.js CLI execution.",
);
NODE

echo
echo "Formatting repaired visual-review script..."
npx prettier "$TARGET" --write

echo
echo "Checking JavaScript syntax..."
node --check "$TARGET"

echo
echo "Running TypeScript verification..."
npm run typecheck

echo
echo "Repair completed successfully."
echo
echo "Run:"
echo "npm run m4:visual-review"
