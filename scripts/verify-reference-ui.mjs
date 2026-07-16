import fs from "node:fs";

const layout = fs.readFileSync("src/app/layout.tsx", "utf8");
const obsoleteImports = [
  "verzus-retro-system.css",
  "verzus-reference-lock.css",
  "verzus-esports-design-system.css",
  "verzus-font-reference.css",
];

const failures = obsoleteImports
  .filter((name) => layout.includes(name))
  .map((name) => `Obsolete theme import remains active: ${name}`);

const checks = [
  ["src/styles/verzus-visual-system.css", "--vz-clip-button:"],
  ["src/components/layout/app-shell/BrandMark.tsx", "brandVersion"],
  ["src/components/primitives/button/Button.module.css", "VERZUS STAGE 2 BUTTON:BEGIN"],
  [
    "src/features/onboarding/ui/onboarding-experience.module.css",
    "VERZUS STAGE 5 ONBOARDING:BEGIN",
  ],
  ["src/features/play/ui/play-command-center.module.css", "VERZUS STAGE 3 PLAY:BEGIN"],
  ["docs/design-system/stage-5-platform-contract.md", "# VERZUS Stage 5 Platform Contract"],
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

if (failures.length > 0) {
  console.error(
    "Reference-aligned VERZUS UI verification failed:\n" +
      failures.map((item) => `- ${item}`).join("\n"),
  );
  process.exit(1);
}

console.log("Reference-aligned canonical VERZUS UI markers: PASS");
