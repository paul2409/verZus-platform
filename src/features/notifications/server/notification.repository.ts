import "server-only";

import { createHash } from "node:crypto";

import type { PoolClient } from "pg";

import { queryDatabase, withDatabaseTransaction } from "@/lib/db";
import type {
  NotificationCategory,
  NotificationLifecycleState,
  NotificationRecord,
} from "../center/model/notification-center.types";
import type { NotificationSettingsPreferences } from "../settings/model/notification-settings.types";

type NotificationRow = {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  state: NotificationLifecycleState;
  priority: NotificationRecord["priority"];
  created_at: Date;
  expires_at: Date | null;
  href: string | null;
  action_label: string | null;
  source_label: string;
  reference: string;
};

type SettingsRow = {
  version: number;
  email_enabled: boolean;
  push_enabled: boolean;
  match_enabled: boolean;
  crew_enabled: boolean;
  competition_enabled: boolean;
  reward_enabled: boolean;
  system_enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start_minute: number;
  quiet_hours_end_minute: number;
  quiet_hours_timezone: string;
  email_digest: "immediate" | "daily" | "weekly";
  updated_at: Date;
};

function mapNotification(row: NotificationRow): NotificationRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    state: row.state,
    priority: row.priority,
    createdAt: row.created_at.toISOString(),
    expiresAt: row.expires_at?.toISOString() ?? null,
    href: row.href,
    actionLabel: row.action_label,
    sourceLabel: row.source_label,
    reference: row.reference,
  };
}

function fingerprint(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export class NotificationRepositoryError extends Error {
  readonly code: string;
  readonly status: number;
  readonly retryable: boolean;

  constructor(input: { code: string; message: string; status: number; retryable?: boolean }) {
    super(input.message);
    this.name = "NotificationRepositoryError";
    this.code = input.code;
    this.status = input.status;
    this.retryable = input.retryable ?? false;
  }
}

async function countUnread(client: Pick<PoolClient, "query">, userId: string): Promise<number> {
  const result = await client.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
       FROM notifications
      WHERE user_id = $1::uuid
        AND state = 'unread'
        AND (expires_at IS NULL OR expires_at > now())`,
    [userId],
  );
  return Number(result.rows[0]?.count ?? 0);
}

export async function listNotifications(input: {
  userId: string;
  state: NotificationLifecycleState | "all";
  category: NotificationCategory | "all";
  page: number;
  pageSize: number;
}) {
  const filters = ["user_id = $1::uuid"];
  const values: unknown[] = [input.userId];

  if (input.state === "expired") {
    filters.push("(state = 'expired' OR (state = 'unread' AND expires_at IS NOT NULL AND expires_at <= now()))");
  } else if (input.state === "unread") {
    filters.push("state = 'unread' AND (expires_at IS NULL OR expires_at > now())");
  } else if (input.state !== "all") {
    values.push(input.state);
    filters.push(`state = $${values.length}`);
  }
  if (input.category !== "all") {
    values.push(input.category);
    filters.push(`category = $${values.length}`);
  }

  values.push(input.pageSize);
  const limitParameter = `$${values.length}`;
  values.push((input.page - 1) * input.pageSize);
  const offsetParameter = `$${values.length}`;

  const result = await queryDatabase<NotificationRow & { total: string; unread_count: string }>(
    `SELECT
       id::text,
       title,
       description,
       category,
       CASE
         WHEN state = 'unread' AND expires_at IS NOT NULL AND expires_at <= now() THEN 'expired'
         ELSE state
       END AS state,
       priority,
       created_at,
       expires_at,
       href,
       action_label,
       source_label,
       reference,
       COUNT(*) OVER()::text AS total,
       (
         SELECT COUNT(*)::text
           FROM notifications AS unread
          WHERE unread.user_id = $1::uuid
            AND unread.state = 'unread'
            AND (unread.expires_at IS NULL OR unread.expires_at > now())
       ) AS unread_count
     FROM notifications
     WHERE ${filters.join(" AND ")}
     ORDER BY created_at DESC, id DESC
     LIMIT ${limitParameter}
     OFFSET ${offsetParameter}`,
    values,
  );

  const total = Number(result.rows[0]?.total ?? 0);
  const totalPages = total === 0 ? 0 : Math.ceil(total / input.pageSize);
  const safePage = totalPages === 0 ? 1 : Math.min(input.page, totalPages);

  return {
    items: result.rows.map(mapNotification),
    total,
    totalPages,
    page: safePage,
    unreadCount: Number(result.rows[0]?.unread_count ?? 0),
  };
}

export async function getUnreadCount(userId: string): Promise<number> {
  const result = await queryDatabase<{ count: string }>(
    `SELECT COUNT(*)::text AS count
       FROM notifications
      WHERE user_id = $1::uuid
        AND state = 'unread'
        AND (expires_at IS NULL OR expires_at > now())`,
    [userId],
  );
  return Number(result.rows[0]?.count ?? 0);
}

type MutationResult = {
  item: NotificationRecord | null;
  operation: "read" | "actioned" | "dismissed" | "read_all";
  updatedCount: number;
  unreadCount: number;
  idempotencyKey: string;
  replayed: boolean;
};

export async function mutateNotification(input:
  | {
      kind: "single";
      userId: string;
      notificationId: string;
      operation: "read" | "actioned" | "dismissed";
      expectedState: NotificationLifecycleState;
      idempotencyKey: string;
    }
  | {
      kind: "read-all";
      userId: string;
      category: NotificationCategory | "all";
      idempotencyKey: string;
    },
): Promise<MutationResult> {
  const requestFingerprint = fingerprint(input);

  return withDatabaseTransaction(async (client) => {
    const replay = await client.query<{ fingerprint: string; response: MutationResult }>(
      `SELECT fingerprint, response
         FROM notification_commands
        WHERE user_id = $1::uuid AND idempotency_key = $2
        FOR UPDATE`,
      [input.userId, input.idempotencyKey],
    );

    if (replay.rowCount) {
      const existing = replay.rows[0];
      if (!existing || existing.fingerprint !== requestFingerprint) {
        throw new NotificationRepositoryError({
          code: "IDEMPOTENCY_KEY_REUSED",
          message: "This idempotency key was already used for another notification update.",
          status: 409,
        });
      }
      return { ...existing.response, replayed: true };
    }

    let result: Omit<MutationResult, "replayed">;

    if (input.kind === "read-all") {
      const update = await client.query(
        `UPDATE notifications
            SET state = 'read',
                read_at = COALESCE(read_at, now()),
                updated_at = now(),
                version = version + 1
          WHERE user_id = $1::uuid
            AND state = 'unread'
            AND (expires_at IS NULL OR expires_at > now())
            AND ($2::text = 'all' OR category = $2)
        RETURNING id`,
        [input.userId, input.category],
      );
      result = {
        item: null,
        operation: "read_all",
        updatedCount: update.rowCount ?? 0,
        unreadCount: await countUnread(client, input.userId),
        idempotencyKey: input.idempotencyKey,
      };
    } else {
      const current = await client.query<NotificationRow>(
        `SELECT
           id::text,
           title,
           description,
           category,
           state,
           priority,
           created_at,
           expires_at,
           href,
           action_label,
           source_label,
           reference
         FROM notifications
         WHERE id = $1::uuid AND user_id = $2::uuid
         FOR UPDATE`,
        [input.notificationId, input.userId],
      );

      const row = current.rows[0];
      if (!row) {
        throw new NotificationRepositoryError({
          code: "NOTIFICATION_MUTATION_NOT_FOUND",
          message: "The notification no longer exists.",
          status: 404,
        });
      }
      if (row.state !== input.expectedState) {
        throw new NotificationRepositoryError({
          code: "NOTIFICATION_STATE_CONFLICT",
          message: "The notification changed before this update was applied.",
          status: 409,
          retryable: true,
        });
      }
      if (["actioned", "dismissed", "expired"].includes(row.state)) {
        throw new NotificationRepositoryError({
          code: "NOTIFICATION_STATE_TERMINAL",
          message: "This notification can no longer transition.",
          status: 409,
        });
      }

      const targetState = input.operation;
      const updated = await client.query<NotificationRow>(
        `UPDATE notifications
            SET state = $3,
                read_at = CASE WHEN $3 IN ('read', 'actioned') THEN COALESCE(read_at, now()) ELSE read_at END,
                actioned_at = CASE WHEN $3 = 'actioned' THEN now() ELSE actioned_at END,
                dismissed_at = CASE WHEN $3 = 'dismissed' THEN now() ELSE dismissed_at END,
                updated_at = now(),
                version = version + 1
          WHERE id = $1::uuid AND user_id = $2::uuid
        RETURNING
          id::text,
          title,
          description,
          category,
          state,
          priority,
          created_at,
          expires_at,
          href,
          action_label,
          source_label,
          reference`,
        [input.notificationId, input.userId, targetState],
      );

      result = {
        item: mapNotification(updated.rows[0]!),
        operation: input.operation,
        updatedCount: 1,
        unreadCount: await countUnread(client, input.userId),
        idempotencyKey: input.idempotencyKey,
      };
    }

    await client.query(
      `INSERT INTO notification_commands (user_id, idempotency_key, fingerprint, response)
       VALUES ($1::uuid, $2, $3, $4::jsonb)`,
      [input.userId, input.idempotencyKey, requestFingerprint, JSON.stringify(result)],
    );

    return { ...result, replayed: false };
  });
}

function mapSettings(row: SettingsRow, requestId: string) {
  return {
    version: row.version,
    channels: { inApp: true as const, email: row.email_enabled, push: row.push_enabled },
    categories: {
      match: row.match_enabled,
      crew: row.crew_enabled,
      competition: row.competition_enabled,
      reward: row.reward_enabled,
      security: true as const,
      system: row.system_enabled,
    },
    quietHours: {
      enabled: row.quiet_hours_enabled,
      startMinute: row.quiet_hours_start_minute,
      endMinute: row.quiet_hours_end_minute,
      timeZone: row.quiet_hours_timezone,
    },
    emailDigest: row.email_digest,
    updatedAt: row.updated_at.toISOString(),
    requestId,
  };
}

async function ensureSettings(client: Pick<PoolClient, "query">, userId: string): Promise<void> {
  await client.query(
    `INSERT INTO notification_settings (user_id, quiet_hours_timezone)
     SELECT $1::uuid, COALESCE(NULLIF(timezone, ''), 'UTC')
       FROM player_profiles
      WHERE user_id = $1::uuid
     ON CONFLICT (user_id) DO NOTHING`,
    [userId],
  );
  await client.query(
    `INSERT INTO notification_settings (user_id)
     VALUES ($1::uuid)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId],
  );
}

export async function readNotificationSettings(userId: string, requestId: string) {
  return withDatabaseTransaction(async (client) => {
    await ensureSettings(client, userId);
    const result = await client.query<SettingsRow>(
      `SELECT * FROM notification_settings WHERE user_id = $1::uuid`,
      [userId],
    );
    return mapSettings(result.rows[0]!, requestId);
  });
}

export async function updateNotificationSettings(input: {
  userId: string;
  preferences: NotificationSettingsPreferences;
  expectedVersion: number;
  idempotencyKey: string;
  requestId: string;
}) {
  const requestFingerprint = fingerprint({
    preferences: input.preferences,
    expectedVersion: input.expectedVersion,
  });

  return withDatabaseTransaction(async (client) => {
    await ensureSettings(client, input.userId);

    const replay = await client.query<{ fingerprint: string; response: ReturnType<typeof mapSettings> }>(
      `SELECT fingerprint, response
         FROM notification_settings_commands
        WHERE user_id = $1::uuid AND idempotency_key = $2
        FOR UPDATE`,
      [input.userId, input.idempotencyKey],
    );
    if (replay.rowCount) {
      const existing = replay.rows[0]!;
      if (existing.fingerprint !== requestFingerprint) {
        throw new NotificationRepositoryError({
          code: "NOTIFICATION_SETTINGS_IDEMPOTENCY_CONFLICT",
          message: "The idempotency key was already used for another settings update.",
          status: 409,
        });
      }
      return { snapshot: { ...existing.response, requestId: input.requestId }, replayed: true };
    }

    const current = await client.query<SettingsRow>(
      `SELECT * FROM notification_settings WHERE user_id = $1::uuid FOR UPDATE`,
      [input.userId],
    );
    if (current.rows[0]!.version !== input.expectedVersion) {
      throw new NotificationRepositoryError({
        code: "NOTIFICATION_SETTINGS_VERSION_CONFLICT",
        message: "Notification settings changed elsewhere. Refresh before saving.",
        status: 409,
      });
    }

    const updated = await client.query<SettingsRow>(
      `UPDATE notification_settings
          SET version = version + 1,
              email_enabled = $2,
              push_enabled = $3,
              match_enabled = $4,
              crew_enabled = $5,
              competition_enabled = $6,
              reward_enabled = $7,
              system_enabled = $8,
              quiet_hours_enabled = $9,
              quiet_hours_start_minute = $10,
              quiet_hours_end_minute = $11,
              quiet_hours_timezone = $12,
              email_digest = $13,
              updated_at = now()
        WHERE user_id = $1::uuid
      RETURNING *`,
      [
        input.userId,
        input.preferences.channels.email,
        input.preferences.channels.push,
        input.preferences.categories.match,
        input.preferences.categories.crew,
        input.preferences.categories.competition,
        input.preferences.categories.reward,
        input.preferences.categories.system,
        input.preferences.quietHours.enabled,
        input.preferences.quietHours.startMinute,
        input.preferences.quietHours.endMinute,
        input.preferences.quietHours.timeZone,
        input.preferences.emailDigest,
      ],
    );

    const snapshot = mapSettings(updated.rows[0]!, input.requestId);
    await client.query(
      `INSERT INTO notification_settings_commands (user_id, idempotency_key, fingerprint, response)
       VALUES ($1::uuid, $2, $3, $4::jsonb)`,
      [input.userId, input.idempotencyKey, requestFingerprint, JSON.stringify(snapshot)],
    );
    return { snapshot, replayed: false };
  });
}
