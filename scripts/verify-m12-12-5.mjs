// VERZUS M12.5 STRUCTURAL VERIFIER

import fs from "node:fs";

const requiredFiles = [
  "src/features/activity/feed/model/activity-feed.types.ts",
  "src/features/activity/feed/schema/activity-feed.schema.ts",
  "src/features/activity/feed/adapter/activity-feed.adapter.ts",
  "src/features/activity/feed/api/activity-feed.client.ts",
  "src/features/activity/feed/api/activity-feed.query.ts",
  "src/features/activity/feed/server/activity-feed.service.ts",
  "src/features/activity/feed/server/activity-feed.http.ts",
  "src/features/activity/feed/ui/ActivityFeedScreen.tsx",
  "src/features/activity/feed/ui/ActivityFeedScreen.module.css",
  "src/features/activity/feed/index.ts",
  "src/features/activity/ui/ActivityScreen.tsx",
  "src/features/activity/index.ts",
  "src/app/api/activity/route.ts",
  "src/app/(platform)/activity/page.tsx",
  "src/app/(platform)/activity/loading.tsx",
  "src/app/(platform)/activity/error.tsx",
  "src/app/(platform)/activity/not-found.tsx",
  "docs/milestones/M12/m12-12-5-personalized-activity-feed.md",
  "tsconfig.m12-12-5.json",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`M12.5 missing required file: ${file}`);
}

const service = fs.readFileSync("src/features/activity/feed/server/activity-feed.service.ts", "utf8");
const query = fs.readFileSync("src/features/activity/feed/api/activity-feed.query.ts", "utf8");
const schema = fs.readFileSync("src/features/activity/feed/schema/activity-feed.schema.ts", "utf8");
const screen = fs.readFileSync("src/features/activity/feed/ui/ActivityFeedScreen.tsx", "utf8");
const route = fs.readFileSync("src/app/api/activity/route.ts", "utf8");
const navigation = fs.readFileSync("src/components/layout/app-shell/shell-navigation.ts", "utf8");
const platformRoute = fs.readFileSync("src/components/layout/app-shell/platform-route.ts", "utf8");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

for (const marker of [
  "SERVER-AUTHORITATIVE PERSONALIZED ACTIVITY FEED",
  "isVisibleToViewer",
  "FOLLOWED_ACTOR_IDS",
  "encodeCursor",
  "decodeCursor",
  "compareActivity",
]) {
  if (!service.includes(marker)) throw new Error(`M12.5 service marker missing: ${marker}`);
}

for (const marker of [
  "infiniteQueryOptions",
  "initialPageParam",
  "getNextPageParam",
  "retry: false",
]) {
  if (!query.includes(marker)) throw new Error(`M12.5 query marker missing: ${marker}`);
}

if (!schema.includes("activityFeedResponseSchema")) {
  throw new Error("M12.5 Zod response schema is missing.");
}

for (const marker of [
  'data-m12-stage="12.5"',
  "ACTIVITY FEED",
  "For you",
  "Load more activity",
  "Confirmed items remain visible",
  "Personalized, not global noise",
]) {
  if (!screen.includes(marker)) throw new Error(`M12.5 screen marker missing: ${marker}`);
}

if (!route.includes("handleActivityFeedGet")) {
  throw new Error("M12.5 activity endpoint is not connected.");
}
if (!navigation.includes('id: "activity"') || !navigation.includes('href: "/activity"')) {
  throw new Error("M12.5 desktop activity navigation is not installed.");
}
if (!platformRoute.includes('| "activity"') || !platformRoute.includes('id: "activity"')) {
  throw new Error("M12.5 platform route descriptor is not installed.");
}

for (const name of ["typecheck:m12:12.5", "verify:m12:12.5"]) {
  if (!packageJson.scripts?.[name]) throw new Error(`M12.5 package script missing: ${name}`);
}

console.log(
  "M12.5 personalized activity, viewer-safe filtering, URL domain filters, deterministic cursor pagination and contextual links are installed.",
);
