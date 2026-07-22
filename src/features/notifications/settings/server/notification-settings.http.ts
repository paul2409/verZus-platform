import { NextResponse, type NextRequest } from "next/server";

import { getServerAuthSession } from "@/features/auth/server";
import type { NotificationSettingsSnapshot } from "../model/notification-settings.types";
import { notificationSettingsUpdateRequestSchema } from "../schema/notification-settings.schema";
import {
  getNotificationSettingsSnapshot,
  NotificationSettingsServiceError,
  updateNotificationSettingsSnapshot,
} from "./notification-settings.service";

function requestId(scope: string): string {
  return `notifications-settings-${scope}-${crypto.randomUUID()}`;
}

function rawSettings(snapshot: NotificationSettingsSnapshot) {
  return {
    version: snapshot.version,
    channels: {
      in_app: true,
      email: snapshot.channels.email,
      push: snapshot.channels.push,
    },
    categories: {
      match: snapshot.categories.match,
      crew: snapshot.categories.crew,
      competition: snapshot.categories.competition,
      reward: snapshot.categories.reward,
      security: true,
      system: snapshot.categories.system,
    },
    quiet_hours: {
      enabled: snapshot.quietHours.enabled,
      start_minute: snapshot.quietHours.startMinute,
      end_minute: snapshot.quietHours.endMinute,
      time_zone: snapshot.quietHours.timeZone,
    },
    email_digest: snapshot.emailDigest,
    updated_at: snapshot.updatedAt,
  };
}

function errorResponse(input: {
  status: number;
  code: string;
  message: string;
  retryable: boolean;
  requestId: string;
}) {
  return NextResponse.json(
    {
      error: {
        code: input.code,
        message: input.message,
        request_id: input.requestId,
        retryable: input.retryable,
      },
    },
    {
      status: input.status,
      headers: { "cache-control": "no-store", "x-request-id": input.requestId },
    },
  );
}

async function authenticatedUserId(id: string) {
  const session = await getServerAuthSession();
  if (session.state !== "authenticated" || !session.user) {
    return {
      response: errorResponse({
        status: 401,
        code: "NOTIFICATION_SETTINGS_UNAUTHORIZED",
        message: "Sign in again to manage notification settings.",
        retryable: false,
        requestId: id,
      }),
      userId: null,
    };
  }
  return { response: null, userId: session.user.id };
}

function successResponse(input: {
  snapshot: NotificationSettingsSnapshot;
  requestId: string;
  idempotencyKey?: string;
  replayed?: boolean;
}) {
  return NextResponse.json(
    {
      data: rawSettings(input.snapshot),
      meta: {
        request_id: input.requestId,
        ...(input.idempotencyKey ? { idempotency_key: input.idempotencyKey } : {}),
        ...(input.replayed === undefined ? {} : { replayed: input.replayed }),
      },
    },
    { headers: { "cache-control": "private, no-store", "x-request-id": input.requestId } },
  );
}

export async function handleNotificationSettingsGet(_request?: NextRequest): Promise<NextResponse> {
  const id = requestId("read");
  const auth = await authenticatedUserId(id);
  if (auth.response || !auth.userId) return auth.response!;

  try {
    return successResponse({
      snapshot: await getNotificationSettingsSnapshot(auth.userId, id),
      requestId: id,
    });
  } catch {
    return errorResponse({
      status: 503,
      code: "NOTIFICATION_SETTINGS_UNAVAILABLE",
      message: "Notification settings are temporarily unavailable.",
      retryable: true,
      requestId: id,
    });
  }
}

export async function handleNotificationSettingsPatch(
  request: NextRequest,
): Promise<NextResponse> {
  const id = requestId("update");
  const auth = await authenticatedUserId(id);
  if (auth.response || !auth.userId) return auth.response!;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return errorResponse({
      status: 400,
      code: "NOTIFICATION_SETTINGS_INVALID_JSON",
      message: "The notification settings request body was not valid JSON.",
      retryable: false,
      requestId: id,
    });
  }

  const parsed = notificationSettingsUpdateRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return errorResponse({
      status: 422,
      code: "NOTIFICATION_SETTINGS_INVALID",
      message: "The notification settings request did not match the required contract.",
      retryable: false,
      requestId: id,
    });
  }

  const headerKey = request.headers.get("idempotency-key");
  if (!headerKey || headerKey !== parsed.data.idempotency_key) {
    return errorResponse({
      status: 400,
      code: "NOTIFICATION_SETTINGS_IDEMPOTENCY_MISMATCH",
      message: "The Idempotency-Key header must match the request body.",
      retryable: false,
      requestId: id,
    });
  }

  try {
    const result = await updateNotificationSettingsSnapshot({
      userId: auth.userId,
      expectedVersion: parsed.data.expected_version,
      idempotencyKey: parsed.data.idempotency_key,
      requestId: id,
      preferences: {
        channels: {
          inApp: true,
          email: parsed.data.settings.channels.email,
          push: parsed.data.settings.channels.push,
        },
        categories: {
          match: parsed.data.settings.categories.match,
          crew: parsed.data.settings.categories.crew,
          competition: parsed.data.settings.categories.competition,
          reward: parsed.data.settings.categories.reward,
          security: true,
          system: parsed.data.settings.categories.system,
        },
        quietHours: {
          enabled: parsed.data.settings.quiet_hours.enabled,
          startMinute: parsed.data.settings.quiet_hours.start_minute,
          endMinute: parsed.data.settings.quiet_hours.end_minute,
          timeZone: parsed.data.settings.quiet_hours.time_zone,
        },
        emailDigest: parsed.data.settings.email_digest,
      },
    });

    return successResponse({
      snapshot: result.snapshot,
      requestId: id,
      idempotencyKey: parsed.data.idempotency_key,
      replayed: result.replayed,
    });
  } catch (error) {
    if (error instanceof NotificationSettingsServiceError) {
      return errorResponse({
        status: error.status,
        code: error.code,
        message: error.message,
        retryable: error.retryable,
        requestId: id,
      });
    }
    return errorResponse({
      status: 500,
      code: "NOTIFICATION_SETTINGS_UPDATE_FAILED",
      message: "The notification settings update could not be completed.",
      retryable: true,
      requestId: id,
    });
  }
}
