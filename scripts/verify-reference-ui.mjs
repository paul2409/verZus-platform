import fs from "node:fs";

const failures = [];
const checks = [
  ["src/app/layout.tsx", 'data-theme="retro-competitive"'],
  ["src/styles/verzus-retro-system.css", "--vz-retro-cut-sm:"],
  ["src/styles/verzus-retro-system.css", "--vz-retro-cut-md:"],
  ["src/styles/verzus-retro-system.css", "--vz-retro-cut-lg:"],
  ["src/components/layout/app-shell/BrandMark.tsx", "brandVersion"],
  ["src/components/primitives/button/Button.module.css", "VERZUS STAGE 2"],
  [
    "src/features/onboarding/ui/onboarding-experience.module.css",
    "VERZUS STAGE 5 ONBOARDING:BEGIN",
  ],
  ["src/features/play/ui/PlayCommandCenter.tsx", "VERZUS STAGE 3 RETRO PLAY"],
  ["docs/design-system/stage-5-retro-platform-contract.md", "# VERZUS Stage 5"],
];

for (const [file, expected] of checks) {
  if (!fs.existsSync(file)) {
    failures.push(`${file}: missing`);
    continue;
  }

  const source = fs.readFileSync(file, "utf8");
  if (!source.includes(expected)) {
    failures.push(`${file}: missing ${expected}`);
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
    "Reference-aligned retro VERZUS UI verification failed:\n" +
      failures.map((item) => `- ${item}`).join("\n"),
  );
  process.exit(1);
}

console.log("Reference-aligned retro VERZUS UI markers: PASS");
