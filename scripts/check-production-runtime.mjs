import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourceExtensions = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"]);
const bannedScenarioKeys = [
  "scenario",
  "resource",
  "widget",
  "widgetScenario",
  "accountScenario",
  "intelScenario",
  "viewer",
  "crash",
  "delay",
  "mock",
  "fixture",
  "failureMode",
];

async function collectFiles(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === "ENOENT") return [];
    throw error;
  }

  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(absolute)));
    else if (sourceExtensions.has(path.extname(entry.name))) files.push(absolute);
  }
  return files;
}

function projectPath(absolute) {
  return path.relative(root, absolute).split(path.sep).join("/");
}

const violations = [];
const appFiles = await collectFiles(path.join(root, "src/app"));
const routeRuntimeFiles = appFiles.filter((file) => /(?:^|\/)(?:page|route)\.[cm]?[jt]sx?$/.test(projectPath(file)));

for (const file of routeRuntimeFiles) {
  const relative = projectPath(file);
  const source = await readFile(file, "utf8");
  for (const key of bannedScenarioKeys) {
    const quoted = new RegExp(`["']${key}["']`, "g");
    if (quoted.test(source)) {
      violations.push(`${relative}: public page/API references internal control '${key}'`);
    }
  }
}

const runtimeServerFiles = [
  ...(await collectFiles(path.join(root, "src/app/api"))),
  ...(await collectFiles(path.join(root, "src/features"))),
].filter((file) => {
  const relative = projectPath(file);
  return relative.includes("/server/") || relative.includes("src/app/api/");
});

for (const file of runtimeServerFiles) {
  const relative = projectPath(file);
  if (/\.(?:test|spec)\.[cm]?[jt]sx?$/.test(relative)) continue;
  const source = await readFile(file, "utf8");

  if (/\bglobalThis\b/.test(source)) {
    violations.push(`${relative}: globalThis must not own production domain state`);
  }

  const processStorePattern = /(?:store|commands?|sessions?|entries|claims?|notifications?|applications?|invites?)\w*\s*=\s*new\s+(?:Map|Set)\s*\(/i;
  if (processStorePattern.test(source)) {
    violations.push(`${relative}: process-local Map/Set persistence is forbidden`);
  }
}

const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const scripts = packageJson.scripts ?? {};
for (const scriptName of ["dev", "build", "start", "predev", "prebuild", "prestart", "postinstall"]) {
  const command = scripts[scriptName];
  if (typeof command === "string" && /(?:db:)?migrat(?:e|ion)|scripts\/db\/migrate/i.test(command)) {
    violations.push(`package.json scripts.${scriptName}: database migrations must not run during application startup/build`);
  }
}

const envCandidates = [
  ".env.example",
  ".env.production",
  ".env.production.local",
  ".env.staging",
  ".env.staging.local",
];
for (const candidate of envCandidates) {
  try {
    const source = await readFile(path.join(root, candidate), "utf8");
    if (/^NEXT_PUBLIC_ENABLE_MOCKS\s*=\s*["']?true["']?\s*$/im.test(source)) {
      violations.push(`${candidate}: NEXT_PUBLIC_ENABLE_MOCKS must be false`);
    }
  } catch (error) {
    if (!error || error.code !== "ENOENT") throw error;
  }
}

const workflowRoot = path.join(root, ".github/workflows");
let workflowEntries = [];
try {
  workflowEntries = await readdir(workflowRoot, { withFileTypes: true });
} catch (error) {
  if (!error || error.code !== "ENOENT") throw error;
}
for (const entry of workflowEntries) {
  if (!entry.isFile() || !/\.ya?ml$/i.test(entry.name)) continue;
  const file = path.join(workflowRoot, entry.name);
  const source = await readFile(file, "utf8");
  if (/NEXT_PUBLIC_ENABLE_MOCKS\s*:\s*["']?true["']?/i.test(source) && /npm\s+run\s+build/i.test(source)) {
    violations.push(`.github/workflows/${entry.name}: production build enables runtime mocks`);
  }
}

const uniqueViolations = [...new Set(violations)].sort();
if (uniqueViolations.length > 0) {
  console.error("Production runtime violations found:\n");
  for (const violation of uniqueViolations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log(
  `Production runtime guard passed for ${routeRuntimeFiles.length} route files and ${runtimeServerFiles.length} server files.`,
);
