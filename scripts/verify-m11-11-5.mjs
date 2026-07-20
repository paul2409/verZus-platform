// VERZUS M11.5 STRUCTURAL VERIFIER
import fs from "node:fs";

const requiredFiles = [
  "src/features/profiles/history/model/player-history.types.ts",
  "src/features/profiles/history/schema/player-history.schema.ts",
  "src/features/profiles/history/adapter/player-history.adapter.ts",
  "src/features/profiles/history/api/player-history.client.ts",
  "src/features/profiles/history/api/player-history.query.ts",
  "src/features/profiles/history/server/player-history.service.ts",
  "src/features/profiles/history/server/player-history.http.ts",
  "src/features/profiles/history/ui/PlayerMatchHistoryScreen.tsx",
  "src/features/profiles/history/ui/PlayerMatchHistoryScreen.module.css",
  "src/app/api/profile/matches/route.ts",
  "src/app/api/profile/statistics/route.ts",
  "src/app/(platform)/profile/matches/page.tsx",
  "docs/milestones/M11/m11-11-5-match-history-statistics.md",
  "tsconfig.m11-11-5.json",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`M11.5 missing required file: ${file}`);
}

const screen = fs.readFileSync(
  "src/features/profiles/history/ui/PlayerMatchHistoryScreen.tsx",
  "utf8",
);
const schema = fs.readFileSync(
  "src/features/profiles/history/schema/player-history.schema.ts",
  "utf8",
);
const query = fs.readFileSync("src/features/profiles/history/api/player-history.query.ts", "utf8");
const foundation = fs.readFileSync(
  "src/features/profiles/foundation/ui/PlayerProfileFoundationScreen.tsx",
  "utf8",
);

const markers = [
  'data-m11-stage="11.5"',
  "DesktopMatchTable",
  "MobileMatchCard",
  "Page {matches.page}",
  "playerMatchHistoryResponseSchema",
  "playerDetailedStatisticsResponseSchema",
  "placeholderData: keepPreviousData",
  "VERZUS M11.5 COMPLETE MATCH HISTORY LINK",
];

for (const marker of markers) {
  if (![screen, schema, query, foundation].some((content) => content.includes(marker))) {
    throw new Error(`M11.5 missing marker: ${marker}`);
  }
}

if (screen.includes("useMutation") || screen.includes('method: "POST"')) {
  throw new Error("M11.5 match history must remain read-only.");
}

console.log(
  "M11.5 paginated match history, detailed statistics, independent resources and responsive presentations are installed.",
);
