import { rm } from "node:fs/promises";

const paths = [".next", "coverage", "playwright-report", "test-results", "artifacts"];

await Promise.all(paths.map((target) => rm(target, { force: true, recursive: true })));

console.log(`Removed generated paths: ${paths.join(", ")}`);
