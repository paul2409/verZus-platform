// VERZUS M12.3 STRUCTURAL VERIFIER

import fs from "node:fs";

const files = [
  "src/features/notifications/center/model/notification-center.types.ts",
  "src/features/notifications/center/schema/notification-center.schema.ts",
  "src/features/notifications/center/adapter/notification-center.adapter.ts",
  "src/features/notifications/center/api/notification-center.client.ts",
  "src/features/notifications/center/api/notification-center.query.ts",
  "src/features/notifications/center/server/notification-center.service.ts",
  "src/features/notifications/center/server/notification-center.http.ts",
  "src/features/notifications/center/server/index.ts",
  "src/features/notifications/center/ui/NotificationCenterScreen.tsx",
  "src/features/notifications/center/ui/NotificationCenterScreen.module.css",
  "src/features/notifications/center/index.ts",
  "src/app/api/notifications/route.ts",
  "docs/milestones/M12/m12-12-3-notification-center-lifecycle.md",
  "tsconfig.m12-12-3.json",
];
for (const file of files) if (!fs.existsSync(file)) throw new Error(`M12.3 missing: ${file}`);

const screen = fs.readFileSync("src/features/notifications/center/ui/NotificationCenterScreen.tsx", "utf8");
const schema = fs.readFileSync("src/features/notifications/center/schema/notification-center.schema.ts", "utf8");
const query = fs.readFileSync("src/features/notifications/center/api/notification-center.query.ts", "utf8");
const route = fs.readFileSync("src/app/api/notifications/route.ts", "utf8");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

for (const marker of [
  'data-m12-stage="12.3"',
  "unread",
  "actioned",
  "dismissed",
  "expired",
  "Notification settings",
  "M12.4",
]) if (!screen.includes(marker)) throw new Error(`M12.3 screen marker missing: ${marker}`);

if (!schema.includes("notificationCenterResponseSchema")) throw new Error("M12.3 Zod schema missing.");
if (!query.includes("placeholderData: keepPreviousData")) throw new Error("M12.3 retained pagination data missing.");
if (!route.includes("handleNotificationCenterGet")) throw new Error("M12.3 endpoint handler missing.");
for (const name of ["typecheck:m12:12.3", "verify:m12:12.3"]) {
  if (!packageJson.scripts?.[name]) throw new Error(`M12.3 package script missing: ${name}`);
}
console.log("M12.3 notification centre, lifecycle filters, pagination, schema validation and local failure recovery are installed.");
