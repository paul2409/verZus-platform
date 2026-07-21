// VERZUS M12.7 SERVER-AUTHORITATIVE NOTIFICATION SETTINGS STORE

import type {
  NotificationSettingsPreferences,
  NotificationSettingsSnapshot,
} from "../model/notification-settings.types";

type ReplayRecord = {
  fingerprint: string;
  snapshot: NotificationSettingsSnapshot;
};

type NotificationSettingsStore = {
  current: NotificationSettingsSnapshot;
  replay: Map<string, ReplayRecord>;
};

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

const defaults: NotificationSettingsSnapshot = {
  version: 1,
  channels: { inApp: true, email: true, push: false },
  categories: {
    match: true,
    crew: true,
    competition: true,
    reward: true,
    security: true,
    system: true,
  },
  quietHours: {
    enabled: false,
    startMinute: 1320,
    endMinute: 420,
    timeZone: "Africa/Lagos",
  },
  emailDigest: "daily",
  updatedAt: "2026-07-21T12:00:00.000Z",
  requestId: "notification-settings-bootstrap",
};

const globalStore = globalThis as typeof globalThis & {
  __verzusNotificationSettingsStore?: NotificationSettingsStore;
};

function store(): NotificationSettingsStore {
  if (!globalStore.__verzusNotificationSettingsStore) {
    globalStore.__verzusNotificationSettingsStore = {
      current: defaults,
      replay: new Map<string, ReplayRecord>(),
    };
  }
  return globalStore.__verzusNotificationSettingsStore;
}

export function getNotificationSettingsSnapshot(requestId: string): NotificationSettingsSnapshot {
  return { ...store().current, requestId };
}

export function updateNotificationSettingsSnapshot(input: {
  preferences: NotificationSettingsPreferences;
  expectedVersion: number;
  idempotencyKey: string;
  requestId: string;
}): { snapshot: NotificationSettingsSnapshot; replayed: boolean } {
  const state = store();
  const fingerprint = JSON.stringify({
    expectedVersion: input.expectedVersion,
    preferences: input.preferences,
  });
  const replay = state.replay.get(input.idempotencyKey);

  if (replay) {
    if (replay.fingerprint !== fingerprint) {
      throw new NotificationSettingsServiceError({
        code: "NOTIFICATION_SETTINGS_IDEMPOTENCY_CONFLICT",
        message: "The idempotency key was already used for a different preference update.",
        retryable: false,
        status: 409,
      });
    }
    return {
      snapshot: { ...replay.snapshot, requestId: input.requestId },
      replayed: true,
    };
  }

  if (input.expectedVersion !== state.current.version) {
    throw new NotificationSettingsServiceError({
      code: "NOTIFICATION_SETTINGS_VERSION_CONFLICT",
      message: "Notification settings changed elsewhere. Refresh before saving again.",
      retryable: false,
      status: 409,
    });
  }

  const next: NotificationSettingsSnapshot = {
    ...input.preferences,
    channels: { ...input.preferences.channels, inApp: true },
    categories: { ...input.preferences.categories, security: true },
    version: state.current.version + 1,
    updatedAt: new Date().toISOString(),
    requestId: input.requestId,
  };

  state.current = next;
  state.replay.set(input.idempotencyKey, { fingerprint, snapshot: next });
  return { snapshot: next, replayed: false };
}
