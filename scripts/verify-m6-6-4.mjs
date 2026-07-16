import fs from "node:fs";

const required = [
  "src/app/(platform)/compete/[competitionId]/page.tsx",
  "src/features/competitions/details/ui/CompetitionDetailScreen.tsx",
  "src/features/competitions/details/ui/CompetitionDetail.module.css",
  "src/features/competitions/details/api/competition-detail-api.adapter.ts",
  "src/features/competitions/details/hooks/useCompetitionDetailData.ts",
  "src/features/competitions/details/server/mock-competition-detail.service.ts",
];
const resources = [
  "summary",
  "eligibility",
  "schedule",
  "rewards",
  "rules",
  "participants",
  "bracket",
];
const errors = [];
for (const file of required) if (!fs.existsSync(file)) errors.push(`Missing ${file}`);
for (const resource of resources) {
  const file = `src/app/api/competitions/[competitionId]/${resource}/route.ts`;
  if (!fs.existsSync(file)) errors.push(`Missing ${file}`);
}
const screen = fs.readFileSync(
  "src/features/competitions/details/ui/CompetitionDetailScreen.tsx",
  "utf8",
);
for (const marker of [
  "COMPETITION SUMMARY",
  "ELIGIBILITY",
  "SCHEDULE",
  "REWARD POOL",
  "COMPETITION RULES",
  "PARTICIPANTS",
  "BRACKET PREVIEW",
]) {
  if (!screen.includes(marker)) errors.push(`Missing screen marker: ${marker}`);
}
const css = fs.readFileSync(
  "src/features/competitions/details/ui/CompetitionDetail.module.css",
  "utf8",
);
if (/#[0-9a-f]{3,8}\b/i.test(css)) errors.push("M6.4 CSS contains hardcoded hex colours");
if (/border-radius\s*:\s*(?!0(?:[;\s]|$))[^;]+/i.test(css))
  errors.push("M6.4 CSS contains a nonzero border radius");
if (/body::(?:before|after)/.test(css)) errors.push("M6.4 duplicates global atmosphere layers");
if (errors.length) {
  console.error("M6.4 verification failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("M6.4 competition detail markers are installed.");
