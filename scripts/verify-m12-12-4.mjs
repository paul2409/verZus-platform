// VERZUS M12.4 STRUCTURAL VERIFIER

import fs from "node:fs";

const requiredFiles = [
  "src/features/notifications/mutations/model/notification-mutation.types.ts",
  "src/features/notifications/mutations/schema/notification-mutation.schema.ts",
  "src/features/notifications/mutations/adapter/notification-mutation.adapter.ts",
  "src/features/notifications/mutations/api/notification-mutation.client.ts",
  "src/features/notifications/mutations/api/notification-mutation.query.ts",
  "src/features/notifications/mutations/hooks/useNotificationMutations.ts",
  "src/features/notifications/mutations/server/notification-mutation.http.ts",
  "src/features/notifications/mutations/server/index.ts",
  "src/features/notifications/mutations/ui/NotificationOperationsScreen.tsx",
  "src/features/notifications/mutations/ui/NotificationOperationsScreen.module.css",
  "src/features/notifications/mutations/shell/NotificationAwarePlatformShell.tsx",
  "src/features/notifications/mutations/index.ts",
  "src/app/api/notifications/[notificationId]/route.ts",
  "src/app/api/notifications/read-all/route.ts",
  "src/app/api/notifications/unread-count/route.ts",
  "docs/milestones/M12/m12-12-4-idempotent-notification-mutations-badge-sync.md",
  "tsconfig.m12-12-4.json",
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`M12.4 missing required file: ${file}`);
}

const service = fs.readFileSync(
  "src/features/notifications/center/server/notification-center.service.ts",
  "utf8",
);
const hook = fs.readFileSync(
  "src/features/notifications/mutations/hooks/useNotificationMutations.ts",
  "utf8",
);
const client = fs.readFileSync(
  "src/features/notifications/mutations/api/notification-mutation.client.ts",
  "utf8",
);
const screen = fs.readFileSync(
  "src/features/notifications/mutations/ui/NotificationOperationsScreen.tsx",
  "utf8",
);
const bridge = fs.readFileSync(
  "src/features/notifications/mutations/shell/NotificationAwarePlatformShell.tsx",
  "utf8",
);
const platformLayout = fs.readFileSync("src/app/(platform)/layout.tsx", "utf8");
const notificationEntry = fs.readFileSync(
  "src/features/notifications/ui/NotificationsScreen.tsx",
  "utf8",
);
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

for (const marker of [
  "VERZUS M12.4 SHARED NOTIFICATION STATE",
  "idempotencyLedger",
  "IDEMPOTENCY_KEY_REUSED",
  "NOTIFICATION_STATE_CONFLICT",
  "getNotificationUnreadCount",
]) {
  if (!service.includes(marker)) throw new Error(`M12.4 service marker missing: ${marker}`);
}

for (const marker of [
  "onMutate",
  "cancelQueries",
  "onError",
  "invalidateQueries",
  "retry: false",
]) {
  if (!hook.includes(marker)) throw new Error(`M12.4 optimistic mutation marker missing: ${marker}`);
}

for (const marker of ["Idempotency-Key", "PATCH", "read-all"]) {
  if (!client.includes(marker)) throw new Error(`M12.4 client marker missing: ${marker}`);
}

for (const marker of [
  'data-m12-stage="12.4"',
  "Mark all read",
  "Mark read",
  "dismissed",
  "actioned",
  "Retry same request",
]) {
  if (!screen.includes(marker)) throw new Error(`M12.4 screen marker missing: ${marker}`);
}

if (!bridge.includes("notificationUnreadCountQueryOptions") || !bridge.includes("notificationCount")) {
  throw new Error("M12.4 feature-owned shell badge bridge is incomplete.");
}
if (!platformLayout.includes("NotificationAwarePlatformShell")) {
  throw new Error("M12.4 platform layout badge bridge is not installed.");
}
if (!notificationEntry.includes("NotificationOperationsScreen")) {
  throw new Error("M12.4 notification screen entry is not installed.");
}

for (const name of ["typecheck:m12:12.4", "verify:m12:12.4"]) {
  if (!packageJson.scripts?.[name]) throw new Error(`M12.4 package script missing: ${name}`);
}

console.log(
  "M12.4 idempotent notification mutations, optimistic rollback and shell badge synchronization are installed.",
);
