// VERZUS M12.7 STRUCTURAL VERIFIER

import fs from "node:fs";

const required = [
  "src/features/notifications/settings/model/notification-settings.types.ts",
  "src/features/notifications/settings/schema/notification-settings.schema.ts",
  "src/features/notifications/settings/adapter/notification-settings.adapter.ts",
  "src/features/notifications/settings/api/notification-settings.client.ts",
  "src/features/notifications/settings/api/notification-settings.query.ts",
  "src/features/notifications/settings/hooks/useNotificationSettingsMutation.ts",
  "src/features/notifications/settings/server/notification-settings.service.ts",
  "src/features/notifications/settings/server/notification-settings.http.ts",
  "src/features/notifications/settings/ui/NotificationSettingsScreen.tsx",
  "src/features/notifications/settings/ui/NotificationSettingsScreen.module.css",
  "src/app/api/notifications/settings/route.ts",
  "src/app/(platform)/notifications/settings/page.tsx",
  "src/app/(platform)/notifications/settings/loading.tsx",
  "src/app/(platform)/notifications/settings/error.tsx",
  "docs/milestones/M12/m12-12-7-notification-settings-delivery-preferences.md",
  "tsconfig.m12-12-7.json",
];

for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`M12.7 missing required file: ${file}`);
}

const types = fs.readFileSync(required[0], "utf8");
for (const marker of ["inApp: true", "security: true", "expectedVersion", "idempotencyKey"]) {
  if (!types.includes(marker)) throw new Error(`M12.7 domain marker missing: ${marker}`);
}

const schema = fs.readFileSync(required[1], "utf8");
for (const marker of ["expected_version", "idempotency_key", "quiet_hours", "email_digest"]) {
  if (!schema.includes(marker)) throw new Error(`M12.7 schema marker missing: ${marker}`);
}

const query = fs.readFileSync(required[4], "utf8");
if (!query.includes('["notifications", "settings"]')) {
  throw new Error("M12.7 settings do not use an independent query-key namespace.");
}
if (query.includes("notification-center")) {
  throw new Error("M12.7 settings were coupled to the notification-centre query key.");
}

const mutation = fs.readFileSync(required[5], "utf8");
for (const marker of ["snapshots", "onError", "lastInput", "mutation.mutateAsync(lastInput)"]) {
  if (!mutation.includes(marker)) throw new Error(`M12.7 optimistic rollback marker missing: ${marker}`);
}

const service = fs.readFileSync(required[6], "utf8");
for (const marker of ["IDEMPOTENCY_CONFLICT", "VERSION_CONFLICT", "security: true", "inApp: true"]) {
  if (!service.includes(marker)) throw new Error(`M12.7 server guardrail missing: ${marker}`);
}

const http = fs.readFileSync(required[7], "utf8");
for (const marker of ["Idempotency-Key", "idempotency-key", "scenarioFailure", "x-request-id"]) {
  if (!http.includes(marker)) throw new Error(`M12.7 HTTP marker missing: ${marker}`);
}

const route = fs.readFileSync(required[10], "utf8");
if (!route.includes("export async function GET") || !route.includes("export async function PATCH")) {
  throw new Error("M12.7 settings endpoint must expose independent GET and PATCH handlers.");
}

const screen = fs.readFileSync(required[8], "utf8");
for (const marker of [
  'data-m12-stage="12.7"',
  "Notification settings",
  "Quiet hours",
  "Retry same request",
  "Back to signal centre",
]) {
  if (!screen.includes(marker)) throw new Error(`M12.7 UI marker missing: ${marker}`);
}
if (!screen.includes("function parseNotificationSettingsScenario(")) {
  throw new Error("M12.7 scenario parser is missing.");
}
if (screen.includes("const readScenario = readScenario(")) {
  throw new Error("M12.7 scenario parser is shadowed by the local readScenario value.");
}

const center = fs.readFileSync(
  "src/features/notifications/mutations/ui/NotificationOperationsScreen.tsx",
  "utf8",
);
if (!center.includes('href="/notifications/settings"')) {
  throw new Error("M12.7 notification-centre settings link is missing.");
}

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
for (const name of ["typecheck:m12:12.7", "verify:m12:12.7"]) {
  if (!packageJson.scripts?.[name]) throw new Error(`M12.7 package script missing: ${name}`);
}

console.log(
  "M12.7 notification settings, version conflicts, idempotent saves, optimistic rollback and independent delivery preferences are installed.",
);
