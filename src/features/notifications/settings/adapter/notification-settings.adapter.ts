// VERZUS M12.7 NOTIFICATION SETTINGS ADAPTER

import type {
  NotificationSettingsErrorShape,
  NotificationSettingsMutationResult,
  NotificationSettingsSnapshot,
} from "../model/notification-settings.types";
import {
  notificationSettingsErrorSchema,
  notificationSettingsResponseSchema,
} from "../schema/notification-settings.schema";

export class NotificationSettingsError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;
  readonly status: number | undefined;

  constructor(input: NotificationSettingsErrorShape) {
    super(input.message);
    this.name = "NotificationSettingsError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
    this.status = input.status;
  }
}

export function adaptNotificationSettings(payload: unknown): NotificationSettingsSnapshot {
  const parsed = notificationSettingsResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new NotificationSettingsError({
      code: "NOTIFICATION_SETTINGS_SCHEMA_INVALID",
      message: "Notification settings returned data that could not be validated.",
      requestId: "notification-settings-schema-invalid",
      retryable: true,
    });
  }

  const value = parsed.data.data;
  return {
    version: value.version,
    channels: {
      inApp: true,
      email: value.channels.email,
      push: value.channels.push,
    },
    categories: {
      match: value.categories.match,
      crew: value.categories.crew,
      competition: value.categories.competition,
      reward: value.categories.reward,
      security: true,
      system: value.categories.system,
    },
    quietHours: {
      enabled: value.quiet_hours.enabled,
      startMinute: value.quiet_hours.start_minute,
      endMinute: value.quiet_hours.end_minute,
      timeZone: value.quiet_hours.time_zone,
    },
    emailDigest: value.email_digest,
    updatedAt: value.updated_at,
    requestId: parsed.data.meta.request_id,
  };
}

export function adaptNotificationSettingsMutation(
  payload: unknown,
): NotificationSettingsMutationResult {
  const settings = adaptNotificationSettings(payload);
  const parsed = notificationSettingsResponseSchema.parse(payload);
  return {
    settings,
    idempotencyKey: parsed.meta.idempotency_key ?? "notification-settings-confirmed",
    replayed: parsed.meta.replayed ?? false,
  };
}

export function adaptNotificationSettingsError(
  payload: unknown,
  status: number,
): NotificationSettingsError {
  const parsed = notificationSettingsErrorSchema.safeParse(payload);
  if (parsed.success) {
    return new NotificationSettingsError({
      code: parsed.data.error.code,
      message: parsed.data.error.message,
      requestId: parsed.data.error.request_id,
      retryable: parsed.data.error.retryable,
      status,
    });
  }

  return new NotificationSettingsError({
    code: "NOTIFICATION_SETTINGS_FAILED",
    message: "Notification settings could not be completed.",
    requestId: `notification-settings-${status}`,
    retryable: status >= 500,
    status,
  });
}
