// VERZUS M12.6 STRUCTURAL VERIFIER

import fs from "node:fs";

const requiredFiles = [
  "src/lib/reliability/resource-reliability.ts",
  "src/components/feedback/resource-state/ResourceStatePanel.tsx",
  "src/components/feedback/resource-state/ResourceStatePanel.module.css",
  "src/components/feedback/resource-state/index.ts",
  "src/features/search/reliability/search-reliability.ts",
  "src/features/notifications/reliability/notification-reliability.ts",
  "src/features/activity/reliability/activity-reliability.ts",
  "docs/milestones/M12/m12-12-6-cross-feature-reliability-matrix.md",
  "docs/milestones/M12/m12-12-6-reliability-matrix.json",
  "tsconfig.m12-12-6.json",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`M12.6 missing required file: ${file}`);
}

const reliability = fs.readFileSync("src/lib/reliability/resource-reliability.ts", "utf8");
const panel = fs.readFileSync("src/components/feedback/resource-state/ResourceStatePanel.tsx", "utf8");
const searchTypes = fs.readFileSync("src/features/search/resources/model/search-resource.types.ts", "utf8");
const searchHook = fs.readFileSync("src/features/search/resources/hooks/useSearchResources.ts", "utf8");
const searchHttp = fs.readFileSync("src/features/search/resources/server/search-resource.http.ts", "utf8");
const searchScreen = fs.readFileSync("src/features/search/foundation/ui/SearchFoundationScreen.tsx", "utf8");
const notificationTypes = fs.readFileSync("src/features/notifications/center/model/notification-center.types.ts", "utf8");
const notificationHttp = fs.readFileSync("src/features/notifications/center/server/notification-center.http.ts", "utf8");
const notificationScreen = fs.readFileSync("src/features/notifications/mutations/ui/NotificationOperationsScreen.tsx", "utf8");
const mutationTypes = fs.readFileSync("src/features/notifications/mutations/model/notification-mutation.types.ts", "utf8");
const mutationHttp = fs.readFileSync("src/features/notifications/mutations/server/notification-mutation.http.ts", "utf8");
const activityTypes = fs.readFileSync("src/features/activity/feed/model/activity-feed.types.ts", "utf8");
const activitySchema = fs.readFileSync("src/features/activity/feed/schema/activity-feed.schema.ts", "utf8");
const activityHttp = fs.readFileSync("src/features/activity/feed/server/activity-feed.http.ts", "utf8");
const activityScreen = fs.readFileSync("src/features/activity/feed/ui/ActivityFeedScreen.tsx", "utf8");
const matrix = JSON.parse(fs.readFileSync("docs/milestones/M12/m12-12-6-reliability-matrix.json", "utf8"));
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

for (const marker of [
  "unauthorized",
  "forbidden",
  "not-found",
  "maintenance",
  "schema-invalid",
  "partial-failure",
  "classifyResourceFailure",
]) {
  if (!reliability.includes(marker)) throw new Error(`M12.6 reliability marker missing: ${marker}`);
}

for (const marker of ["data-resource-state", "Support reference", "Retry resource"]) {
  if (!panel.includes(marker)) throw new Error(`M12.6 state panel marker missing: ${marker}`);
}

for (const source of [searchTypes, notificationTypes, mutationTypes, activityTypes]) {
  for (const scenario of ["unauthorized", "forbidden", "not-found", "maintenance"]) {
    if (!source.includes(`\"${scenario}\"`)) throw new Error(`M12.6 scenario missing: ${scenario}`);
  }
}

for (const marker of ["describeSearchResourceHealth", "partial-failure", "not-found"]) {
  if (!searchHook.includes(marker) && !searchScreen.includes(marker) && !searchHttp.includes(marker)) {
    throw new Error(`M12.6 Search reliability marker missing: ${marker}`);
  }
}

for (const marker of ["NOTIFICATIONS_FORBIDDEN", "NOTIFICATIONS_NOT_FOUND"]) {
  if (!notificationHttp.includes(marker)) throw new Error(`M12.6 notification read marker missing: ${marker}`);
}
if (!notificationScreen.includes("describeNotificationFailure") || !notificationScreen.includes("ResourceStatePanel")) {
  throw new Error("M12.6 notification reliability presentation is not connected.");
}
if (notificationScreen.includes('import { NotificationCenterError }')) {
  throw new Error("M12.6 left an unused NotificationCenterError import in the notification screen.");
}
if (!mutationHttp.includes("NOTIFICATION_MUTATION_NOT_FOUND")) {
  throw new Error("M12.6 notification mutation not-found state is missing.");
}

for (const marker of ["freshness", "partial", "ACTIVITY_FORBIDDEN", "ACTIVITY_NOT_FOUND"]) {
  if (!activityTypes.includes(marker) && !activitySchema.includes(marker) && !activityHttp.includes(marker)) {
    throw new Error(`M12.6 Activity reliability marker missing: ${marker}`);
  }
}
if (!activityScreen.includes("describeActivityFailure") || !activityScreen.includes("ResourceStatePanel")) {
  throw new Error("M12.6 Activity reliability presentation is not connected.");
}
if (activityScreen.includes('import { ActivityFeedError }')) {
  throw new Error("M12.6 left an unused ActivityFeedError import in the Activity screen.");
}

if (matrix.shellMustSurvive !== true || matrix.automaticMutationRetry !== false) {
  throw new Error("M12.6 machine-readable isolation policy is invalid.");
}

for (const name of ["typecheck:m12:12.6", "verify:m12:12.6"]) {
  if (!packageJson.scripts?.[name]) throw new Error(`M12.6 package script missing: ${name}`);
}

console.log(
  "M12.6 cross-feature offline, stale, unauthorized, forbidden, not-found, maintenance, schema and partial-failure states are installed.",
);
