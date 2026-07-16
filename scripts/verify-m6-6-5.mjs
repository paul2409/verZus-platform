import fs from "node:fs";
import path from "node:path";

const required = [
  "src/features/competitions/entry/model/competition-entry.types.ts",
  "src/features/competitions/entry/model/competition-entry.schema.ts",
  "src/features/competitions/entry/api/competition-entry-api.schema.ts",
  "src/features/competitions/entry/api/competition-entry-api.adapter.ts",
  "src/features/competitions/entry/api/competition-entry-api.client.ts",
  "src/features/competitions/entry/api/competition-entry.query.ts",
  "src/features/competitions/entry/hooks/useCompetitionEntry.ts",
  "src/features/competitions/entry/server/mock-competition-entry.cookie.ts",
  "src/features/competitions/entry/server/mock-competition-entry.service.ts",
  "src/features/competitions/entry/server/mock-competition-entry.http.ts",
  "src/features/competitions/entry/ui/CompetitionEntryControl.tsx",
  "src/features/competitions/entry/ui/CompetitionEntry.module.css",
  "src/app/api/competitions/[competitionId]/entry/route.ts",
  "docs/milestones/M6/m6-6-5-competition-entry.md",
];

const errors = [];
for (const file of required) {
  if (!fs.existsSync(file)) errors.push(`Missing M6.5 file: ${file}`);
}

const detail = fs.readFileSync(
  "src/features/competitions/details/ui/CompetitionDetailScreen.tsx",
  "utf8",
);
if (!detail.includes('data-m6-stage="6.5"')) {
  errors.push("Competition detail screen is not marked as M6.5.");
}
if (!detail.includes("CompetitionEntryControl")) {
  errors.push("Competition detail screen does not render CompetitionEntryControl.");
}

const route = fs.readFileSync("src/app/api/competitions/[competitionId]/entry/route.ts", "utf8");
if (!route.includes("export async function GET") || !route.includes("export async function POST")) {
  errors.push("Competition entry route must expose GET and POST.");
}

const service = fs.readFileSync(
  "src/features/competitions/entry/server/mock-competition-entry.service.ts",
  "utf8",
);
for (const marker of [
  "idempotency_key_required",
  "idempotency_key_mismatch",
  "stale_competition_state",
  "competition_full",
  "not_eligible",
]) {
  if (!service.includes(marker)) errors.push(`Missing server guard: ${marker}`);
}

const css = fs.readFileSync(
  "src/features/competitions/entry/ui/CompetitionEntry.module.css",
  "utf8",
);
if (/#[0-9a-f]{3,8}\b/i.test(css)) {
  errors.push("M6.5 entry CSS contains a hardcoded hexadecimal colour.");
}
if (/border-radius\s*:\s*(?!0(?:[;\s]|$)|var\(--vz-radius-[^)]+\))/i.test(css)) {
  errors.push("M6.5 entry CSS contains a nonzero hardcoded border radius.");
}
if (/body::(?:before|after)/.test(css)) {
  errors.push("M6.5 duplicates the global retro atmosphere layer.");
}

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
if (!packageJson.scripts?.["verify:m6:6.5"]) {
  errors.push("Missing verify:m6:6.5 package script.");
}

if (errors.length > 0) {
  console.error("M6.5 verification failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("M6.5 competition entry markers are installed.");
