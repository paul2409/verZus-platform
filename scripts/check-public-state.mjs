import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const productionRoots = [
  "src/app/(platform)",
  "src/components/layout/app-shell",
  "src/features/platform-runtime",
];

const ignored = [
  /\.test\.[cm]?[jt]sx?$/,
  /\.stories\.[cm]?[jt]sx?$/,
  /(^|\/)__tests__(\/|$)/,
  /(^|\/)fixtures(\/|$)/,
  /preview/i,
];

const forbiddenIdentityPatterns = [
  /\bJayflex\b/i,
  /\bPrismo\b/i,
  /\bMainland Titans\b/i,
  /\bXenon\b/i,
];

const forbiddenQueryPatterns = [
  /(?:get|has)\(["']scenario["']\)/,
  /(?:get|has)\(["']widgetScenario["']\)/,
  /(?:get|has)\(["']accountScenario["']\)/,
  /(?:get|has)\(["']intelScenario["']\)/,
];

async function filesUnder(relativeRoot) {
  const absoluteRoot = path.join(root, relativeRoot);
  const output = [];

  async function walk(directory) {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
        return;
      }
      throw error;
    }

    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      const relative = path.relative(root, absolute).replaceAll("\\", "/");
      if (ignored.some((pattern) => pattern.test(relative))) continue;
      if (entry.isDirectory()) await walk(absolute);
      else if (/\.[cm]?[jt]sx?$/.test(entry.name)) output.push({ absolute, relative });
    }
  }

  await walk(absoluteRoot);
  return output;
}

const files = (await Promise.all(productionRoots.map(filesUnder))).flat();
const violations = [];

for (const file of files) {
  const source = await readFile(file.absolute, "utf8");

  for (const pattern of forbiddenIdentityPatterns) {
    if (pattern.test(source)) {
      violations.push(`${file.relative}: fictional public identity matches ${pattern}`);
    }
  }

  for (const pattern of forbiddenQueryPatterns) {
    if (pattern.test(source)) {
      violations.push(`${file.relative}: internal scenario query control matches ${pattern}`);
    }
  }
}

const platformConfig = await readFile(
  path.join(root, "src/components/layout/app-shell/platform-shell.config.ts"),
  "utf8",
);
const platformShell = await readFile(
  path.join(root, "src/components/layout/app-shell/PlatformShell.tsx"),
  "utf8",
);

if (!platformConfig.includes('name: "Player"')) {
  violations.push("platform-shell.config.ts must use a neutral fallback identity.");
}

if (!platformShell.includes("notificationCount = 0")) {
  violations.push("PlatformShell must default the unread notification count to zero.");
}

if (violations.length > 0) {
  console.error("Public-state contract failed:\n");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log(`Public-state contract passed across ${files.length} production runtime files.`);
