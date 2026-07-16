import fs from "node:fs";

const checks = [
  ["src/app/layout.tsx", 'data-theme="retro-competitive"'],
  ["src/app/layout.tsx", 'import "@/styles/verzus-retro-system.css";'],
  ["src/styles/verzus-retro-system.css", "--vz-retro-green: #00ff87"],
  ["src/components/layout/app-shell/AppShell.module.css", "VERZUS RETRO_SHELL START"],
  ["src/components/primitives/button/Button.module.css", "VERZUS RETRO_BUTTONS START"],
  ["src/features/leaderboards/components/Leaderboard.module.css", "VERZUS RETRO_LEADERBOARD START"],
  ["src/features/onboarding/ui/onboarding-experience.module.css", "VERZUS RETRO_ONBOARDING START"],
  ["src/features/play/ui/play-command-center.module.css", "VERZUS RETRO_PLAY START"],
];

const failures = [];
for (const [file, fragment] of checks) {
  if (!fs.existsSync(file)) {
    failures.push(`${file}: missing`);
    continue;
  }
  const source = fs.readFileSync(file, "utf8");
  if (!source.includes(fragment)) failures.push(`${file}: missing ${fragment}`);
}

if (failures.length > 0) {
  console.error("Retro UI verification failed:\n" + failures.join("\n"));
  process.exit(1);
}

console.log("Retro UI installation markers: PASS");
