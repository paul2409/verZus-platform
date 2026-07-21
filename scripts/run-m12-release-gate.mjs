// VERZUS M12.8 FULL RELEASE GATE

import { spawnSync } from "node:child_process";
import fs from "node:fs";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const scripts = packageJson.scripts ?? {};
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function run(scriptName) {
  if (!scripts[scriptName]) {
    throw new Error(`Required package script is missing: ${scriptName}`);
  }
  console.log(`\n[M12 release gate] npm run ${scriptName}`);
  const result = spawnSync(npmCommand, ["run", scriptName], { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

for (const required of ["verify:m12:12.8", "lint", "typecheck", "test", "build"]) {
  run(required);
}

for (const optional of ["test:e2e", "test:a11y", "test:visual"]) {
  if (scripts[optional]) run(optional);
}

run("package:m12:release");
run("verify:m12:artifact");
console.log("\nM12 full release gate passed.");
