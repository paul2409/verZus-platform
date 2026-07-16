import fs from "node:fs";

const checks = [
  ["src/app/layout.tsx", 'data-theme="retro-competitive"'],
  ["src/app/layout.tsx", 'import "@/styles/verzus-retro-system.css";'],
  ["src/styles/verzus-retro-system.css", "--vz-retro-green: #00ff87"],
  ["src/styles/verzus-retro-system.css", "--vz-retro-cyan: #00e5ff"],
  ["src/components/layout/app-shell/AppShell.module.css", "VERZUS STAGE 2 RETRO SHARED UI:BEGIN"],
  ["src/features/play/ui/PlayCommandCenter.tsx", "VERZUS STAGE 3 RETRO PLAY"],
  ["scripts/verify-stage-4-competitive.mjs", "Stage 4"],
  ["scripts/verify-stage-5-retro-platform.mjs", "Stage 5"],
];

const failures = [];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) {
    failures.push(`${file}: missing`);
    continue;
  }

  const source = fs.readFileSync(file, "utf8").toLowerCase();
  if (!source.includes(fragment.toLowerCase())) {
    failures.push(`${file}: missing ${fragment}`);
  }
}

const layout = fs.readFileSync("src/app/layout.tsx", "utf8");
for (const inactive of [
  "verzus-reference-lock.css",
  "verzus-esports-design-system.css",
  "verzus-font-reference.css",
  "verzus-visual-system.css",
]) {
  if (layout.includes(inactive)) {
    failures.push(`Inactive theme import remains active: ${inactive}`);
  }
}

if (failures.length > 0) {
  console.error(
    "Retro VERZUS UI verification failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"),
  );
  process.exit(1);
}

console.log("Retro VERZUS competitive UI markers: PASS");
