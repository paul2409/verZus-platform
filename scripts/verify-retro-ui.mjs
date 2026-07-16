import fs from "node:fs";

const checks = [
  ["src/app/layout.tsx", 'import "@/styles/verzus-visual-system.css";'],
  ["src/styles/tokens.css", "--vz-color-accent-green: #00ff87"],
  ["src/styles/tokens.css", "--vz-color-accent-cyan: #00e5ff"],
  ["src/components/layout/app-shell/AppShell.module.css", "VERZUS STAGE 2 SHELL:BEGIN"],
  ["src/features/play/ui/play-command-center.module.css", "VERZUS STAGE 3 PLAY:BEGIN"],
  ["scripts/verify-stage-4-competitive.mjs", "Stage 4"],
  ["scripts/verify-stage-5-platform.mjs", "Stage 5"],
];

const failures = [];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) {
    failures.push(`${file}: missing`);
    continue;
  }

  const source = fs.readFileSync(file, "utf8");
  if (!source.includes(fragment)) {
    failures.push(`${file}: missing ${fragment}`);
  }
}

if (failures.length > 0) {
  console.error("Canonical VERZUS UI verification failed:\n" + failures.join("\n"));
  process.exit(1);
}

console.log("Canonical VERZUS competitive UI markers: PASS");
