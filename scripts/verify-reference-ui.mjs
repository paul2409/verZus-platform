import fs from "node:fs";

const checks = [
  ["src/app/layout.tsx", 'data-theme="verzus-reference"'],
  ["src/app/layout.tsx", 'import "@/styles/verzus-reference-lock.css";'],
  ["src/styles/verzus-reference-lock.css", "--vz-ref-green: #00ff87"],
  ["src/styles/verzus-reference-lock.css", "--vz-ref-cyan: #00e5ff"],
  ["src/styles/verzus-reference-lock.css", "--vz-ref-violet: #9b62ff"],
  ["src/styles/verzus-reference-lock.css", "--vz-ref-gold: #ffc247"],
  ["src/components/layout/app-shell/BrandMark.tsx", "brandVersion"],
  ["src/components/layout/app-shell/AppShell.module.css", "VERZUS REFERENCE_LOCK_SHELL START"],
  [
    "src/features/leaderboards/components/Leaderboard.module.css",
    "VERZUS REFERENCE_LOCK_LEADERBOARD START",
  ],
  [
    "src/features/onboarding/ui/onboarding-experience.module.css",
    "VERZUS REFERENCE_LOCK_ONBOARDING START",
  ],
  ["src/features/play/ui/play-command-center.module.css", "VERZUS REFERENCE_LOCK_PLAY START"],
];

const failures = [];
for (const [file, expected] of checks) {
  if (!fs.existsSync(file)) {
    failures.push(`${file}: missing`);
    continue;
  }
  const source = fs.readFileSync(file, "utf8");
  if (!source.includes(expected)) failures.push(`${file}: missing ${expected}`);
}

if (failures.length) {
  console.error(
    "Reference UI verification failed:\n" + failures.map((item) => `- ${item}`).join("\n"),
  );
  process.exit(1);
}

console.log("Reference-locked VERZUS UI markers are installed.");
