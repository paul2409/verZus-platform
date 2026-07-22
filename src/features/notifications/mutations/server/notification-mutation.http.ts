import { NextResponse, type NextRequest } from "next/server";

import { getServerRuntimeSession } from "@/lib/session/runtime-session.server";
import {
  mutateNotification,
  getUnreadCount,
  NotificationRepositoryError,
} from "../../server/notification.repository";
import { serializeNotification } from "../../center/server/notification-center.service";
import {
  readAllNotificationsMutationRequestSchema,
  singleNotificationMutationRequestSchema,
} from "../schema/notification-mutation.schema";

function requestId(scope: string): string {
  return `notifications-${scope}-${crypto.randomUUID()}`;
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

async function authenticatedUserId(requestIdValue: string) {
  const session = await getServerRuntimeSession();
  if (session.state !== "authenticated" || !session.user) {
    return {
      response: errorResponse({
        status: 401,
        code: "NOTIFICATION_MUTATION_UNAUTHORIZED",
        message: "Sign in again before updating notifications.",
        retryable: false,
        requestId: requestIdValue,
      }),
      userId: null,
    };
  }
  return { response: null, userId: session.user.id };
}

async function parseJson(request: NextRequest, id: string): Promise<unknown | NextResponse> {
  try {
    return await request.json();
  } catch {
    return errorResponse({
      status: 400,
      code: "NOTIFICATION_MUTATION_INVALID_JSON",
      message: "The notification update body must be valid JSON.",
      retryable: false,
      requestId: id,
    });
  }
}

function verifyIdempotencyHeader(request: NextRequest, bodyKey: string, id: string) {
  const headerKey = request.headers.get("idempotency-key");
  if (!headerKey || headerKey !== bodyKey) {
    return errorResponse({
      status: 400,
      code: "IDEMPOTENCY_KEY_REQUIRED",
      message: "A matching Idempotency-Key header is required.",
      retryable: false,
      requestId: id,
    });
  }
  return null;
}

function successResponse(result: Awaited<ReturnType<typeof mutateNotification>>, id: string) {
  return NextResponse.json(
    {
      data: {
        item: result.item ? serializeNotification(result.item) : null,
        operation: result.operation,
        updated_count: result.updatedCount,
        unread_count: result.unreadCount,
        replayed: result.replayed,
      },
      meta: { request_id: id, idempotency_key: result.idempotencyKey },
    },
    { headers: { "cache-control": "no-store", "x-request-id": id } },
  );
}

function serviceError(error: unknown, id: string) {
  if (error instanceof NotificationRepositoryError) {
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
    code: "NOTIFICATION_MUTATION_UNKNOWN",
    message: "The notification update failed unexpectedly.",
    retryable: true,
    requestId: id,
  });
}

export async function handleSingleNotificationMutation(
  request: NextRequest,
  notificationId: string,
): Promise<NextResponse> {
  const id = requestId("mutation");
  const auth = await authenticatedUserId(id);
  if (auth.response || !auth.userId) return auth.response!;

  const payload = await parseJson(request, id);
  if (payload instanceof NextResponse) return payload;
  const parsed = singleNotificationMutationRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return errorResponse({
      status: 422,
      code: "NOTIFICATION_MUTATION_INVALID",
      message: "The notification update did not match the required contract.",
      retryable: false,
      requestId: id,
    });
  }
  const headerFailure = verifyIdempotencyHeader(request, parsed.data.idempotency_key, id);
  if (headerFailure) return headerFailure;

  try {
    return successResponse(
      await mutateNotification({
        kind: "single",
        userId: auth.userId,
        notificationId,
        operation: parsed.data.operation,
        expectedState: parsed.data.expected_state,
        idempotencyKey: parsed.data.idempotency_key,
      }),
      id,
    );
  } catch (error) {
    return serviceError(error, id);
  }
}

export async function handleReadAllNotificationsMutation(
  request: NextRequest,
): Promise<NextResponse> {
  const id = requestId("read-all");
  const auth = await authenticatedUserId(id);
  if (auth.response || !auth.userId) return auth.response!;

  const payload = await parseJson(request, id);
  if (payload instanceof NextResponse) return payload;
  const parsed = readAllNotificationsMutationRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return errorResponse({
      status: 422,
      code: "NOTIFICATION_READ_ALL_INVALID",
      message: "The mark-all-read request did not match the required contract.",
      retryable: false,
      requestId: id,
    });
  }
  const headerFailure = verifyIdempotencyHeader(request, parsed.data.idempotency_key, id);
  if (headerFailure) return headerFailure;

  try {
    return successResponse(
      await mutateNotification({
        kind: "read-all",
        userId: auth.userId,
        category: parsed.data.category,
        idempotencyKey: parsed.data.idempotency_key,
      }),
      id,
    );
  } catch (error) {
    return serviceError(error, id);
  }
}

export async function handleNotificationUnreadCountGet(_request?: NextRequest): Promise<NextResponse> {
  const id = requestId("unread-count");
  const auth = await authenticatedUserId(id);
  if (auth.response || !auth.userId) return auth.response!;

  try {
    return NextResponse.json(
      {
        data: { unread_count: await getUnreadCount(auth.userId) },
        meta: { request_id: id, fetched_at: new Date().toISOString() },
      },
      { headers: { "cache-control": "private, no-store", "x-request-id": id } },
    );
  } catch {
    return errorResponse({
      status: 503,
      code: "NOTIFICATION_COUNT_UNAVAILABLE",
      message: "The unread notification count is temporarily unavailable.",
      retryable: true,
      requestId: id,
    });
  }
}
