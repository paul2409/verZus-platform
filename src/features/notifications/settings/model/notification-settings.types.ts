// VERZUS M12.7 NOTIFICATION SETTINGS DOMAIN TYPES

export type NotificationSettingsScenario =
  | "normal"
  | "slow"
  | "error"
  | "offline"
  | "malformed"
  | "unauthorized"
  | "forbidden"
  | "maintenance"
  | "conflict";

export type NotificationDigestFrequency = "immediate" | "daily" | "weekly";

export type NotificationDeliveryChannels = {
  inApp: true;
  email: boolean;
  push: boolean;
};

export type NotificationCategoryPreferences = {
  match: boolean;
  crew: boolean;
  competition: boolean;
  reward: boolean;
  security: true;
  system: boolean;
};

export type NotificationQuietHours = {
  enabled: boolean;
  startMinute: number;
  endMinute: number;
  timeZone: string;
};

export type NotificationSettingsPreferences = {
  channels: NotificationDeliveryChannels;
  categories: NotificationCategoryPreferences;
  quietHours: NotificationQuietHours;
  emailDigest: NotificationDigestFrequency;
};

export type NotificationSettingsSnapshot = NotificationSettingsPreferences & {
  version: number;
  updatedAt: string;
  requestId: string;
};

export type NotificationSettingsUpdateInput = {
  preferences: NotificationSettingsPreferences;
  expectedVersion: number;
  idempotencyKey: string;
  scenario: NotificationSettingsScenario;
};

export type NotificationSettingsMutationResult = {
  settings: NotificationSettingsSnapshot;
  idempotencyKey: string;
  replayed: boolean;
};

export type NotificationSettingsErrorShape = {
  code: string;
  message: string;
  requestId: string;
  retryable: boolean;
  status?: number | undefined;
};
