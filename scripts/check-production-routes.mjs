import { readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const appRoot = path.join(root, "src/app");
const pageNames = new Set(["page.js", "page.jsx", "page.ts", "page.tsx"]);

const allowedRoutes = new Set([
  "/",
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/session-expired",
  "/onboarding",
  "/onboarding/identity",
  "/onboarding/games",
  "/onboarding/location",
  "/onboarding/availability",
  "/onboarding/crew",
  "/onboarding/complete",
  "/play",
  "/compete",
  "/compete/[competitionId]",
  "/matches",
  "/matches/[matchId]",
  "/leaderboards",
  "/leaderboards/weekly",
  "/crews",
  "/crews/create",
  "/crews/[crewId]",
  "/rewards",
  "/profile",
  "/profile/edit",
  "/profile/matches",
  "/profile/achievements",
  "/profile/settings",
  "/players/[playerId]",
  "/notifications",
  "/notifications/settings",
  "/search",
  "/activity",
  "/settings",
]);

const forbiddenRouteToken = /(?:^|[-_/])(preview|review|reference|audit|storybook|fixture|mock|test)(?:$|[-_/])/i;

async function collectPages(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === "ENOENT") return [];
    throw error;
  }

  const pages = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) pages.push(...(await collectPages(absolute)));
    else if (pageNames.has(entry.name)) pages.push(absolute);
  }
  return pages;
}

function pageToRoute(pageFile) {
  const relativeDirectory = path.relative(appRoot, path.dirname(pageFile));
  if (!relativeDirectory) return "/";

  const segments = relativeDirectory
    .split(path.sep)
    .filter(Boolean)
    .filter((segment) => !(segment.startsWith("(") && segment.endsWith(")")))
    .filter((segment) => !segment.startsWith("@"));

  return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}

function projectPath(absolute) {
  return path.relative(root, absolute).split(path.sep).join("/");
}

const violations = [];
const pages = await collectPages(appRoot);
const discovered = new Map();

for (const page of pages) {
  const route = pageToRoute(page);
  const sourcePath = projectPath(page);
  const owners = discovered.get(route) ?? [];
  owners.push(sourcePath);
  discovered.set(route, owners);

  if (forbiddenRouteToken.test(route)) {
    violations.push(`${sourcePath}: non-public route token in '${route}'`);
  }

  if (!allowedRoutes.has(route)) {
    violations.push(`${sourcePath}: route '${route}' is not in the production allowlist`);
  }
}

for (const [route, owners] of discovered.entries()) {
  if (owners.length > 1) {
    violations.push(`route '${route}' has multiple page owners: ${owners.join(", ")}`);
  }
}

const devApiPath = path.join(appRoot, "api", "dev");
try {
  const entries = await readdir(devApiPath);
  if (entries.length > 0) violations.push("src/app/api/dev: development APIs are forbidden in production");
} catch (error) {
  if (!error || error.code !== "ENOENT") throw error;
}

const uniqueViolations = [...new Set(violations)].sort();
if (uniqueViolations.length > 0) {
  console.error("Production route violations found:\n");
  for (const violation of uniqueViolations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log(`Production route allowlist passed for ${pages.length} page routes.`);
