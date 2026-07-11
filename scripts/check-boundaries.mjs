import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const srcRoot = path.join(root, "src");
const sourceExtensions = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx"]);
const importPattern =
  /(?:import|export)\s+(?:type\s+)?(?:[^"']*?\s+from\s+)?["']([^"']+)["']|import\(["']([^"']+)["']\)/g;

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(absolutePath)));
      continue;
    }

    if (sourceExtensions.has(path.extname(entry.name))) {
      files.push(absolutePath);
    }
  }

  return files;
}

function toProjectPath(absolutePath) {
  return path.relative(root, absolutePath).split(path.sep).join("/");
}

function resolveImport(importer, specifier) {
  if (specifier.startsWith("@/")) {
    return path.join(srcRoot, specifier.slice(2));
  }

  if (specifier.startsWith(".")) {
    return path.resolve(path.dirname(importer), specifier);
  }

  return null;
}

function featureName(filePath) {
  const relative = path.relative(srcRoot, filePath).split(path.sep);
  return relative[0] === "features" ? (relative[1] ?? null) : null;
}

function isInside(filePath, folder) {
  const relative = path.relative(folder, filePath);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function evaluate(importer, target) {
  const importerFeature = featureName(importer);
  const targetFeature = featureName(target);
  const componentsRoot = path.join(srcRoot, "components");
  const featuresRoot = path.join(srcRoot, "features");
  const libRoot = path.join(srcRoot, "lib");
  const appRoot = path.join(srcRoot, "app");

  if (
    isInside(importer, libRoot) &&
    (isInside(target, componentsRoot) ||
      isInside(target, featuresRoot) ||
      isInside(target, appRoot))
  ) {
    return "src/lib must not depend on UI, features, or routes";
  }

  if (
    isInside(importer, componentsRoot) &&
    (isInside(target, featuresRoot) || isInside(target, appRoot))
  ) {
    return "shared components must remain domain-neutral";
  }

  if (importerFeature && targetFeature && importerFeature !== targetFeature) {
    return `feature '${importerFeature}' must not import feature '${targetFeature}' directly`;
  }

  if (!isInside(importer, appRoot) && isInside(target, appRoot)) {
    return "only the application layer may own route imports";
  }

  return null;
}

const violations = [];
const files = await collectFiles(srcRoot);

for (const file of files) {
  const source = await readFile(file, "utf8");
  importPattern.lastIndex = 0;

  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1] ?? match[2];
    if (!specifier) continue;

    const target = resolveImport(file, specifier);
    if (!target) continue;

    const reason = evaluate(file, target);
    if (reason) {
      violations.push(`${toProjectPath(file)} -> ${specifier}: ${reason}`);
    }
  }
}

if (violations.length > 0) {
  console.error("Architecture boundary violations found:\n");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log(`Architecture boundaries passed for ${files.length} source files.`);
