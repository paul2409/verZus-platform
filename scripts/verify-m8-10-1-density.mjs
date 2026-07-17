// VERZUS M8.10.1 COMPACT DESKTOP DENSITY VERIFIER

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.module.css",
  "src/features/leaderboards/interactions/ui/LeaderboardInteractions.module.css",
  "src/features/leaderboards/interactions/ui/LeaderboardInteractiveIdentity.tsx",
  "tests/e2e/m8/m8-leaderboard-desktop-density.spec.ts",
  "docs/milestones/M8/m8-10-1-compact-desktop-density.md",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`Missing required file: ${file}`);
}

function expectContains(file, marker) {
  const location = path.join(root, file);
  if (!fs.existsSync(location)) return;
  const source = fs.readFileSync(location, "utf8");
  if (!source.includes(marker)) failures.push(`${file} is missing marker: ${marker}`);
}

const foundation = "src/features/leaderboards/foundation/ui/LeaderboardFoundationScreen.module.css";
expectContains(foundation, "VERZUS M8.10.1 COMPACT DESKTOP LEADERBOARD DENSITY START");
expectContains(foundation, "height: 2.75rem;");
expectContains(foundation, "height: 4.25rem;");
expectContains(foundation, "height: 4.5rem;");
expectContains(foundation, "height: 4.75rem;");
expectContains(foundation, "padding: 0.5rem 0.75rem;");
expectContains(foundation, "box-shadow: inset 0.1875rem 0 0 var(--vz-row-accent);");

const interactions = "src/features/leaderboards/interactions/ui/LeaderboardInteractions.module.css";
expectContains(interactions, "VERZUS M8.10.1 COMPACT INTERACTION TARGETS START");
expectContains(interactions, ".compactMeta");
expectContains(interactions, "min-height: 1.125rem;");
expectContains(interactions, "min-height: 1.75rem;");

const identity = "src/features/leaderboards/interactions/ui/LeaderboardInteractiveIdentity.tsx";
expectContains(identity, "VERZUS M8.10.1 COMPACT TWO-LINE IDENTITY");
expectContains(identity, "className={styles.compactMeta}");
expectContains(identity, "className={styles.metaDot}");

const packageFile = path.join(root, "package.json");
if (fs.existsSync(packageFile)) {
  const packageJson = JSON.parse(fs.readFileSync(packageFile, "utf8"));
  for (const script of ["verify:m8:10.1", "test:m8:10.1"]) {
    if (!packageJson.scripts?.[script]) failures.push(`Missing package script: ${script}`);
  }
}

if (failures.length > 0) {
  console.error("M8.10.1 desktop-density verification failures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  "M8.10.1 compact 44px header, 68/72/76px desktop rows, two-line identity and restrained color markers are installed.",
);
