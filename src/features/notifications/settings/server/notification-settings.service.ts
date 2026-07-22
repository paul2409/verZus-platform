import type {
  NotificationSettingsPreferences,
  NotificationSettingsSnapshot,
} from "../model/notification-settings.types";
import {
  readNotificationSettings,
  updateNotificationSettings,
  NotificationRepositoryError,
} from "../../server/notification.repository";

export class NotificationSettingsServiceError extends Error {
  readonly code: string;
  readonly retryable: boolean;
  readonly status: number;

  constructor(input: { code: string; message: string; retryable: boolean; status: number }) {
    super(input.message);
    this.name = "NotificationSettingsServiceError";
    this.code = input.code;
    this.retryable = input.retryable;
    this.status = input.status;
  }
}

function mapError(error: unknown): never {
  if (error instanceof NotificationRepositoryError) {
    throw new NotificationSettingsServiceError({
      code: error.code,
      message: error.message,
      retryable: error.retryable,
      status: error.status,
    });
  }
  throw error;
}

export async function getNotificationSettingsSnapshot(
  userId: string,
  requestId: string,
): Promise<NotificationSettingsSnapshot> {
  try {
    return await readNotificationSettings(userId, requestId);
  } catch (error) {
    return mapError(error);
  }
}

export async function updateNotificationSettingsSnapshot(input: {
  userId: string;
  preferences: NotificationSettingsPreferences;
  expectedVersion: number;
  idempotencyKey: string;
  requestId: string;
}): Promise<{ snapshot: NotificationSettingsSnapshot; replayed: boolean }> {
  try {
    return await updateNotificationSettings(input);
  } catch (error) {
    return mapError(error);
  }
}
