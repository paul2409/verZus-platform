import fs from "node:fs";

const files = {
  layout: "src/app/layout.tsx",
  globals: "src/styles/globals.css",
  fonts: "src/styles/fonts.css",
  typography: "src/styles/typography.css",
  retro: "src/styles/verzus-retro-system.css",
};

const read = (file) => fs.readFileSync(file, "utf8");
const layout = read(files.layout);
const globals = read(files.globals);
const fonts = read(files.fonts);
const typography = read(files.typography);
const retro = read(files.retro);

const failures = [];
const pass = (message) => console.log(`PASS: ${message}`);
const fail = (message) => failures.push(message);

if (/data-theme=["']retro-competitive["']/.test(layout)) {
  pass("Root html activates retro-competitive.");
} else {
  fail("Root html does not activate retro-competitive.");
}

const retroImportCount = (layout.match(/verzus-retro-system\.css/g) ?? []).length;
if (retroImportCount === 1) {
  pass("verzus-retro-system.css is imported exactly once.");
} else {
  fail(`Expected one retro theme import, found ${retroImportCount}.`);
}

for (const legacy of [
  "verzus-esports-design-system.css",
  "verzus-reference-lock.css",
  "verzus-font-reference.css",
  "verzus-visual-system.css",
]) {
  if (layout.includes(legacy)) fail(`Competing global theme remains imported: ${legacy}`);
  else pass(`${legacy} is inactive globally.`);
}

for (const colour of [
  "#020305",
  "#00ff87",
  "#00e5ff",
  "#9b62ff",
  "#ff8a1f",
  "#ffc247",
  "#ff3b30",
  "#ff2d87",
  "#f7f8fb",
  "#8f91a5",
]) {
  if (retro.toLowerCase().includes(colour)) pass(`Approved colour preserved: ${colour}`);
  else fail(`Approved colour missing: ${colour}`);
}

for (const token of [
  "--vz-retro-cut-sm",
  "--vz-retro-cut-md",
  "--vz-retro-cut-lg",
  "--vz-gradient-brand",
  "--vz-gradient-primary",
  "--vz-shadow-glow-green",
  "--vz-shadow-glow-cyan",
  "--vz-shadow-glow-purple",
  "--vz-shadow-glow-gold",
  "--vz-shadow-focus",
]) {
  if (retro.includes(token)) pass(`Approved retro token preserved: ${token}`);
  else fail(`Approved retro token missing: ${token}`);
}

for (const selector of [
  'html[data-theme="retro-competitive"] body',
  'html[data-theme="retro-competitive"] body::before',
  'html[data-theme="retro-competitive"] body::after',
]) {
  if (retro.includes(selector)) pass(`Required selector exists: ${selector}`);
  else fail(`Required selector missing: ${selector}`);
}

if (/body::(?:before|after)/.test(globals)) {
  fail("globals.css still declares a body atmosphere pseudo-element.");
} else {
  pass("globals.css does not duplicate grid or scanline layers.");
}

const globalBodyBlock = globals.match(/(^|\n)body\s*\{([\s\S]*?)\n\}/m)?.[2] ?? "";
if (/\b(?:background|color)\s*:/.test(globalBodyBlock)) {
  fail("globals.css body still declares competing background or colour.");
} else {
  pass("globals.css body leaves visual atmosphere to the retro theme.");
}

const combinedFonts = `${layout}\n${fonts}\n${typography}`;
if (/Rajdhani/i.test(combinedFonts)) pass("Rajdhani remains referenced.");
else fail("Rajdhani reference is missing.");

if (/Inter/i.test(combinedFonts)) pass("Inter remains referenced.");
else fail("Inter reference is missing.");

if (
  /font-variant-numeric:\s*tabular-nums\s+lining-nums/.test(`${fonts}\n${typography}\n${retro}`)
) {
  pass("Tabular lining numerals remain enabled.");
} else {
  fail("Tabular lining numerals are missing.");
}

if (failures.length > 0) {
  console.error("\nStage 1 retro verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("\nStage 1 retro theme verification passed.");
