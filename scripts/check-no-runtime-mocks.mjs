import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const sourceExtensions = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"]);
const runtimeRoots = ["src/app", "src/components", "src/features", "src/lib", "src/shared"];
const ignoredSegments = new Set(["__tests__", "test", "tests", "storybook"]);
const ignoredFilePattern = /(?:\.test|\.spec|\.stories)\.[cm]?[jt]sx?$/i;
const forbiddenPathSegment = /(^|\/)(?:mocks?|fixtures?|seeds?)(\/|$)/i;
const forbiddenRuntimeFilename = /(?:^|[-_.])(?:mock|fixture|seed)(?:[-_.]|$)/i;
const forbiddenImport = /(^|\/)(?:mocks?|fixtures?|seeds?)(\/|$)|(?:^|[-_.])(?:mock|fixture|seed)(?:[-_.\/]|$)/i;
const importPattern = /(?:import|export)\s+(?:type\s+)?(?:[^"']*?\s+from\s+)?["']([^"']+)["']|import\(["']([^"']+)["']\)/g;

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
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(absolute)));
    } else if (sourceExtensions.has(path.extname(entry.name))) {
      files.push(absolute);
    }
  }
  return files;
}

function projectPath(absolute) {
  return path.relative(root, absolute).split(path.sep).join("/");
}

function isIgnored(relativePath) {
  const segments = relativePath.split("/");
  return segments.some((segment) => ignoredSegments.has(segment)) || ignoredFilePattern.test(relativePath);
}

const violations = [];
const files = [];
for (const runtimeRoot of runtimeRoots) {
  files.push(...(await collectFiles(path.join(root, runtimeRoot))));
}

for (const file of files) {
  const relative = projectPath(file);
  if (isIgnored(relative)) continue;

  const relativeWithoutRoot = relative.replace(/^src\//, "");
  if (forbiddenPathSegment.test(relativeWithoutRoot) || forbiddenRuntimeFilename.test(path.basename(relative))) {
    violations.push(`${relative}: runtime source path is named as mock, fixture, or seed data`);
  }

  const source = await readFile(file, "utf8");
  importPattern.lastIndex = 0;
  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1] ?? match[2];
    if (specifier && forbiddenImport.test(specifier)) {
      violations.push(`${relative}: imports forbidden runtime test data '${specifier}'`);
    }
  }
}

const uniqueViolations = [...new Set(violations)].sort();
if (uniqueViolations.length > 0) {
  console.error("Runtime mock/fixture/seed violations found:\n");
  for (const violation of uniqueViolations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log(`No runtime mock, fixture, or seed dependencies found across ${files.length} source files.`);
