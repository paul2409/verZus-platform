// VERZUS M12.7 NOTIFICATION SETTINGS CLIENT

import {
  adaptNotificationSettings,
  adaptNotificationSettingsError,
  adaptNotificationSettingsMutation,
  NotificationSettingsError,
} from "../adapter/notification-settings.adapter";
import type {
  NotificationSettingsMutationResult,
  NotificationSettingsScenario,
  NotificationSettingsSnapshot,
  NotificationSettingsUpdateInput,
} from "../model/notification-settings.types";

async function readPayload(response: Response, fallbackCode: string): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new NotificationSettingsError({
      code: fallbackCode,
      message: "The notification settings service returned unreadable data.",
      requestId: response.headers.get("x-request-id") ?? fallbackCode.toLowerCase(),
      retryable: true,
      status: response.status,
    });
  }
}

export async function getNotificationSettings(input?: {
  scenario?: NotificationSettingsScenario;
  signal?: AbortSignal;
}): Promise<NotificationSettingsSnapshot> {
  const params = new URLSearchParams();
  if (input?.scenario && input.scenario !== "normal") {
    params.set("scenario", input.scenario);
  }
  const query = params.toString();

  let response: Response;
  try {
    response = await fetch(`/api/notifications/settings${query ? `?${query}` : ""}`, {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
      headers: { accept: "application/json" },
      ...(input?.signal ? { signal: input.signal } : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new NotificationSettingsError({
      code: "NOTIFICATION_SETTINGS_OFFLINE",
      message: "Notification settings are unavailable while offline.",
      requestId: "notification-settings-offline",
      retryable: true,
    });
  }

  const payload = await readPayload(response, "NOTIFICATION_SETTINGS_INVALID_JSON");
  if (!response.ok) throw adaptNotificationSettingsError(payload, response.status);
  return adaptNotificationSettings(payload);
}

export async function updateNotificationSettings(
  input: NotificationSettingsUpdateInput,
): Promise<NotificationSettingsMutationResult> {
  const body = {
    expected_version: input.expectedVersion,
    idempotency_key: input.idempotencyKey,
    scenario: input.scenario,
    settings: {
      channels: {
        in_app: true,
        email: input.preferences.channels.email,
        push: input.preferences.channels.push,
      },
      categories: {
        match: input.preferences.categories.match,
        crew: input.preferences.categories.crew,
        competition: input.preferences.categories.competition,
        reward: input.preferences.categories.reward,
        security: true,
        system: input.preferences.categories.system,
      },
      quiet_hours: {
        enabled: input.preferences.quietHours.enabled,
        start_minute: input.preferences.quietHours.startMinute,
        end_minute: input.preferences.quietHours.endMinute,
        time_zone: input.preferences.quietHours.timeZone,
      },
      email_digest: input.preferences.emailDigest,
    },
  };

  let response: Response;
  try {
    response = await fetch("/api/notifications/settings", {
      method: "PATCH",
      cache: "no-store",
      credentials: "same-origin",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "Idempotency-Key": input.idempotencyKey,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new NotificationSettingsError({
      code: "NOTIFICATION_SETTINGS_UPDATE_OFFLINE",
      message: "The preference update is unavailable while offline.",
      requestId: "notification-settings-update-offline",
      retryable: true,
    });
  }

  const payload = await readPayload(response, "NOTIFICATION_SETTINGS_UPDATE_INVALID_JSON");
  if (!response.ok) throw adaptNotificationSettingsError(payload, response.status);
  return adaptNotificationSettingsMutation(payload);
}
