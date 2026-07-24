import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const failures = [];

const packageJson = JSON.parse(read("package.json"));
const layout = read("src/app/layout.tsx");
const fonts = read("src/styles/fonts.css");
const typography = read("src/styles/typography.css");
const shell = read("src/components/layout/app-shell/AppShell.module.css");
const play = read("src/features/play/ui/play-command-center.module.css");
const actionCentre = read("src/features/play/ui/action-centre-panel.module.css");

function requireText(name, source, expected) {
  if (!source.includes(expected)) {
    failures.push(`${name}: missing ${expected}`);
  }
}

if (packageJson.dependencies?.["@fontsource-variable/jetbrains-mono"] !== "5.2.8") {
  failures.push("package.json: JetBrains Mono must be version locked to 5.2.8");
}

requireText("layout", layout, 'import "@fontsource-variable/jetbrains-mono";');
requireText("fonts", fonts, '--vz-font-display: "Rajdhani"');
requireText("fonts", fonts, "--vz-font-interface:");
requireText("fonts", fonts, '"Inter Variable"');
requireText("fonts", fonts, "--vz-font-numeric:");
requireText("fonts", fonts, '"JetBrains Mono Variable"');
requireText("fonts", fonts, "tabular-nums lining-nums slashed-zero");
requireText("typography", typography, "VERZUS TACTICAL TYPOGRAPHY START");
requireText("shell", shell, "VERZUS TACTICAL TYPOGRAPHY START");
requireText("shell", shell, "text-transform: none;");
requireText("play", play, "VERZUS TACTICAL TYPOGRAPHY START");
requireText("play", play, "font-family: var(--vz-font-numeric);");
requireText("action centre", actionCentre, "VERZUS TACTICAL TYPOGRAPHY START");

if (fonts.includes('--vz-font-numeric: "Rajdhani"')) {
  failures.push("fonts.css: numeric role still points to Rajdhani");
}

if (layout.includes("fonts.googleapis.com") || fonts.includes("fonts.googleapis.com")) {
  failures.push("remote Google Fonts imports are forbidden; use local Fontsource assets");
}

if (failures.length > 0) {
  console.error("Typography contract failed:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log("VERZUS typography contract passed.");
